// src/views/userinput/index.js

import React, { Fragment } from "react";
import WavPredictionCard from "../../components/common/WavPredictionCard";
import CsvPredictionCard from "../../components/common/CsvPredictionCard";
import { Card } from "react-bootstrap";

const UserInputPage = () => {
  return (
    <Fragment>
      <section id="fault-diagnosis">
        <div className="iq-side-content sticky-xl-top">
          <Card>
            <Card.Body>
              <h4 className="fw-bold">고장 진단</h4>
            </Card.Body>
          </Card>
        </div>

        {/* ✅ WAV 예측 카드 */}
        <WavPredictionCard />

        {/* ✅ CSV 예측 카드 */}
        <CsvPredictionCard />
      </section>
    </Fragment>
  );
};

export default UserInputPage;
// 이 컴포넌트는 WAV 파일 업로드 및 예측, CSV 파일 업로드 및 예측 기능을 포함합니다.
// 각 기능은 별도의 카드 컴포넌트로 분리되어 있으며, 사용자가 파일을 업로드하고 예측 결과를 확인할 수 있습니다.
// 이 페이지는 고장 진단을 위한 사용자 입력 인터페이스를 제공합니다.    