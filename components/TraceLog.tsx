"use client";

import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface Source {
  question: string;
  indicator: string;
  source_url: string;
  page_content: string;
}

interface TraceLogProps {
  isVisible: boolean;
  sources: Source[];
}

const TraceLog: React.FC<TraceLogProps> = ({ isVisible, sources }) => {
  const [activeTab, setActiveTab] = useState<"trace" | "sources">("trace");
  const [currentIndex, setCurrentIndex] = useState(0);

  const contentLength = activeTab === "trace" ? 1 : sources.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, contentLength - 1));
  };

  return (
    <div
      className={`fixed right-0 z-20 bg-gray-800 h-full flex flex-col transform transition-all duration-300 ease-in-out ${
        isVisible ? "visible translate-x-0 w-80 pt-4" : "invisible -translate-x-full w-0"
      }`}
    >
      <div className={`overflow-y-scroll ${isVisible ? "visible" : "hidden"}`}>
        {/* Header */}
        <div className="w-full">
          <h2 className="text-md font-bold text-center text-gray-200">
            {activeTab === "trace" ? "Trace Log" : "Sources"}
          </h2>
          <p className="text-xs text-gray-400 text-center">
            View Wolfie’s {activeTab === "trace" ? "workflow here" : "sources here"}
          </p>
          <div className="mt-4 flex justify-between w-full text-sm bg-gray-900">
            <button
              onClick={() => {
                setActiveTab("trace");
                setCurrentIndex(0);
              }}
              className={`w-1/2 py-2 rounded-b-lg ${activeTab === "trace" ? "bg-gray-600" : "bg-gray-700"} text-white hover:bg-gray-500`}
            >
              View Trace Log
            </button>
            <button
              onClick={() => {
                setActiveTab("sources");
                setCurrentIndex(0);
              }}
              className={`w-1/2 py-2 rounded-b-lg ${activeTab === "sources" ? "bg-gray-600" : "bg-gray-700"} text-white hover:bg-gray-500`}
            >
              View Sources
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1">
          {activeTab === "trace" ? (
            <div className="border border-gray-600 text-gray-300 p-4 rounded shadow-sm">
              <h3 className="text-sm font-semibold mb-2">Generating SQL Query</h3>
              <pre className="text-xs whitespace-pre-wrap leading-5">SELECT ...</pre>
            </div>
          ) : sources.length > 0 ? (
            <div className="border border-gray-600 text-gray-300 p-4 rounded shadow-sm">
              <h3 className="text-lg font-bold mb-2">Sources</h3>
              <p className="text-blue-500 text-sm mb-1">
                ({sources[currentIndex].indicator}){" "}
                <span className="px-1 text-sm text-gray-600">
                  Related to: {sources[currentIndex].question}
                </span>
              </p>
              <p className="text-md mt-4 font-semibold">Source URL:</p>
              <p className="text-sm mb-2">{sources[currentIndex].source_url}</p>
              <p className="text-md mt-4 font-semibold mb-1">Page Content</p>
              <p className="text-sm mt-4 whitespace-pre-wrap">{sources[currentIndex].page_content}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">No sources available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mb-4 flex justify-center items-center space-x-6 text-gray-400">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`hover:text-white ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FiArrowLeft size={20} />
          </button>
          <p className="text-sm">
            <span className="font-bold">{currentIndex + 1}</span> of <span className="font-bold">{contentLength}</span>
          </p>
          <button
            onClick={goToNext}
            disabled={currentIndex === contentLength - 1}
            className={`hover:text-white ${currentIndex === contentLength - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FiArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraceLog;
