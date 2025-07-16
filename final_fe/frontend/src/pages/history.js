// HistoryPage.tsx
'use client';

import React from 'react';
import Header from '../components/Header';
import HistoryTable from '../components/HistoryTable';
import RemainingLifeTrendChart from '../components/RemainingLifeTrendChart';
import DefectDifferenceChart from '../components/DefectDifferenceChart';

export default function HistoryPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        {/* 상단: 테이블 카드 */}
        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              marginBottom: 0,
            }}
          >
            <HistoryTable />
          </div>
          {/* 하단: 2열 카드 */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <DefectDifferenceChart />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <RemainingLifeTrendChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
