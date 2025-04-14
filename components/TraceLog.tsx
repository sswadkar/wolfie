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
}

const TraceLog: React.FC<TraceLogProps> = ({
  isVisible,
  sources,
  activeTab,
  setActiveTab,
  currentIndex,
  setCurrentIndex,
}) => {
  const contentLength = activeTab === "trace" ? 1 : sources.length

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, contentLength - 1))
  }

  return (
    <div
      className={`fixed right-0 z-20 bg-white h-full flex flex-col transform transition-all duration-300 ease-in-out shadow-md ${
        isVisible ? "visible translate-x-0 w-80 pt-4" : "invisible -translate-x-full w-0"
      }`}
    >
      <div className={`overflow-y-scroll ${isVisible ? "visible" : "hidden"}`}>
        {/* Header */}
        <div className="w-full">
          <h2 className="text-md font-bold text-center text-gray-800">
            {activeTab === "trace" ? "Trace Log" : "Sources"}
          </h2>
          <p className="text-xs text-gray-500 text-center">
            View Wolfie's {activeTab === "trace" ? "workflow here" : "sources here"}
          </p>
          <div className="mt-4 flex justify-between w-full text-sm bg-gray-100">
            <button
              onClick={() => {
                setActiveTab("trace")
                setCurrentIndex(0)
              }}
              className={`w-1/2 py-2 rounded-b-lg ${activeTab === "trace" ? "bg-gray-300" : "bg-gray-100"} text-gray-800 hover:bg-gray-400`}
            >
              View Trace Log
            </button>
            <button
              onClick={() => {
                setActiveTab("sources")
                setCurrentIndex(0)
              }}
              className={`w-1/2 py-2 rounded-b-lg ${activeTab === "sources" ? "bg-gray-300" : "bg-gray-100"} text-gray-800 hover:bg-gray-400`}
            >
              View Sources
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1">
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
        <div className="mb-4 flex justify-center items-center space-x-6 text-gray-500">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`hover:text-gray-800 ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FiArrowLeft size={20} />
          </button>
          <p className="text-sm">
            <span className="font-bold">{currentIndex + 1}</span> of <span className="font-bold">{contentLength}</span>
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
  )
}

export default TraceLog
