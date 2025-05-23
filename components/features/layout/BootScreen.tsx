"use client";

import { useEffect, useState } from "react";

export function BootScreen() {
  const [lines, setLines] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    const bootMessages = [
      "BIOS Version: MyNFTs.exe v4.98",
      "CPU: Web Assembly 3.7 GHz",
      "Memory Test: 640K OK, 16384K Extended",
      "Initializing System Components...",
      "Checking Storage Devices...",
      "Drive C: [OK]",
      "Loading Operating System...",
      "Starting MyNFTs.exe...",
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootMessages.length) {
        setLines((prev) => [...prev, bootMessages[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    const cursorInterval = setInterval(() => {
      setCursorPosition((pos) => (pos === 0 ? 1 : 0));
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="bg-[#000] w-full h-screen flex flex-col items-center justify-center text-white">
      <div className="text-center w-full max-w-2xl">
        <div
          className="text-left font-mono p-6 mx-auto w-full max-w-2xl overflow-auto"
          style={{ height: "60vh" }}
        >
          <p className="text-green-400 text-xl mb-6">SYSTEM BOOT v4.98</p>

          {lines.map((line, index) => (
            <p key={index} className="mb-2 text-green-200">
              {index === 0 ? "> " : index < 3 ? "  " : "> "}
              {line}
            </p>
          ))}

          <p className="text-green-400 flex">
            <span>C:\&gt;</span>
            <span
              className={cursorPosition === 0 ? "opacity-0" : "opacity-100"}
            >
              ▌
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
