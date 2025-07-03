import './globals.css';

export const metadata = {
  title: 'AI Multi-Model Chatbot',
  description: 'A starter template for AI chatbot supporting multiple models',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
        {/* 科技感网络节点SVG背景，放大、弱化、偏右下角 */}
        <div className="fixed -bottom-32 -right-32 scale-150 opacity-5 -z-10 pointer-events-none select-none">
          <svg width="480" height="480" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" fill="#e0e7ef"/>
            <circle cx="200" cy="200" r="120" fill="#fff"/>
            <circle cx="200" cy="120" r="8" fill="#b6c2d9"/>
            <circle cx="120" cy="200" r="8" fill="#b6c2d9"/>
            <circle cx="200" cy="280" r="8" fill="#b6c2d9"/>
            <circle cx="280" cy="200" r="8" fill="#b6c2d9"/>
            <line x1="200" y1="120" x2="120" y2="200" stroke="#b6c2d9" strokeWidth="2"/>
            <line x1="120" y1="200" x2="200" y2="280" stroke="#b6c2d9" strokeWidth="2"/>
            <line x1="200" y1="280" x2="280" y2="200" stroke="#b6c2d9" strokeWidth="2"/>
            <line x1="280" y1="200" x2="200" y2="120" stroke="#b6c2d9" strokeWidth="2"/>
          </svg>
        </div>
        {children}
      </body>
    </html>
  );
} 