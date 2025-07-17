import { useState, useEffect } from 'react';

export default function EnvironmentSensor() {
  const [temperature, setTemperature] = useState(32.5);
  const [humidity, setHumidity] = useState(55.0);
  const [tempDirection, setTempDirection] = useState(0); // 0: no change, 1: up, -1: down
  const [humidityDirection, setHumidityDirection] = useState(0); // 0: no change, 1: up, -1: down

  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} 기준`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prevTemp => {
        let newTemp = prevTemp + (Math.random() * 0.2 - 0.1); // +/- 0.1
        newTemp = parseFloat(Math.min(newTemp, 33.0).toFixed(1)); // Cap at 33.0
        setTempDirection(newTemp > prevTemp ? 1 : (newTemp < prevTemp ? -1 : 0));
        return newTemp;
      });
      setHumidity(prevHumidity => {
        let newHumidity = prevHumidity + (Math.random() * 1.0 - 0.5); // +/- 0.5
        newHumidity = parseFloat(Math.min(newHumidity, 57.0).toFixed(1)); // Cap at 57.0
        setHumidityDirection(newHumidity > prevHumidity ? 1 : (newHumidity < prevHumidity ? -1 : 0));
        return newHumidity;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">환경 및 센서 상태</h2>
        <span className="text-sm text-gray-500">{currentTime ? formatDateTime(currentTime) : ''}</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">온도, 습도 및 센서 연결 상태를 모니터링합니다</p>

      <div className="space-y-4">
        {/* 온도, 습도 섹션 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-2">온도</h4>
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              {temperature}°C
              {tempDirection === 1 && <span className="text-red-600 text-lg ml-2">▲</span>}
              {tempDirection === -1 && <span className="text-blue-600 text-lg ml-2">▼</span>}
            </div>
          </div>

          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-2">습도</h4>
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
              {humidity}%
              {humidityDirection === 1 && <span className="text-red-600 text-lg ml-2">▲</span>}
              {humidityDirection === -1 && <span className="text-blue-600 text-lg ml-2">▼</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 센서 연결 상태 박스 */}
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3 text-xl">센서 연결 상태</h4>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-blink"></div>
              <span className="text-xl font-semibold text-green-600">정상</span>
            </div>
          </div>

          {/* 모델 구동 상태 박스 */}
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3 text-xl">모델 구동 상태</h4>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-blink"></div>
              <span className="text-xl font-semibold text-blue-600">정상</span> {/* 예시 상태 유지 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}