"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiX, FiCheckCircle } from "react-icons/fi";

interface UploadModalProps {
  closeModal: () => void;
}

export default function UploadModal({ closeModal }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "ingesting" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const pollIngestion = async (jobId: string) => {
    setStatus("ingesting");

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    while (true) {
      const res = await fetch(`/api/ingestion-status?jobId=${jobId}`);
      const data = await res.json();
      const status = data.status;

      console.log(status)

      if (status === "COMPLETE") {
        setStatus("done");
        return;
      } else if (status === "FAILED") {
        alert("Ingestion failed.");
        setUploading(false);
        return;
      }

      await delay(2000);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("documents", file));

    try {
      setUploading(true);
      setStatus("uploading");

      const res = await fetch("/api/upload-docs", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const ingestionJobId = result.ingestionJob?.ingestionJobId;
      console.log(ingestionJobId)
      if (ingestionJobId) {
        await pollIngestion(ingestionJobId);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
      setStatus("idle");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Upload Document</h3>
          <button
            onClick={() => {
              console.log(status)
              if (status === "done") {
                console.log("refreshing")
                router.refresh(); // triggers a hard page refresh without full reload
              }
              closeModal()
            }}
            className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
            disabled={uploading}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Drop zone or file list */}
          {selectedFiles.length > 0 ? (
            <div className="bg-gray-100 rounded-md p-4 border border-gray-300 text-center">
              <p className="text-sm text-gray-700 font-medium">Selected file(s):</p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 text-left">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop files here, or{" "}
                <span
                  onClick={handleBrowseClick}
                  className="text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  browse
                </span>
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Supports PDF (max 50MB)
              </p>
            </div>
          )}

          {/* Status */}
          {status === "uploading" && (
            <p className="text-sm text-blue-600 font-medium text-center">Uploading...</p>
          )}
          {status === "ingesting" && (
            <p className="text-sm text-yellow-600 font-medium text-center">Ingesting into knowledge base...</p>
          )}
          {status === "done" && (
            <div className="text-green-700 text-sm flex justify-center items-center space-x-2">
              <FiCheckCircle />
              <span>Ready to ask questions!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles.length || status !== "idle"}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
