"use client"

import type React from "react"

import { useState } from "react"
import { FiX, FiPlus, FiDatabase, FiFolder, FiUpload } from "react-icons/fi"
import { figtree } from "@/lib/fonts"
import UploadModal from "./settings_comps/UploadModal"
import S3Modal from "./settings_comps/S3Modal"

interface SettingsProps {
  isVisible: boolean
}

const Settings: React.FC<SettingsProps> = ({ isVisible }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const closeModal = () => {
    setActiveModal(null)
  }

  const renderModal = () => {
    switch (activeModal) {
      case "database":
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Configure Database</h3>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Oracle</option>
                    <option>PostgreSQL</option>
                    <option>MySQL</option>
                    <option>MongoDB</option>
                    <option>SQLite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection String</label>
                  <input
                    type="text"
                    placeholder="admin/secret123@dbhost.example.com:1521/orclpdb1"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schema</label>
                  <input type="text" placeholder="public" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case "documents":
        return <S3Modal closeModal={closeModal} />
      case "upload":
        return <UploadModal closeModal={closeModal} />;
      default:
        return null
    }
  }

  return (
    <>
      <div
        className={`relative top-0 right-0 h-full bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
          isVisible ? "w-80" : "w-0 overflow-hidden"
        } ${figtree.className}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex flex-col justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Settings</h2>
        </div>

        {/* Content Section */}
        <div className="p-4 overflow-y-auto h-full">
          <div className="space-y-4">
            <button
              onClick={() => setActiveModal("database")}
              className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FiDatabase className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Configure Database</h3>
                  <p className="text-sm text-gray-500">Connect to your database for queries</p>
                </div>
              </div>
              <FiPlus className="text-gray-400" size={20} />
            </button>

            <button
              onClick={() => setActiveModal("documents")}
              className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FiFolder className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Connect to Documents</h3>
                  <p className="text-sm text-gray-500">Link to document repositories</p>
                </div>
              </div>
              <FiPlus className="text-gray-400" size={20} />
            </button>

            <button
              onClick={() => setActiveModal("upload")}
              className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FiUpload className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Upload Document</h3>
                  <p className="text-sm text-gray-500">Add new documents to the system</p>
                </div>
              </div>
              <FiPlus className="text-gray-400" size={20} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-500">Changes to settings may require a system restart to take effect.</p>
        </div>
      </div>

      {/* Render the active modal */}
      {renderModal()}
    </>
  )
}

export default Settings
