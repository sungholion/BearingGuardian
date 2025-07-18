'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define the props interface for HistoryTable
interface HistoryTableProps {
  isPdfExporting?: boolean; // Make it optional, as it might not always be passed or needed for all uses
}

// Update the function signature to accept props
export default function HistoryTable({ isPdfExporting, defectFilter }: HistoryTableProps & { defectFilter: string }) {
  const [activeSort, setActiveSort] = useState('latest');
  const [selectedStartDate, setSelectedStartDate] = useState(new Date(2020, 4, 1));
  const [selectedEndDate, setSelectedEndDate] = useState(new Date(2020, 5, 26));
  const [currentMonth1, setCurrentMonth1] = useState(new Date(2020, 4, 1));
  const [currentMonth2, setCurrentMonth2] = useState(new Date(2020, 5, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const [hoveredImageInfo, setHoveredImageInfo] = useState(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState<HistoryItem[]>([]);

  interface HistoryItem {
    id: string;
    timestamp: string;
    classificationNumber: string;
    defectType: string;
    predictedRUL: string;
    mediaType: 'audio' | 'image';
    mediaUrl: string;
  }

  const generateHistoryData = (numItems: number): HistoryItem[] => {
    const data: HistoryItem[] = [];
    let currentTimestamp = new Date('2025-07-18T13:00:00');
    let currentRUL = 95.0; // 95에서 시작

    const defectTypes = ['IR', 'OR', 'Normal'];
    const mediaTypes = ['audio', 'image'];
    const audioUrls = ['/audio/sample1.mp3', '/audio/sample2.mp3', '/audio/sample3.mp3', '/audio/sample4.mp3', '/audio/sample5.mp3'];
    const imageUrls = ['/images/sample1.png', '/images/sample2.png', '/images/sample3.png', '/images/sample4.png', '/images/sample5.png'];

    for (let i = 0; i < numItems; i++) {
      const id = (i + 1).toString();
      const year = currentTimestamp.getFullYear();
      const month = (currentTimestamp.getMonth() + 1).toString().padStart(2, '0');
      const day = currentTimestamp.getDate().toString().padStart(2, '0');
      const hours = currentTimestamp.getHours().toString().padStart(2, '0');
      const minutes = currentTimestamp.getMinutes().toString().padStart(2, '0');
      const seconds = currentTimestamp.getSeconds().toString().padStart(2, '0');
      const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // predictedRUL은 95에서 시작하여 0.1씩 감소하거나 유지되거나 하는 랜덤한 변화
      // 가장 최근 데이터가 가장 낮은 수치여야 하므로, i가 증가할수록 RUL이 감소하도록 조정
      const predictedRULValue = 95.0 - (i * 0.1); // 95에서 시작하여 0.1씩 감소
      const predictedRUL = `${predictedRULValue.toFixed(1)}`;

      let defectType: string;
      let classificationNumber: string;

      // 첫 번째 페이지 항목 (0, 1, 2, 3 인덱스)에 대한 강제 설정
      if (i === 0) {
        defectType = 'Normal';
        classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else if (i === 1) {
        defectType = 'Normal';
        classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else if (i === 2) {
        defectType = 'IR';
        classificationNumber = `I_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else if (i === 3) {
        defectType = 'Normal';
        classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      } else {
        // 나머지 항목은 기존 로직 유지 (랜덤)
        defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        if (defectType === 'OR') {
          classificationNumber = `O_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
        } else if (defectType === 'IR') {
          classificationNumber = `I_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
        } else { // Normal
          classificationNumber = `N_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
        }
      }

      const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
      const mediaUrl = mediaType === 'audio' ? audioUrls[Math.floor(Math.random() * audioUrls.length)] : imageUrls[Math.floor(Math.random() * imageUrls.length)];

      data.push({
        id,
        timestamp,
        classificationNumber,
        defectType,
        predictedRUL,
        mediaType: mediaType as 'audio' | 'image',
        mediaUrl,
      });

      // 시간을 역순으로 감소 (예: 2초씩 감소)
      currentTimestamp = new Date(currentTimestamp.getTime() - 2 * 1000); // 2초씩 감소
    }
    return data;
  };

  useEffect(() => {
    const generatedData = generateHistoryData(50);
    const sortedData = generatedData.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setHistoryData(sortedData);
    setFilteredHistoryData(sortedData); // Initialize filtered data with all data
  }, []);

  useEffect(() => {
    let dataToFilter = historyData;
    if (defectFilter === '정상') {
      dataToFilter = historyData.filter(item => item.defectType === 'Normal');
    } else if (defectFilter === '불량') {
      dataToFilter = historyData.filter(item => item.defectType === 'IR' || item.defectType === 'OR');
    }
    setFilteredHistoryData(dataToFilter);
    setCurrentPage(1); // Reset to first page on filter change
  }, [defectFilter, historyData]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistoryData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // 날짜 포맷 함수
  const formatDate = (date: Date) => `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  const formatDateRange = () =>
    selectedStartDate && selectedEndDate
      ? `${formatDate(selectedStartDate)} ~ ${formatDate(selectedEndDate)}`
      : selectedStartDate
        ? `${formatDate(selectedStartDate)} ~`
        : '';

  // 달력 렌더링
  const renderCalendar = (monthDate: Date, isFirstCalendar: boolean) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, currentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) days.push({ day: i, currentMonth: false });

    const handleDayClick = (dayObj: any) => {
      if (!dayObj.currentMonth) return;
      const clickedDate = dayObj.date;
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        setSelectedStartDate(clickedDate);
        setSelectedEndDate(null);
      } else if (clickedDate < selectedStartDate) {
        setSelectedStartDate(clickedDate);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(clickedDate);
      }
    };
    const isSelected = (date: Date) => {
      if (!date) return false;
      const start = selectedStartDate ? selectedStartDate.toDateString() : null;
      const end = selectedEndDate ? selectedEndDate.toDateString() : null;
      const current = date.toDateString();
      return current === start || current === end;
    };
    const isInRange = (date: Date) => {
      if (!selectedStartDate || !selectedEndDate) return false;
      return date >= selectedStartDate && date <= selectedEndDate;
    };

    return (
      <div style={{ flex: 1, padding: '0 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button
            onClick={() => {
              if (isFirstCalendar) {
                setCurrentMonth1(new Date(year, month - 1, 1));
                setCurrentMonth2(new Date(year, month, 1));
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}
          >
            &lt;
          </button>
          <span style={{ fontWeight: 'bold', color: '#333' }}>{year}. {month + 1}.</span>
          <button
            onClick={() => {
              if (isFirstCalendar) {
                setCurrentMonth1(new Date(year, month + 1, 1));
                setCurrentMonth2(new Date(year, month + 2, 1));
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}
          >
            &gt;
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, textAlign: 'center' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName, idx) => (
            <span key={dayName} style={{ fontWeight: 'bold', color: idx === 0 ? 'red' : idx === 6 ? 'blue' : '#333' }}>{dayName}</span>
          ))}
          {days.map((dayObj, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(dayObj)}
              style={{
                padding: '5px 0',
                borderRadius: '4px',
                cursor: dayObj.currentMonth ? 'pointer' : 'default',
                color: dayObj.currentMonth ? (isSelected(dayObj.date) ? '#fff' : (dayObj.date?.getDay() === 0 ? 'red' : dayObj.date?.getDay() === 6 ? 'blue' : '#333')) : '#ccc',
                background: isSelected(dayObj.date) ? '#007bff' : isInRange(dayObj.date) ? '#e0f2ff' : 'none',
                fontWeight: isSelected(dayObj.date) ? 'bold' : 'normal',
                transition: 'background 0.1s',
              }}
            >
              {dayObj.day}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
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
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}
        >
          &gt;
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