'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, // AreaChart와 Area 컴포넌트를 임포트합니다.
} from 'recharts';

// 커스텀 레이블 컴포넌트 정의
const CustomLabel = ({ x, y, stroke, value }) => {
  // Line 위에 값을 표시할 위치와 스타일 조정
  return (
    <text x={x} y={y} dy={-10} fill={stroke} fontSize={12} textAnchor="middle">
      {value}
    </text>
  );
};


export default function FrequencyAnalysis() {
  const realtimeData = [
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">실시간 주파수 분석</h2>
        <span className="text-sm text-gray-500">2025/07/08 15:00 기준</span>
      </div>
      <p className="text-sm text-gray-600 mb-6">베어링의 실시간 주파수 변화와 평균 변동을 분석합니다</p>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* (1) 실시간 주파수 추이 */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* 타이틀 + 범례 */}
          <div style={{ minHeight: 66 }}>
            <h4 className="text-center font-bold text-xl whitespace-nowrap mb-1">
              실시간 주파수 추이
            </h4>
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#69C7C5] mr-2"></div>
                  <span className="text-xs text-gray-600">평균</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#4477D8] mr-2"></div>
                  <span className="text-xs text-gray-600">현재</span>
                </div>
              </div>
            </div>
          </div>
          {/* 차트 */}
          <div className="flex-1 border border-gray-300 rounded-lg flex items-center justify-center overflow-x-auto min-w-0 p-0">
            <div className="w-full min-w-[400px] max-w-[600px] h-[420px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={realtimeData}
                  margin={{ top: 24, right: 24, left: 0, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="freq" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="previous"
                    stackId="a"
                    fill="#69C7C5"
                    radius={[0, 0, 0, 0]}
                    label={{ position: 'insideBottom', fill: '#ffffff', fontSize: 10 }}
                  />
                  <Bar
                    dataKey="current"
                    stackId="a"
                    fill="#4477D8"
                    radius={[4, 4, 0, 0]}
                    label={{ position: 'insideTop', fill: '#ffffff', fontSize: 10 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* (2) 주파수 변동(평균) 차트 */}
        <div className="flex flex-col flex-1 min-w-0 pr-2 sm:pr-0">
          <div style={{ minHeight: 66 }}>
            <h4 className="text-center font-bold text-xl whitespace-nowrap mb-1">
              주파수 변동(평균) 차트
            </h4>
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#4477D8] mr-2"></div>
                  <span className="text-xs text-gray-600">주파수1</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#69C7C5] mr-2"></div>
                  <span className="text-xs text-gray-600">주파수2</span>
                </div>
              </div>
            </div>
          </div>
          {/* 차트 */}
          <div className="flex-1 border border-gray-300 rounded-lg flex items-center justify-center overflow-x-auto min-w-0 p-0">
            <div className="w-full min-w-[400px] max-w-[600px] h-[420px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={variationData}
                  margin={{ top: 24, right: 24, left: 8, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    domain={[0, 160]}
                    tickCount={7}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                    itemStyle={{ color: '#555' }}
                  />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4477D8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4477D8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#69C7C5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#69C7C5" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <Area
                    type="monotone"
                    dataKey="freq1"
                    stroke="#4477D8"
                    strokeWidth={3}
                    dot={{ fill: '#4477D8', r: 4 }}
                    fill="url(#colorSales)"
                    label={<CustomLabel />} // CustomLabel 컴포넌트 적용
                  />
                  <Area
                    type="monotone"
                    dataKey="freq2"
                    stroke="#69C7C5"
                    strokeWidth={3}
                    dot={{ fill: '#69C7C5', r: 4 }}
                    fill="url(#colorCost)"
                    label={<CustomLabel />} // CustomLabel 컴포넌트 적용
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}