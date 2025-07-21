import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function BearingInfo({ bearingId }) {
  const [rpm, setRpm] = useState(1760); // Initial RPM
  const [rms, setRms] = useState(2.3); // Initial RMS
  const [peak, setPeak] = useState(7.9); // Initial PEAK
  const [crestFactor, setCrestFactor] = useState(3.2); // Initial CRESTFACTOR

  const bearingData = {
    bearing1: {
      model: 'B001 (SKF 6205-2RS)',
      installationDate: '2024.01.15',
      load: '850 N',
      initialOperatingTimeMs: 2847 * 3600 * 1000, // 베어링 1의 초기 운영 시간
    },
    bearing2: {
      model: 'B002 (FAG 6308)',
      installationDate: '2023.11.01',
      load: '1200 N',
      initialOperatingTimeMs: 3500 * 3600 * 1000, // 베어링 2의 초기 운영 시간
    },
    bearing3: {
      model: 'B003 (NTN 6006LLU)',
      installationDate: '2024.03.20',
      load: '700 N',
      initialOperatingTimeMs: 1500 * 3600 * 1000, // 베어링 3의 초기 운영 시간
    },
    bearing4: {
      model: 'B004 (NSK 6207ZZ)',
      installationDate: '2023.09.10',
      load: '1000 N',
      initialOperatingTimeMs: 4200 * 3600 * 1000, // 베어링 4의 초기 운영 시간
    },
  };

  const currentBearing = bearingData[bearingId] || bearingData.bearing1; // 기본값 설정

  const [operatingTimeMs, setOperatingTimeMs] = useState(currentBearing.initialOperatingTimeMs); // 초기 운영 시간 설정

  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('rpm_update', (data) => {
      setRpm(data.rpm);
    });

    socket.on('vibration_metrics_update', (data) => {
      setRms(data.rms);
      setPeak(data.peak);
      setCrestFactor(data.crest_factor);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    // Set up interval for operating time
    const intervalId = setInterval(() => {
      setOperatingTimeMs(prevTime => prevTime + 100); // Increment by 100ms every 100ms
    }, 100);

    return () => {
      socket.disconnect();
      clearInterval(intervalId); // Clean up interval on unmount
    };
  }, []);

  // Helper function to format time
  const formatOperatingTime = (totalMs) => {
    const ms = totalMs % 1000;
    const totalSeconds = Math.floor(totalMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num) => num.toString().padStart(2, '0');

    return `${hours}:${pad(minutes)}:${pad(seconds)}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">베어링 정보 표시</h2>
        <span className="text-sm text-gray-500">{currentTime ? formatDateTime(currentTime) : ''}</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* 좌측: 정보/파라미터 */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">모델명:</span>
              <span className="font-medium">{currentBearing.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">설치일:</span>
              <span className="font-medium">{currentBearing.installationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">운영시간:</span>
              <span className="font-medium">{formatOperatingTime(operatingTimeMs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">하중:</span>
              <span className="font-medium">{currentBearing.load}</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end mb-6">
            <h4 className="font-medium text-lg mb-3">파라미터 수치</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">RPM (회전 속도)</div>
                <div className="text-l font-bold text-blue-600">{rpm} RPM</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">RMS (평균 진동 속도)</div>
                <div className="text-l font-bold text-green-600">{rms} mm/s</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">PEAK (최대 진동 속도)</div>
                <div className="text-l font-bold text-yellow-600">{peak} mm/s</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">CREST FACTOR (첨도 계수)</div>
                <div className="text-l font-bold text-purple-600">{crestFactor}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 우측: 베어링 이미지 (항상 정중앙) */}
        <div className="flex-1 flex items-center justify-center max-w-[400px] max-h-[385px]">
          <div className="w-full h-full bg-white rounded-lg border border-gray-300 flex items-center justify-center">
            <img 
              src={`/${bearingId === 'bearing1' ? 'moving_bearing' : 'moving' + bearingId.replace('bearing', '')}.gif`}
              alt="베어링 이미지"
              className="w-full h-full object-contain rounded-lg max-w-[300px] max-h-[250px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

