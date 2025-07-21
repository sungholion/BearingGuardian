'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define the props interface for HistoryTable
interface HistoryTableProps {
  isPdfExporting?: boolean; // Make it optional, as it might not always be passed or needed for all uses
}

// Update the function signature to accept props
export default function HistoryTable({ isPdfExporting, defectFilter, selectedPeriod, selectedStartDate, selectedEndDate }: HistoryTableProps & { defectFilter: string, selectedPeriod: string, selectedStartDate: Date | null, selectedEndDate: Date | null }) {
  const [activeSort, setActiveSort] = useState('latest');
  const [currentMonth1, setCurrentMonth1] = useState(new Date(2020, 4, 1));
  const [currentMonth2, setCurrentMonth2] = useState(new Date(2020, 5, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const [hoveredImageInfo, setHoveredImageInfo] = useState(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState<HistoryItem[]>([]);

  interface HistoryItem {
    id: string;
    bearingId: string;
    timestamp: string;
    classificationNumber: string;
    defectType: string;
    predictedRUL: string;
    mediaType: 'audio' | 'image';
    mediaUrl: string;
  }

  const generateHistoryData = (numItems: number): HistoryItem[] => {
    const data: HistoryItem[] = [];
    const today = new Date('2025-07-21T00:00:00'); // 오늘 날짜의 시작 시간
    let currentTimestamp = new Date('2025-07-21T23:59:59'); // 오늘 날짜의 끝 시간부터 역순으로 시작
    let currentRUL = 95.0; // 95에서 시작

    const bearingIds = ['B001', 'B002', 'B003', 'B004'];
    const defectTypes = ['IR', 'OR', 'Normal'];
    const mediaTypes = ['audio', 'image'];
    const audioUrls = ['/audio/sample1.mp3', '/audio/sample2.mp3', '/audio/sample3.mp3', '/audio/sample4.mp3', '/audio/sample5.mp3'];
    const imageUrls = ['/images/sample1.png', '/images/sample2.png', '/images/sample3.png', '/images/sample4.png', '/images/sample5.png'];

    // 오늘 날짜 데이터 (10분 간격으로 100개)
    for (let i = 0; i < 100; i++) {
      const id = (i + 1).toString();
      const bearingId = bearingIds[Math.floor(Math.random() * bearingIds.length)];
      const timestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
      const predictedRULValue = Math.max(0, 95.0 - (i * 0.1));
      const predictedRUL = `${predictedRULValue.toFixed(1)}`;

      const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
      let classificationNumber;
      if (defectType === 'OR') {
        classificationNumber = `O_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else if (defectType === 'IR') {
        classificationNumber = `I_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else { // Normal
        classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      }

      const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
      const mediaUrl = mediaType === 'audio' ? audioUrls[Math.floor(Math.random() * audioUrls.length)] : imageUrls[Math.floor(Math.random() * imageUrls.length)];

      data.push({
        id,
        bearingId,
        timestamp,
        classificationNumber,
        defectType,
        predictedRUL,
        mediaType: mediaType as 'audio' | 'image',
        mediaUrl,
      });

      currentTimestamp = new Date(currentTimestamp.getTime() - 10 * 60 * 1000); // 10분씩 감소
    }

    // 과거 데이터 (나머지 항목, 12시간 간격)
    currentTimestamp = new Date('2025-07-20T23:59:59'); // 오늘 이전 날짜부터 시작
    for (let i = 100; i < numItems; i++) {
      const id = (i + 1).toString();
      const bearingId = bearingIds[Math.floor(Math.random() * bearingIds.length)];
      const timestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
      const predictedRULValue = Math.max(0, 95.0 - (i * 0.1));
      const predictedRUL = `${predictedRULValue.toFixed(1)}`;

      const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
      let classificationNumber;
      if (defectType === 'OR') {
        classificationNumber = `O_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else if (defectType === 'IR') {
        classificationNumber = `I_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else { // Normal
        classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      }

      const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
      const mediaUrl = mediaType === 'audio' ? audioUrls[Math.floor(Math.random() * audioUrls.length)] : imageUrls[Math.floor(Math.random() * imageUrls.length)];

      data.push({
        id,
        bearingId,
        timestamp,
        classificationNumber,
        defectType,
        predictedRUL,
        mediaType: mediaType as 'audio' | 'image',
        mediaUrl,
      });

      currentTimestamp = new Date(currentTimestamp.getTime() - 12 * 60 * 60 * 1000); // 12시간씩 감소
    }
    return data;
  };

  useEffect(() => {
    const generatedData = generateHistoryData(1000); // 총 1000개 항목 생성
    const sortedData = generatedData.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setHistoryData(sortedData);
    setFilteredHistoryData(sortedData); // Initialize filtered data with all data
  }, []);

  useEffect(() => {
    let dataToFilter = historyData;

    // Defect filter
    if (defectFilter === '정상') {
      dataToFilter = dataToFilter.filter(item => item.defectType === 'Normal');
    } else if (defectFilter === '불량') {
      dataToFilter = dataToFilter.filter(item => item.defectType === 'IR' || item.defectType === 'OR');
    }

    // Date filter
    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (selectedPeriod === '오늘') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedPeriod === '1주') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedPeriod === '1개월') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedPeriod === '1년') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedStartDate && selectedEndDate) {
      startDate = selectedStartDate;
      endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999); // End of selected day
    }

    if (startDate && endDate) {
      dataToFilter = dataToFilter.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Sorting
    let sortedData = [...dataToFilter]; // Create a copy to sort
    if (activeSort === 'latest') {
      sortedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (activeSort === 'oldest') {
      sortedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    setFilteredHistoryData(sortedData);
    setCurrentPage(1); // Reset to first page on filter change
  }, [defectFilter, historyData, selectedPeriod, selectedStartDate, selectedEndDate, activeSort]);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = isPdfExporting ? filteredHistoryData : filteredHistoryData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePrevPageBlock = () => {
    setCurrentPage(prev => Math.max(1, prev - 10));
  };

  const handleNextPageBlock = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 10));
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endPage = Math.min(totalPages, startPage + 9);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const endPage = Math.min(totalPages, startPage + 9);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        marginBottom: 24,
        position: 'relative' // This is correct for positioning children absolutely
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>HISTORY</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f8f8' }}>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>기록 일시</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>베어링 번호</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>분류 번호</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>불량 유형</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>예측 잔여 수명</th>
            {/* Conditionally hide the column header */}
            <th style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                textAlign: 'center',
                display: isPdfExporting ? 'none' : 'table-cell' // Hide if PDF exporting
            }}>이미지</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.timestamp}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.bearingId}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.classificationNumber}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.defectType}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.predictedRUL}</td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                display: isPdfExporting ? 'none' : 'table-cell'
              }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    width: '100%', height: '100px', // Adjust height as needed
                    overflow: 'hidden',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                    background: '#f9f9f9',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredImageInfo({
                      imageUrl: '/zupa.png', // 임의의 스펙트로그램 이미지 경로
                      left: e.clientX - 550, // 커서 X 위치에서 이미지 너비의 절반만큼 왼쪽으로 이동 (수평 중앙 정렬)
                      top: e.clientY - 350, // 커서 Y 위치에서 이미지 높이 + 여백만큼 위로 이동
                    });
                  }}
                  onMouseLeave={() => setHoveredImageInfo(null)}
                >
                  <img
                    src="/zupa.png" // 실제 스펙트로그램 이미지 경로
                    alt="스펙트로그램 이미지"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/E0E0E0/ADADAD?text=No+Image';
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Conditionally hide the pagination section */}
      <div
        style={{
          display: isPdfExporting ? 'none' : 'flex',
          justifyContent: 'center',
          marginTop: 20,
          gap: 8,
        }}
      >
        <button
          onClick={handlePrevPageBlock}
          disabled={startPage === 1}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &lt;
        </button>
        {renderPageNumbers().map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: currentPage === pageNumber ? '#007bff' : '#f9f9f9',
              color: currentPage === pageNumber ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &gt;
        </button>
        <button
          onClick={handleNextPageBlock}
          disabled={endPage === totalPages}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &gt;&gt;
        </button>
      </div>

      {/* 이미지 크게 보기 오버레이 */}
      {hoveredImageInfo && (
        <div style={{
          position: 'absolute',
          left: hoveredImageInfo.left,
          top: hoveredImageInfo.top,
          zIndex: 100,
          border: '1px solid #ddd',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fff',
        }}>
          <img
            src={hoveredImageInfo.imageUrl}
            alt="확대 이미지"
            style={{ display: 'block', maxWidth: '500px', height: 'auto' }}
            onError={e => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/FF0000/FFFFFF?text=Image+Load+Error';
            }}
          />
        </div>
      )}
    </div>
  );
}