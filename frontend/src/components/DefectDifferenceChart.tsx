'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React from 'react';

export default function DefectDifferenceChart() {
  const pieData = [
    { name: 'Ball', value: 34 },
    { name: 'IR', value: 12 },
    { name: 'OR', value: 8 },
  ];
  const COLORS = ['#6477FF', '#43A0FF', '#9A6BFF'];

  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.7; // This controls how far the label is from the center
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    
    const mainText = `${name}`; 
    const subText = `(${Math.round(percent * 100)}%)`; 

    return (
      <text
        x={x}
        y={y}
        fill="#fff" // Label text color
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14} // Font size for the main text (name)
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {mainText}
        <tspan x={x} dy="1.2em" fontSize={15} fontWeight="500"> {/* dy moves the text down */}
          {subText}
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

      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, flexGrow: 1 }}>
        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
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