import React from 'react';

export default function RemainingLifeTrendChart() {
  const data = [
    { label: '베어링 1', value: 85 },
    { label: '베어링 2', value: 60 },
    { label: '베어링 3', value: 75 },
    { label: '베어링 4', value: 90 },
    { label: '베어링 5', value: 40 },
    { label: '베어링 6', value: 55 },
    { label: '베어링 7', value: 68 },
    { label: '베어링 8', value: 32 },
    { label: '베어링 9', value: 79 },
    { label: '베어링 10', value: 23 },
  ];

  const chartWidth = 800;
  const yLabelWidth = 60;
  const barStart = yLabelWidth + 5;
  const barHeight = 28; // Increased from 18 to 28 for thicker bars
  const gap = 16;
  const chartHeight = data.length * barHeight + (data.length - 1) * gap + 40; // Auto-calculated height

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
          잔여 수명 추이 차트
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
        {data.map((item, idx) => {
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
}