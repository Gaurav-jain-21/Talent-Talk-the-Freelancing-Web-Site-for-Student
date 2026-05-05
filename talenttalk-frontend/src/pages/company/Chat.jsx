import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getConversation } from "../../api/communicationApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const CompanyChat = () => {
  const { user } = useAuth();
  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  const connect = async () => {
    if (!receiverId) return;
    try {
      const res = await getConversation(user.userId, receiverId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8084/ws"),
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/messages/${user.userId}`, (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
    });
    client.activate();
    clientRef.current = client;
  };

  const sendMessage = () => {
    if (!input.trim() || !connected) return;
    clientRef.current.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        senderId: parseInt(user.userId),
        receiverId: parseInt(receiverId),
        senderName: user.name,
        content: input,
      }),
    });
    setMessages((prev) => [
      ...prev,
      {
        senderId: parseInt(user.userId),
        senderName: user.name,
        content: input,
        sentAt: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => clientRef.current?.deactivate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>

        {!connected && (
          <div
            className="bg-white rounded-xl shadow p-4 mb-4
            flex gap-3"
          >
            <input
              type="number"
              placeholder="Enter Student User ID to chat"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="flex-1 border rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={connect}
              className="bg-blue-600 hover:bg-blue-700
                text-white px-4 py-2 rounded text-sm"
            >
              Connect
            </button>
          </div>
        )}

        {connected && (
          <>
            <div
              className="bg-white rounded-xl shadow p-4
              h-96 overflow-y-auto mb-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex mb-3 ${
                    msg.senderId === parseInt(user.userId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-xl ${
                      msg.senderId === parseInt(user.userId)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-4 py-2
                  focus:outline-none focus:ring-2
                  focus:ring-blue-400"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700
                  text-white px-6 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyChat;
