import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-full bg-gray-900 text-white">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No chat selected</p>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            />
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded">
              ⬆️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}