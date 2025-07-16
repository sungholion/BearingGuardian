'use client';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex justify-end mb-6">
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
            aria-label={isCollapsed ? "펼치기" : "접기"}
            type="button"
          >
            <i className={`text-lg ${isCollapsed ? 'ri-arrow-right-line' : 'ri-arrow-left-line'}`}></i>
          </button>
        </div>
        <nav className="space-y-2">
          <div className={`flex items-center p-3 rounded-lg bg-blue-50 text-blue-600 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
            <i className="ri-dashboard-line text-lg"></i>
            {!isCollapsed && <span className="ml-3 font-medium">대시보드</span>}
          </div>
          <div className={`flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
            <i className="ri-user-line text-lg"></i>
            {!isCollapsed && <span className="ml-3 font-medium">사용자 입력</span>}
          </div>
        </nav>
      </div>
    </aside>
  );
}
