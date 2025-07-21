import Link from 'next/link';
import { useRouter } from 'next/router'; // useRouter 훅을 import 합니다.
import { useState } from 'react'; // useState 훅을 import 합니다.

const BellIcon = () => (
  <svg width="25" height="25" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C6.64 5.36 5 7.929 5 11v3.159c0 .538-.214 1.055-.595 1.436L3 17h5m7 0a3.001 3.001 0 01-6 0m6 0H9"/>
  </svg>
);

const UserIcon = () => (
  <svg width="27" height="27" fill="none" stroke="gray" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.313 3.134-6 7-6s7 2.687 7 6" />
  </svg>
);

const menus = [
  { name: "Dashboard", link: "/" },
  { name: "History", link: "/history" },
  { name: "Settings", link: "/settings" },
];

export default function Header({ notifications, setNotifications }) {
  const router = useRouter();
  const activePath = router.pathname;

  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [showUserTooltip, setShowUserTooltip] = useState(false);

  // 베어링 페이지 목록
  const bearingPages = [
    { name: '베어링 1', link: '/' },
    { name: '베어링 2', link: '/bearing2' },
    { name: '베어링 3', link: '/bearing3' },
    { name: '베어링 4', link: '/bearing4' },
    { name: '베어링 전체', link: '/entireBearing' },
  ];

  return (
    <div
      style={{
        height: '100px',
        backgroundColor: 'rgba(1, 60, 255, 0.06)',
        boxShadow: '0 2px 8px rgba(1, 60, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        marginBottom: 24,
      }}
    >
      {/* 좌측: 로고+텍스트 (홈 이동) */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          cursor: "pointer",
        }}>
          <img
            src="/logo.png"
            alt="로고"
            style={{
              width: 120,
              height: 120,
              objectFit: 'contain',
              verticalAlign: 'middle',
            }}
          />
          <span style={{
            fontWeight: 700,
            fontSize: '1.8rem',
            color: 'black',
            letterSpacing: '-0.02em',
            textShadow: '0 1px 4px rgba(0,0,0,0.08)',
            verticalAlign: 'middle',
          }}>
            베어링 모니터링 시스템
          </span>
        </div>
      </Link>

      
      {/* 우측: 메뉴 → 알림 → 회원 아이콘 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 50,
      }}>
        {/* 메뉴 3개 */}
        <div style={{ display: 'flex', position: 'relative', right: 100, alignItems: 'center', gap: 35 }}>
          {menus.map((m) => (
            <div key={m.link} className="relative group">
              <Link href={m.link} legacyBehavior>
                <a
                  className="text-lg font-medium text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md transition-colors duration-200"
                >
                  {m.name}
                </a>
              </Link>
              {m.name === "Dashboard" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {bearingPages.map((b) => (
                    <Link key={b.link} href={b.link} legacyBehavior>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{b.name}</a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 아이콘 그룹: 알림 → 회원 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 30, // 아이콘끼리 간격
        }}>
          {/* 알림 아이콘 */}
          <div
            style={{
              position: 'relative',
              right: 90,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setShowNotificationTooltip(prev => !prev)}
          >
            <BellIcon />
            {notifications?.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -7,
                right: -7,
                background: '#ef4444',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                padding: '2px 7px',
                minWidth: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.13)',
              }}>
                {notifications.length}
              </span>
            )}
            {showNotificationTooltip && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-60%)', // Adjusted to move slightly left
                marginTop: '10px',
                padding: '15px',
                background: '#fff',
                color: '#333',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
                zIndex: 100,
                width: '300px',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1rem' }}>알림</h4>
                {(notifications && notifications.length > 0) ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {notifications.map(notif => (
                      <li key={notif.id} style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{notif.message}</div>
                        <div style={{ fontSize: '0.75rem', color: '#777' }}>{notif.timestamp}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#777' }}>새로운 알림이 없습니다.</p>
                )}
              </div>
            )}
          </div>
          {/* 회원 아이콘 */}
          <div
            style={{
              position: 'relative', // Add this line
              right: 100,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#f1f5fb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid gray',
              cursor: 'pointer',
            }}
            onClick={() => setShowUserTooltip(prev => !prev)}
          >
            <UserIcon />
            {showUserTooltip && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '10px',
                padding: '15px',
                background: '#fff',
                color: '#333',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
                zIndex: 100,
                width: '200px',
                border: '1px solid #ddd',
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1rem' }}>사용자 정보</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>담당자:</span> 조성호
                  </li>
                  <li style={{ marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>역할:</span> 관리자
                  </li>
                  <li>
                    <span style={{ fontWeight: 'bold' }}>이메일:</span> sung@gmail.com
                  </li>
                </ul>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
    
  );
}