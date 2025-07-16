'use client';

export default function BearingInfo() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">베어링 정보 표시</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* 좌측: 정보/파라미터 */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">모델명:</span>
              <span className="font-medium">SKF 6205-2RS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">설치일:</span>
              <span className="font-medium">2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">운영시간:</span>
              <span className="font-medium">2,847시간</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">회전속도:</span>
              <span className="font-medium">1,800 RPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">하중:</span>
              <span className="font-medium">850 N</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end mb-6">
            <h4 className="font-medium text-lg mb-3">파라미터 수치</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">RPM</div>
                <div className="text-l font-bold text-blue-600">1,760 RPM</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">RMS</div>
                <div className="text-l font-bold text-green-600">2.3 mm/s</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">PEAK</div>
                <div className="text-l font-bold text-yellow-600">7.9 mm/s</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200 flex flex-col items-center">
                <div className="text-sm text-gray-600">CRESTFACTOR</div>
                <div className="text-l font-bold text-purple-600">3.2</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 우측: 베어링 이미지 (항상 정중앙) */}
        <div className="flex-1 flex items-center justify-center max-w-[400px] max-h-[385px]">
          <div className="w-full h-full bg-white rounded-lg border border-gray-300 flex items-center justify-center">
            <img 
              src="https://readdy.ai/api/search-image?query=industrial%20ball%20bearing%20mechanical%20component%20detailed%20view%20with%20metallic%20surface%20high%20quality%20technical%20engineering%20photo%20clean%20white%20background%20product%20photography%20professional%20lighting&width=300&height=250&seq=bearing-detail&orientation=portrait"
              alt="베어링 이미지"
              className="w-full h-full object-contain rounded-lg max-w-[300px] max-h-[250px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
