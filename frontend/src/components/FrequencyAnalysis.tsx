import { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../spectrogram-heatmap/components/ui/card';
import SpectrogramHeatmap from './SpectrogramHeatmap';

// 커스텀 레이블 컴포넌트 정의
const CustomLabel = ({ x, y, stroke, value }) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;

  return (
    <text x={x} y={y} dy={-10} fill="#000000" fontSize={12} textAnchor="middle">
      {formattedValue} Hz
    </text>
  );
};


export default function FrequencyAnalysis() {
  const [currentTime, setCurrentTime] = useState(null); // Add currentTime state

  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date()); // Set initial time on mount
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to format date and time
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} 기준`;
  };

  const initialRealtimeData = [
    { freq: 'S', current: 10, previous: 0.2 },
    { freq: 'M', current: 4.8, previous: 1.5 },
    { freq: 'T', current: 7.5, previous: 3.8 },
    { freq: 'W', current: 8.5, previous: 3.1 },
    { freq: 'T', current: 8.8, previous: 3.2 },
    { freq: 'F', current: 2.8, previous: 3.1 },
    { freq: 'S', current: 5.2, previous: 3.1 },
    { freq: 'M', current: 1.5, previous: 3.1 },
    { freq: 'T', current: 1.7, previous: 3.1 },
    { freq: 'W', current: 9.8, previous: 3.1 },
    { freq: 'T', current: 2.3, previous: 3.1 },
    { freq: 'F', current: 9.7, previous: 3.1 },
    { freq: 'S', current: 4.8, previous: 3.1 },
  ];

  const [realtimeData, setRealtimeData] = useState(initialRealtimeData);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prevData =>
        prevData.map(item => {
          const newCurrent = parseFloat((item.current + (Math.random() * 2 - 1) * 0.5).toFixed(1)); // +/- 0.5
          const newPrevious = parseFloat((item.previous + (Math.random() * 2 - 1) * 0.2).toFixed(1)); // +/- 0.2

          return {
            ...item,
            current: Math.max(1.0, Math.min(10.0, newCurrent)), // Clamp between 1.0 and 10.0
            previous: Math.max(0.1, Math.min(4.0, newPrevious)), // Clamp between 0.1 and 4.0
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const variationData = [
    { time: '15:00', freq1: 70, freq2: 20 },
    { time: '15:30', freq1: 95, freq2: 45 },
    { time: '16:00', freq1: 85, freq2: 35 },
    { time: '16:30', freq1: 110, freq2: 60 },
    { time: '17:00', freq1: 70, freq2: 40 },
    { time: '17:30', freq1: 135, freq2: 55 },
    { time: '18:00', freq1: 88, freq2: 58 },
    { time: '18:30', freq1: 72, freq2: 30 },
    { time: '19:00', freq1: 98, freq2: 48 },
    { time: '19:30', freq1: 85, freq2: 35 },
  ];

  const colorPreviousPurple = '#A0B3F7';
  const colorCurrentPurple = '#7B68EE';


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col space-y-1.5 p-6">
        <CardTitle className="text-2xl font-bold">실시간 주파수 분석</CardTitle>
        <CardDescription className="text-sm text-gray-600">베어링의 실시간 주파수 변화와 히트맵으로 패턴을 확인합니다</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-0">
        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* (1) 실시간 주파수 추이 - 웨이브폼 차트 (보라색 계열) */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* 타이틀 + 범례 */}
            <div style={{ minHeight: 66 }}>
              <h4 className="text-center font-bold text-xl whitespace-nowrap mb-1">
                실시간 주파수 추이
              </h4>
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3" style={{ backgroundColor: colorPreviousPurple }}></div>
                    <span className="text-xs text-gray-600">평균</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3" style={{ backgroundColor: colorCurrentPurple }}></div>
                    <span className="text-xs text-gray-600">실시간</span>
                  </div>
                </div>
              </div>
            </div>
            {/* 차트 */}
            <div className="flex-1 border border-gray-300 rounded-lg flex items-center justify-center overflow-x-auto p-0">
              <div className="w-full h-full"> {/* min-w, max-w, mx-auto 제거 */}
                <ResponsiveContainer width="100%" height="100%"> {/* height를 100%로 설정 */}
                  <AreaChart
                    data={realtimeData}
                    margin={{ top: 24, right: 24, left: 0, bottom: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="freq" tick={{ fontSize: 12 }} stroke="#6b7280" label={{ value: '주파수 대역 (Hz)', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
                    {/* YAxis domain을 최대 current 또는 previous 값에 맞게 조정 (예: 0부터 12 또는 데이터 최대값 + 여유) */}
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" domain={[0, 12]} label={{ value: '진폭 (mm/s)', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <defs>
                      <linearGradient id="gradientPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorPreviousPurple} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colorPreviousPurple} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="gradientCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorCurrentPurple} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colorCurrentPurple} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>

                    <Area
                      type="monotone"
                      dataKey="previous"
                      // stackId="realtimeStack" // ⚠️ 이 라인을 제거하여 스택 기능을 비활성화합니다.
                      stroke={colorPreviousPurple}
                      fill="url(#gradientPrevious)"
                      strokeWidth={2}
                      dot={{ fill: colorPreviousPurple, r: 3 }}
                      label={<CustomLabel />}
                    />
                    <Area
                      type="monotone"
                      dataKey="current"
                      // stackId="realtimeStack" // ⚠️ 이 라인을 제거하여 스택 기능을 비활성화합니다.
                      stroke={colorCurrentPurple}
                      fill="url(#gradientCurrent)"
                      strokeWidth={2}
                      dot={{ fill: colorCurrentPurple, r: 3 }}
                      label={<CustomLabel />}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0 pr-2 sm:pr-0">
            <SpectrogramHeatmap />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}