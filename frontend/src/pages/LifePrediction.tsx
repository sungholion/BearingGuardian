'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LifePrediction() {
  const data = [
    { date: '01/01', predicted: 100, actual: 98 },
    { date: '01/08', predicted: 95, actual: 93 },
    { date: '01/15', predicted: 88, actual: 89 },
    { date: '01/22', predicted: 82, actual: 85 },
    { date: '01/29', predicted: 75, actual: 78 },
    { date: '02/05', predicted: 68, actual: 72 },
    { date: '02/12', predicted: 62, actual: 65 },
    { date: '02/19', predicted: 55, actual: 58 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">예측 수명 분석</h2>
        <p className="text-sm text-gray-600 mb-4">베어링의 예측 수명과 실제 수명을 비교하여 분석합니다</p>

        <div className="flex justify-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#3b82f6" }}></span>
            <span className="text-sm text-gray-700">예측 수명</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ef4444" }}></span>
            <span className="text-sm text-gray-700">실제 수명</span>
          </div>
        </div>

        <div className="h-64 border border-gray-300 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={"100%"}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: -20, bottom: 5 }} // left 마진을 음수 값으로 조정
            >
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="예측 수명"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              name="실제 수명"
            />
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '8px'
              }}
            />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}