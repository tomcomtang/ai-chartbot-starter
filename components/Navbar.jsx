import React from "react";
import { FaGithub } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-4 bg-transparent shadow-none">
      <div className="font-bold text-lg">AI Multi-Model Chatbot</div>
      <div className="flex items-center">
        <a
          href="https://github.com/xxx/ai-chatbot-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-black text-xl"
        >
          <FaGithub />
        </a>
      </div>
    </nav>
  );
} 