import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// RMS 값에 따라 색상을 반환하는 유틸리티 함수
function getColorByRMS(rms) {
  if (rms > 1000) return "red";
  if (rms > 100) return "orange";
  return "green";
}

// RMS 값에 따라 레이블을 반환하는 유틸리티 함수
function getLabelByRMS(rms) {
  if (rms > 1000) return "위험";
  if (rms > 100) return "주의";
  return "정상";
}

const RecentPredictionsCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <tr>
        <td colSpan="5" className="text-center">최근 예측 기록이 없습니다.</td>
      </tr>
    );
  }

  return (
    <>
      {data.map((item, index) => {
        // '정상'이 아닌 모든 predicted_fault는 불량으로 간주
        const isFault = item.predicted_fault !== "정상";
        const rmsValue = item.features?.rms; // optional chaining으로 features.rms 안전하게 접근

        return (
          <tr key={item.id || index}> {/* item.id가 있으면 고유 키로 사용, 없으면 index */}
            <td>
              <div className="d-flex align-items-center">
                {/* predicted_time 사용 및 한국 로케일 포맷 적용 */}
                <h6>{new Date(item.predicted_time).toLocaleString('ko-KR')}</h6>
              </div>
            </td>
            <td>
              <span className={`badge ${isFault ? 'bg-danger' : 'bg-success'}`}>
                {isFault ? "불량" : "정상"}
              </span>
            </td>
            <td>{item.predicted_fault || "N/A"}</td> {/* 불량 유형 또는 "정상" */}
            
            {/* 진동 값 대신 mean, stddev 표시 */}
            <td>
              {item.features ? (
                <div className="small">
                  Mean: {item.features.mean?.toFixed(2) || "N/A"}<br />
                  StdDev: {item.features.stddev?.toFixed(2) || "N/A"}
                </div>
              ) : "N/A"}
            </td>

            {/* RMS 신호등 시각화 */}
            <td className="text-center">
              {rmsValue !== undefined ? (
                <div style={{ width: "80px", margin: "0 auto" }}>
                  <CircularProgressbar
                    value={rmsValue}
                    maxValue={3000} // RMS 값의 최대 범위에 따라 조정 필요
                    text={`${rmsValue.toFixed(0)}`}
                    styles={buildStyles({
                      pathColor: getColorByRMS(rmsValue),
                      textColor: "#000",
                      trailColor: "#eee",
                    })}
                  />
                  <div
                    className="small"
                    style={{
                      color: getColorByRMS(rmsValue),
                      fontWeight: "bold",
                      marginTop: "5px",
                    }}
                  >
                    {getLabelByRMS(rmsValue)}
                  </div>
                </div>
              ) : (
                "N/A" // RMS 데이터가 없는 경우
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default RecentPredictionsCard;
