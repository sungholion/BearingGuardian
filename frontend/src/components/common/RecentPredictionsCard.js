import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const getStatusInfo = (rms) => {
  if (rms < 100) return { label: "정상", color: "#3a57e8" };       // 파란색
  if (rms < 300) return { label: "주의", color: "#ffc107" };       // 노란색
  return { label: "위험", color: "#dc3545" };                      // 빨간색
};

const RecentPredictionsCard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/ml/history/recent")
      .then((res) => setHistory(res.data))
      .catch(() => setError("히스토리 데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <tr>
        <td colSpan="4">Loading...</td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan="4">{error}</td>
      </tr>
    );
  }

  return (
    <>
      {history.map((item, idx) => {
        const { rms } = item.features;
        const statusInfo = getStatusInfo(rms);

        return (
          <tr key={item.id}>
            <td>
              <div className="d-flex align-items-center">
                <div className="rounded bg-soft-primary img-fluid avatar-40 me-3 d-flex align-items-center justify-content-center">
                  <span className="text-primary fw-bold">
                    {item.predicted_fault.split("_")[0][0]}
                  </span>
                </div>
                <h6 className="mb-0">{item.predicted_fault}</h6>
              </div>
            </td>
            <td>
              <span className="badge bg-secondary">
                {new Date(item.predicted_time).toLocaleString()}
              </span>
            </td>
            <td>
              <CircularProgressbar
                value={rms}
                maxValue={500}
                text={`${rms.toFixed(1)}`}
                styles={buildStyles({
                  pathColor: statusInfo.color,
                  textColor: "#000",
                  trailColor: "#eee",
                })}
              />
              <div className="text-center mt-1" style={{ color: statusInfo.color }}>
                <strong>{statusInfo.label}</strong>
              </div>
            </td>
            <td>
              <div className="small text-muted">
                mean: {item.features.mean.toFixed(1)}<br />
                std: {item.features.stddev.toFixed(1)}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default RecentPredictionsCard;
