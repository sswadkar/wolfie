"use client";

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { FiInfo, FiMenu } from "react-icons/fi";
import { useState } from "react";
import TraceLog from "@/components/TraceLog";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isTraceLogVisible, setTraceLogVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleTraceLog = () => {
    setTraceLogVisible(!isTraceLogVisible);
  };

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white h-screen">
        <div className="flex h-full justify-between">
          {/* Sidebar */}
          <Sidebar isVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-800 p-4">
              <button
                onClick={toggleSidebar}
                className="text-white text-2xl focus:outline-none p-2 hover:bg-gray-700 rounded"
              >
                <FiMenu />
              </button>
              <h1 className="ml-4 text-2xl font-bold">
                CVM <span className="text-blue-500">Wolfie</span>
              </h1>
              <button
                onClick={toggleTraceLog}
                className="text-white text-2xl focus:outline-none p-2 hover:bg-gray-700 rounded"
              >
                <FiInfo />
              </button>
            </div>

            {/* Children */}
            <div className="flex-1">{children}</div>
          </div>

          <TraceLog isVisible={isTraceLogVisible} toggleTraceLog={toggleTraceLog}></TraceLog>
        </div>
      </body>
    </html>
  );
}