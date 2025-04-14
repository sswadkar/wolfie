"use client"

import { FaEdit, FaTrash } from "react-icons/fa"
import type React from "react"

interface SidebarProps {
  isVisible: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  const options = [
    {
      title: "Check FDA Compliance",
      description: "Analyze if product X meets the necessary...",
    },
    {
      title: "Generate Summary Report",
      description: "Summarize findings for product approval...",
    },
    {
      title: "Verify Data Integrity",
      description: "Ensure all submitted data matches FDA...",
    },
    {
      title: "Label Analysis",
      description: "Evaluate product labels for regulatory...",
    },
  ]

  return (
    <div
      className={`fixed left-0 z-50 bg-white h-full flex flex-col transform transition-all duration-300 ease-in-out shadow-md ${
        isVisible ? "visible translate-x-0 w-64" : "invisible -translate-x-full w-0"
      }`}
    >
      <div className="p-4 flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Manage Chats</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full p-2 rounded bg-gray-100 text-sm placeholder-gray-500 border border-gray-200"
          />
        </div>

        {/* Chat Options */}
        <ul className="divide-y divide-gray-200 overflow-y-auto h-full max-h-[70vh]">
          {options.map((option, index) => (
            <li key={index} className="flex justify-between items-center py-3 px-2 hover:bg-gray-100">
              <div>
                <h3 className="font-medium text-sm text-gray-800">{option.title}</h3>
                <p className="text-xs text-gray-500 hidden md:block">{option.description}</p>
              </div>
              <div className="flex space-x-3 text-gray-500 pl-2">
                <FaEdit className="cursor-pointer hover:text-gray-800" />
                <FaTrash className="cursor-pointer hover:text-gray-800" />
              </div>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Connected</span>
              <span className="bg-green-500 h-3 w-3 rounded-full"></span>
            </div>
            <p className="text-gray-500 text-xs mt-2">APPRC © 2024</p>
            <p className="text-gray-500 text-xs">
              <a href="#" className="hover:underline">
                Privacy
              </a>{" "}
              |{" "}
              <a href="#" className="hover:underline">
                Terms
              </a>{" "}
              |{" "}
              <a href="#" className="hover:underline">
                FAQ
              </a>{" "}
              |{" "}
              <a href="#" className="hover:underline">
                Changelog
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
