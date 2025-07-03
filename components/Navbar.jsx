import React from "react";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-4 bg-transparent shadow-none">
      <div className="font-bold text-lg" style={{ color: '#222' }}>Edgeone AI</div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/xxx/ai-chatbot-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl"
          style={{ color: '#222' }}
        >
          <FaGithub />
        </a>
      </div>
    </nav>
  );
} 