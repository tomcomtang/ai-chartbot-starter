"use client";
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChatHistory from "../components/ChatHistory";
import ChatInputBar from "../components/ChatInputBar";
import { fetchAIResponse } from "./aiApi";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim() || isThinking) return;
    setMessages((msgs) => [...msgs, { role: "user", content: text }]);
    setIsThinking(true);
    const { aiContent, aiReasoning } = await fetchAIResponse(selectedModel, text);
    setMessages((msgs) => [
      ...msgs,
      {
        role: "assistant",
        content: aiContent,
        thinking: aiReasoning,
      },
    ]);
    setIsThinking(false);
  };

  // Chat area and input area max width
  const containerClass = "w-full max-w-2xl mx-auto";
  // 聊天输入卡片高度（用于底部留白）
  const chatInputHeight = 120;

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className={`flex-1 flex flex-col ${messages.length === 0 ? 'items-center justify-center' : 'items-center justify-start'} overflow-hidden`}>
        {messages.length === 0 ? (
          // Center input area when no messages
          <div className={`${containerClass} flex-1 flex flex-col justify-center items-center`}>
            <ChatInputBar
              onSend={handleSend}
              isThinking={isThinking}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              cardHeight={chatInputHeight}
            />
          </div>
        ) : (
          // Center chat and input area, transparent chat area
          <>
            <div
              className="w-full flex-1 overflow-y-auto"
              style={{
                maxHeight: `calc(100vh - ${chatInputHeight + 56}px)`,
                paddingBottom: `${chatInputHeight + 48}px`, // 增大底部留白
                scrollbarGutter: 'stable',
              }}
            >
              <div className={containerClass + " px-2"}>
                <ChatHistory messages={messages} />
                <div ref={chatBottomRef} style={{ scrollMarginBottom: `${chatInputHeight + 48}px` }} />
              </div>
            </div>
            <ChatInputBar
              onSend={handleSend}
              isThinking={isThinking}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              cardHeight={chatInputHeight}
            />
          </>
        )}
      </div>
    </div>
  );
} 