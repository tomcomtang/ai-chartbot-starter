"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import Navbar from "../components/Navbar";
import ChatHistory from "../components/ChatHistory";
import ChatInputBar from "../components/ChatInputBar";
import { fetchAIStreamResponse } from "./aiApi";

// 系统提示词
const SYSTEM_PROMPT = "Please answer user questions in the following format:\n\n**Analysis Process:**\n[Here, analyze the problem in detail and show your thinking process]\n\n**Answer:**\n[Here, provide the final answer]\n\nNote: If the user asks in Chinese, respond in Chinese. If the user asks in English, respond in English.";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");
  const chatBottomRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatAreaRef = useRef(null);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

  // 流式输出回调函数
  const handleStreamChunk = useCallback((content, reasoning, isComplete) => {
    console.log('UI update callback:', { content: content.substring(0, 50) + '...', reasoning: reasoning?.substring(0, 50) + '...', isComplete });
    
    // 使用 flushSync 确保立即更新
    flushSync(() => {
      setMessages((prevMsgs) => {
        // 查找最后一条消息，优先查找loading消息，如果没有则查找最后一条assistant消息
        let idx = prevMsgs.findIndex((msg) => msg.loading);
        if (idx === -1) {
          // 如果没有loading消息，查找最后一条assistant消息
          idx = prevMsgs.length - 1;
          while (idx >= 0 && prevMsgs[idx].role !== "assistant") {
            idx--;
          }
        }
        
        if (idx === -1) {
          console.warn('No assistant message found, creating new one');
          return [...prevMsgs, { 
            role: "assistant", 
            content: content, 
            reasoning: reasoning || "",
            streaming: !isComplete 
          }];
        }
        
        const newMsgs = [...prevMsgs];
        if (isComplete) {
          // 流式输出完成，设置最终内容，移除所有特殊标志
          newMsgs[idx] = {
            role: "assistant",
            content: content,
            reasoning: reasoning || "",
          };
          setIsThinking(false);
        } else {
          // 流式输出中，更新内容并保持streaming标志
          newMsgs[idx] = {
            role: "assistant",
            content: content,
            reasoning: reasoning || "",
            streaming: true
          };
        }
        console.log('Updated message at index:', idx, 'with content length:', content.length, 'reasoning length:', reasoning?.length || 0, 'isComplete:', isComplete);
        return newMsgs;
      });
    });
  }, []);

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
    const chatMessages = messages
      .concat({ role: "user", content: text })
      .filter((msg) => !msg.loading)
      .map((msg) => ({ role: msg.role, content: msg.content }));
    
    // 将 SYSTEM_PROMPT 插入到倒数第二条位置
    messagesForApi = [
      ...chatMessages.slice(0, -1), // 除了最后一条消息外的所有消息
      { role: "system", content: SYSTEM_PROMPT }, // 倒数第二条：系统提示词
      chatMessages[chatMessages.length - 1] // 最后一条：用户消息
    ];

    // 统一流式输出处理，无需模型判断
    try {
      await fetchAIStreamResponse(selectedModel, text, messagesForApi, handleStreamChunk);
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages((prevMsgs) => {
        const idx = prevMsgs.findIndex((msg) => msg.loading);
        if (idx === -1) return prevMsgs.map(msg => {
          if (msg.loading) {
            const { loading, ...rest } = msg;
            return rest;
          }
          return msg;
        });
        const newMsgs = [...prevMsgs];
        newMsgs[idx] = {
          role: "assistant",
          content: `AI request failed: ${error?.message || error?.toString() || "Unknown error"}`,
          reasoning: ""
        };
        // 兜底：移除所有 loading 字段
        return newMsgs.map(msg => {
          if (msg.loading) {
            const { loading, ...rest } = msg;
            return rest;
          }
          return msg;
        });
      });
      setIsThinking(false);
    }
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