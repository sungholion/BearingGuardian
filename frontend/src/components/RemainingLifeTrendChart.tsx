import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from 'recharts';
import React, { forwardRef } from 'react';

const RemainingLifeTrendChart = forwardRef(({ selectedBearing, selectedPeriod, selectedStartDate, selectedEndDate, getPeriodText }, ref) => {
  // 0-100 범위의 값을 5000만-9000만 범위로 변환하는 헬퍼 함수
  const convertToRealisticValue = (value) => {
    // 0-100 범위의 값에 소수점과 약간의 무작위성을 추가
    const randomness = (Math.random() - 0.5) * 0.5; // +/- 0.25 정도의 무작위성
    const converted = value + randomness;
    return parseFloat(converted.toFixed(1)); // 소수점 첫째 자리까지 표시
  };

  const generateChartData = (period) => {
    const allBearingsRawData = {}; // Raw data for each bearing, period-specific
    const allDefectPoints = {}; // Defect points for each bearing, period-specific

    const today = new Date();

    // Helper to generate base data for a given length, start value, and decrement
    const generateBaseDataPoints = (length, startValue, decrement) => {
      return Array.from({ length }, (_, i) => ({
        value: startValue - i * decrement,
      }));
    };

    // Base templates for values (independent of date/time)
    const valueTemplates = {
      B001: generateBaseDataPoints(22, 95.0, 0.5),
      B002: generateBaseDataPoints(22, 90.0, 0.5),
      B003: generateBaseDataPoints(22, 80.0, 0.5),
      B004: generateBaseDataPoints(22, 70.0, 0.5),
    };

    // Function to apply defects to a given data array
    const applyDefectPoints = (dataArray) => {
      const defects = [];
      const dataWithDefects = [...dataArray];
      const availableIndices = Array.from({ length: dataArray.length - 2 }, (_, i) => i + 1); // Exclude first and last for defect placement

      // Ensure there are enough points for 2 defects
      if (availableIndices.length < 2) {
        // Handle cases where data is too short to place 2 defects
        return { data: dataWithDefects, defects: [] };
      }

      // Select 2 random unique indices for defects
      const defectIndices = [];
      while (defectIndices.length < 2) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
        defectIndices.push(selectedIndex);
      }
      defectIndices.sort((a, b) => a - b); // Sort to apply defects in order

      defectIndices.forEach((defectIndex, i) => {
        const defectType = i === 0 ? 'OR' : 'IR'; // First is OR, second is IR
        const prevValue = dataWithDefects[defectIndex - 1].value;
        const dropPercentage = (Math.random() * 0.02) + 0.02; // 2% ~ 4% decrease
        const newValue = prevValue * (1 - dropPercentage);
        dataWithDefects[defectIndex].value = parseFloat(newValue.toFixed(1));
        defects.push({ index: defectIndex, type: defectType, value: dataWithDefects[defectIndex].value });
      });
      return { data: dataWithDefects, defects };
    };

    // Generate period-specific data for each bearing
    Object.keys(valueTemplates).forEach(bearingId => {
      let currentBearingData = [];
      let currentDefects = [];

      if (period === '오늘') {
        // Generate time-based data for today
        for (let h = 0; h <= 24; h += 4) {
          const time = `${h.toString().padStart(2, '0')}:00`;
          const dataIndex = Math.floor(h / 4); // Map time to an index in valueTemplates
          currentBearingData.push({
            xValue: time,
            value: valueTemplates[bearingId][dataIndex]?.value || 0
          });
        }
      } else if (period === '1주') {
        // Generate date-based data for the last week
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateString = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          const dataIndex = valueTemplates[bearingId].length - 1 - i; // Map date to an index
          currentBearingData.push({
            xValue: dateString,
            value: valueTemplates[bearingId][Math.max(0, dataIndex)]?.value || 0
          });
        }
        currentBearingData.sort((a, b) => new Date(a.xValue).getTime() - new Date(b.xValue).getTime()); // Sort by date
      } else {
        // For '전체', '1개월', '1년', '사용자 지정' - use original date-based data
        currentBearingData = valueTemplates[bearingId].map((item, i) => ({
          xValue: `2025-07-${(i + 1).toString().padStart(2, '0')}`,
          value: item.value
        }));
      }

      // Apply defects to the period-specific data
      const defectResult = applyDefectPoints(currentBearingData);
      const finalData = defectResult.data;
      
      // Map xValue to defects after currentBearingData has xValue
      const finalDefects = defectResult.defects.map(defect => ({
        ...defect,
        xValue: finalData[defect.index].xValue // Get the xValue from the corresponding data point
      }));

      allBearingsRawData[bearingId] = finalData;
      allDefectPoints[bearingId] = finalDefects;
    });

    // Combine data for '전체' view
    const combinedChartData = {};
    if (selectedBearing === '전체') {
      Object.keys(allBearingsRawData).forEach(bearingId => {
        allBearingsRawData[bearingId].forEach(item => {
          if (!combinedChartData[item.xValue]) {
            combinedChartData[item.xValue] = { xValue: item.xValue };
          }
          combinedChartData[item.xValue][bearingId] = convertToRealisticValue(item.value);
        });
      });
    } else {
      // For specific bearing, just map values
      allBearingsRawData[selectedBearing].forEach(item => {
        if (!combinedChartData[item.xValue]) {
          combinedChartData[item.xValue] = { xValue: item.xValue };
        }
        combinedChartData[item.xValue].value = convertToRealisticValue(item.value);
      });
    }

    const sortedChartData = Object.values(combinedChartData).sort((a, b) => {
      if (period === '오늘') {
        const timeA = parseInt(a.xValue.split(':')[0]);
        const timeB = parseInt(b.xValue.split(':')[0]);
        return timeA - timeB;
      } else {
        return new Date(a.xValue).getTime() - new Date(b.xValue).getTime();
      }
    });

    return { chartData: sortedChartData, defectPoints: allDefectPoints, processedBearingsData: allBearingsRawData };
  };

  const { chartData, defectPoints, processedBearingsData } = generateChartData(selectedPeriod);

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
            key={`${bearingId}-${defect.xValue}-${defect.type}`}
            x={defect.xValue}
            y={convertToRealisticValue(defect.value)}
            r={5}
            fill={defect.type === 'OR' ? 'red' : 'blue'}
            stroke="none"
          />
        );
      });
    };

    if (selectedBearing === '전체') {
      Object.keys(defectPoints).forEach(bearingId => {
        addDots(bearingId, defectPoints[bearingId]);
      });
    } else {
      addDots(selectedBearing, defectPoints[selectedBearing]);
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
          누적 잔여 사이클 수 추이 - {getPeriodText(selectedPeriod, selectedStartDate, selectedEndDate)}
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
          <XAxis dataKey="xValue" tickFormatter={(tick) => selectedPeriod === '오늘' ? tick.split(':')[0] : tick} />
          <YAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => value.toLocaleString()} label={{ value: '단위: 만 사이클', angle: -90, position: 'insideLeft', offset: 10 }} />
          <Tooltip formatter={(value) => `${value.toLocaleString()} 만 사이클`} />
          <Legend payload={[
            { value: 'OR 결함', type: 'circle', color: 'red' },
            { value: 'IR 결함', type: 'circle', color: 'blue' },
          ]} />
          {selectedBearing === '전체' ? (
            Object.keys(processedBearingsData).map(bearingId => (
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