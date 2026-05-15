import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { MessageSquareText, SendHorizonal, Wifi } from "lucide-react";
import { jobApi, messageApi } from "../api/services";
import { EmptyState, GhostButton, GlassCard, Skeleton } from "../components/ui/Primitives";
import { Page } from "../components/ui/Motion";
import { useAuth } from "../context/useAuth";
import { loadCompanyApplicationGroups, flattenCompanyApplications } from "../utils/companyApplications";
import { asArray, errorMessage, formatTime, initials, pick } from "../utils/format";
import { useAsync } from "../utils/useAsync";

async function loadStudentContacts(studentId) {
  const selectedApplications = asArray(await jobApi.studentApplications(studentId)).filter(
    (application) => String(pick(application, ["status"], "")).toUpperCase() === "SELECTED",
  );
  const contacts = await Promise.all(
    selectedApplications.map(async (application) => {
      const jobId = pick(application, ["jobId"]);
      try {
        const job = jobId ? await jobApi.byId(jobId) : null;
        const companyId = pick(job, ["companyId"]);
        if (!companyId) return null;
        return {
          id: String(companyId),
          name: pick(job, ["companyName", "company"], "Company"),
          subtitle: pick(job, ["title", "jobTitle"], pick(application, ["projectTitle"], "Selected work")),
        };
      } catch {
        return null;
      }
    }),
  );
  return uniqueContacts(contacts.filter(Boolean));
}

async function loadCompanyContacts(companyId) {
  const selected = flattenCompanyApplications(await loadCompanyApplicationGroups(companyId))
    .filter(({ application }) => String(pick(application, ["status"], "")).toUpperCase() === "SELECTED")
    .map(({ application, job }) => ({
      id: String(pick(application, ["studentId", "userId"])),
      name: pick(application, ["studentName", "name"], "Student"),
      subtitle: pick(job, ["title", "jobTitle"], pick(application, ["projectTitle"], "Selected work")),
    }))
    .filter((contact) => contact.id);
  return uniqueContacts(selected);
}

function uniqueContacts(contacts) {
  const map = new Map();
  contacts.forEach((contact) => {
    if (!map.has(contact.id)) map.set(contact.id, contact);
  });
  return Array.from(map.values());
}

export default function Chat() {
  const { user } = useAuth();
  const contactsQuery = useAsync(
    () =>
      String(user.role).toUpperCase() === "STUDENT"
        ? loadStudentContacts(user.userId)
        : loadCompanyContacts(user.userId),
    [user.userId, user.role],
    { toast: false, initialData: [] },
  );
  const contacts = asArray(contactsQuery.data);
  const [activePeerId, setActivePeerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const effectivePeerId = activePeerId || contacts[0]?.id || "";

  const activePeer = useMemo(
    () => contacts.find((contact) => String(contact.id) === String(effectivePeerId)),
    [effectivePeerId, contacts],
  );

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
            const otherId = String(pick(body, ["senderId"])) === String(user.userId)
              ? String(pick(body, ["receiverId"]))
              : String(pick(body, ["senderId"]));
            if (otherId === String(effectivePeerId)) {
              setMessages((current) => [...current, body]);
            }
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
  }, [effectivePeerId, user.userId]);

  useEffect(() => {
    if (!effectivePeerId) return;

    async function loadConversation() {
      try {
        const result = await messageApi.conversation(user.userId, effectivePeerId);
        setMessages(asArray(result));
      } catch (error) {
        toast.error(errorMessage(error));
      }
    }

    loadConversation();
  }, [effectivePeerId, user.userId]);

  function send() {
    if (!text.trim() || !activePeer) return;
    const payload = {
      senderId: user.userId,
      receiverId: activePeer.id,
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

        {contactsQuery.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : contacts.length ? (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActivePeerId(contact.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  String(effectivePeerId) === String(contact.id)
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-cyan-400/10"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
                  {initials(contact.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-white">{contact.name}</span>
                  <span className="block truncate text-xs text-slate-500">{contact.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquareText}
            title="No message contacts"
            message={
              String(user.role).toUpperCase() === "STUDENT"
                ? "Companies will appear here after they select your application."
                : "Students will appear here after you select their applications."
            }
          />
        )}
      </GlassCard>

      <GlassCard hover={false} className="flex min-h-[36rem] flex-col overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h3 className="text-xl font-black text-white">
            {activePeer ? activePeer.name : "Select a conversation"}
          </h3>
          {activePeer && <p className="mt-1 text-sm text-slate-500">{activePeer.subtitle}</p>}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => {
            const mine = String(pick(message, ["senderId"])) === String(user.userId);
            return (
              <div key={`${pick(message, ["timestamp", "sentAt", "createdAt"], index)}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
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
            placeholder={activePeer ? `Message ${activePeer.name}` : "Select a contact"}
            disabled={!activePeer}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <GhostButton disabled={!activePeer} className="h-12 w-12 rounded-full p-0" onClick={send}>
            <SendHorizonal className="h-5 w-5" />
          </GhostButton>
        </div>
      </GlassCard>
    </Page>
  );
}
