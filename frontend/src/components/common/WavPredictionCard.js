// frontend/src/components/common/WavPredictionCard.js

import React, { useState } from 'react';
import Card from '../Card'; // '../../src/components/Card' 대신 '../Card'로 경로 변경
import Loader from '../Loader'; // '../../src/components/Loader' 대신 '../Loader'로 경로 변경
import { Button, Table, Row, Col } from 'react-bootstrap'; // Bootstrap 컴포넌트
import { predictFault } from '../../api/apiService'; // apiService에서 predictFault 함수 임포트

const WavPredictionCard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "audio/wav") {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file)); 
      setPredictionResult(null); 
      setError(null);
    } else {
      setSelectedFile(null);
      setAudioUrl(null);
      setError("WAV 파일만 업로드할 수 있습니다.");
    }
  };
  const handlePredict = async () => {
    if (!selectedFile) {
      setError("WAV 파일을 먼저 업로드해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const response = await predictFault(selectedFile);
      setPredictionResult(response.data); // axios는 data 안에 결과 있음
      console.log("Prediction Result:", response.data);    } catch (err) {
      console.error("Error predicting:", err);
      setError(err.response?.data?.detail || "예측 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (predictionResult && predictionResult.preprocessed_csv_data) {
      const blob = new Blob([predictionResult.preprocessed_csv_data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'preprocessed_features.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); 
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Header.Title>
          <h4>WAV 파일 기반 고장 진단</h4>
        </Card.Header.Title>
      </Card.Header>
      <Card.Body>
        <p className="mb-3">WAV 파일을 업로드하여 베어링 고장 유형을 예측합니다.</p>

        <div className="mb-3">
          <label htmlFor="wavFile" className="form-label">WAV 파일 선택:</label>
          <input 
            type="file" 
            className="form-control" 
            id="wavFile" 
            accept=".wav" 
            onChange={handleFileChange} 
          />
        </div>

        {audioUrl && (
          <div className="mb-3">
            <h5>업로드된 오디오</h5>
            <audio controls src={audioUrl} className="w-100">
              Your browser does not support the audio element.
            </audio>
            <p className="mt-2">파일명: {selectedFile?.name}</p>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {predictionResult && (
          <div className="mt-4">
            {/* 예측 결과에 따른 메시지 표시 */}
            {predictionResult.predicted_label === "정상" && (
              <div className="alert alert-success mt-3">
                <i className="fa fa-check-circle"></i> 정상입니다.
              </div>
            )}

            {predictionResult.predicted_label !== "정상" && (
              <div className="alert alert-danger mt-3">
                <i className="fa fa-exclamation-triangle"></i> 불량입니다. ({predictionResult.predicted_label})
              </div>
            )}

            {/* 나머지 예측 결과 (확률 테이블 등) */}
            <h5>예측 결과:</h5>
            <p>예측된 고장 유형: <strong>{predictionResult.predicted_label}</strong></p>
            <p>샘플링 주파수: {predictionResult.sampling_rate} Hz</p>
            <p>추출된 피처 형태: [{predictionResult.extracted_feature_shape.join(', ')}]</p>

            {predictionResult.probabilities && (
              <>
                <h5 className="mt-4">고장 유형별 예측 확률:</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>고장 유형</th>
                      <th>확률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionResult.probabilities.map((prob, index) => (
                      <tr key={index}>
                        <td>{prob.fault_type}</td>
                        <td>{(prob.probability * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            <Button variant="success" onClick={handleDownloadCsv}>
              전처리된 피처 CSV 다운로드
            </Button>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handlePredict}
          disabled={!selectedFile || loading}
          type="button" // 기본 제출 동작 방지
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              예측 중...
            </>
          ) : (
            "고장 유형 예측하기"
          )}
        </Button>
      </Card.Body>
      {loading && <Loader />}
    </Card>
  );
};

export default WavPredictionCard;
