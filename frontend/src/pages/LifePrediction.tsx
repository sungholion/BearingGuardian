'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

// CustomLabel 컴포넌트 정의
const CustomLabel = ({ x, y, stroke, value }) => {
  const formattedValue = typeof value === 'number' ? Math.round(value) : value;

  // 20 이하인 값에 대한 조건부 스타일
  const isHighlighted = typeof value === 'number' && value <= 20;

  // 배경이 있을 경우 텍스트 색상 변경
  const textColor = isHighlighted ? '#ffffff' : stroke;
  // 배경색
  const backgroundColor = isHighlighted ? '#ef4444' : 'transparent'; // 빨간색 배경

  return (
    <g>
      {isHighlighted && (
        // 배경을 그리는 사각형
        <rect
          x={x - (String(formattedValue).length * 4.5) - 4} // 텍스트 길이에 따라 x 위치 조절 및 패딩
          y={y - 25} // 텍스트보다 살짝 위로 (dy=-10 고려)
          width={(String(formattedValue).length * 9) + 8} // 텍스트 길이에 따라 너비 조절 및 패딩
          height={20} // 높이
          fill={backgroundColor}
          rx={4} // 둥근 모서리
          ry={4} // 둥근 모서리
        />
      )}
      <text x={x} y={y} dy={-10} fill={textColor} fontSize={12} textAnchor="middle">
        {formattedValue}
      </text>
    </g>
  );
};

export default function LifePrediction() {
  const data = [
    { date: '01/01', actual: 98 },
    { date: '01/08', actual: 93 },
    { date: '01/15', actual: 89 },
    { date: '01/22', actual: 15 }, // <=20, start of first highlight, single point in previous image
    { date: '01/29', actual: 78 }, // >20, end of first highlight
    { date: '02/05', actual: 72 },
    { date: '02/12', actual: 65 },
    { date: '02/19', actual: 58 },
    { date: '02/26', actual: 45 },
    { date: '03/04', actual: 30 },
    { date: '03/11', actual: 20 }, // <=20, start of second highlight
    { date: '03/18', actual: 15 },
    { date: '03/25', actual: 10 },
    { date: '04/01', actual: 8 },
    { date: '04/08', actual: 5 },
    { date: '04/15', actual: 30 }, // >20, end of second highlight
    { date: '04/22', actual: 40 },
    { date: '04/29', actual: 18 }, // <=20, start of third highlight
    { date: '05/06', actual: 12 },
    { date: '05/13', actual: 105 }, // >20, end of third highlight
  ];

  const yAxisMin = 0;
  const yAxisMax = 120; // YAxis max adjusted to match image

  const highlightSegments = [];
  let segmentActive = false; // Flag to track if we're currently in a highlight segment
  let segmentStartIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i].actual <= 20) {
      if (!segmentActive) {
        segmentActive = true;
        segmentStartIndex = i;
      }
    } else {
      if (segmentActive) {
        // End of a segment
        highlightSegments.push({
          x1: data[segmentStartIndex].date,
          // If the previous point was the end of highlight, use its date.
          // For ReferenceArea to work with single points, x2 should be slightly after x1.
          // A common practice is to use the next point's date if it exists,
          // or add a small offset to x1 if it's a single point at the end of the chart.
          // Here, we use the current point's date if it's the point AFTER the highlight.
          // Or, for a single point, use the current point's date.
          x2: data[i].date // This creates a highlight from start of segment to start of non-highlighted point
        });
        segmentActive = false;
        segmentStartIndex = -1;
      }
    }
  }

  // If a segment is active at the end of the data, add it
  if (segmentActive) {
    highlightSegments.push({
      x1: data[segmentStartIndex].date,
      x2: data[data.length - 1].date // Highlight until the last date if condition holds
    });
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">예측 수명 분석</h2>
        <p className="text-sm text-gray-600 mb-4">베어링의 예측 수명을 분석합니다</p>

        <div className="h-64 border border-gray-300 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={"100%"}>
            <LineChart
              data={data}
              margin={{ top: 15, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[yAxisMin, yAxisMax]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px'
                }}
              />
              {/* ReferenceArea 컴포넌트를 사용하여 특정 구간을 강조합니다 */}
              {highlightSegments.map((segment, index) => (
                <ReferenceArea
                  key={index}
                  x1={segment.x1}
                  x2={segment.x2}
                  y1={yAxisMin}
                  y2={yAxisMax}
                  fill="#fce7f3" // A very light pink, similar to the image
                  fillOpacity={0.5}
                />
              ))}

              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0000ff" // ⭐ Line color changed to blue to match image_33779a.png ⭐
                strokeWidth={2} // Reduced strokeWidth to match image more closely
                dot={{ fill: '#0000ff', r: 4 }} // ⭐ Dot color changed to blue to match image_33779a.png ⭐
                name="실제 수명"
                label={<CustomLabel />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}