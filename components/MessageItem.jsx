import React, { useState, useRef, useLayoutEffect } from "react";
import { FaChevronDown, FaChevronUp, FaUserCircle, FaRobot } from "react-icons/fa";

export default function MessageItem({ message }) {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);
  const reasoningRef = useRef(null);
  const [reasoningHeight, setReasoningHeight] = useState(0);

  useLayoutEffect(() => {
    if (expanded && message.thinking && reasoningRef.current) {
      setReasoningHeight(reasoningRef.current.scrollHeight);
    } else {
      setReasoningHeight(0);
    }
  }, [expanded, message.thinking]);

  if (!isUser) {
    // AI 消息：AI回复内容在下，分析过程在上，默认收起
    if (message.loading) {
      // AI loading 动画，结构与常规AI消息保持一致（两行）
      return (
        <div className="flex items-center justify-start mb-2 min-h-[48px]">
          <div className="flex-shrink-0 mr-2 flex items-center">
            <FaRobot className="text-2xl" style={{ color: '#555' }} />
          </div>
          <div className="flex items-center w-full">
            <span className="animate-pulse text-base text-gray-900">AI is thinking</span>
            <span className="ml-1 inline-block w-4 h-4 align-middle">
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce mr-0.5" style={{ animationDelay: '0s' }}></span>
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce mr-0.5" style={{ animationDelay: '0.15s' }}></span>
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-start justify-start mb-2">
        <div className="flex-shrink-0 mr-2 mt-1">
          <FaRobot className="text-2xl" style={{ color: '#555' }} />
        </div>
        <div className="flex flex-col w-full">
          {/* 展开时显示分析内容（在AI回复内容上方） */}
          <div
            className="transition-all duration-300 overflow-hidden mb-1"
            style={{ maxHeight: reasoningHeight, opacity: expanded && message.thinking ? 1 : 0, willChange: 'max-height, opacity' }}
          >
            <div
              ref={reasoningRef}
              className="text-sm text-gray-700 whitespace-pre-line"
              style={{ paddingTop: expanded && message.thinking ? 0 : 0 }}
            >
              {message.thinking}
            </div>
          </div>
          {/* 展开/收起按钮，始终紧贴AI回复内容上方 */}
          {message.thinking && (
            <div className="flex items-center text-xs text-gray-500 mb-1 cursor-pointer select-none transition-colors hover:text-blue-500" onClick={() => setExpanded((e) => !e)}>
              {/* 展开时显示向下箭头，收起时显示向上箭头 */}
              {expanded ? <FaChevronDown className="mr-1" /> : <FaChevronUp className="mr-1" />}
              <span>{expanded ? "Hide the reasoning process" : "Show the reasoning process"}</span>
            </div>
          )}
          {/* AI 回复内容始终在底部 */}
          <div className="text-base text-gray-900">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // 用户消息：使用微信风格气泡形状（绿色气泡，右下角带小三角），浅灰背景，深色文字
  return (
    <div className="flex items-start justify-end mb-2">
      <div className="relative max-w-[80%]">
        <div className="bg-[#f3f4f6] text-gray-900 px-4 py-2 rounded-[18px] shadow flex flex-col relative">
          <div>{message.content}</div>
        </div>
        {/* 微信风格右下角三角，SVG与圆角自然衔接 */}
        <svg
          className="absolute right-[-10px] bottom-2"
          width="16" height="18" viewBox="0 0 16 18" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 1 }}
        >
          <path
            d="M0 18 Q8 2 16 8 Q10 12 0 18 Z"
            fill="#f3f4f6"
          />
        </svg>
      </div>
      <div className="flex-shrink-0 ml-2 mt-1">
        <FaUserCircle className="text-2xl" style={{ color: '#555' }} />
      </div>
    </div>
  );
} 