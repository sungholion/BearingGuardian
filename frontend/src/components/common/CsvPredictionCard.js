// frontend/src/components/common/CsvPredictionCard.js
import React, { useState } from 'react';
import { Button, Card, Alert, Spinner } from 'react-bootstrap';
import { predictFromCsv } from '../../api/apiService';

const CsvPredictionCard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('CSV 파일만 업로드할 수 있습니다.');
      setSelectedFile(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setCsvResult(null);

    try {
      const resultBlob = await predictFromCsv(selectedFile);
      setCsvResult(resultBlob);
    } catch (err) {
      setError('예측 중 오류 발생: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const url = window.URL.createObjectURL(new Blob([csvResult]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'predicted_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 mb-4">
      <h4>📊 CSV 기반 다중 예측</h4>

      <div className="mb-3">
        <input type="file" accept=".csv" onChange={handleCsvChange} className="form-control" />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button onClick={handlePredict} disabled={!selectedFile || loading} variant="primary">
        {loading ? (
          <>
            <Spinner size="sm" animation="border" className="me-2" /> 예측 중...
          </>
        ) : (
          'CSV 예측 실행'
        )}
      </Button>

      {csvResult && (
        <div className="mt-3">
          <Alert variant="success">✅ 예측이 완료되었습니다.</Alert>
          <Button variant="success" onClick={handleDownload}>
            예측 결과 CSV 다운로드
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CsvPredictionCard;
