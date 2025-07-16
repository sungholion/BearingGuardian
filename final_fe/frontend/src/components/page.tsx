
'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BearingInfo from '@/components/BearingInfo';
import LifePrediction from '@/components/LifePrediction';
import StatusChart from '@/components/StatusChart';
import FrequencyAnalysis from '@/components/FrequencyAnalysis';
import EnvironmentSensor from '@/components/EnvironmentSensor';

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className="bg-white border-b border-gray-200 px-6 py-8 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20industrial%20monitoring%20technology%20background%20with%20subtle%20circuit%20patterns%20and%20data%20visualization%20elements%20professional%20gradient%20blue%20to%20gray%20background%20minimalist%20design%20for%20dashboard%20header%20dark%20overlay%20subtle%20texture&width=1200&height=150&seq=header-bg-v2&orientation=landscape')`
        }}
      >
        <div className="absolute inset-0 bg-white/75"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-semibold text-gray-800">베어링 모니터링 시스템</h1>
          </div>
          <div className="relative">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-notification-line text-xl cursor-pointer text-gray-700"></i>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 p-6">
          <div className="grid grid-cols-10 gap-6 h-[calc(100vh-180px)]">
            <div className="col-span-6 space-y-6 flex flex-col h-full">
              <div className="flex-1">
                <BearingInfo />
              </div>
              <div className="flex-1">
                <FrequencyAnalysis />
              </div>
            </div>
            
            <div className="col-span-4 space-y-6 flex flex-col h-full">
              <div className="flex-1">
                <StatusChart />
              </div>
              <div className="flex-1">
                <LifePrediction />
              </div>
              <div className="flex-1">
                <EnvironmentSensor />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
