'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BearingInfo from '../components/BearingInfo';
import StatusChart from '../components/StatusChart';
import EnvironmentSensor from '../components/EnvironmentSensor';
import FrequencyAnalysis from '../components/FrequencyAnalysis';
import { useTheme } from '../contexts/ThemeContext';

import { Card, CardHeader, CardTitle, CardContent } from '../../spectrogram-heatmap/components/ui/card';
import { RULGauge } from '../../rul_chart/rul-gauge';
import { cn } from '../lib/utils';

const CheckCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.56"></path>
    <path d="M22 4L12 14.01l-3-3"></path>
  </svg>
);

const AlertTriangle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 20 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);


export default function Bearing3Page() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const [rulValue, setRulValue] = useState(112);
  const [confidenceValue, setConfidenceValue] = useState(87);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setRulValue(prevRul => {
        const change = (Math.random() > 0.5 ? 0.1 : -0.1);
        const newRul = Math.max(0, Math.min(100, prevRul + change));
        return parseFloat(newRul.toFixed(1));
      });
      setConfidenceValue(prevConfidence => {
        const change = (Math.random() * 0.4 - 0.2); // -0.2 to +0.2
        const newConfidence = Math.max(0, Math.min(100, prevConfidence + change));
        return parseFloat(newConfidence.toFixed(1));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        
        <Header notifications={notifications} setNotifications={setNotifications} />
        {/* 카드 2열 레이아웃 */}
        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', gap: 24 }}>
          {/* (왼쪽) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <BearingInfo bearingId="bearing3" />
            </div>
            <div style={cardStyle}>
              <FrequencyAnalysis />
            </div>
          </div>
          {/* (오른쪽) */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            <div style={cardStyle}>
              <StatusChart />
            </div>
            <div style={cardStyle}>
              {/* RUL 예측 (개선된 버전) */}
              <Card className="col-span-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <CardHeader className="flex flex-col space-y-1.5 p-6">
                  <CardTitle className="text-2xl font-bold">예측 수명 분석</CardTitle>
                  <div className="text-sm text-gray-500">잔여 수명을 예측합니다</div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <RULGauge value={rulValue} maxValue={100} unit="일" confidence={confidenceValue} />
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-500">예상 잔존수명</div>
                        <div className="text-lg font-bold">{rulValue.toFixed(1)}일</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium">정상 운영 구간</span>
                        </div>
                        <div className="text-xs text-gray-600">60일 이상 - 정상 운영 가능</div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium">주의 구간</span>
                        </div>
                        <div className="text-xs text-gray-600">30-60일 - 점검 주기 단축 권장</div>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium">교체 권장</span>
                        </div>
                        <div className="text-xs text-gray-600">30일 미만 - 즉시 교체 검토</div>
                      </div>
                    </div>
                  </div>

                  {/* 30일 트렌드 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="text-sm font-medium mb-3">최근 RUL 변화 추이 (2초 간격)</div>
                    <div className="h-20 bg-gray-50 rounded flex items-end justify-between px-2">
                      {Array.from({ length: 30 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-blue-500 w-1 rounded-t"
                          style={{ height: `${Math.random() * 60 + 40}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
