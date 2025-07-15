// HistoryTable.tsx (혹은 histroy_table.tsx)
import React, { useState, useRef, useEffect } from 'react';

export default function HistoryTable() {
  // 정렬 기준 상태 관리
  const [activeSort, setActiveSort] = useState('latest');
  // 날짜 관련 상태
  const [selectedStartDate, setSelectedStartDate] = useState(new Date(2020, 4, 1));
  const [selectedEndDate, setSelectedEndDate] = useState(new Date(2020, 5, 26));
  const [currentMonth1, setCurrentMonth1] = useState(new Date(2020, 4, 1));
  const [currentMonth2, setCurrentMonth2] = useState(new Date(2020, 5, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // 기간 버튼
  const [activePeriod, setActivePeriod] = useState('전체');

  // 이미지 오버레이 상태
  const [hoveredImageInfo, setHoveredImageInfo] = useState<null | { x: number, y: number, imageUrl: string }>(null);

  // 달력 외부 클릭시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !(datePickerRef.current as any).contains(event.target)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [datePickerRef]);

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
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      marginBottom: 24,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>HISTORY</h2>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>보고서 다운로드</button>
      </div>

      <div style={{ marginBottom: 20, fontSize: 14, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div ref={datePickerRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '6px 10px',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 250,
                justifyContent: 'space-between',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style={{ flexGrow: 1, textAlign: 'center', fontSize: '0.85rem' }}>{formatDateRange()}</span>
            </div>
            {showDatePicker && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                padding: 15,
                width: 550,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                  {renderCalendar(currentMonth1, true)}
                  {renderCalendar(currentMonth2, false)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 10 }}>
                  <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>
                    {formatDateRange()}
                  </span>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#007bff',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
            {['전체', '오늘', '일주일', '한달', '일년'].map((period, index) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                style={{
                  padding: '6px 10px',
                  border: 'none',
                  background: activePeriod === period ? '#007bff' : '#f0f0f0',
                  color: activePeriod === period ? '#fff' : '#555',
                  cursor: 'pointer',
                  borderRight: index < 4 ? '1px solid #ddd' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setActiveSort('latest')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'none',
              color: activeSort === 'latest' ? '#007bff' : '#555',
              cursor: 'pointer',
              fontWeight: activeSort === 'latest' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s, fontWeight 0.15s'
            }}
          >
            <span style={{ color: activeSort === 'latest' ? '#007bff' : '#555' }}>●</span> 최신순
          </button>
          <button
            onClick={() => setActiveSort('risk')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'none',
              color: activeSort === 'risk' ? '#007bff' : '#555',
              cursor: 'pointer',
              fontWeight: activeSort === 'risk' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s, fontWeight 0.15s'
            }}
          >
            <span style={{ color: activeSort === 'risk' ? '#007bff' : '#555' }}>●</span> 위험도 순
          </button>

          <select style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}>
            <option>유형 선택</option>
            <option>전체</option>
            <option>불량</option>
            <option>정상</option>
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f8f8' }}>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>기록 일시</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>분류 번호</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>불량 유형</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>예측 잔여 수명</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>재생 및 이미지</th>
          </tr>
        </thead>
        <tbody>
          {/* 1번째 row (오디오) */}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px', textAlign: 'center' }}>2025-07-08 23:58:55</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>f_111</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>IR</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>55h</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              {/* 오디오 컨트롤러 */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: 20,
                padding: '8px 12px',
                width: 250,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <button style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: 8,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#333' }}>
                    <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
                  </svg>
                </button>
                <span style={{ fontSize: '0.85rem', color: '#555', whiteSpace: 'nowrap' }}>
                  0:13 / 2:27
                </span>
                <div style={{
                  flexGrow: 1, height: 4, background: '#ccc', borderRadius: 2,
                  margin: '0 10px', position: 'relative',
                }}>
                  <div style={{
                    width: '30%', height: '100%', background: '#888', borderRadius: 2,
                  }}></div>
                  <div style={{
                    position: 'absolute', left: 'calc(30% - 6px)', top: -6,
                    width: 12, height: 12, background: '#555', borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}></div>
                </div>
              </div>
            </td>
          </tr>

          {/* 2번째 row (이미지 보기) - td 전체 hover시 확대 이미지 */}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px', textAlign: 'center' }}>2025-07-08 21:58:55</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>f_110</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>OR</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>35h</td>
            <td
              style={{ padding: '12px', textAlign: 'center', position: 'relative' }}
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredImageInfo({
                  x: rect.left + window.scrollX,
                  y: rect.top + window.scrollY,
                  imageUrl: 'https://placehold.co/300x200/E0E0E0/333333?text=Large+Image'
                });
              }}
              onMouseLeave={() => setHoveredImageInfo(null)}
            >
              <button
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: '#f9f9f9',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span style={{ marginLeft: 5 }}>이미지 보기</span>
              </button>
            </td>
          </tr>

          {/* 3번째 row (오디오) */}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px', textAlign: 'center' }}>2025-07-08 21:58:55</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>N_88</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>정상</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>100h</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#f0f0f0', borderRadius: 20, padding: '8px 12px',
                width: 250, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <button style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', marginRight: 8,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#333' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span style={{ fontSize: '0.85rem', color: '#555', whiteSpace: 'nowrap' }}>
                  0:13 / 2:27
                </span>
                <div style={{
                  flexGrow: 1, height: 4, background: '#ccc', borderRadius: 2,
                  margin: '0 10px', position: 'relative',
                }}>
                  <div style={{
                    width: '30%', height: '100%', background: '#888', borderRadius: 2,
                  }}></div>
                  <div style={{
                    position: 'absolute', left: 'calc(30% - 6px)', top: -6,
                    width: 12, height: 12, background: '#555', borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}></div>
                </div>
              </div>
            </td>
          </tr>

          {/* 4번째 row (오디오) */}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px', textAlign: 'center' }}>2025-07-08 21:58:55</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>f_109</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>BALL</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>15h</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#f0f0f0', borderRadius: 20, padding: '8px 12px',
                width: 250, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <button style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', marginRight: 8,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#333' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span style={{ fontSize: '0.85rem', color: '#555', whiteSpace: 'nowrap' }}>
                  0:13 / 2:27
                </span>
                <div style={{
                  flexGrow: 1, height: 4, background: '#ccc', borderRadius: 2,
                  margin: '0 10px', position: 'relative',
                }}>
                  <div style={{
                    width: '30%', height: '100%', background: '#888', borderRadius: 2,
                  }}></div>
                  <div style={{
                    position: 'absolute', left: 'calc(30% - 6px)', top: -6,
                    width: 12, height: 12, background: '#555', borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}></div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 8 }}>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}>&lt;</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#007bff', color: '#fff', cursor: 'pointer' }}>1</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}>2</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}>3</button>
        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' }}>&gt;</button>
      </div>

      {/* 이미지 크게 보기 오버레이 */}
      {hoveredImageInfo && (
        <div style={{
          position: 'absolute',
          left: hoveredImageInfo.x - 24, // 상황에 따라 보정
          top: hoveredImageInfo.y - 70,
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
            style={{ display: 'block', maxWidth: '300px', height: 'auto' }}
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
