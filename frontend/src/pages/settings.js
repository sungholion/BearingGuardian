'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

const translations = {
  ko: {
    settings: '설정',
    profileSettings: '프로필 설정',
    name: '이름',
    email: '이메일',
    company: '소속',
    save: '저장',
    displaySettings: '화면 표시 설정',
    theme: '테마',
    light: '라이트',
    dark: '다크',
    language: '언어',
    korean: '한국어',
    english: 'English',
    systemLogManagement: '시스템 로그 관리',
    systemLogDescription: '시스템 로그를 확인하고 관리합니다.',
    goToLogPage: '로그 관리 페이지로 이동',
    bearingMonitoringSystem: '베어링 모니터링 시스템',
  },
  en: {
    settings: 'Settings',
    profileSettings: 'Profile Settings',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    save: 'Save',
    displaySettings: 'Display Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    korean: '한국어',
    english: 'English',
    systemLogManagement: 'System Log Management',
    systemLogDescription: 'View and manage system logs.',
    goToLogPage: 'Go to Log Management Page',
    bearingMonitoringSystem: 'Bearing Monitoring System',
  },
};

// 각 섹션을 위한 카드 컴포넌트
function SettingsCard({ title, children, theme }) {
  const cardStyle = {
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#333',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '24px',
    border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #f0f0f0',
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: theme === 'dark' ? '#e2e8f0' : '#333',
    borderBottom: theme === 'dark' ? '1px solid #4a5568' : '1px solid #f0f0f0',
    paddingBottom: 16,
    marginBottom: 24,
  };

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// 입력 필드 컴포넌트
function InputField({ label, value, type = 'text', theme }) {
    const [inputValue, setInputValue] = useState(value);
    const labelStyle = {
        display: 'block',
        color: theme === 'dark' ? '#a0aec0' : '#555',
        marginBottom: 8,
        fontSize: 14,
    };
    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e0e0e0',
        background: theme === 'dark' ? '#1a202c' : '#fff',
        color: theme === 'dark' ? '#e2e8f0' : '#333',
        fontSize: 14,
    };
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{label}</label>
            <input
                type={type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={inputStyle}
            />
        </div>
    );
}


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState('ko');
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

  const t = (key) => translations[currentLanguage][key] || key;

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'dark' ? '#1a202c' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
  };

  return (
    <div style={pageStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header notifications={notifications} setNotifications={setNotifications} />
        <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column' }}>
          {/* 페이지 타이틀 */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('settings')}</h1>
          </div>

          {/* 프로필 설정 카드 */}
          <SettingsCard title={t('profileSettings')} theme={theme}>
            <InputField label={t('name')} value="조성호" theme={theme} />
            <InputField label={t('email')} value="sung@gmail.com" theme={theme} />
            <InputField label={t('company')} value="21-F 공정 32N 컨베이어벨트 설비보전팀" theme={theme} />
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
            }}>
                {t('save')}
            </button>
          </SettingsCard>

          {/* 화면 표시 설정 카드 */}
          <SettingsCard title={t('displaySettings')} theme={theme}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 500 }}>{t('theme')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setTheme('light')}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 8, 
                    border: theme === 'light' ? '1px solid #007bff' : '1px solid #4a5568', 
                    background: theme === 'light' ? '#e0f2ff' : 'transparent', 
                    color: theme === 'light' ? '#007bff' : '#a0aec0',
                    cursor: 'pointer',
                  }}
                >
                  {t('light')}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 8, 
                    border: theme === 'dark' ? '1px solid #007bff' : '1px solid #4a5568', 
                    background: theme === 'dark' ? '#007bff' : 'transparent', 
                    color: theme === 'dark' ? '#fff' : '#555',
                    cursor: 'pointer',
                  }}
                >
                  {t('dark')}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 500 }}>{t('language')}</div>
              <select 
                onChange={(e) => setCurrentLanguage(e.target.value)}
                value={currentLanguage}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e0e0e0',
                  background: theme === 'dark' ? '#1a202c' : '#fff',
                  color: theme === 'dark' ? '#e2e8f0' : '#333',
              }}>
                <option value="ko">{t('korean')}</option>
                <option value="en">{t('english')}</option>
              </select>
            </div>
          </SettingsCard>

          {/* 시스템 로그 관리 카드 */}
          <SettingsCard title={t('systemLogManagement')} theme={theme}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: theme === 'dark' ? '#a0aec0' : '#555', fontSize: 14 }}>
                {t('systemLogDescription')}
              </p>
            </div>
            <a href="/settings/logs" style={{
                display: 'inline-block',
                marginTop: 12,
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#007bff',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
            }}>
                {t('goToLogPage')}
            </a>
          </SettingsCard>

        </div>
      </div>
    </div>
  );
}