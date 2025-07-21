'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import HistoryTable from '../components/HistoryTable';
import RemainingLifeTrendChart from '../components/RemainingLifeTrendChart';
import DefectDifferenceChart from '../components/DefectDifferenceChart';
import ManyBearingHistory from '../components/ManyBearingHistory';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { useTheme } from '../contexts/ThemeContext';

// ReportControls 컴포넌트가 handleDownloadReport 함수와 isDownloading, libsLoaded 상태를 받도록 변경
function ReportControls({ handleDownloadReport, isDownloading, theme, defectFilter, setDefectFilter, selectedPeriod, setSelectedPeriod, selectedStartDate, setSelectedStartDate, selectedEndDate, setSelectedEndDate, selectedBearing, setSelectedBearing }) {
  // Add a state to manage the active period button
  const [activePeriod, setActivePeriod] = useState('전체');

  const handleDefectFilterChange = (event) => {
    setDefectFilter(event.target.value);
  };

  const reportControlsStyle = {
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#333',
    borderRadius: 16,
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    marginBottom: '24px',
    border: theme === 'dark' ? '1px solid #4a5568' : 'none',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between', 
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 20,
    borderBottom: `1px solid ${theme === 'dark' ? '#4a5568' : '#f0f0f0'}`,
    paddingBottom: 16,
  };

  return (
    <div style={reportControlsStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '16px' }}>HISTORY</span>
          <div>
            <button onClick={() => setSelectedBearing('B001')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: selectedBearing === 'B001' ? '#e0f2ff' : '#f9f9f9', cursor: 'pointer', fontSize: '14px' }}>B001</button>
            <button onClick={() => setSelectedBearing('B002')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: selectedBearing === 'B002' ? '#e0f2ff' : '#f9f9f9', cursor: 'pointer', fontSize: '14px' }}>B002</button>
            <button onClick={() => setSelectedBearing('B003')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: selectedBearing === 'B003' ? '#e0f2ff' : '#f9f9f9', cursor: 'pointer', fontSize: '14px' }}>B003</button>
            <button onClick={() => setSelectedBearing('B004')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: selectedBearing === 'B004' ? '#e0f2ff' : '#f9f9f9', cursor: 'pointer', fontSize: '14px' }}>B004</button>
            <button onClick={() => setSelectedBearing('전체')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: selectedBearing === '전체' ? '#e0f2ff' : '#f9f9f9', cursor: 'pointer', fontSize: '14px' }}>전체</button>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            opacity: isDownloading ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s ease, opacity 0.2s ease',
          }}
        >
          {isDownloading ? '다운로드 중...' : '보고서 다운로드'}
        </button>
      </div>

      {/* 기존 필터/기간 선택 UI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <input 
          type="date" 
          value={selectedStartDate ? selectedStartDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            setSelectedStartDate(e.target.value ? new Date(e.target.value) : null);
            setSelectedPeriod('사용자 지정');
          }}
          style={{
            height: 36,
            borderRadius: 8,
            border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
            background: theme === 'dark' ? '#1a202c' : '#fff',
            color: theme === 'dark' ? '#e2e8f0' : '#555',
            padding: '0 12px',
            fontSize: 14,
          }}
        />
        <span style={{ fontSize: 16, color: theme === 'dark' ? '#a0aec0' : '#555' }}>-</span>
        <input 
          type="date" 
          value={selectedEndDate ? selectedEndDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            setSelectedEndDate(e.target.value ? new Date(e.target.value) : null);
            setSelectedPeriod('사용자 지정');
          }}
          style={{
            height: 36,
            borderRadius: 8,
            border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
            background: theme === 'dark' ? '#1a202c' : '#fff',
            color: theme === 'dark' ? '#e2e8f0' : '#555',
            padding: '0 12px',
            fontSize: 14,
          }}
        />
        <div style={{
          display: 'flex',
          gap: 6,
          marginLeft: 20,
        }}>
          {/* 기간 선택 on 표시 효과*/}
          {['전체', '오늘', '1주', '1개월', '1년'].map((text) => (
            <button
              key={text}
              onClick={() => {
                setSelectedPeriod(text);
                setSelectedStartDate(null);
                setSelectedEndDate(null);
              }} 
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: selectedPeriod === text ? '1px solid #007bff' : `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
                background: selectedPeriod === text ? '#e0f2ff' : (theme === 'dark' ? '#2d3748' : '#f8f8f8'),
                color: selectedPeriod === text ? '#007bff' : (theme === 'dark' ? '#a0aec0' : '#555'),
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {text}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          border: 'none',
          background: 'transparent',
          fontWeight: 600,
          color: '#007bff',
          fontSize: 14,
          cursor: 'pointer',
        }}>
          최신순
        </button>
        <button style={{
          border: 'none',
          background: 'transparent',
          color: theme === 'dark' ? '#a0aec0' : '#888',
          fontSize: 14,
          cursor: 'pointer',
        }}>
          오래된순
        </button>
        <select
          value={defectFilter} // defectFilter 상태와 연결
          onChange={handleDefectFilterChange} // 변경 시 handleDefectFilterChange 호출
          style={{
            marginLeft: 10,
            height: 36,
            borderRadius: 8,
            border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e0e0e0'}`,
            background: theme === 'dark' ? '#1a202c' : '#fff',
            color: theme === 'dark' ? '#e2e8f0' : '#555',
            padding: '0 10px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <option value="전체">전체</option>
          <option value="불량">불량</option>
          <option value="정상">정상</option>
        </select>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const contentToPrintRef = useRef(null);
  const historyTableRef = useRef(null);
  const defectDifferenceChartRef = useRef(null);
  const remainingLifeTrendChartRef = useRef(null);
  const manyBearingHistoryRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false); 
  const { theme } = useTheme();
  const [defectFilter, setDefectFilter] = useState('전체');
  const [selectedPeriod, setSelectedPeriod] = useState('전체');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedBearing, setSelectedBearing] = useState('전체');
  const [notifications, setNotifications] = useState([
    { id: 1, message: '베어링 1 온도 임계치 초과', timestamp: '2025-07-21 12:01:00' },
    { id: 2, message: '베어링 3 외륜 결함 발생', timestamp: '2025-07-21 12:00:00' },
    { id: 3, message: '시스템 정기 점검 예정 (2025-07-22 09:00)', timestamp: '2025-07-21 11:55:00' },
    { id: 4, message: '베어링 4 내륜 결함 의심', timestamp: '2025-07-21 11:50:00' },
    { id: 5, message: '베어링 2 온도 센서 오류 감지', timestamp: '2025-07-21 11:45:00' },
    { id: 6, message: '베어링 1 외륜 결함 심화', timestamp: '2025-07-21 11:40:00' },
    { id: 7, message: '전체 시스템 긴급 점검 필요', timestamp: '2025-07-21 11:35:00' },
    { id: 8, message: '베어링 3 온도 정상 범위 복귀', timestamp: '2025-07-21 11:30:00' },
    { id: 9, message: '데이터베이스 서버 점검 (2025-07-21 23:00)', timestamp: '2025-07-21 11:25:00' },
  ]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPeriodText = (period, startDate, endDate) => {
    const today = new Date();
    const todayFormatted = formatDate(today);

    if (period === '오늘') {
      return `오늘 (${todayFormatted})`;
    } else if (period === '1주') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return `1주일 (${formatDate(oneWeekAgo)} ~ ${todayFormatted})`;
    } else if (period === '1개월') {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return `1개월 (${formatDate(oneMonthAgo)} ~ ${todayFormatted})`;
    } else if (period === '1년') {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return `1년 (${formatDate(oneYearAgo)} ~ ${todayFormatted})`;
    } else if (period === '사용자 지정' && startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    } else if (period === '전체') {
      return '전체';
    }
    return period;
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setIsPdfExporting(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10; // mm
    let yOffset = margin; // Current Y position in PDF

    const addComponentToPdf = async (componentRef, title) => {
      if (!componentRef.current) {
        console.warn(`Skipping ${title}: component ref is null.`);
        return;
      }

      console.log(`Attempting to capture ${title}...`);

      // Temporarily set a fixed width for capture to ensure consistent scaling
      const originalWidth = componentRef.current.style.width;
      componentRef.current.style.width = '100%'; // Ensure it takes full width for capture

      await new Promise(resolve => requestAnimationFrame(resolve));

      try {
        const canvas = await html2canvas(componentRef.current, {
          scale: 1, // Lower scale for potentially better stability
          useCORS: true,
          logging: false,
          backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
        });

        const imgData = canvas.toDataURL('image/png');

        if (imgData === 'data:,') {
          console.error(`html2canvas failed to generate valid image data for ${title}. Skipping this component.`);
          return; // Skip this component if image data is invalid
        }

        console.log(`${title} captured. Image data length: ${imgData.length}`);

        const imgProps = pdf.getImageProperties(imgData);
        const imgPdfWidth = pdfWidth - 2 * margin;
        const imgPdfHeight = (imgProps.height * imgPdfWidth) / imgProps.width;

        // Check if current component fits on current page
        if (yOffset + imgPdfHeight + margin > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          yOffset = margin; // Reset yOffset for new page
        }

        pdf.addImage(imgData, 'PNG', margin, yOffset, imgPdfWidth, imgPdfHeight);
        yOffset += imgPdfHeight + margin; // Move yOffset down for next component

      } catch (error) {
        console.error(`Error capturing ${title}:`, error);
      } finally {
        // Restore original width
        componentRef.current.style.width = originalWidth;
      }
    };

    try {
      // Add Header (optional, if you want to include it in the PDF)
      // await addComponentToPdf(headerRef, 'Header');

      // Add ReportControls (optional)
      // await addComponentToPdf(reportControlsRef, 'Report Controls');

      // await addComponentToPdf(historyTableRef, 'History Table');
      await addComponentToPdf(defectDifferenceChartRef, 'Defect Difference Chart');
      await addComponentToPdf(remainingLifeTrendChartRef, 'Remaining Life Trend Chart');
      await addComponentToPdf(manyBearingHistoryRef, 'Many Bearing History');

      pdf.save("보고서.pdf");

    } catch (error) {
      console.error("보고서 다운로드 중 오류 발생:", error);
      alert("보고서 다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
      setIsPdfExporting(false);
    }
  }; // Missing closing brace for handleDownloadReport was here

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'dark' ? '#1a202c' : '#f8fafc',
  };

  const contentContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    background: theme === 'dark' ? '#2d3748' : '#fff',
    color: '#333',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    border: theme === 'dark' ? '1px solid #4a5568' : 'none',
  };

  return (
    <div style={pageStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header notifications={notifications} setNotifications={setNotifications} />
        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column' }}>

          {/* ReportControls 컴포넌트에 필요한 props 전달 */}
          <ReportControls
            handleDownloadReport={handleDownloadReport}
            isDownloading={isDownloading}
            theme={theme}
            defectFilter={defectFilter}
            setDefectFilter={setDefectFilter}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            selectedStartDate={selectedStartDate}
            setSelectedStartDate={setSelectedStartDate}
            selectedEndDate={selectedEndDate}
            setSelectedEndDate={setSelectedEndDate}
            selectedBearing={selectedBearing}
            setSelectedBearing={setSelectedBearing}
          />

          {/* PDF로 캡처할 컨텐츠 영역 (테이블과 차트) */}
          <div
            ref={contentToPrintRef}
            style={contentContainerStyle}
          >
            {/* HistoryTable */}
            <HistoryTable 
              ref={historyTableRef} 
              isPdfExporting={isPdfExporting} 
              defectFilter={defectFilter} 
              selectedPeriod={selectedPeriod}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              getPeriodText={getPeriodText}
            />

            {/* 하단: 3열 카드 (불량률 파이 차트, 잔여 수명 추이 차트, 다중 베어링 이력) */}
            <div style={{ display: 'flex', gap: 24, width: '100%' }}>
              <div style={{ flex: 1, minWidth: '0' }}>
                <DefectDifferenceChart 
                  ref={defectDifferenceChartRef} 
                  selectedBearing={selectedBearing}
                  selectedPeriod={selectedPeriod}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  getPeriodText={getPeriodText}
                />
              </div>
              <div style={{ flex: 1, minWidth: '0' }}>
                <RemainingLifeTrendChart 
                  ref={remainingLifeTrendChartRef} 
                  selectedBearing={selectedBearing}
                  selectedPeriod={selectedPeriod}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  getPeriodText={getPeriodText}
                />
              </div>
              <div style={{ flex: 1, minWidth: '0' }}>
                <ManyBearingHistory 
                  ref={manyBearingHistoryRef} 
                  selectedBearing={selectedBearing}
                  selectedPeriod={selectedPeriod}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  getPeriodText={getPeriodText}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}