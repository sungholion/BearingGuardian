'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import HistoryTable from '../components/HistoryTable';
import RemainingLifeTrendChart from '../components/RemainingLifeTrendChart';
import DefectDifferenceChart from '../components/DefectDifferenceChart';

// ReportControls 컴포넌트가 handleDownloadReport 함수와 isDownloading, libsLoaded 상태를 받도록 변경
function ReportControls({ handleDownloadReport, isDownloading, libsLoaded }) {
  // Add a state to manage the active period button
  const [activePeriod, setActivePeriod] = useState('전체');

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between', // HISTORY 타이틀과 버튼을 양 끝으로 정렬
        alignItems: 'center',
        fontSize: 22,
        fontWeight: 600,
        color: '#333',
        marginBottom: 20,
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: 16,
      }}>
        <span>HISTORY</span>
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading || !libsLoaded}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: (isDownloading || !libsLoaded) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            opacity: (isDownloading || !libsLoaded) ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s ease, opacity 0.2s ease',
          }}
        >
          {isDownloading ? '다운로드 중...' : !libsLoaded ? '라이브러리 로드 중...' : '보고서 다운로드'}
        </button>
      </div>

      {/* 기존 필터/기간 선택 UI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <input type="date" style={{
          height: 36,
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          padding: '0 12px',
          fontSize: 14,
          color: '#555',
        }}/>
        <span style={{ fontSize: 16, color: '#555' }}>-</span>
        <input type="date" style={{
          height: 36,
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          padding: '0 12px',
          fontSize: 14,
          color: '#555',
        }}/>
        <div style={{
          display: 'flex',
          gap: 6,
          marginLeft: 20,
        }}>
          {/* 기간 선택 on 표시 효과*/}
          {['전체', '오늘', '1주', '1개월', '1년'].map((text) => (
            <button
              key={text}
              onClick={() => setActivePeriod(text)} 
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activePeriod === text ? '1px solid #007bff' : '1px solid #e0e0e0', // Active border
                background: activePeriod === text ? '#e0f2ff' : '#f8f8f8', // Active background
                color: activePeriod === text ? '#007bff' : '#555', // Active text color
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: activePeriod === text ? '#e0f2ff' : '#e0e0e0', // Hover style for non-active
                },
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
          color: '#888',
          fontSize: 14,
          cursor: 'pointer',
        }}>
          위험도순
        </button>
        <select style={{
          marginLeft: 15,
          height: 36,
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          padding: '0 10px',
          fontSize: 14,
          color: '#555',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}>
          <option>장비 선택</option>
        </select>
        <select style={{
          marginLeft: 10,
          height: 36,
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          padding: '0 10px',
          fontSize: 14,
          color: '#555',
          backgroundColor: '#fff',
          cursor: 'pointer',
        }}>
          <option>기간 선택</option>
        </select>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const contentToPrintRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false); 

  useEffect(() => {
    const loadHtml2canvas = () => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.html2canvas) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('html2canvas 로드 실패'));
        document.head.appendChild(script);
      });
    };

    const loadJsPDF = () => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.jspdf) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('jspdf 로드 실패'));
        document.head.appendChild(script);
      });
    };

    const loadLibraries = async () => {
      try {
        await loadHtml2canvas();
        await loadJsPDF();
        setLibsLoaded(true);
      } catch (error) {
        console.error("라이브러리 로드 중 오류 발생:", error);
        setLibsLoaded(false);
      }
    };

    loadLibraries();

    return () => {
      const html2canvasScript = document.querySelector('script[src*="html2canvas"]');
      const jspdfScript = document.querySelector('script[src*="jspdf"]');
      if (html2canvasScript) html2canvasScript.remove();
      if (jspdfScript) jspdfScript.remove();
    };
  }, []);

  const handleDownloadReport = async () => {
    if (!contentToPrintRef.current) {
      console.error("PDF로 저장할 컨텐츠를 찾을 수 없습니다.");
      return;
    }

    if (!libsLoaded) {
      console.warn("PDF 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsDownloading(true);
    setIsPdfExporting(true); // Set to true before capture

    // Use requestAnimationFrame to ensure the DOM updates before html2canvas captures
    await new Promise(resolve => requestAnimationFrame(resolve));

    try {
      // @ts-ignore
      const html2canvas = window.html2canvas;
      // @ts-ignore
      const jsPDF = window.jspdf.jsPDF;

      const canvas = await html2canvas(contentToPrintRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgPdfWidth = pdfWidth - 20;
      const imgPdfHeight = (imgProps.height * imgPdfWidth) / imgProps.width;

      let heightLeft = imgPdfHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgPdfWidth, imgPdfHeight);
      heightLeft -= (pdfHeight - position);

      while (heightLeft > 0) {
        position = -heightLeft + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgPdfWidth, imgPdfHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("보고서.pdf");
    } catch (error) {
      console.error("보고서 다운로드 중 오류 발생:", error);
      alert("보고서 다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
      setIsPdfExporting(false); // Set back to false after capture
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column' }}>

          {/* ReportControls 컴포넌트에 필요한 props 전달 */}
          <ReportControls
            handleDownloadReport={handleDownloadReport}
            isDownloading={isDownloading}
            libsLoaded={libsLoaded}
          />

          {/* PDF로 캡처할 컨텐츠 영역 (테이블과 차트) */}
          <div
            ref={contentToPrintRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            {/* HistoryTable */}
            <HistoryTable isPdfExporting={isPdfExporting} /> {/* Pass the new prop here */}

            {/* 하단: 2열 카드 (불량률 파이 차트, 잔여 수명 추이 차트) */}
            <div style={{ display: 'flex', gap: 24, width: '100%' }}>
              <div style={{ flex: 1, minWidth: '0' }}>
                <DefectDifferenceChart />
              </div>
              <div style={{ flex: 1, minWidth: '0' }}>
                <RemainingLifeTrendChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}