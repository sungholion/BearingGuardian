import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from 'recharts';
import React, { forwardRef } from 'react';

const RemainingLifeTrendChart = forwardRef(({ selectedBearing }, ref) => {
  // 0-100 범위의 값을 5000만-9000만 범위로 변환하는 헬퍼 함수
  const convertToRealisticValue = (value) => {
    // 0-100 범위의 값에 소수점과 약간의 무작위성을 추가
    const randomness = (Math.random() - 0.5) * 0.5; // +/- 0.25 정도의 무작위성
    const converted = value + randomness;
    return parseFloat(converted.toFixed(1)); // 소수점 첫째 자리까지 표시
  };

  // 다중 베어링 누적 잔여 수명 데이터 (예시) - 기본 데이터는 부드러운 감소 추세
  const baseAllBearingsData = {
    B001: Array.from({ length: 22 }, (_, i) => ({ date: `2025-07-${(i + 1).toString().padStart(2, '0')}`, value: 95.0 - i * 0.5 })),
    B002: Array.from({ length: 22 }, (_, i) => ({ date: `2025-07-${(i + 1).toString().padStart(2, '0')}`, value: 90.0 - i * 0.5 })),
    B003: Array.from({ length: 22 }, (_, i) => ({ date: `2025-07-${(i + 1).toString().padStart(2, '0')}`, value: 80.0 - i * 0.5 })),
    B004: Array.from({ length: 22 }, (_, i) => ({ date: `2025-07-${(i + 1).toString().padStart(2, '0')}`, value: 70.0 - i * 0.5 })),
  };

  // 결함 지점을 무작위로 생성하고 데이터에 적용하는 헬퍼 함수
  const generateDefectPoints = (data) => {
    const defects = [];
    const dataWithDefects = [...data];
    const availableDates = data.slice(1, data.length - 1).map(item => item.date); // 첫날과 마지막날 제외

    // 2개의 무작위 결함 지점 선택
    for (let i = 0; i < 2; i++) {
      if (availableDates.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableDates.length);
      const defectDate = availableDates.splice(randomIndex, 1)[0];
      const defectType = i === 0 ? 'OR' : 'IR'; // 첫번째는 OR, 두번째는 IR

      const defectIndex = dataWithDefects.findIndex(item => item.date === defectDate);
      if (defectIndex > 0) {
        const prevValue = dataWithDefects[defectIndex - 1].value;
        const dropPercentage = (Math.random() * 0.02) + 0.02; // 2% ~ 4% 감소
        const newValue = prevValue * (1 - dropPercentage);
        dataWithDefects[defectIndex].value = parseFloat(newValue.toFixed(1));
        defects.push({ date: defectDate, type: defectType, value: dataWithDefects[defectIndex].value });
      }
    }
    return { data: dataWithDefects, defects };
  };

  const processedAllBearingsData = {};
  const allDefectPoints = {};

  Object.keys(baseAllBearingsData).forEach(bearingId => {
    const { data, defects } = generateDefectPoints(baseAllBearingsData[bearingId]);
    processedAllBearingsData[bearingId] = data;
    allDefectPoints[bearingId] = defects;
  });

  // Combine all data for '전체' view, ensuring unique dates
  const combineData = (dataObj) => {
    const combined = {};
    Object.keys(dataObj).forEach(bearingId => {
      dataObj[bearingId].forEach(item => {
        if (!combined[item.date]) {
          combined[item.date] = { date: item.date };
        }
        combined[item.date][bearingId] = convertToRealisticValue(item.value);
      });
    });
    // Sort by date
    return Object.values(combined).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = selectedBearing === '전체' ? combineData(processedAllBearingsData) : processedAllBearingsData[selectedBearing].map(item => ({ ...item, value: convertToRealisticValue(item.value) }));

  const bearingColors = {
    B001: '#8884d8',
    B002: '#82ca9d',
    B003: '#ffc658',
    B004: '#ff7300',
  };

  const renderReferenceDots = () => {
    const dots = [];
    const addDots = (bearingId, defects) => {
      defects.forEach(defect => {
        dots.push(
          <ReferenceDot
            key={`${bearingId}-${defect.date}-${defect.type}`}
            x={defect.date}
            y={convertToRealisticValue(defect.value)}
            r={5}
            fill={defect.type === 'OR' ? 'red' : 'blue'}
            stroke="none"
          />
        );
      });
    };

    if (selectedBearing === '전체') {
      Object.keys(allDefectPoints).forEach(bearingId => {
        addDots(bearingId, allDefectPoints[bearingId]);
      });
    } else {
      addDots(selectedBearing, allDefectPoints[selectedBearing]);
    }
    return <>{dots}</>;
  };

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
          누적 잔여 사이클 수 추이 - {selectedBearing === '전체' ? '전체' : selectedBearing}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10, right: 30, left: 0, bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => value.toLocaleString()} label={{ value: '단위: 만 사이클', angle: -90, position: 'insideLeft', offset: 10 }} />
          <Tooltip formatter={(value) => `${value.toLocaleString()} 만 사이클`} />
          <Legend payload={[
            { value: 'OR 결함', type: 'circle', color: 'red' },
            { value: 'IR 결함', type: 'circle', color: 'blue' },
          ]} />
          {selectedBearing === '전체' ? (
            Object.keys(processedAllBearingsData).map(bearingId => (
              <Area
                key={bearingId}
                type="monotone"
                dataKey={bearingId}
                stroke={bearingColors[bearingId]}
                fillOpacity={0.3}
                fill={bearingColors[bearingId]}
                name={bearingId} // Tooltip에 표시될 이름
              />
            ))
          ) : (
            <Area type="monotone" dataKey="value" stroke={bearingColors[selectedBearing]} fill={bearingColors[selectedBearing]} />
          )}
          {renderReferenceDots()}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RemainingLifeTrendChart;