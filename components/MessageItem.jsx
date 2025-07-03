import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function MessageItem({ message }) {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 shadow ${
          isUser ? "bg-blue-500 text-white" : "bg-white text-gray-900"
        } relative`}
      >
        <div>{message.content}</div>
        {/* Show reasoning for assistant */}
        {!isUser && message.thinking && (
          <div>
            <button
              className="flex items-center text-xs text-gray-500 mt-1 hover:underline"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <FaChevronUp className="mr-1" />
              ) : (
                <FaChevronDown className="mr-1" />
              )}
              {expanded ? "Hide reasoning" : "Show reasoning"}
            </button>
            {expanded && (
              <div className="mt-1 p-2 bg-gray-100 rounded text-gray-700 text-xs whitespace-pre-line">
                {message.thinking}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 