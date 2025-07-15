'use client';

export default function EnvironmentSensor() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
      <h2 className="text-2xl font-bold">환경 및 센서 상태</h2>

      <p className="text-sm text-gray-600 mb-4">온도, 습도 및 센서 연결 상태를 모니터링합니다</p>

      <div className="space-y-4">
        {/* 온도, 습도 섹션 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-2">온도</h4>
            <div className="text-2xl font-bold text-green-600">32.5°C</div>
          </div>

          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-2">습도</h4>
            <div className="text-2xl font-bold text-blue-600">55%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 센서 연결 상태 박스 */}
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3 text-xl">센서 연결 상태</h4>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xl font-semibold text-green-600">정상</span>
            </div>
          </div>

          {/* 모델 구동 상태 박스 */}
          <div className="text-center p-4 border border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3 text-xl">모델 구동 상태</h4>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xl font-semibold text-blue-600">정상</span> {/* 예시 상태 유지 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}