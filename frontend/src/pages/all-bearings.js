'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

export default function AllBearingsPage() {
  const { theme } = useTheme();

  // 각 베어링의 목업 데이터
  const allBearingsData = [
    {
      id: 'bearing1',
      name: '베어링 1',
      rul: 75,
      defectType: 'Normal',
      temperature: 35,
      humidity: 60,
    },
    {
      id: 'bearing2',
      name: '베어링 2',
      rul: 65,
      defectType: 'IR',
      temperature: 40,
      humidity: 55,
    },
    {
      id: 'bearing3',
      name: '베어링 3',
      rul: 80,
      defectType: 'Normal',
      temperature: 30,
      humidity: 65,
    },
    {
      id: 'bearing4',
      name: '베어링 4',
      rul: 50,
      defectType: 'OR',
      temperature: 45,
      humidity: 50,
    },
  ];

  // 전체 베어링 개수
  const totalBearings = allBearingsData.length;
  // 정상 베어링 개수
  const normalBearings = allBearingsData.filter(b => b.defectType === 'Normal').length;
  // 이상 베어링 개수
  const abnormalBearings = totalBearings - normalBearings;

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header /> {/* Header는 그대로 사용 */}

        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 상단 요약 정보 */}
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>전체 베어링</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>{totalBearings}개</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>정상 베어링</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{normalBearings}개</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>이상 베어링</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{abnormalBearings}개</p>
            </div>
          </div>

          {/* 베어링 정보 컨테이너 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, flexGrow: 1 }}>
            {allBearingsData.map(bearing => (
              <div key={bearing.id} style={cardStyle}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>{bearing.name}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>잔여 수명:</span> {bearing.rul}일
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>이상 유형:</span> {bearing.defectType}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>온도:</span> {bearing.temperature}°C
                </div>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>습도:</span> {bearing.humidity}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}