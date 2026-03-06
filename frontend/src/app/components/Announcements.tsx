import { Megaphone, ChevronRight } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: 'new' | 'update' | 'event';
}

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Binance将上线新交易对BTC/EUR',
    date: '2026-01-10',
    type: 'new'
  },
  {
    id: '2',
    title: '关于调整部分交易对手续费率的公告',
    date: '2026-01-09',
    type: 'update'
  },
  {
    id: '3',
    title: '新年交易大赛 - 瓜分100万USDT奖池',
    date: '2026-01-08',
    type: 'event'
  }
];

export function Announcements() {
  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: { text: string; color: string } } = {
      new: { text: '最新', color: 'bg-[#0ecb81] text-white' },
      update: { text: '更新', color: 'bg-[#f0b90b] text-black' },
      event: { text: '活动', color: 'bg-[#f6465d] text-white' }
    };
    return labels[type] || labels.new;
  };

  return (
    <div className="bg-[#161a1e] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-[#f0b90b]" />
        <h3 className="font-semibold text-white">公告</h3>
      </div>

      <div className="space-y-2">
        {announcements.map(announcement => {
          const typeLabel = getTypeLabel(announcement.type);
          return (
            <button
              key={announcement.id}
              className="w-full flex items-center justify-between p-3 rounded hover:bg-[#1e2329] transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabel.color}`}>
                  {typeLabel.text}
                </span>
                <div className="text-left flex-1">
                  <div className="text-sm text-white line-clamp-1">
                    {announcement.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {announcement.date}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          );
        })}
      </div>

      <button className="w-full mt-3 py-2 text-xs text-[#f0b90b] hover:text-[#f0b90b]/80 transition-colors">
        查看所有公告
      </button>
    </div>
  );
}
