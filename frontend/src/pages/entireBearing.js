'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BearingSummaryCard from '../components/BearingSummaryCard';
import { useTheme } from '../contexts/ThemeContext';

export default function EntireBearingPage() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, message: '베어링 1 온도 임계치 초과', timestamp: '2025-07-21 12:01:00' },
    { id: 2, message: '베어링 3 외륜 결함 발생', timestamp: '2025-07-21 12:00:00' },
    { id: 3, message: '시스템 정기 점검 예정 (2025-07-22 09:00)', timestamp: '2025-07-21 11:55:00' },
    { id: 4, message: '베어링 4 내륜 결함 의심', timestamp: '2025-07-21 11:50:00' },
    { id: 5, message: '베어링 2 온도 센서 오류 감지', timestamp: '2025-07-21 11:45:00' },
    { id: 6, message: '베어링 1 외륜 결함 심화', timestamp: '2025-07-21 11:40:00' },
    { id: 7, message: '전체 시스템 긴급 점검 필요', timestamp: '2025-07-21 11:35:00' },
    { id: 8, message: '베어링 3 온도 정상 범위 복귀', timestamp: '2025-07-21 11:30:00' },
    { id: 9, message: '데이터베이스 서버 점검 (2025-07-21 23:00)', timestamp: '2025-07-21 11:25:00' },
  ]);

  const [rulValues, setRulValues] = useState({
    bearing1: 75,
    bearing2: 55,
    bearing3: 112,
    bearing4: 93,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRulValues(prevRulValues => {
        const newRulValues = { ...prevRulValues };
        for (const bearingId of bearingIds) {
          const change = (Math.random() > 0.5 ? 0.1 : -0.1);
          const newRul = Math.max(0, Math.min(100, prevRulValues[bearingId] + change));
          newRulValues[bearingId] = parseFloat(newRul.toFixed(1));
        }
        return newRulValues;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'dark' ? '#1a202c' : '#f8fafc',
  };

  const bearingIds = ['bearing1', 'bearing2', 'bearing3', 'bearing4'];

  return (
    <div style={pageStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header notifications={notifications} setNotifications={setNotifications} />
        <div style={{ flex: 1, padding: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '32px', color: theme === 'dark' ? 'white' : 'black' }}>베어링 전체 현황</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            {bearingIds.map(id => (
              <BearingSummaryCard key={id} bearingId={id} rulValue={rulValues[id]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
