'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const getStatus = (bearingId) => {
  // 실제로는 API 호출 등을 통해 상태를 가져와야 합니다.
  if (bearingId === 'bearing1') return { text: '온도 임계치 초과', color: '#ef4444' };
  if (bearingId === 'bearing3') return { text: '외륜 결함 발생', color: '#f97316' };
  return { text: '정상', color: '#22c55e' };
};

export default function BearingSummaryCard({ bearingId, rulValue }) {
  const { theme } = useTheme();
  const status = getStatus(bearingId);

  const cardStyle = {
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{bearingId.replace('bearing', '베어링 ')}</h3>
        <span style={{
          backgroundColor: status.color,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          {status.text}
        </span>
      </div>
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: '1rem', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>예측 잔존 수명 (RUL)</p>
        <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{rulValue} <span style={{fontSize: '1.5rem'}}>일</span></p>
      </div>
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: '1rem', marginBottom: 8, color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>최근 진동 추이</p>
        <div style={{ height: 60, background: theme === 'dark' ? '#1e293b' : '#f1f5f9', borderRadius: 8 }}>
          {/* 여기에 작은 차트가 들어갈 수 있습니다. */}
        </div>
      </div>
    </div>
  );
}
