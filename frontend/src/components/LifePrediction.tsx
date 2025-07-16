'use client';

import { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
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
  const [data, setData] = useState([
    { date: 0, actual: 98 },
  ]);
  const [bearingStatus, setBearingStatus] = useState('정상'); // Add bearingStatus state

  const yAxisMin = 0;
  const yAxisMax = 100; // YAxis max adjusted to match image

  // WebSocket connection for bearingStatus
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket for LifePrediction');
    });

    socket.on('bearing_status_update', (data) => {
      setBearingStatus(data.status);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket for LifePrediction');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let timeStep = data.length - 1; // Initialize timeStep based on initial data length

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        const lastActual = newData[newData.length - 1].actual;
        let newActual = lastActual; // Start with current actual value

        // Apply decrease based on bearingStatus
        if (bearingStatus === '외륜 결함') {
          newActual -= (Math.random() * 0.5 + 0.5) * 2; // Decrease by 1.0 to 2.5 (approx 2% of 100)
        } else if (bearingStatus === '내륜 결함') {
          newActual -= (Math.random() * 0.5 + 0.5) * 3; // Decrease by 1.5 to 3.0 (approx 3% of 100)
        } else { // Normal or other status
          newActual -= (Math.random() * 0.1); // Very slow decrease (0 to 0.1)
        }

        newActual = Math.max(0, newActual); // Ensure it doesn't go below 0
        newActual = Math.min(100, newActual); // Ensure it doesn't go above 100 (for initial values)

        timeStep++;

        // Remove the oldest data point if array gets too long
        if (newData.length >= 20) { // Keep around 20 data points
          newData.shift();
        }

        newData.push({ date: timeStep, actual: Math.round(newActual) });
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [data, bearingStatus]); // Add bearingStatus to dependency array

  // Recalculate highlightSegments whenever data changes
  const highlightSegments = useMemo(() => {
    const segments = [];
    let segmentActive = false;
    let segmentStartIndex = -1;

    for (let i = 0; i < data.length; i++) {
      if (data[i].actual <= 20) {
        if (!segmentActive) {
          segmentActive = true;
          segmentStartIndex = i;
        }
      } else {
        if (segmentActive) {
          segments.push({
            x1: data[segmentStartIndex].date,
            x2: data[i].date
          });
          segmentActive = false;
          segmentStartIndex = -1;
        }
      }
    }

    if (segmentActive) {
      segments.push({
        x1: data[segmentStartIndex].date,
        x2: data[data.length - 1].date
      });
    }
    return segments;
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">예측 수명 분석</h2>
        <p className="text-sm text-gray-600 mb-4">베어링의 예측 수명을 분석합니다</p>

        <div className="h-64 border border-gray-300 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={"100%"}>
            <LineChart
              data={data}
              margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickMargin={1}
                label={{ value: '운영 시간', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[yAxisMin, yAxisMax]}
                tickCount={11}
                label={{ value: '잔존 수명 (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280' }}
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