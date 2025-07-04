import React from "react";
import MessageItem from "./MessageItem";

export default function ChatHistory({ messages }) {
  console.log('ChatHistory messages:', messages);
  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.map((msg, idx) => (
        <MessageItem key={idx} message={msg} />
      ))}
    </div>
  );
} 