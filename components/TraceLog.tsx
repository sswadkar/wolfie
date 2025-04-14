"use client"

import type React from "react"
import { FiArrowLeft, FiArrowRight } from "react-icons/fi"

interface Source {
  question: string
  indicator: string
  source_url: string
  page_content: string
}

interface TraceLogProps {
  isVisible: boolean
  sources: Source[]
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<"trace" | "sources">>
  currentIndex: number
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
  setTraceLogVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const TraceLog: React.FC<TraceLogProps> = ({
  isVisible,
  sources,
  activeTab,
  setActiveTab,
  currentIndex,
  setCurrentIndex,
  setTraceLogVisible,
}) => {
  const contentLength = activeTab === "trace" ? 1 : sources.length

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, contentLength - 1))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">{activeTab === "trace" ? "Trace Log" : "Sources"}</h2>
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab(activeTab === "trace" ? "sources" : "trace")}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mr-2"
            >
              Switch to {activeTab === "trace" ? "Sources" : "Trace Log"}
            </button>
            <button
              onClick={() => setTraceLogVisible(false)}
              className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === "trace" ? (
            <div className="border border-gray-300 text-gray-800 p-4 rounded shadow-sm">
              <h3 className="text-sm font-semibold mb-2">Generating SQL Query</h3>
              <pre className="text-xs whitespace-pre-wrap leading-5">SELECT ...</pre>
            </div>
          ) : sources.length > 0 ? (
            <div className="border border-gray-300 text-gray-800 p-4 rounded shadow-sm">
              <h3 className="text-lg font-bold mb-2">Sources</h3>
              <p className="text-blue-600 text-sm mb-1">
                ({sources[currentIndex].indicator}){" "}
                <span className="px-1 text-sm text-gray-500">Related to: {sources[currentIndex].question}</span>
              </p>
              <p className="text-md mt-4 font-semibold">Source URL:</p>
              <p className="text-sm mb-2">{sources[currentIndex].source_url}</p>
              <p className="text-md mt-4 font-semibold mb-1">Page Content</p>
              <p className="text-sm mt-4 whitespace-pre-wrap">{sources[currentIndex].page_content}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center">No sources available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-6 text-gray-500">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`hover:text-gray-800 ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FiArrowLeft size={20} />
            </button>
            <p className="text-sm">
              <span className="font-bold">{currentIndex + 1}</span> of{" "}
              <span className="font-bold">{contentLength}</span>
            </p>
            <button
              onClick={goToNext}
              disabled={currentIndex === contentLength - 1}
              className={`hover:text-gray-800 ${currentIndex === contentLength - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FiArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraceLog
