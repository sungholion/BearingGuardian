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
        {/* <tspan> 요소를 사용하여 줄 바꿈 구현 */}
        <tspan x={x} dy="-0.6em">{name}</tspan> {/* 첫 번째 줄 (name) */}
        <tspan x={x} dy="1.2em">({value}건)</tspan> {/* 두 번째 줄 (value), dy로 상대적인 Y 위치 조정 */}
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

      {/* flex-row의 gap을 조절하여 전체 컨테이너 여백 확보 */}
      {/* items-start로 변경하여 두 차트의 상단이 정렬되도록 함 */}
      <div className="flex flex-row gap-4 flex-1 min-h-[172px] items-start">
        {/* --- 도넛 차트 --- */}
        <div className="flex flex-col items-center justify-start w-70"> 
          {/* 도넛 차트 자체의 크기 더 키움: w-56 h-56 */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45} // 굵기 조절
                  outerRadius={90} // 전체 원의 크기
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
            {/* 도넛 중앙 표시 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
              <span className="text-sm text-red-600 font-bold">위험</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-l text-black-600 font-semibold">누적 품질 현황</span>
          </div>
        </div>

        {/* --- Progress Bar --- */}
        {/* 프로그레스 바 시작점을 맞추기 위해 top 마진 유지 (pt-4) */}
        <div className="flex-1 flex flex-col gap-7 justify-start pt-4">
          {barList.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-black-600">{label}</span>
                <span className="text-xs text-black-500">{value}%</span>
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