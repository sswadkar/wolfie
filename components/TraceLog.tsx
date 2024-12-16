"use client";

import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface TraceLogProps {
  isVisible: boolean;
}

const logs = [
  `SELECT 'DUO PEN' AS proprietary_name,
ndc_product_code, product_type_name,
product_kits_flag, strength, dosage_name,
market_category_name, market_status,
product_market_status, fda_approved,
product_fee_status, market_start_date,
market_end_date, discontinue_date,
submission_date, labeler_firm_name,
labeler_firm_duns, labeler_ndc_code,
registrant_firm_name, registrant_firm_duns,
document_num, doc_type_code,
applicant_firm_name, application_number 
FROM product_info 
WHERE proprietary_name LIKE '%DUO PEN%';`,

  `SELECT 'DRUG X' AS proprietary_name,
ndc_product_code, strength, market_status,
product_market_status, fda_approved
FROM product_info 
WHERE market_status = 'ACTIVE';`,
];

const sources = [
   {
    question: "What is CAPA?",
    indicator: "1",
    url: "s3://llmchatbotkb/Quality-Systems-Approach-to-Pharmaceutical-Current-Good-Manufacturing-Practice-Regulations.pdf",
    content: `CAPA stands for Corrective and Preventive Action. It is a systematic approach used in regulated industries, such as pharmaceuticals, medical devices, and food manufacturing, to address and prevent quality issues, non-conformances, or defects in products or processes.
    
    Key Components of CAPA:
    1. Corrective Action:
       • Focuses on identifying and eliminating the root cause of a specific problem or non-conformance to prevent its recurrence.
       • Example: If a manufacturing defect occurs, corrective action might involve fixing the equipment causing the defect.
    2. Preventive Action:
       • Proactively identifies potential risks and implements measures to prevent issues from occurring in the first place.
       • Example: Updating standard operating procedures (SOPs) to address a newly identified risk.`,
  },
  {
    question: "What are SOPs?",
    indicator: "2",
    url: "s3://llmchatbotkb/Standard-Operating-Procedures-Manual.pdf",
    content: `SOPs are documented procedures that guide operations...`,
  },
];

const TraceLog: React.FC<TraceLogProps> = ({ isVisible }) => {
  const [activeTab, setActiveTab] = useState<"trace" | "sources">("trace");
  const [currentIndex, setCurrentIndex] = useState(0);

  const contentLength = activeTab === "trace" ? logs.length : sources.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, contentLength - 1));
  };

  return (
    <div
      className={`bg-gray-800 h-full flex flex-col transform transition-all duration-300 ${
        isVisible
          ? "visible translate-x-0 w-80 pt-4"
          : "invisible -translate-x-full w-0"
      }`}
    >
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
            className={`w-1/2 py-2 rounded-b-lg ${
              activeTab === "trace" ? "bg-gray-600" : "bg-gray-700"
            } text-white hover:bg-gray-500`}
          >
            View Trace Log
          </button>
          <button
            onClick={() => {
              setActiveTab("sources");
              setCurrentIndex(0);
            }}
            className={`w-1/2 py-2 rounded-b-lg ${
              activeTab === "sources" ? "bg-gray-600" : "bg-gray-700"
            } text-white hover:bg-gray-500`}
          >
            View Sources
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 h-full flex-1 overflow-auto">
        {activeTab === "trace" ? (
          <div className="border border-gray-600 text-gray-300 p-4 rounded shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Generating SQL Query</h3>
            <pre className="text-xs whitespace-pre-wrap leading-5">
              {logs[currentIndex]}
            </pre>
          </div>
        ) : (
          <div className="border border-gray-600 text-gray-300 p-4 rounded shadow-sm">
            <h3 className="text-lg font-bold mb-2">Sources</h3>
            <p className="text-blue-500 text-sm mb-1">
              ({sources[currentIndex].indicator}){" "}
              <span className="px-1 text-sm text-gray-600">
                Related to: {sources[currentIndex].question}
              </span>
            </p>
            <p className="text-md mt-4 font-semibold">Source URL:</p>
            <p className="text-sm mb-2">{sources[currentIndex].url}</p>
            <p className="text-md mt-4 font-semibold mb-1">Page Content</p>
            <p className="text-sm mt-4 whitespace-pre-wrap">
              {sources[currentIndex].content}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mb-4 flex justify-center items-center space-x-6 text-gray-400">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`hover:text-white ${
            currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiArrowLeft size={20} />
        </button>
        <p className="text-sm">
          <span className="font-bold">{currentIndex + 1}</span> of <span className="font-bold">{contentLength }</span>
        </p>
        <button
          onClick={goToNext}
          disabled={currentIndex === contentLength - 1}
          className={`hover:text-white ${
            currentIndex === contentLength - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <FiArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TraceLog;