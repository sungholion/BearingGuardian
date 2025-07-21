'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const getStatus = (bearingId, currentStatus) => {
  let statusText = currentStatus;
  let statusColor = '#22c55e'; // Default to Green for normal
  let anomalies = [];

  switch (currentStatus) {
    case '정상':
      statusColor = '#22c55e';
      anomalies = [];
      break;
    case '내륜 결함':
      statusColor = '#ef4444';
      anomalies = ['내륜 결함 발생'];
      // Add more specific anomalies if needed based on bearingId
      if (bearingId === 'bearing2') anomalies.push('습도 이상 감지');
      break;
    case '외륜 결함':
      statusColor = '#ef4444';
      anomalies = ['외륜 결함 발생'];
      // Add more specific anomalies if needed based on bearingId
      if (bearingId === 'bearing1') anomalies.push('온도 임계치 초과');
      break;
    default:
      statusColor = '#22c55e';
      anomalies = [];
  }

  return { text: statusText, color: statusColor, anomalies: anomalies };
};

export default function BearingSummaryCard({ bearingId, rulValue, remainingCycles, currentStatus }) {
  const { theme } = useTheme();
  const status = getStatus(bearingId, currentStatus);

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
      <div style={{ display: 'flex', marginTop: '24px', gap: '24px' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img 
            src={`/${bearingId === 'bearing1' ? 'moving_bearing' : 'moving' + bearingId.replace('bearing', '')}.gif`}
            alt="베어링 이미지"
            style={{ width: '200px', height: '200px', objectFit: 'contain' }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
          <div>
            <p style={{ fontSize: '1rem', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>예측 잔존 수명 (RUL)</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{rulValue} <span style={{fontSize: '1.5rem'}}>일</span></p>
          </div>
          <div>
            <p style={{ fontSize: '1rem', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>잔여 사이클 수</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{remainingCycles.toLocaleString()} <span style={{fontSize: '1.5rem'}}>사이클</span></p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24, borderTop: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`, paddingTop: 24 }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}>감지된 이상</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {status.anomalies.map((anomaly, index) => (
            <li key={index} style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#cbd5e1' : '#475569', marginBottom: 4 }}>
              - {anomaly}
            </li>
          ))}
          {status.anomalies.length === 0 && (
            <li style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#cbd5e1' : '#475569' }}>이상 없음</li>
          )}
        </ul>
      </div>
    </div>
  );
}
