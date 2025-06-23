document.addEventListener('DOMContentLoaded', () => {
    const wavFileInput = document.getElementById('wavFile');
    const predictBtn = document.getElementById('predictBtn');
    const statusDiv = document.getElementById('status');
    const resultsSection = document.getElementById('resultsSection');
    const resultsTableBody = document.querySelector('#resultsTable tbody');

    // 백엔드 API 주소
    const apiUrl = 'http://127.0.0.1:8001/predict/wav';

    predictBtn.addEventListener('click', async () => {
        const file = wavFileInput.files[0];

        if (!file) {
            statusDiv.textContent = '⚠️ 파일을 선택해주세요.';
            statusDiv.style.color = '#e74c3c';
            return;
        }

        if (!file.name.toLowerCase().endsWith('.wav')) {
            statusDiv.textContent = '⚠️ .wav 파일만 업로드할 수 있습니다.';
            statusDiv.style.color = '#e74c3c';
            return;
        }

        // 이전 결과 숨기기 및 상태 초기화
        resultsSection.style.display = 'none';
        resultsTableBody.innerHTML = '';
        statusDiv.textContent = '🔄 예측을 위해 서버에 파일을 업로드하는 중...';
        statusDiv.style.color = '#3498db';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '서버에서 오류가 발생했습니다.');
            }

            const results = await response.json();
            
            statusDiv.textContent = '✅ 예측 완료!';
            statusDiv.style.color = '#2ecc71';
            displayResults(results);

        } catch (error) {
            statusDiv.textContent = `🚫 오류 발생: ${error.message}`;
            statusDiv.style.color = '#e74c3c';
            console.error('Fetch Error:', error);
        }
    });

    function displayResults(results) {
        if (!results || results.length === 0) {
            statusDiv.textContent = '결과 데이터가 없습니다.';
            return;
        }

        results.forEach(row => {
            const tr = document.createElement('tr');
            
            // 테이블 헤더 순서에 맞게 데이터를 삽입
            tr.innerHTML = `
                <td>${row.max.toFixed(4)}</td>
                <td>${row.min.toFixed(4)}</td>
                <td>${row.rms.toFixed(4)}</td>
                <td>${row.kurtosis.toFixed(4)}</td>
                <td>${row.crest.toFixed(4)}</td>
                <td>${row.form.toFixed(4)}</td>
                <td><strong>${row.predicted_fault}</strong></td>
            `;
            resultsTableBody.appendChild(tr);
        });

        resultsSection.style.display = 'block';
    }
}); 