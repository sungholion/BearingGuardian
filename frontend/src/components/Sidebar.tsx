'use client';

import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { theme } = useTheme();

  const asideClass = `
    transition-all duration-300 flex flex-col 
    ${isCollapsed ? 'w-16' : 'w-64'}
    ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
  `;

  const buttonClass = `
    w-8 h-8 flex items-center justify-center rounded
    ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
  `;

  const linkClass = `
    flex items-center p-3 rounded-lg cursor-pointer
    ${isCollapsed ? 'justify-center' : ''}
    ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}
  `;

  return (
    <aside className={asideClass.trim()}>
      <div className="p-4">
        <div className="flex justify-end mb-6">
          <button
            onClick={onToggle}
            className={buttonClass.trim()}
            aria-label={isCollapsed ? "펼치기" : "접기"}
            type="button"
          >
            <i className={`text-lg ${isCollapsed ? 'ri-arrow-right-line' : 'ri-arrow-left-line'}`}></i>
          </button>
        </div>
        <nav className="space-y-2">
          <div className="relative">
            <button
              className={`${linkClass.trim()} w-full text-left`}
              onMouseEnter={(e) => {
                if (!isCollapsed) {
                  const dropdown = e.currentTarget.nextElementSibling;
                  if (dropdown) {
                    dropdown.classList.remove('hidden');
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isCollapsed) {
                  const dropdown = e.currentTarget.nextElementSibling;
                  if (dropdown) {
                    dropdown.classList.add('hidden');
                  }
                }
              }}
            >
              <i className="ri-dashboard-line text-lg"></i>
              {!isCollapsed && <span className="ml-3 font-medium">대시보드</span>}
            </button>
            <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg hidden z-10">
              <a href="/bearing1" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">베어링 1</a>
              <a href="/bearing2" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">베어링 2</a>
              <a href="/bearing3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">베어링 3</a>
              <a href="/bearing4" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">베어링 4</a>
            </div>
          </div>
          <a href="/history" className={linkClass.trim()}>
            <i className="ri-history-line text-lg"></i>
            {!isCollapsed && <span className="ml-3 font-medium">History</span>}
          </a>
          <a href="/settings" className={linkClass.trim()}>
            <i className="ri-settings-3-line text-lg"></i>
            {!isCollapsed && <span className="ml-3 font-medium">Settings</span>}
          </a>
        </nav>
      </div>
    </aside>
  );
}
