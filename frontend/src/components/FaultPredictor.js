// frontend/src/components/FaultPredictor.js
import React, { useState } from 'react';
import { predictFault } from '../api/apiService';

const FaultPredictor = () => {
  const [wavFile, setWavFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setWavFile(e.target.files[0]);
  };

  const handlePredict = async () => {
    if (!wavFile) return alert('WAV 파일을 업로드해주세요.');
    try {
      const response = await predictFault(wavFile);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert('예측 중 오류 발생');
    }
  };

  return (
    <div>
      <h2>WAV 고장 예측</h2>
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <button onClick={handlePredict}>예측하기</button>

      {result && (
        <div>
          <h3>예측 결과: {result.predicted_label}</h3>
          <ul>
            {result.probabilities.map((p, idx) => (
              <li key={idx}>
                {p.fault_type}: {(p.probability * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FaultPredictor;
