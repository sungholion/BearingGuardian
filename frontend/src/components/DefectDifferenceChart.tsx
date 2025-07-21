'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React, { forwardRef } from 'react';

const DefectDifferenceChart = forwardRef(({ selectedBearing, selectedPeriod, selectedStartDate, selectedEndDate }, ref) => {
  const generatePieData = (period, bearing) => {
    const baseData = {
      '전체': { Normal: 99360, IR: 47520, OR: 25920 },
      'B001': { Normal: 25920, IR: 10800, OR: 6480 },
      'B002': { Normal: 23760, IR: 12960, OR: 6480 },
      'B003': { Normal: 21600, IR: 15120, OR: 6480 },
      'B004': { Normal: 28080, IR: 8640, OR: 6480 },
    };

    let currentData = baseData[bearing] || baseData['전체'];

    if (period === '1주') {
      // '1주'일 때 '오늘' 데이터에서 약간의 변화를 줍니다.
      const fluctuate = (value) => {
        const change = Math.floor(Math.random() * 1000) - 500; // -500 ~ +499
        return Math.max(0, value + change);
      };
      currentData = {
        Normal: fluctuate(currentData.Normal),
        IR: fluctuate(currentData.IR),
        OR: fluctuate(currentData.OR),
      };
    }

    return [
      { name: 'Normal', value: currentData.Normal, color: '#10b981' },
      { name: 'IR', value: currentData.IR, color: '#ef4444' },
      { name: 'OR', value: currentData.OR, color: '#f59e0b' },
    ];
  };

  const pieData = generatePieData(selectedPeriod, selectedBearing);

  const COLORS = ['#6477FF', '#43A0FF', '#9A6BFF'];

  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);

  // 숫자를 천 단위 구분 기호로 포맷팅하는 헬퍼 함수
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.65; // This controls how far the label is from the center
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    
    const mainText = `${name} ${formatNumber(value)}건`; 
    const subText = `(${Math.round(percent * 100)}%)`; 

    return (
      <text
        x={x}
        y={y}
        fill="#fff" // Label text color
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={17} // Font size for the main text (name)
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {mainText}
        <tspan x={x} dy="1.2em" fontSize={17} fontWeight="500"> {/* dy moves the text down */}
          {subText}
        </tspan>
      </text>
    );
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPeriodText = (period, startDate, endDate) => {
    const today = new Date();
    const todayFormatted = formatDate(today);

    if (period === '오늘') {
      return `오늘 (${todayFormatted})`;
    } else if (period === '1주') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return `1주일 (${formatDate(oneWeekAgo)} ~ ${todayFormatted})`;
    } else if (period === '1개월') {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return `1개월 (${formatDate(oneMonthAgo)} ~ ${todayFormatted})`;
    } else if (period === '1년') {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return `1년 (${formatDate(oneYearAgo)} ~ ${todayFormatted})`;
    } else if (period === '사용자 지정' && startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    } else if (period === '전체') {
      return '전체';
    }
    return period;
  };

  const periodText = getPeriodText(selectedPeriod, selectedStartDate, selectedEndDate);

  return (
    <div
      ref={ref}
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
          fontSize: 26,
          fontWeight: 'bold',
          color: '#222',
          letterSpacing: -1,
        }}>
          불량률 파이 차트 - {getPeriodText(selectedPeriod, selectedStartDate, selectedEndDate)}
        </span>

      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 36, flexGrow: 1 }}>
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
                  return [`${formatNumber(value)}건 (${percentage}%)`, name];
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: 18,
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
              <span style={{ fontSize: 18, color: '#222', width: 70 }}>{name}</span>
              <span style={{ fontWeight: 600, color: '#444', marginLeft: 8, fontSize: 23 }}>
                {formatNumber(value)}건&nbsp;
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
});

export default DefectDifferenceChart;