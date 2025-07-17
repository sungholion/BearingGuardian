'use client';

import { useState } from 'react';
import Header from '../components/Header';
import BearingInfo from '../components/BearingInfo';
import StatusChart from '../components/StatusChart';
import LifePrediction from '../components/LifePrediction';
import EnvironmentSensor from '../components/EnvironmentSensor';
import FrequencyAnalysis from '../components/FrequencyAnalysis';

// ... 이하 코드 동일


import { useTheme } from '../contexts/ThemeContext';

// ... 이하 코드 동일


export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'dark' ? '#1a202c' : '#f8fafc',
  };

  const cardStyle = {
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: '#333',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    border: theme === 'dark' ? '1px solid #4a5568' : 'none',
  };

  return (
    <div style={pageStyle}>
      {/* 좌측 메뉴 */}
      {/* <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((v) => !v)}
      /> */}

      {/* 우측 전체(헤더 + 본문) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 */}
        
        <Header />
        {/* 카드 2열 레이아웃 */}
        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', gap: 24 }}>
          {/* (왼쪽) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <BearingInfo />
            </div>
            <div style={cardStyle}>
              <FrequencyAnalysis />
            </div>
          </div>
          {/* (오른쪽) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <StatusChart />
            </div>
            <div style={cardStyle}>
              <LifePrediction />
            </div>
            <div style={cardStyle}>
              <EnvironmentSensor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
