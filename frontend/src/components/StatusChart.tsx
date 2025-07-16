'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function StatusChart() {
  const pieData = [
    { name: 'Ball', value: 73, color: '#ef4444' },
    { name: 'IR', value: 22, color: '#10b981' },
    { name: 'OR', value: 44, color: '#f59e0b' },
  ];
  const barList = [
    { label: 'Ball', value: 73, color: '#ef4444' },
    { label: 'IR', value: 22, color: '#10b981' },
    { label: 'OR', value: 44, color: '#f59e0b' },
  ];

  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    const textColor = '#ffffff';

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        <tspan x={x} dy="-0.6em">{name}</tspan>
        <tspan x={x} dy="1.2em">({value}%)</tspan>
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">상태</h2>
        <span className="text-sm text-gray-500">2025/07/08 15:00 기준</span>
      </div>
      <p className="text-sm text-gray-600 mb-6">베어링 구성 요소별 상태를 분석합니다</p>

      <div className="flex flex-row gap-4 flex-1 min-h-[172px] items-start">
        {/* --- 도넛 차트 --- */}
        <div className="flex flex-col items-center justify-start w-70">
          <h4 className="text-lg font-bold mb-2">누적 품질 현황</h4> {/* 타이틀 */}

          <div className="relative w-56 h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: '#555' }}
                  formatter={(value, name, props) => {
                    const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
                    return [`${value}건 (${percentage}%)`, props.payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
              <span className="text-sm text-red-600 font-bold">위험</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-7 justify-start">
          <h4 className="text-lg font-bold mb-2">실시간 불량 건수</h4>

          {barList.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-black-600">{label}</span>
                <span className="text-xs text-black-500">{value}건</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${value}%`,
                    backgroundColor: color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}