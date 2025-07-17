'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../contexts/ThemeContext';

export default function LogsPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('logs');

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'dark' ? '#1a202c' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
  };

  const contentAreaStyle = {
    flex: 1,
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  };

  const cardStyle = {
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#333',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #f0f0f0',
  };

  const tabButtonStyle = (tabName) => ({
    padding: '10px 20px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #007bff' : '3px solid transparent',
    background: 'transparent',
    color: activeTab === tabName ? '#007bff' : (theme === 'dark' ? '#a0aec0' : '#555'),
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 16,
  });

  return (
    <div style={pageStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={contentAreaStyle}>
          {/* 페이지 타이틀 */}
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>시스템 로그 관리</h1>
          </div>

          {/* 탭 메뉴 */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}` }}>
            <button style={tabButtonStyle('logs')} onClick={() => setActiveTab('logs')}>로그 보기</button>
            <button style={tabButtonStyle('settings')} onClick={() => setActiveTab('settings')}>설정</button>
            <button style={tabButtonStyle('history')} onClick={() => setActiveTab('history')}>실행 기록</button>
          </div>

          {/* 탭 내용 */}
          <div style={cardStyle}>
            {activeTab === 'logs' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>로그 내용</h2>
                <textarea
                  readOnly
                  style={{
                    width: '100%',
                    height: '400px',
                    background: theme === 'dark' ? '#1a202c' : '#f0f0f0',
                    color: theme === 'dark' ? '#e2e8f0' : '#333',
                    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ddd'}`,
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 14,
                    fontFamily: 'monospace',
                    resize: 'none',
                  }}
                  value={`
[2025-07-17 10:00:00] INFO: Application started successfully.
[2025-07-17 10:01:15] DEBUG: Sensor data received from Bearing A.
[2025-07-17 10:02:30] INFO: Data processing initiated for Bearing A.
[2025-07-17 10:03:45] WARNING: Vibration anomaly detected in Bearing B. Threshold exceeded.
[2025-07-17 10:05:00] ERROR: Failed to connect to database. Retrying...
[2025-07-17 10:06:10] INFO: Database connection re-established.
[2025-07-17 10:07:25] DEBUG: Sending notification to maintenance team for Bearing B.
[2025-07-17 10:08:40] INFO: Report generated for daily operations.
[2025-07-17 10:10:00] INFO: System health check passed.
[2025-07-17 10:11:15] DEBUG: Sensor data received from Bearing C.
[2025-07-17 10:12:30] INFO: Data processing initiated for Bearing C.
[2025-07-17 10:13:45] WARNING: Temperature of Bearing D is slightly elevated.
[2025-07-17 10:15:00] INFO: User 'admin' logged in.
[2025-07-17 10:16:10] DEBUG: Performing routine data archival.
[2025-07-17 10:17:25] INFO: Bearing E remaining useful life prediction: 120 days.
[2025-07-17 10:18:40] ERROR: Disk space low on data archive server. Action required.
[2025-07-17 10:20:00] INFO: Application running smoothly.
                  `}
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
                    background: theme === 'dark' ? '#1a202c' : '#f8f8f8',
                    color: theme === 'dark' ? '#e2e8f0' : '#555',
                    cursor: 'pointer',
                  }}>로그 새로고침</button>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#007bff',
                    color: '#fff',
                    cursor: 'pointer',
                  }}>로그 다운로드</button>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>로그 설정</h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: theme === 'dark' ? '#a0aec0' : '#555', marginBottom: 8 }}>로그 레벨:</label>
                  <select style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
                    background: theme === 'dark' ? '#1a202c' : '#fff',
                    color: theme === 'dark' ? '#e2e8f0' : '#333',
                  }}>
                    <option>INFO</option>
                    <option>DEBUG</option>
                    <option>WARNING</option>
                    <option>ERROR</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: theme === 'dark' ? '#a0aec0' : '#555', marginBottom: 8 }}>로그 보존 기간 (일):</label>
                  <input type="number" value="30" style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
                    background: theme === 'dark' ? '#1a202c' : '#fff',
                    color: theme === 'dark' ? '#e2e8f0' : '#333',
                  }} />
                </div>
                <button style={{
                  marginTop: 12,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#007bff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}>설정 저장</button>
              </div>
            )}
            {activeTab === 'history' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>로그 실행 기록</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${theme === 'dark' ? '#4a5568' : '#eee'}` }}>
                    <div style={{ fontWeight: 'bold' }}>2025-07-17 10:00:00 - 로그 다운로드</div>
                    <div style={{ fontSize: 12, color: theme === 'dark' ? '#a0aec0' : '#777' }}>사용자: admin</div>
                  </li>
                  <li style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${theme === 'dark' ? '#4a5568' : '#eee'}` }}>
                    <div style={{ fontWeight: 'bold' }}>2025-07-16 15:30:00 - 로그 레벨 변경 (DEBUG)</div>
                    <div style={{ fontSize: 12, color: theme === 'dark' ? '#a0aec0' : '#777' }}>사용자: system</div>
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