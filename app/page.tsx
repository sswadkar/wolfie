"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FiCopy } from "react-icons/fi";
import { Switch } from "@/components/ui/switch"; // Import the ShadCN Switch component

interface ChatMessage {
  id: number;
  text: string;
  type: "user" | "bot";
  data?: { [key: string]: string }[];
}

function ChatMessageComponent({ message, onCopy }: { message: ChatMessage; onCopy: (text: string) => void }) {
  return (
    <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`p-3 flex flex-col rounded-lg ${
          message.type === "user"
            ? "bg-gray-700 text-white text-sm items-end"
            : "bg-gray-800 text-gray-200 text-sm max-w-[85%]"
        }`}
      >
        {message.data && (
          <div className="mb-2 overflow-x-scroll">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  {Object.keys(message.data[0]).map((key) => (
                    <TableHead key={key} className="text-gray-500 whitespace-nowrap">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {message.data.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((value, idx) => (
                      <TableCell key={idx} className="whitespace-nowrap">
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p>{message.text}</p>
        {message.type === "bot" && (
          <button
            onClick={() => onCopy(message.text)}
            className="mt-2 flex items-center text-sm text-gray-400 hover:text-gray-200"
          >
            <FiCopy className="mr-1" /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isDocumentSearch, setIsDocumentSearch] = useState(false);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chat_messages");
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const PROD_WEBSOCKET_URL = process.env.NEXT_PUBLIC_PROD_WEBSOCKET_URL || "wss://";
    const WS_URL =
        process.env.NEXT_PUBLIC_TESTING_MODE === "true"
            ? process.env.NEXT_PUBLIC_TEST_WEBSOCKET_URL || "ws://localhost:8765"
            : `${process.env.NEXT_PUBLIC_PROXY_URL}?target=${encodeURIComponent(PROD_WEBSOCKET_URL)}`;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        ws.send(JSON.stringify({ message: input }));
    };

    ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.database_info && typeof response.database_info === "object") {
            const formattedData = Object.entries(response.database_info).map(([key, value]) => ({
                field1: key,
                field2: typeof value === "object" && Array.isArray(value)
                    ? value.join(", ")
                    : value?.toString() || "",
            }));

            const messageToEcho = JSON.parse(response.echo);

            const botResponse: ChatMessage = {
                id: Date.now() + 1,
                text: `${messageToEcho.message}`,
                type: "bot",
                data: formattedData,
            };

            setMessages((prev) => [...prev, botResponse]);
        } else {
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                text: "Invalid response format received.",
                type: "bot",
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        const errorMessage: ChatMessage = {
            id: Date.now() + 1,
            text: "An error occurred. Please try again.",
            type: "bot",
        };
        setMessages((prev) => [...prev, errorMessage]);
    };
};



  return (
    <div className="flex h-full w-full max-w-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 w-screen overflow-y-scroll p-4 space-y-4">
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} onCopy={handleCopy} />
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 p-4 flex items-center">
          {/* ShadCN Switch */}
          <div className="flex items-center mr-4">
            <span
              className={`mr-2 text-sm ${
                isDocumentSearch ? "text-gray-400" : "text-blue-400"
              }`}
            >
              Database
            </span>
            <Switch
              checked={isDocumentSearch}
              onCheckedChange={(checked) => setIsDocumentSearch(checked)}
              className="bg-gray-600 border-2 border-gray-500 rounded-full"
            />
            <span
              className={`ml-2 text-sm ${
                isDocumentSearch ? "text-blue-400" : "text-gray-400"
              }`}
            >
              Document
            </span>
          </div>

          {/* Input and Send Button */}
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Search in ${isDocumentSearch ? "Document" : "Database"}...`}
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
