'use client';

import { HistoryItem } from '@/components/features/collections/types';
import { Win98Window } from '@/components/ui/organisms/Win98Window';

interface NFTHistoryProps {
  history?: HistoryItem[];
}

export function NFTHistory({ history = [] }: NFTHistoryProps) {
  return (
    <Win98Window title="Transfer History" icon="/assets/icons/window/gallery.png" className="mb-3">
      <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-1 mb-1 max-h-24 overflow-y-auto">
        <table className="w-full text-black text-xs">
          <thead className="bg-[#c0c0c0] sticky top-0">
            <tr>
              <th className="py-[3px] px-2 text-left">Type</th>
              <th className="py-[3px] px-2 text-left">From</th>
              <th className="py-[3px] px-2 text-left">To</th>
              <th className="py-[3px] px-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((event, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-[#efefef]' : ''}>
                <td className="py-[3px] px-2">{event.type}</td>
                <td className="py-[3px] px-2 truncate max-w-[80px]">
                  {event.from === '0x0000000000000000000000000000000000000000'
                    ? 'New Mint'
                    : event.from}
                </td>
                <td className="py-[3px] px-2 truncate max-w-[80px]">{event.to}</td>
                <td className="py-[3px] px-2">{event.date}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="py-1 px-2 text-center">
                  No transfer history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Win98Window>
  );
}
