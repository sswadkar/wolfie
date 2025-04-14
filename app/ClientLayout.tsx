"use client"

import type React from "react"

import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { FiInfo, FiMenu } from "react-icons/fi"
import { useState } from "react"
import TraceLog from "@/components/TraceLog"
import { figtree, inter } from "@/lib/fonts"
import ChatPage from "@/components/ChatPage"

interface Source {
  question: string
  indicator: string
  source_url: string
  page_content: string
}

export default function ClientLayout() {
  const [isSidebarVisible, setSidebarVisible] = useState(true)
  const [isTraceLogVisible, setTraceLogVisible] = useState(false)
  const [sourcesData, setSourcesData] = useState<Source[]>([])
  const [activeTab, setActiveTab] = useState<"trace" | "sources">("sources")
  const [currentIndex, setCurrentIndex] = useState(0)

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible)
  }

  const toggleTraceLog = () => {
    setTraceLogVisible(!isTraceLogVisible)
  }

  return (
    <html>
      <body>
    <div className={`${figtree.className} bg-white text-gray-800 h-screen w-screen flex flex-col`}>
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-white p-4 z-10 border-b border-gray-200 shadow-sm">
      <button onClick={toggleSidebar} className="text-gray-800 focus:outline-none p-2 hover:bg-gray-100 rounded">
            <FiMenu size={20} />
          </button>
        <h1 className="text-2xl font-bold text-gray-800">
          CVM <span className="text-blue-600 text-2xl font-bold">Wolfie</span>
        </h1>
        <button onClick={toggleTraceLog} className="text-gray-800 focus:outline-none p-2 hover:bg-gray-100 rounded">
            <FiInfo size={20} />
          </button>
        {/* <div className="flex items-center space-x-4">
        </div> */}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - now on the right */}
        <Sidebar isVisible={isSidebarVisible} />

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${inter.className}`}>
          <ChatPage
            sourcesData={sourcesData}
            setSourcesData={setSourcesData}
            setTraceLogVisible={setTraceLogVisible}
            setActiveTab={setActiveTab}
            setSourceIndex={setCurrentIndex}
          />
        </div>

        {/* TraceLog - floating over content when visible */}
        <TraceLog
          setTraceLogVisible={setTraceLogVisible}
          isVisible={isTraceLogVisible}
          sources={sourcesData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </div>
    </div>
    </body>
    </html>
  )
}
