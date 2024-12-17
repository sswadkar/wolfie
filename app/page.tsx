"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FiCopy } from "react-icons/fi";

interface ChatMessage {
  id: number;
  text: string;
  type: "user" | "bot";
  data?: {[key: string]: string}[];
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chat_messages");
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const simulatedResponse: ChatMessage = {
        id: Date.now() + 1,
        text: "Here's your data table and response.",
        type: "bot",
        data: [
          {
            proprietary_name: "DUO PEN",
            ndc_product_code: "1234567890",
            product_type_name: "Injectable",
            product_kits_flag: "Yes",
            strength: "50mg",
            dosage_name: "Injection",
            market_category_name: "Prescription",
            market_status: "Active",
            product_market_status: "Available",
            fda_approved: "Yes",
            product_fee_status: "Paid",
            market_start_date: "2023-01-01",
            market_end_date: "2025-12-31",
            discontinue_date: "",
            submission_date: "2022-11-01",
            labeler_firm_name: "PharmaCo",
            labeler_firm_duns: "123456789",
            labeler_ndc_code: "987654321",
            registrant_firm_name: "HealthCorp",
            registrant_firm_duns: "987654321",
            document_num: "DOC123456",
            doc_type_code: "NDA",
            applicant_firm_name: "MedSolutions",
            application_number: "123456789012"
          },
          {
            proprietary_name: "DUO PEN",
            ndc_product_code: "0987654321",
            product_type_name: "Injectable",
            product_kits_flag: "No",
            strength: "100mg",
            dosage_name: "Injection",
            market_category_name: "Prescription",
            market_status: "Active",
            product_market_status: "Available",
            fda_approved: "Yes",
            product_fee_status: "Unpaid",
            market_start_date: "2024-02-01",
            market_end_date: "2026-12-31",
            discontinue_date: "null",
            submission_date: "2023-09-15",
            labeler_firm_name: "BioMed",
            labeler_firm_duns: "1122334455",
            labeler_ndc_code: "667788990",
            registrant_firm_name: "HealthCorp",
            registrant_firm_duns: "9988776655",
            document_num: "DOC654321",
            doc_type_code: "BLA",
            applicant_firm_name: "MedSolutions",
            application_number: "987654321098"
          },
          {
            proprietary_name: "DUO PEN",
            ndc_product_code: "1122334455",
            product_type_name: "Injectable",
            product_kits_flag: "Yes",
            strength: "75mg",
            dosage_name: "Injection",
            market_category_name: "Prescription",
            market_status: "Discontinued",
            product_market_status: "Unavailable",
            fda_approved: "No",
            product_fee_status: "Unpaid",
            market_start_date: "2021-06-01",
            market_end_date: "2023-05-31",
            discontinue_date: "2023-06-01",
            submission_date: "2020-03-01",
            labeler_firm_name: "PharmaCo",
            labeler_firm_duns: "2233445566",
            labeler_ndc_code: "4455667788",
            registrant_firm_name: "MedGlobal",
            registrant_firm_duns: "5544332211",
            document_num: "DOC789012",
            doc_type_code: "IND",
            applicant_firm_name: "GlobalHealth",
            application_number: "321654987654"
          }
        ],
      };
      setMessages((prev) => [...prev, simulatedResponse]);
    }, 500);
  };

  return (
    <div className="flex h-full w-full max-w-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 w-screen overflow-y-scroll p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 flex flex-col rounded-lg ${
                  msg.type === "user"
                    ? "bg-gray-700 text-white text-sm items-end"
                    : "bg-gray-800 text-gray-200 text-sm max-w-[85%]"
                }`}
              >
                {msg.data && (
                  <div className="mb-2 overflow-x-scroll overflow-hidden">
                  <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        {Object.keys(msg.data[0]).map((key) => (
                          <TableHead key={key} className="text-gray-500 whitespace-nowrap">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {msg.data.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((value, idx) => (
                            <TableCell key={idx} className="whitespace-nowrap">
                              {value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                )}
                <p>{msg.text}</p>
                {msg.type === "bot" && (
                  <button
                    onClick={() => handleCopy(msg.text)}
                    className="mt-2 flex items-center text-sm text-gray-400 hover:text-gray-200"
                  >
                    <FiCopy className="mr-1" /> Copy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-gray-800 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
