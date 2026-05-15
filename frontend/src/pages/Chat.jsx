import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { SendHorizonal, Wifi } from "lucide-react";
import { messageApi } from "../api/services";
import { Field, GhostButton, GlassCard, GradientButton } from "../components/ui/Primitives";
import { Page } from "../components/ui/Motion";
import { useAuth } from "../context/AuthContext";
import { asArray, errorMessage, formatTime, initials, pick } from "../utils/format";

export default function Chat() {
  const { user } = useAuth();
  const [peerId, setPeerId] = useState("");
  const [activePeer, setActivePeer] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    let client;
    let disposed = false;

    async function connectSocket() {
      window.global = window.global || window;
      const SockJS = (await import("sockjs-client")).default;
      if (disposed) return;

      client = new Client({
        webSocketFactory: () => new SockJS("/ws"),
        reconnectDelay: 4000,
        onConnect: () => {
          setConnected(true);
          client.subscribe(`/topic/messages/${user.userId}`, (frame) => {
            const body = JSON.parse(frame.body);
            setMessages((current) => [...current, body]);
          });
        },
        onWebSocketClose: () => setConnected(false),
      });
      client.activate();
      clientRef.current = client;
    }

    connectSocket();

    return () => {
      disposed = true;
      client?.deactivate();
    };
  }, [user.userId]);

  const conversations = useMemo(() => {
    const ids = new Set(
      messages
        .map((message) => {
          const sender = String(pick(message, ["senderId"], ""));
          const receiver = String(pick(message, ["receiverId"], ""));
          return sender === String(user.userId) ? receiver : sender;
        })
        .filter((id) => id && id !== String(user.userId)),
    );
    return Array.from(ids);
  }, [messages, user.userId]);

  async function connect() {
    if (!peerId.trim()) return;
    setActivePeer(peerId.trim());
    try {
      const result = await messageApi.conversation(user.userId, peerId.trim());
      setMessages(asArray(result));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function send() {
    if (!text.trim() || !activePeer) return;
    const payload = {
      senderId: user.userId,
      receiverId: activePeer,
      senderName: user.name,
      content: text.trim(),
      message: text.trim(),
      timestamp: new Date().toISOString(),
    };
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(payload),
      });
    } else {
      messageApi.send(payload).catch((error) => toast.error(errorMessage(error)));
    }
    setMessages((current) => [...current, payload]);
    setText("");
  }

  return (
    <Page className="grid min-h-[calc(100vh-9rem)] gap-5 xl:grid-cols-[22rem_1fr]">
      <GlassCard hover={false} className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Messages</h2>
          <span className={`flex items-center gap-2 text-xs font-bold ${connected ? "text-emerald-300" : "text-slate-500"}`}>
            <Wifi className="h-4 w-4" /> {connected ? "Connected" : "Offline"}
          </span>
        </div>
        <div className="flex gap-2">
          <Field label="Enter User ID" value={peerId} onChange={(event) => setPeerId(event.target.value)} />
          <GradientButton onClick={connect}>Connect</GradientButton>
        </div>
        <div className="mt-5 space-y-2">
          {conversations.map((id) => (
            <button key={id} onClick={() => { setPeerId(id); setActivePeer(id); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left hover:bg-cyan-400/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">{initials(id)}</span>
              <span className="font-bold text-white">User {id}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard hover={false} className="flex min-h-[36rem] flex-col overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h3 className="text-xl font-black text-white">{activePeer ? `Conversation with ${activePeer}` : "Connect to begin"}</h3>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => {
            const mine = String(pick(message, ["senderId"])) === String(user.userId);
            return (
              <div key={`${pick(message, ["timestamp"], index)}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-3xl px-5 py-3 ${mine ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "border border-white/10 bg-white/[0.05] text-slate-100"}`}>
                  <p className="text-sm">{pick(message, ["content", "message", "text"], "")}</p>
                  <p className="mt-1 text-right text-[11px] text-white/45">{formatTime(pick(message, ["timestamp", "sentAt", "createdAt"]))}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 border-t border-white/10 p-4">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
            placeholder="Write a message"
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300/40"
          />
          <GhostButton className="h-12 w-12 rounded-full p-0" onClick={send}><SendHorizonal className="h-5 w-5" /></GhostButton>
        </div>
      </GlassCard>
    </Page>
  );
}
