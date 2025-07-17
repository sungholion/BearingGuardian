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

export default function Header() {
  const router = useRouter(); // useRouter 훅을 초기화합니다.
  const activePath = router.pathname; // 현재 페이지의 경로를 가져와 activePath에 할당합니다.

  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [showUserTooltip, setShowUserTooltip] = useState(false);

  // Mock notification data
  const [notifications, setNotifications] = useState([
    { id: 1, message: '베어링 A에 새로운 결함 감지', timestamp: '2025-07-17 10:30:00' },
    { id: 2, message: '베어링 B 정기 점검 예정', timestamp: '2025-07-16 14:00:00' },
    { id: 3, message: '시스템 업데이트 완료', timestamp: '2025-07-15 09:00:00' },
    { id: 4, message: '베어링 C 온도 이상 감지', timestamp: '2025-07-17 11:00:00' },
    { id: 5, message: '베어링 D 진동 패턴 변화', timestamp: '2025-07-17 11:15:00' },
    { id: 6, message: '베어링 E 수명 예측 경고', timestamp: '2025-07-17 11:30:00' },
    { id: 7, message: '베어링 F 소음 레벨 증가', timestamp: '2025-07-17 11:45:00' },
  ]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 35 }}>
          {menus.map((m) => (
            <Link key={m.link} href={m.link} legacyBehavior>
              <a
                style={{
                  fontSize: "1.5rem",
                  color: m.link === activePath ? "#1646d9" : "#727171ff",
                  fontWeight: m.link === activePath ? 700 : 500,
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  background: "none",
                  transition: "background .15s, color .15s, font-weight .15s",
                  cursor: "pointer",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "#f1f5fb";
                  e.currentTarget.style.color = "#1a3184";
                }}
                onMouseOut={e => {
                  // 현재 활성 경로와 일치하지 않을 때만 원래 색상으로 되돌립니다.
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = m.link === activePath ? "#1646d9" : "#727171ff"; // 원래 색상으로 변경
                }}
              >
                {m.name}
              </a>
            </Link>
          ))}
        </div>
        {/* 아이콘 그룹: 알림 → 회원 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20, // 아이콘끼리 간격
        }}>
          {/* 알림 아이콘 */}
          <div
            style={{
              position: 'relative',
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
            {notifications.length > 0 && (
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
                {notifications.length > 0 ? (
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
                    <span style={{ fontWeight: 'bold' }}>담당자:</span> 김성훈
                  </li>
                  <li style={{ marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>역할:</span> 관리자
                  </li>
                  <li>
                    <span style={{ fontWeight: 'bold' }}>이메일:</span> user@example.com
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