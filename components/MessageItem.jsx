import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaUserCircle, FaRobot } from "react-icons/fa";

export default function MessageItem({ message }) {
  const isUser = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  if (!isUser) {
    // AI 消息：AI回复内容在下，分析过程在上，默认收起
    return (
      <div className="flex items-start justify-start mb-2">
        <div className="flex-shrink-0 mr-2 mt-1">
          <FaRobot className="text-2xl" style={{ color: '#555' }} />
        </div>
        <div className="flex flex-col w-full">
          {/* 展开时显示分析内容（在AI回复内容上方） */}
          {expanded && message.thinking && (
            <div className="mb-1 text-sm text-gray-700 whitespace-pre-line">
              {message.thinking}
            </div>
          )}
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

  // 用户消息：使用常见聊天气泡形状（右侧小三角），浅灰背景，深色文字
  return (
    <div className="flex items-start justify-end mb-2">
      <div className="relative max-w-[80%]">
        <div className="bg-[#f3f4f6] text-gray-900 px-4 py-2 rounded-2xl shadow flex flex-col relative">
          <div>{message.content}</div>
        </div>
        {/* 右侧尖角，指向用户头像 */}
        <div className="absolute right-[-14px] top-4 w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-[#f3f4f6]" />
      </div>
      <div className="flex-shrink-0 ml-2 mt-1">
        <FaUserCircle className="text-2xl" style={{ color: '#555' }} />
      </div>
    </div>
  );
} 