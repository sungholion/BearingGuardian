// DefectDifferenceChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React from 'react'; // React 임포트 추가

export default function DefectDifferenceChart() {
  // 데이터는 3가지 유형(Ball, IR, OR)
  const pieData = [
    { name: 'Ball', value: 34 },
    { name: 'IR', value: 12 },
    { name: 'OR', value: 8 },
  ];
  // 파란색/보라색 계열
  const COLORS = ['#6477FF', '#43A0FF', '#9A6BFF']; // 원하는 계열로 더 세분화 가능

  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);

  // 커스텀 라벨
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index }) => {
    // 0건이면 라벨 안띄움
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.68;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {name}
        <tspan x={x} dy="1.2em" fontSize={12} fontWeight="500">
          ({Math.round(percent * 100)}%)
        </tspan>
      </text>
    );
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      {/* 타이틀+셀렉트 */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#222',
          letterSpacing: -1,
        }}>
          불량률 파이 차트
        </span>
        <select
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 15,
            background: '#fff',
            color: '#222',
            minWidth: 120,
            height: 38,
            fontWeight: 500,
            boxShadow: 'none',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option>기간 선택 ▼</option>
          <option>오늘</option>
          <option>1주</option>
          <option>1개월</option>
          <option>1년</option>
        </select>
      </div>

      {/* 차트와 범례 컨테이너: 가운데 정렬을 위해 justifyContent 추가 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, flexGrow: 1 }}>
        <div style={{ width: 300, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}      // innerRadius 없이 파이!
                fill="#8884d8"
                label={renderLabel}
                labelLine={false}
                paddingAngle={2}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${value}건 (${percentage}%)`, name];
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: 13,
                  color: '#444',
                }}
                itemStyle={{ color: '#444' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* 범례 */}
        <div style={{ /* flex: 1 속성 제거 */ }}>
          {pieData.map(({ name, value }, idx) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                width: 16,
                height: 16,
                display: 'inline-block',
                borderRadius: 4,
                background: COLORS[idx % COLORS.length],
                marginRight: 10,
              }}></span>
              <span style={{ fontSize: 15, color: '#222', width: 70 }}>{name}</span>
              <span style={{ fontWeight: 600, color: '#444', marginLeft: 8 }}>
                {value}건&nbsp;
                <span style={{ color: '#aaa' }}>
                  ({total ? Math.round((value / total) * 100) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
