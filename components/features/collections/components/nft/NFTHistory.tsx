"use client";

import { HistoryItem } from "@/components/features/collections/types";

interface NFTHistoryProps {
  history?: HistoryItem[];
}

export function NFTHistory({ history = [] }: NFTHistoryProps) {
  return (
    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 mb-4">
      <div className="win98-bar h-6 flex items-center px-2 mb-3">
        <span className="text-white text-xs font-semibold tracking-tight">
          Transfer History
        </span>
      </div>

      <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-1 mb-1 max-h-40 overflow-y-auto">
        <table className="w-full text-black text-xs">
          <thead className="bg-[#c0c0c0] sticky top-0">
            <tr>
              <th className="py-1 px-2 text-left">Type</th>
              <th className="py-1 px-2 text-left">From</th>
              <th className="py-1 px-2 text-left">To</th>
              <th className="py-1 px-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((event, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-[#efefef]" : ""}>
                <td className="py-1 px-2">{event.type}</td>
                <td className="py-1 px-2">
                  {event.from === "0x0000000000000000000000000000000000000000"
                    ? "New Mint"
                    : event.from}
                </td>
                <td className="py-1 px-2">{event.to}</td>
                <td className="py-1 px-2">{event.date}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="py-2 px-2 text-center">
                  No transfer history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
