'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BearingInfo from './BearingInfo';
import StatusChart from './StatusChart';
import LifePrediction from './LifePrediction';
import EnvironmentSensor from './EnvironmentSensor';
import FrequencyAnalysis from './FrequencyAnalysis';

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
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
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <BearingInfo />
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <FrequencyAnalysis />
            </div>
          </div>
          {/* (오른쪽) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <StatusChart />
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <LifePrediction />
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <EnvironmentSensor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
