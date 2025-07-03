"use client";
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChatHistory from "../components/ChatHistory";
import ChatInputBar from "../components/ChatInputBar";
import { fetchAIResponse } from "./aiApi";

// 系统提示词，需与 aiApi.js 保持一致
const SYSTEM_PROMPT = "请先详细分析用户问题的推理过程，然后再给出最终结论。格式如下：\nReasoning: ...\nAnswer: ...";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const chatBottomRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatAreaRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 监听滚动，判断是否在底部
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatArea;
      // 距离底部小于30px算在底部
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 30);
    };
    chatArea.addEventListener('scroll', handleScroll);
    // 初始判断
    handleScroll();
    return () => chatArea.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim() || isThinking) return;
    // 先同步添加用户消息和 loading 消息
    setMessages((prevMsgs) => [
      ...prevMsgs,
      { role: "user", content: text },
      { role: "assistant", content: "", thinking: "", loading: true }
    ]);
    setIsThinking(true);

    // 构造完整历史消息（含 system prompt）
    let messagesForApi;
    await new Promise((resolve) => setTimeout(resolve, 0));
    // 获取最新的 messages 状态（去掉最后一条 loading）
    messagesForApi = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
        .concat({ role: "user", content: text })
        .filter((msg) => !msg.loading)
        .map((msg) => ({ role: msg.role, content: msg.content }))
    ];

    const { aiContent, aiReasoning } = await fetchAIResponse(selectedModel, text, messagesForApi);
    // 用真实回复替换最后一条 loading 消息
    setMessages((prevMsgs) => {
      const idx = prevMsgs.findIndex((msg) => msg.loading);
      if (idx === -1) return prevMsgs;
      const newMsgs = [...prevMsgs];
      newMsgs[idx] = {
        role: "assistant",
        content: aiContent,
        thinking: aiReasoning,
      };
      return newMsgs;
    });
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
              ref={chatAreaRef}
              className="w-full flex-1 overflow-y-auto relative"
              style={{
                maxHeight: `calc(100vh - ${chatInputHeight + 56}px)`,
                paddingBottom: `${chatInputHeight + 48}px`,
                scrollbarGutter: 'stable',
              }}
            >
              <div className={containerClass + " px-2"}>
                <ChatHistory messages={messages} />
                <div ref={chatBottomRef} style={{ scrollMarginBottom: `${chatInputHeight + 48}px` }} />
              </div>
            </div>
            {/* 向下滚动按钮，渲染在输入框卡片上方 */}
            {showScrollDown && (
              <div className="fixed left-0 w-full flex justify-center z-30 pointer-events-none" style={{ bottom: `${chatInputHeight + 120}px` }}>
                <div className="w-full max-w-2xl flex justify-center pointer-events-auto">
                  <button
                    className="scroll-to-bottom-btn rounded-full p-2"
                    onClick={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    aria-label="Scroll to bottom"
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l5 5 5-5" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
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