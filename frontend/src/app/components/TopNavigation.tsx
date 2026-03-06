import { Search, Bell, User, Globe, HelpCircle, Menu } from 'lucide-react';
import { NavLink } from 'react-router';

export function TopNavigation() {
  return (
    <nav className="bg-[#0b0e11] border-b border-[#2b3139] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f0b90b] rounded flex items-center justify-center">
              <span className="text-black font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Binance</span>
          </NavLink>
          
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <NavLink 
              to="/buy" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              买币
            </NavLink>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
              end
            >
              行情
            </NavLink>
            <NavLink 
              to="/trade" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              交易
            </NavLink>
            <NavLink 
              to="/derivatives" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              衍生品
            </NavLink>
            <NavLink 
              to="/earn" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              理财
            </NavLink>
            <NavLink 
              to="/wallet" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              资产
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => isActive ? "text-[#f0b90b] font-semibold" : "text-white hover:text-[#f0b90b] transition-colors"}
            >
              管理
            </NavLink>
            <a href="#" className="text-white hover:text-[#f0b90b] transition-colors flex items-center gap-1">
              更多
              <Menu className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#1e2329] rounded px-3 py-2 gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索"
              className="bg-transparent border-none outline-none text-sm text-white w-40"
            />
          </div>
          
          <button className="p-2 hover:bg-[#1e2329] rounded transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="p-2 hover:bg-[#1e2329] rounded transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="p-2 hover:bg-[#1e2329] rounded transition-colors">
            <Globe className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="flex items-center gap-2 bg-[#1e2329] px-4 py-2 rounded hover:bg-[#2b3139] transition-colors">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-white hidden md:block">登录/注册</span>
          </button>
          
          <button className="bg-[#f0b90b] text-black px-4 py-2 rounded font-semibold hover:bg-[#f0b90b]/90 transition-colors hidden md:block">
            下载
          </button>
        </div>
      </div>
    </nav>
  );
}
