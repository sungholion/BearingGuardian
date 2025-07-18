'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function StatusChart() {
  const [bearingStatus, setBearingStatus] = useState('정상'); // Initial status
  const [statusCircleColor, setStatusCircleColor] = useState('#10b981'); // Initial color for 'Normal'
  const [normalCount, setNormalCount] = useState(0);
  const [irCount, setIrCount] = useState(0);
  const [orCount, setOrCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(null); // Set initial state to null
  const [pieData, setPieData] = useState([
    { name: 'Normal', value: 73, color: '#10b981' },
    { name: 'IR', value: 22, color: '#ef4444' },
    { name: 'OR', value: 44, color: '#f59e0b' },
  ]);
  const [barList, setBarList] = useState([
    { label: 'Normal', value: 0, color: '#10b981' },
    { label: 'IR', value: 0, color: '#ef4444' },
    { label: 'OR', value: 0, color: '#f59e0b' },
  ]);

  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date()); // Set initial time on mount
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to format date and time
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} 기준`;
  };

  // WebSocket connection and bearingStatus update
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket for StatusChart');
    });

    socket.on('bearing_status_update', (data) => {
      setBearingStatus(data.status);
      // Update counts based on received status
      if (data.status === '정상') {
        setNormalCount(prev => prev + 1);
      } else if (data.status === '내륜 결함') {
        setIrCount(prev => prev + 1);
      } else if (data.status === '외륜 결함') {
        setOrCount(prev => prev + 1);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket for StatusChart');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Effect for handling bearingStatus changes and continuous fluctuation for pie chart
  useEffect(() => {
    // Function to generate a random value within a range
    const generateRandomValues = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Function to calculate new values based on current values and fluctuation
    const calculateNewPieValues = (currentValues) => {
      const newValues = {};
      currentValues.forEach(item => {
        let newValue = item.value;
        const fluctuation = (Math.random() * 0.01 - 0.005); // +/- 0.5% fluctuation

        newValue = item.value * (1 + fluctuation);

        // Ensure values stay within their respective ranges and dominant remains dominant
        if (
          (bearingStatus === '정상' && item.name === 'Normal') ||
          (bearingStatus === '내륜 결함' && item.name === 'IR') ||
          (bearingStatus === '외륜 결함' && item.name === 'OR')
        ) {
          // Dominant category: keep it in the higher range
          newValue = Math.max(60, Math.min(80, newValue));
        } else {
          // Non-dominant categories: keep them in the lower range
          newValue = Math.max(10, Math.min(20, newValue));
        }
        newValues[item.name] = Math.round(newValue);
      });
      return newValues;
    };

    // Initial setup based on bearingStatus
    let initialNormalValue, initialIrValue, initialOrValue;

    switch (bearingStatus) {
      case '정상':
        initialNormalValue = generateRandomValues(60, 80);
        initialIrValue = generateRandomValues(10, 20);
        initialOrValue = generateRandomValues(10, 20);
        setStatusCircleColor('#10b981');
        break;
      case '내륜 결함':
        initialIrValue = generateRandomValues(60, 80);
        initialNormalValue = generateRandomValues(10, 20);
        initialOrValue = generateRandomValues(10, 20);
        setStatusCircleColor('#ef4444');
        break;
      case '외륜 결함':
        initialOrValue = generateRandomValues(60, 80);
        initialNormalValue = generateRandomValues(10, 20);
        initialIrValue = generateRandomValues(10, 20);
        setStatusCircleColor('#f59e0b');
        break;
      default:
        initialNormalValue = generateRandomValues(60, 80);
        initialIrValue = generateRandomValues(10, 20);
        initialOrValue = generateRandomValues(10, 20);
        setStatusCircleColor('#10b981');
    }

    // Set initial pie data state
    const initialPieData = [
      { name: 'Normal', value: initialNormalValue, color: '#10b981' },
      { name: 'IR', value: initialIrValue, color: '#ef4444' },
      { name: 'OR', value: initialOrValue, color: '#f59e0b' },
    ];
    setPieData(initialPieData);

    // Set up interval for continuous fluctuation of pie chart
    const fluctuationInterval = setInterval(() => {
      setPieData(prevData => {
        const newValues = calculateNewPieValues(prevData); // Calculate new values based on previous state
        const updatedPieData = [
          { name: 'Normal', value: newValues.Normal, color: '#10b981' },
          { name: 'IR', value: newValues.IR, color: '#ef4444' },
          { name: 'OR', value: newValues.OR, color: '#f59e0b' },
        ];
        return updatedPieData;
      });
    }, 500); // Update every 0.5 seconds

    return () => clearInterval(fluctuationInterval);
  }, [bearingStatus]);

  // Effect for updating barList based on counts
  useEffect(() => {
    const newBarList = [
      { label: 'Normal', value: normalCount, color: '#10b981' },
      { label: 'IR', value: irCount, color: '#ef4444' },
      { label: 'OR', value: orCount, color: '#f59e0b' },
    ];
    setBarList(newBarList);
  }, [normalCount, irCount, orCount]);

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
        <h2 className="text-2xl font-bold">실시간 이상 유형 분류</h2>
        <span className="text-sm text-gray-500">{currentTime ? formatDateTime(currentTime) : ''}</span>
      </div>
      <p className="text-sm text-gray-600 mb-6">현재 베어링의 이상 유형을 판별합니다</p>

      <div className="flex flex-row gap-4 flex-1 min-h-[172px] items-start">
        {/* --- 도넛 차트 --- */}
        <div className="flex flex-col items-center justify-start w-70">
          <h4 className="text-lg font-bold mb-2">실시간 이상 유형 확률</h4> {/* 타이틀 */}

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
              <span className="w-3 h-3 rounded-full inline-block mr-1" style={{ backgroundColor: statusCircleColor }}></span>
              <span className={`text-sm font-bold`} style={{ color: statusCircleColor }}>{bearingStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-7 justify-start">
          <h4 className="text-lg font-bold mb-2">실시간 누적 불량 건수</h4>

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