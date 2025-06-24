// frontend/src/api/apiService.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1/ml',
});

// 1. WAV 파일 예측
export const predictFault = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/predict-fault', formData);
};

// 2. WAV 피처 CSV 다운로드
export const downloadCSV = (csvData) => {
  return API.get('/download-features-csv', {
    params: { csv_data: csvData },
    responseType: 'blob',
  });
};

// ✅ 3. CSV 업로드 다중 예측 추가
export const predictFromCsv = (csvFile) => {
  const formData = new FormData();
  formData.append('file', csvFile);
  return API.post('/predict-csv', formData, {
    responseType: 'blob', // CSV 파일로 결과 내려오므로 blob 필요
  });
};
// 4. CSV 피처 다운로드
export const downloadCsvFeatures = (csvData) => {
  return API.get('/download-csv-features', {
    params: { csv_data: csvData },
    responseType: 'blob',
  });
}