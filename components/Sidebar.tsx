"use client"

import { useEffect, useState } from "react"
import { FaChevronDown, FaChevronUp, FaTag, FaTrash, FaSync } from "react-icons/fa"
import type React from "react"
import { figtree } from "@/lib/fonts"

interface SidebarProps {
  isVisible: boolean
}

interface PublicDoc {
  key: string;
  size: number;
  lastModified: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  // const [activeSection, setActiveSection] = useState<string>("submissions")
  const [showSecureDocumentOptions, setShowSecureDocumentOptions] = useState<boolean>(true)
  const [selectedSecureDocs, setSelectedSecureDocs] = useState<string[]>([])
  const [showPublicDocumentOptions, setShowPublicDocumentOptions] = useState<boolean>(false)
  const [publicDocs, setPublicDocs] = useState<PublicDoc[]>([]);

  const secureDocumentLabels = [
    "Effectiveness",
    "Human Food Safety",
    "Chemistry and Manufacturing Controls",
    "Environmental",
    "Product Characterization (ABCT)",
    "Target Animal Safety",
    "Reasonable Expectation of Effectiveness",
    "Communication/Admin Actions",
    "Designation",
    "All Other Information",
    "Labeling",
    "Phenotypic Characterization",
    "Bioequivalence",
    "Patent and Exclusivity",
    "New Animal Drug Application",
    "Annual Chemistry Report",
    "B1 Supplement",
    "Determination of Eligibility",
    "Addition to Index",
    "Qualified Expert Panel",
    "Other Application Submissions",
    "Drug Experience Report",
    "Adverse Drug Event",
    "Drug Product Listing",
    "Marketing Materials",
    "New Distributor Statement",
    "Antimicrobial Report",
    "CAREs Act"
  ]

  const toggleSecureLabel = (label: string) => {
    setSelectedSecureDocs(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label) // remove if already selected
        : [...prev, label]              // add if not selected
    )
  }

  const handleDelete = async (key: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${key.replace("uploaded/", "")}"?`);
    if (!confirm) return;
  
    const res = await fetch(`/api/public-docs?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      setPublicDocs((prev) => prev.filter((doc) => doc.key !== key));
      alert("Document deleted.");
    } else {
      alert("Failed to delete document.");
    }
  };
  
  const handleResyncAll = async () => {
    const res = await fetch("/api/resync", {
      method: "POST",
    });
  
    if (res.ok) {
      alert("Resync started for all public documents.");
    } else {
      alert("Failed to start resync.");
    }
  };

  useEffect(() => {
    fetch("/api/public-docs")
      .then((res) => res.json())
      .then((data) => setPublicDocs(data.files || []));
  }, []);
  

  return (
    <div
      className={`relative top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${figtree.className} ${
        isVisible ? "w-80" : "w-0 overflow-hidden"
      }`}
    >
      <div className="p-4 flex flex-col h-full w-full justify-between">
        {/* Header + Labels */}
        <div className="flex flex-col items-center mb-4">
          {/* Header */}
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Configure Prompt Parameters</h2>
          </div>

          {/* Document Toggle Checkboxes */}
          {/* <div className="border-t border-gray-200 pt-4 w-full mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Document Sections</h3>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={activeSection === "submissions"}
                  onChange={() => setActiveSection("submissions")}
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Submission Documents</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={activeSection === "guidance"}
                  onChange={() => setActiveSection("guidance")}
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Guidance & Regulation Documents</span>
              </label>
            </div>
          </div> */}

          {/* Secure Documents Section */}
          <div className= "border-t border-gray-200 pt-4 w-full">
            <button
              className="flex items-center justify-between overflow-y-auto w-full text-sm font-medium text-gray-700 mb-1 mr-2"
              onClick={() => setShowSecureDocumentOptions(!showSecureDocumentOptions)}
            >
              <span className="flex items-center h">
                <FaTag className="mr-2" /> Secure Documents
              </span>
              {showSecureDocumentOptions ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showSecureDocumentOptions && (
              <div className="max-h-96 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2 mt-2">
                {secureDocumentLabels.map((label, index) => {
                  const isSelected = selectedSecureDocs.includes(label)
                  return (
                    <button
                      key={index}
                      onClick={() => toggleSecureLabel(label)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
                </div>
              </div>
            )}
          </div>
          <div className= "border-t border-gray-200 mt-4 w-full"></div>

          {/* Public Documents Section */}
          <div className= "border-t border-gray-200 pt-4 w-full">
            <button
              className="flex items-center justify-between overflow-y-auto w-full text-sm font-medium text-gray-700 mb-1 mr-2"
              onClick={() => setShowPublicDocumentOptions(!showPublicDocumentOptions)}
            >
              <span className="flex items-center h">
                <FaTag className="mr-2" /> Public Documents
              </span>
              {showPublicDocumentOptions ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {showPublicDocumentOptions && 
            <div>
            <div className="flex justify-center mb-2">
              <button
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                onClick={handleResyncAll}
              >
                <FaSync size={14} /> Resync All
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2 text-sm text-gray-800">
              {publicDocs.length === 0 && <p className="text-gray-500 text-sm italic">No public documents found.</p>}
              {publicDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between border px-3 py-1 rounded-md bg-gray-50">
                  <span className="truncate max-w-[70%]">{doc.key.replace("uploaded/", "")}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(doc.key)}>
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
            }
          </div>
          <div className= "border-t border-gray-200 mt-4 w-full"></div>
        </div>

        {/* Search Bar */}
        {/* <div className="mb-4">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full p-2 rounded bg-gray-100 text-sm placeholder-gray-500 border border-gray-200"
          />
        </div> */}

        {/* Section Tabs */}
        {/* <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeSection === "submissions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveSection("submissions")}
          >
            Submissions
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeSection === "guidance" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveSection("guidance")}
          >
            Guidance
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeSection === "database" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveSection("database")}
          >
            Database
          </button>
        </div> */}

        {/* Footer */}
        <div className="mt-4">
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
