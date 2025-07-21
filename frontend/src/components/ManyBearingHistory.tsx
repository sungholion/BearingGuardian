import React, { forwardRef } from 'react';

const ManyBearingHistory = forwardRef(({ selectedBearing, selectedPeriod, selectedStartDate, selectedEndDate, getPeriodText }, ref) => {
  const allBearingsData = {
    B001: { label: 'B001', value: 74.7 },
    B002: { label: 'B002', value: 54.8 },
    B003: { label: 'B003', value: 99.6 },
    B004: { label: 'B004', value: 92.1 },
  };

  const displayData = selectedBearing === '전체' ? Object.values(allBearingsData) : [allBearingsData[selectedBearing]];

  const chartWidth = 800;
  const yLabelWidth = 60;
  const barStart = yLabelWidth + 5;
  const barHeight = 50; // Increased for larger bars
  const gap = 20;
  const chartHeight = displayData.length * barHeight + (displayData.length - 1) * gap + 40; // Auto-calculated height

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
        marginBottom: 100,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 'bold',
          color: '#222',
          letterSpacing: -1,
        }}>
          베어링 누적 잔여 수명 - {getPeriodText(selectedPeriod, selectedStartDate, selectedEndDate)}
        </span>
      </div>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth + yLabelWidth + 10} ${chartHeight}`}>
        {[0, 20, 40, 60, 80, 100].map((x) => {
          const xpos = barStart + (x / 100) * chartWidth;
          return (
            <g key={x}>
              <line
                x1={xpos}
                y1={0}
                x2={xpos}
                y2={chartHeight - 30}
                stroke="#e0e0e0"
                strokeDasharray="2 2"
              />
              <text
                x={xpos}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
              >
                {x}
              </text>
            </g>
          );
        })}
        {displayData.map((item, idx) => {
          const y = idx * (barHeight + gap) + 4;
          const barLen = (item.value / 100) * chartWidth;
          return (
            <g key={item.label}>
              <text
                x={yLabelWidth - 5}
                y={y + barHeight / 2}
                textAnchor="end"
                fontSize="13"
                fill="#333"
                alignmentBaseline="middle"
                fontWeight={500}
              >
                {item.label}
              </text>
              <rect
                x={barStart}
                y={y}
                width={barLen}
                height={barHeight}
                fill="#42a5f5"
                rx={4}
                ry={4}
              />
              <text
                x={barStart + barLen - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                fontSize="12"
                fill="#fff"
                fontWeight="bold"
                alignmentBaseline="middle"
                style={{ pointerEvents: 'none', textShadow: '0 0 2px #1976d2' }}
              >
                {item.value}%
              </text>
            </g>
          );
        })}
        <line
          x1={barStart}
          y1={chartHeight - 30}
          x2={barStart + chartWidth}
          y2={chartHeight - 30}
          stroke="#bbb"
          strokeWidth={1.2}
        />
      </svg>
    </div>
  );
});

export default ManyBearingHistory;