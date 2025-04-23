"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiCheckCircle } from "react-icons/fi";

interface S3ModalProps {
  closeModal: () => void;
}

export default function S3Modal({ closeModal }: S3ModalProps) {
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [documentUrl, setDocumentUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "ingesting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleConnect = async () => {
    setStatus("connecting");
    setMessage("");

    try {
      const res = await fetch("/api/connect-s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessKey,
          secretKey,
          region,
          documentUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(result.message || "Failed to connect to S3.");
        return;
      }

      setStatus("done");
      setMessage("Upload and ingestion successful!");

      // Optionally refresh the page or data
      router.refresh();
    } catch (err) {
      console.error("Connect failed:", err);
      setStatus("error");
      setMessage("Connection error.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Connect to S3 and Upload</h3>
          <button
            onClick={() => {
              if (status === "done") router.refresh();
              closeModal();
            }}
            className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">S3 Document URL</label>
            <input
              type="text"
              placeholder="https://your-bucket.s3.amazonaws.com/file.pdf"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
            <input
              type="text"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input
              type="password"
              placeholder="***************"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              placeholder="us-east-1"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Status and feedback */}
          {status === "connecting" && (
            <p className="text-sm text-blue-600">Connecting to S3 and uploading...</p>
          )}
          {status === "done" && (
            <div className="text-green-600 text-sm flex items-center space-x-2">
              <FiCheckCircle />
              <span>{message}</span>
            </div>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleConnect}
              disabled={!documentUrl || !accessKey || !secretKey || status === "connecting"}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
