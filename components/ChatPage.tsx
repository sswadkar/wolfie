"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { FiCopy } from "react-icons/fi"
import { Switch } from "@/components/ui/switch" // Import the ShadCN Switch component
import { WelcomeScreen } from "./WelcomeScreen"

interface ChatMessage {
  id: number
  text: string
  type: "user" | "bot"
  data?: { [key: string]: string }[]
}

interface Source {
  question: string
  indicator: string
  source_url: string
  page_content: string
  page_number: number
}

function insertSourceLinks(text: string, sources: { [key: string]: { [sub_key: string]: number } }[], offset: number) {
  if (!sources || sources.length === 0) return text

  let modifiedText = text

  // Sort sources in descending order of start index to prevent index shifting
  sources.sort((a, b) => b.source_text_span.start - a.source_text_span.start)

  sources.forEach((source, index) => {
    const start = source.source_text_span.start
    const end = source.source_text_span.end
    const sourceNumber = sources.length - index

    if (start < 0 || end > modifiedText.length) return

    const hyperlink = `<a key=${sourceNumber + offset} href="#source-${sourceNumber + offset}" class="source-link text-blue-600 hover:text-blue-800 underline">(${sourceNumber + offset})</a>`

    // Insert hyperlink at the correct position
    modifiedText = modifiedText.substring(0, end) + " " + hyperlink + modifiedText.substring(end)
  })

  return modifiedText
}

