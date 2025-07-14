export default function Header() {
  return (
    <div
      style={{
        height: '200px',
        backgroundImage: "url('https://templates.iqonic.design/hope-ui/html/dist/assets/images/dashboard/top-header.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontWeight: 'bold',
        fontSize: '2rem',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '36px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: 24,
        color: '#fff', // 글씨가 잘 보이게 색상 변경
        textShadow: '0 1px 6px rgba(0,0,0,0.15)', // 텍스트 가독성 추가
      }}
    >
      베어링 모니터링 시스템
    </div>
  );
}