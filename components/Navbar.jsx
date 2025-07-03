import React from "react";
import { FaGithub } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-4 bg-transparent shadow-none">
      <div className="font-bold text-lg text-blue-500">Edgeone AI</div>
      <div className="flex items-center">
        <a
          href="https://github.com/xxx/ai-chatbot-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 text-xl"
        >
          <FaGithub />
        </a>
      </div>
    </nav>
  );
} 