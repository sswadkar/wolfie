"use client"

import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { FiSettings, FiMenu } from "react-icons/fi"
import { useState } from "react"
import TraceLog from "@/components/TraceLog"
import Settings from "@/components/Settings"
import { figtree, inter } from "@/lib/fonts"
import ChatPage from "@/components/ChatPage"

interface Source {
  question: string
  indicator: string
  source_url: string
  page_content: string
  page_number: number
}

export default function ClientLayout() {
  const [isSidebarVisible, setSidebarVisible] = useState(false)
  const [isTraceLogVisible, setTraceLogVisible] = useState(false)
  const [isSettingsVisible, setSettingsVisible] = useState(false)
  const [sourcesData, setSourcesData] = useState<Source[]>([])
  const [activeTab, setActiveTab] = useState<"trace" | "sources">("sources")
  const [currentIndex, setCurrentIndex] = useState(0)

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible)
  }

  const toggleSettings = () => {
    setSettingsVisible(!isSettingsVisible)
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
              ARC <span className="text-blue-600 text-2xl font-bold">Gen AI</span>
            </h1>
            <button onClick={toggleSettings} className="text-gray-800 focus:outline-none p-2 hover:bg-gray-100 rounded">
              <FiSettings size={20} />
            </button>
          </header>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - on the left */}
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

            {/* Settings Panel - on the right */}
            <Settings isVisible={isSettingsVisible}/>
          </div>
        </div>
      </body>
    </html>
  )
}
