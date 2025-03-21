"use client";

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { FiInfo, FiMenu } from "react-icons/fi";
import { useState } from "react";
import TraceLog from "@/components/TraceLog";
import { figtree, inter } from "@/lib/fonts";
import ChatPage from "@/components/ChatPage";

interface Source {
  question: string;
  indicator: string;
  source_url: string;
  page_content: string;
}

export default function RootLayout() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isTraceLogVisible, setTraceLogVisible] = useState(false);
  const [sourcesData, setSourcesData] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState<"trace" | "sources">("sources");
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleTraceLog = () => {
    setTraceLogVisible(!isTraceLogVisible);
  };

  return (
    <html lang="en" className={figtree.className}>
      <body className="bg-gray-800 text-white h-screen w-screen">
        <div className="flex h-full w-full justify-between">
          {/* Sidebar */}
          <Sidebar isVisible={isSidebarVisible} />
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full z-0">
            {/* Header */}
            <div className="fixed w-full flex items-center justify-between bg-gray-900 p-4 z-50">
              <button
                onClick={toggleSidebar}
                className={`text-white text-2xl focus:outline-none p-2 hover:bg-gray-700 rounded ${isSidebarVisible ? "ml-60" : "ml-2"}`}
              >
                <FiMenu />
              </button>
              <h1 className="ml-4 text-2xl font-bold">
                CVM <span className="text-blue-500 text-2xl font-bold">Wolfie</span>
              </h1>
              <button
                onClick={toggleTraceLog}
                className={`text-white text-2xl focus:outline-none p-2 hover:bg-gray-700 rounded ${isTraceLogVisible ? "mr-80" : "mr-2"}`}
              >
                <FiInfo />
              </button>
            </div>

            {/* Pass sourcesData and setSourcesData to children */}
            <div className={`pt-20 flex-1 ${inter.className}`}>
              <ChatPage sourcesData={sourcesData} setSourcesData={setSourcesData} setTraceLogVisible={setTraceLogVisible} setActiveTab={setActiveTab} setSourceIndex={setCurrentIndex}  />
            </div>
          </div>

          <TraceLog isVisible={isTraceLogVisible} sources={sourcesData} activeTab={activeTab} setActiveTab={setActiveTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}/>
        </div>
      </body>
    </html>
  );
}