function ChatMessageComponent({ message, onCopy }: { message: ChatMessage; onCopy: (text: string) => void }) {
  return (
    <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`p-3 flex flex-col rounded-lg ${
          message.type === "user"
            ? "bg-blue-100 text-gray-800 text-sm items-end"
            : "bg-gray-100 text-gray-800 text-sm max-w-[85%]"
        }`}
      >
        {message.data && (
          <div className="mb-2 overflow-x-scroll">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  {Object.keys(message.data[0]).map((key) => (
                    <TableHead key={key} className="text-gray-600 whitespace-nowrap">
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
        {message.type === "bot" ? <p dangerouslySetInnerHTML={{ __html: message.text }}></p> : <p>{message.text}</p>}
        {message.type === "bot" && (
          <button
            onClick={() => onCopy(message.text)}
            className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <FiCopy className="mr-1" /> Copy
          </button>
        )}
      </div>
    </div>
  )
}

interface ChatPageProps {
  sourcesData: Source[]
  setSourcesData: React.Dispatch<React.SetStateAction<Source[]>>
  setTraceLogVisible: React.Dispatch<React.SetStateAction<boolean>>
  setActiveTab: React.Dispatch<React.SetStateAction<"trace" | "sources">>
  setSourceIndex: React.Dispatch<React.SetStateAction<number>>
}

const ChatPage: React.FC<ChatPageProps> = ({
  sourcesData,
  setSourcesData,
  setTraceLogVisible,
  setActiveTab,
  setSourceIndex,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isDocumentSearch, setIsDocumentSearch] = useState(true)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const prevMessageId = useRef<number>(-1)

  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chat_messages")
    if (savedMessages) setMessages(JSON.parse(savedMessages))
  }, [])

  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash // e.g. "#source-3"
      const match = hash.match(/^#source-(\d+)$/)

      if (match) {
        const index = Number.parseInt(match[1], 10)
        setTraceLogVisible(true)
        setActiveTab("sources")
        setSourceIndex(index - 1)

        // Optional: Clear the hash so it doesn't trigger again on re-render
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    }

    window.addEventListener("hashchange", handleHashChange)

    // Also call immediately in case the link is already clicked before mounting
    handleHashChange()

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const sendMessage = () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = { id: Date.now(), text: input, type: "user" }
    setMessages((prev) => [...prev, userMessage])

    setInput("")

    const WS_URL =
      process.env.NEXT_PUBLIC_TESTING_MODE === "true"
        ? process.env.NEXT_PUBLIC_TEST_WEBSOCKET_URL || "ws://localhost:8765"
        : process.env.NEXT_PUBLIC_PROD_WEBSOCKET_URL || "wss://" // Connect via the http-proxy established on localhost:3000/api/socket

    const ws = new WebSocket(WS_URL)

    let thinkingMessageId: number | null = null
    let thinkingInterval: NodeJS.Timeout | null = null

    // Delay showing "thinking..." message by 500ms to avoid flickering on fast responses
    const thinkingTimeout = setTimeout(() => {
      thinkingMessageId = Date.now() + 1

      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        text: `Thinking.`,
        type: "bot",
      }

      setMessages((prev) => [...prev, thinkingMessage])

      let dots = 1
      thinkingInterval = setInterval(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessageId ? { ...msg, text: `Thinking${".".repeat(dots)}` } : msg)),
        )
        dots = (dots % 3) + 1
      }, 350)
      console.log(thinkingInterval)
    }, 250)

    console.log(thinkingTimeout)

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "sendMessage", message: input }))
    }

    ws.onmessage = (event) => {
      const eventData = JSON.parse(event.data)

      const response = eventData.response
      const sources = response.sources
      console.log(sources)

      setMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessageId)) // remove thinking message

      if (response.database_info && typeof response.database_info === "object") {
        console.log("DB query")
        const formattedData = Object.entries(response.database_info).map(([key, value]) => ({
          field1: key,
          field2: typeof value === "object" && Array.isArray(value) ? value.join(", ") : value?.toString() || "",
        }))

        const messageToEcho = response.response

        //console.log(messageToEcho)

        const botResponse: ChatMessage = {
          id: Date.now() + 2,
          text: `${messageToEcho.response}`,
          type: "bot",
          data: formattedData,
        }

        setMessages((prev) => [...prev, botResponse])
      } else if (response.response) {
        console.log("KB Query")

        const formattedSources = sources.map(
          (source: { question: string; source_url: string; page_content: string, metadata?: { [key: string]: number }; }, index: number) => ({
            question: userMessage.text || "No question available",
            indicator: (sourcesData.length + index + 1).toString(), // Continue numbering
            source_url: source.source_url || "No source URL",
            page_content: source.page_content || "No content available",
            page_number: source.metadata?.["x-amz-bedrock-kb-document-page-number"] || "N/A",
          }),
        )
        const offset = sourcesData.length

        setSourcesData((prevSources) => [...prevSources, ...formattedSources])

        const hyperlinkedSourcesResponse = insertSourceLinks(response.response, sources, offset)

        const botResponse: ChatMessage = {
          id: Date.now() + 2,
          text: hyperlinkedSourcesResponse,
          type: "bot",
        }

        setMessages((prev) => [...prev, botResponse])
      } else {
        console.log("error query")
        const errorMessage: ChatMessage = {
          id: Date.now() + 2,
          text: "Invalid response format received.",
          type: "bot",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error)
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        text: "An error occurred. Please try again.",
        type: "bot",
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0 && messages[messages.length - 1].id != prevMessageId.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
    if (messages.length > 0) {
      prevMessageId.current = messages[messages.length - 1].id
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages or Welcome Screen */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => <ChatMessageComponent key={msg.id} message={msg} onCopy={handleCopy} />)
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Input Section */}
      <div className="bg-gray-50 p-4 flex items-center border-t border-gray-200">
        {/* ShadCN Switch */}
        <div className="flex items-center mr-4">
          <span className={`mr-2 text-sm ${isDocumentSearch ? "text-gray-500" : "text-blue-600"}`}>Database</span>
          <Switch
            checked={isDocumentSearch}
            onCheckedChange={(checked) => setIsDocumentSearch(checked)}
            disabled
            className="bg-gray-300 border-2 border-gray-200 rounded-full"
          />
          <span className={`ml-2 text-sm ${isDocumentSearch ? "text-blue-600" : "text-gray-500"}`}>Document</span>
        </div>

        {/* Input and Send Button */}
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Search in ${isDocumentSearch ? "Document" : "Database"}...`}
            className="flex-1 bg-white text-gray-800 p-2 rounded border border-gray-300"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 hover:bg-gradient-to-br text-white p-2 rounded w-20"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
