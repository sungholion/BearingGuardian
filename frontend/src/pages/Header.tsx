import Link from 'next/link';

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
  const activePath = "/"; // 실제 서비스는 useRouter().pathname 등 사용

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
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = m.link === activePath ? "#1646d9" : "#2563eb";
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
          <div style={{
            position: 'relative',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellIcon />
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
              3
            </span>
          </div>
          {/* 회원 아이콘 */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#f1f5fb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid gray',
            cursor: 'pointer',
          }}>
            <UserIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
