//"C:\Users\jh\Documents\GitHub\br\frontend\src\views\dashboard\index.js"
import WavPredictionCard from "../../components/common/WavPredictionCard";
import CsvPredictionCard from "../../components/common/CsvPredictionCard";
import RecentPredictionsCard from '../../components/common/RecentPredictionsCard';


import React, { useEffect, memo, Fragment, useState } from "react";
import { Row, Col, Dropdown, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

//circular
import Circularprogressbar from "../../components/circularprogressbar.js";

// AOS
import AOS from "aos";
import "../../../node_modules/aos/dist/aos";
import "../../../node_modules/aos/dist/aos.css";
//apexcharts
import Chart from "react-apexcharts";

//swiper
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";

// Import Swiper styles
import "swiper/swiper-bundle.min.css";
// import 'swiper/components/navigation/navigation.scss';

//progressbar
import Progress from "../../components/progress.js";
//img
import shapes1 from "../../assets/images/shapes/01.png";
import shapes2 from "../../assets/images/shapes/02.png";
import shapes3 from "../../assets/images/shapes/03.png";
import shapes4 from "../../assets/images/shapes/04.png";
import shapes5 from "../../assets/images/shapes/05.png";

//Count-up
import CountUp from "react-countup";

// Redux Selector / Action
import { useSelector } from "react-redux";

// Import selectors & action from setting store
import * as SettingSelector from "../../store/setting/selectors"; // ✅ 오류 수정: import * as [별칭] from ...

// install Swiper modules
SwiperCore.use([Navigation]);

const Index = memo((props) => {
  useSelector(SettingSelector.theme_color);

  // ✅ 컴포넌트 내부에 상태 및 useEffect 추가
  const [recentHistory, setRecentHistory] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/ml/history/recent")
      .then((res) => setRecentHistory(res.data))
      .catch((err) => console.error("히스토리 불러오기 실패", err));
  }, []);


  const getVariableColor = () => {
    let prefix =
      getComputedStyle(document.body).getPropertyValue("--prefix") || "bs-";
    if (prefix) {
      prefix = prefix.trim();
    }
    const color1 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}primary`
    );
    const color2 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}info`
    );
    const color3 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}primary-tint-20`
    );
    const color4 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}warning`
    );
    return {
      primary: color1.trim(),
      info: color2.trim(),
      warning: color4.trim(),
      primary_light: color3.trim(),
    };
  };
  const variableColors = getVariableColor();

  const colors = [variableColors.primary, variableColors.info];
  useEffect(() => {
    return () => colors;
  });

  useEffect(() => {
    AOS.init({
      startEvent: "DOMContentLoaded",
      disable: function () {
        var maxWidth = 996;
        return window.innerWidth < maxWidth;
      },
      throttleDelay: 10,
      once: true,
      duration: 700,
      offset: 10,
    });
  });
  const chart1 = {
    options: {
      chart: {
        fontFamily:
          '"Inter", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      colors: colors,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      yaxis: {
        show: true,
        labels: {
          show: true,
          minWidth: 19,
          maxWidth: 19,
          style: {
            colors: "#8A92A6",
          },
          offsetX: -5,
        },
      },
      legend: {
        show: false,
      },
      xaxis: {
        labels: {
          minHeight: 22,
          maxHeight: 22,
          show: true,
          style: {
            colors: "#8A92A6",
          },
        },
        lines: {
          show: false, //or just here to disable only x axis grids
        },
        categories: ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug"],
      },
      grid: {
        show: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0,
          gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
          inverseColors: true,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 50, 80],
          colors: colors,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    series: [
      {
        name: "최대 진동값",
        data: [94, 80, 94, 80, 94, 80, 94],
      },
      {
        name: "평균 진동값",
        data: [72, 60, 84, 60, 74, 60, 78],
      },
    ],
  };
  // chart2 정의
  const series = [251, 176, 105];
  const labels = ["Ball", "IR", "OR"];
  const total = series.reduce((sum, val) => sum + val, 0);

  // Define the colors for chart2 directly
  const chart2Colors = ['#3a57e8', '#4bc7d2', '#00e396']; // These are the colors from chart2.options.colors

  const chart2 = {
    options: {
      labels: labels,
      colors: chart2Colors,
      chart: {
        type: 'donut',
        fontFamily: `'Inter', sans-serif`,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%', // 도넛 크기 조절
            labels: {
              show: true,
              value: {
                show: true,
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: `'Inter', sans-serif`,
              },
            },
          },
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 'normal',
          fontFamily: `'Inter', sans-serif`,
        },
      },
    },
    series: series,
  };

  const chartLegendData = series.map((value, idx) => ({
    label: labels[idx],
    count: value,
    percent: ((value / total) * 100).toFixed(1),
    color: chart2Colors[idx] // Use chart2Colors for the legend as well
  }));




  const chart3 = {
    options: {
      chart: {
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: colors,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "28%",
          endingShape: "rounded",
          borderRadius: 5,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["S", "M", "T", "W", "T", "F", "S", "M", "T", "W"],
        labels: {
          minHeight: 20,
          maxHeight: 20,
          style: {
            colors: "#8A92A6",
          },
        },
      },
      yaxis: {
        title: {
          text: "",
        },
        labels: {
          minWidth: 19,
          maxWidth: 19,
          style: {
            colors: "#8A92A6",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands";
          },
        },
      },
    },
    series: [
      {
        name: "Successful deals",
        data: [30, 50, 35, 60, 40, 60, 60, 30, 50, 35],
      },
      {
        name: "Failed deals",
        data: [40, 50, 55, 50, 30, 80, 30, 40, 50, 55],
      },
    ],
  };


  return (
    <Fragment>
      <Row>
        <Col md="12" lg="12">
          <Row className="row-cols-1">
            <div className="overflow-hidden d-slider1 " data-aos="fade-up" data-aos-delay="800">
              <Swiper
                className="p-0 m-0 mb-2 list-inline "
                slidesPerView={5}
                spaceBetween={32}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                breakpoints={{
                  320: { slidesPerView: 1 },
                  550: { slidesPerView: 2 },
                  991: { slidesPerView: 3 },
                  1400: { slidesPerView: 3 },
                  1500: { slidesPerView: 4 },
                  1920: { slidesPerView: 4 },
                  2040: { slidesPerView: 7 },
                  2440: { slidesPerView: 8 }
                }}

              >
                <SwiperSlide className="card card-slide" >
                  <div className="card-body">
                    <div className="progress-widget">
                      <div className="progress-detail">
                        <p className="mb-2">총 기록 건수</p>
                        <h4 className="counter">
                          <CountUp start={120} end={560} duration={3} />건
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={variableColors.info}
                        width="60px"
                        height="60px"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        Linecap="rounded"
                        style={{ width: 60, height: 60 }}
                        value={60}
                        id="circle-progress-02"
                      >
                        <svg
                          className=""
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M19,6.41L17.59,5L7,15.59V9H5V19H15V17H8.41L19,6.41Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">정상 건수</p>
                        <h4 className="counter">
                          $<CountUp start={20} end={158} duration={3} />K
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={variableColors.primary}
                        width="60px"
                        height="60px"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        Linecap="rounded"
                        style={{ width: 60, height: 60 }}
                        value={70}
                        id="circle-progress-03"
                      >
                        <svg className="" width="24" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M19,6.41L17.59,5L7,15.59V9H5V19H15V17H8.41L19,6.41Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">불량 건수</p>
                        <h4 className="counter">
                          $<CountUp start={120} end={378} duration={3} />K
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={variableColors.info}
                        width="60px"
                        height="60px"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        Linecap="rounded"
                        style={{ width: 60, height: 60 }}
                        value={60}
                        id="circle-progress-04"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">Ball_007_1</p>
                        <h4 className="counter">
                          $<CountUp start={212} end={742} duration={3} />K
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={variableColors.primary}
                        width="60px"
                        height="60px"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        Linecap="rounded"
                        style={{ width: 60, height: 60 }}
                        value={50}
                        id="circle-progress-05"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">Ball_014_1</p>
                        <h4 className="counter">
                          $<CountUp start={35} end={150} duration={3} />K
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={variableColors.info}
                        width="60px"
                        height="60px"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        Linecap="rounded"
                        value={40}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-06"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">Ball_021_1</p>
                        <h4 className="counter">
                          $<CountUp start={652} end={4600} duration={3} />
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">IR_007_1</p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">IR_014_1 </p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">IR_021_1 </p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">OR_007_6_1</p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">OR_014_6_1</p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className=" card card-slide">
                  <div className="card-body">
                    <div className="progress-widget">
                      <Circularprogressbar
                        stroke={colors}
                        Linecap="rounded"
                        trailstroke="#ddd"
                        strokewidth="4px"
                        width="60px"
                        height="60px"
                        value={30}
                        style={{ width: 60, height: 60 }}
                        id="circle-progress-07"
                      >
                        <svg
                          className=""
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"
                          />
                        </svg>
                      </Circularprogressbar>
                      <div className="progress-detail">
                        <p className="mb-2">OR_021_6_1</p>
                        <h4 className="counter">
                          <CountUp
                            start={2}
                            end={11.2}
                            duration={3}
                            decimals={1}
                          />
                          M
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <div className="swiper-button swiper-button-next"></div>
                <div className="swiper-button swiper-button-prev"></div>
              </Swiper>
            </div>
          </Row>
        </Col>
        <Col md="12" lg="8">
          <Row>
            <Col md="12">
              <div className="card" data-aos="fade-up" data-aos-delay="500">
                {/* 폼 영역 추가 시작 */}
                <div className="card-header">
                  <div className="bd-example mb-4">
                    <div className="header-title mt-3 mb-3">
                      <h4 className="card-title">실시간 진동 분석</h4>
                    </div>
                    <form>
                      <label
                        className="form-label mb-0 me-2 mb-3"
                        htmlFor="customFile"
                        style={{ minWidth: 80 }}
                      >
                        분석할 파일을 업로드 해주세요.
                      </label>
                      <div className="mb-3 d-flex align-items-center">
                        <div style={{ flex: 1 }}>
                          <input
                            type="file"
                            className="form-control"
                            id="customFile"
                            style={{ width: "100%" }}
                            // onChange={handleFileChange} // 파일 변경 핸들러 연결 --- 주석처리 메모
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary ms-2"
                          // onClick={handlePredict} // 예측 로직 연결 --- 주석처리 메모
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                    <div className="mt-3 mb-4">
                      <div class="spinner-border text-light mt-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-2 mt-3">현재 분석 중입니다.</span>
                    </div>
                    {/* Alert 예제 시작 */}
                    <div className="bd-example mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
                        <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </symbol>
                        <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                        </symbol>
                        <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                        </symbol>
                      </svg>
                      <div className="alert alert-success d-flex align-items-center" role="alert">
                        <svg className="bi flex-shrink-0 me-2" width="24" height="85">
                          <use xlinkHref="#check-circle-fill" />
                        </svg>
                        <div>
                          정상입니다.
                        </div>
                      </div>
                      <div className="alert alert-warning d-flex align-items-center" role="alert">
                        <svg className="bi flex-shrink-0 me-2" width="24" height="85">
                          <use xlinkHref="#exclamation-triangle-fill" />
                        </svg>
                        <div>
                          업로드 파일을 확인해주세요.
                        </div>
                      </div>
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <svg className="bi flex-shrink-0 me-2" width="24" height="85">
                          <use xlinkHref="#exclamation-triangle-fill" />
                        </svg>
                        <div>
                          불량입니다.<br />(Ball_007-01)
                        </div>
                      </div>
                    </div>
                    {/* Alert 예제 끝 */}
                  </div>
                </div>
              </div>
              <div className="card" data-aos="fade-up" data-aos-delay="800" style={{ height: "400px" }}>
                <div className="flex-wrap card-header d-flex justify-content-between">
                  <div className="header-title">
                    <h4 className="card-title">75.5Hz</h4>
                    <p className="mb-0">진동값 평균</p>
                  </div>
                  <div className="d-flex align-items-center align-self-center">
                    <div className="d-flex align-items-center text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <g>
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="currentColor"
                          ></circle>
                        </g>
                      </svg>
                      <div className="ms-2">
                        <span className="text-gray">최대 진동값</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center ms-3 text-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <g>
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="currentColor"
                          ></circle>
                        </g>
                      </svg>
                      <div className="ms-2">
                        <span className="text-gray">평균 진동값</span>
                      </div>
                    </div>
                  </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      as={Button}
                      variant="text-gray"
                      type="button"
                      id="dropdownMenuButtonSM"
                    >
                      기간 설정
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="#">이번 주</Dropdown.Item>
                      <Dropdown.Item href="#">이번 달</Dropdown.Item>
                      <Dropdown.Item href="#">올해</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="card-body">
                  <Chart
                    options={chart1.options}
                    series={chart1.series}
                    type="area"
                    height="240"
                  />
                </div>
              </div>
            </Col>
            <Col md="12" xl="6">

            </Col>


            <Col md="12" xl="6">

            </Col>
            <Col md="12" lg="12">
              <div
                className="overflow-hidden card"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <div className="flex-wrap card-header d-flex justify-content-between">
                  <div className="header-title">
                    <h4 className="mb-2 card-title">불량 기록 건</h4>
                    <p className="mb-0">
                      <svg
                        className="me-2"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#3a57e8"
                          d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                        />
                      </svg>
                      15 new acquired this month
                    </p>
                  </div>
                </div>
                <div className="p-0 card-body">
                  <div className="mt-4 table-responsive">
                    <table
                      id="basic-table"
                      className="table mb-0 table-striped"
                      role="grid"
                    >
                      <thead>
                        <tr>
                          <th>일시</th>
                          <th>불량 여부</th>
                          <th>불량 유형</th>
                          <th>진동 값</th>
                        </tr>
                      </thead>
                      {/* ✅ 기존 <tbody> 자리에 삽입 */}
                      <tbody>
                        <RecentPredictionsCard data={recentHistory} />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col md="12" lg="4">
          <Row>
            <Col md="12" lg="12">
              <div
                className="card credit-card-widget"
                data-aos="fade-up"
                data-aos-delay="700"
              >
                <div className="pb-4 border-0 card-header">
                  <div className="p-3 border border-white rounded primary-gradient-card">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="font-weight-bold">OOO사</h5>
                        <p className="mb-0">A공장</p>
                      </div>
                      <div className="master-card-content">
                        <svg
                          className="master-card-1"
                          width="60"
                          height="60"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#ffffff"
                            d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                          />
                        </svg>
                        <svg
                          className="master-card-2"
                          width="60"
                          height="60"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#ffffff"
                            d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="my-4">
                    </div>
                    <div className="mb-2 d-flex align-items-center justify-content-between">
                      <p className="mb-0">현재 온도</p>
                      <p className="mb-0">현재 습도</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6>20℃</h6>
                      <h6 className="ms-5">50%</h6>
                    </div>
                  </div>
                </div>
                <div className="card-body">

                  <div className="d-flex justify-content-around">
                    <div>
                      <h4>
                        <small>센서 연결</small>
                      </h4>
                      <div className="d-flex align-items-center ms-3 text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <g>
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="#e50000"
                            ></circle>
                          </g>
                        </svg>
                        <div className="ms-2">
                          <span className="text-gray">정상</span>
                        </div>
                      </div>
                    </div>
                    <hr className="hr-vertial" />
                    <div>
                      <h4>
                        <small>분석 상태</small>
                      </h4>
                      <div className="d-flex align-items-center ms-3 text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <g>
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="green"
                            ></circle>
                          </g>
                        </svg>
                        <div className="ms-2">
                          <span className="text-gray">정상</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-wrap d-flex align-itmes-center mt-3">
                    <div className="d-flex mt-2 align-itmes-center">
                      <div>
                        <div className="p-3 rounded bg-soft-info">
                          <svg
                            width="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">                                 <path opacity="0.4" d="M16.6756 2H7.33333C3.92889 2 2 3.92889 2 7.33333V16.6667C2 20.0711 3.92889 22 7.33333 22H16.6756C20.08 22 22 20.0711 22 16.6667V7.33333C22 3.92889 20.08 2 16.6756 2Z" fill="currentColor"></path>                                 <path d="M7.36866 9.3689C6.91533 9.3689 6.54199 9.74223 6.54199 10.2045V17.0756C6.54199 17.5289 6.91533 17.9022 7.36866 17.9022C7.83088 17.9022 8.20421 17.5289 8.20421 17.0756V10.2045C8.20421 9.74223 7.83088 9.3689 7.36866 9.3689Z" fill="currentColor"></path>                                 <path d="M12.0352 6.08887C11.5818 6.08887 11.2085 6.4622 11.2085 6.92442V17.0755C11.2085 17.5289 11.5818 17.9022 12.0352 17.9022C12.4974 17.9022 12.8707 17.5289 12.8707 17.0755V6.92442C12.8707 6.4622 12.4974 6.08887 12.0352 6.08887Z" fill="currentColor"></path>                                 <path d="M16.6398 12.9956C16.1775 12.9956 15.8042 13.3689 15.8042 13.8312V17.0756C15.8042 17.5289 16.1775 17.9023 16.6309 17.9023C17.0931 17.9023 17.4664 17.5289 17.4664 17.0756V13.8312C17.4664 13.3689 17.0931 12.9956 16.6398 12.9956Z" fill="currentColor"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="ms-3">
                        <h5>보고서 다운로드</h5>
                        <small className="mb-0">2025-06-20 기준</small>
                      </div>
                    </div>
                  </div>

                  {/* <div className="grid-cols-2 d-grid gap"> */}
                  {/* <button className="btn btn-primary text-uppercase">
                      <svg
                            width="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">                                <path opacity="0.4" d="M16.6756 2H7.33333C3.92889 2 2 3.92889 2 7.33333V16.6667C2 20.0711 3.92889 22 7.33333 22H16.6756C20.08 22 22 20.0711 22 16.6667V7.33333C22 3.92889 20.08 2 16.6756 2Z" fill="currentColor"></path>                                <path d="M7.36866 9.3689C6.91533 9.3689 6.54199 9.74223 6.54199 10.2045V17.0756C6.54199 17.5289 6.91533 17.9022 7.36866 17.9022C7.83088 17.9022 8.20421 17.5289 8.20421 17.0756V10.2045C8.20421 9.74223 7.83088 9.3689 7.36866 9.3689Z" fill="currentColor"></path>                                <path d="M12.0352 6.08887C11.5818 6.08887 11.2085 6.4622 11.2085 6.92442V17.0755C11.2085 17.5289 11.5818 17.9022 12.0352 17.9022C12.4974 17.9022 12.8707 17.5289 12.8707 17.0755V6.92442C12.8707 6.4622 12.4974 6.08887 12.0352 6.08887Z" fill="currentColor"></path>                                <path d="M16.6398 12.9956C16.1775 12.9956 15.8042 13.3689 15.8042 13.8312V17.0756C15.8042 17.5289 16.1775 17.9023 16.6309 17.9023C17.0931 17.9023 17.4664 17.5289 17.4664 17.0756V13.8312C17.4664 13.3689 17.0931 12.9956 16.6398 12.9956Z" fill="currentColor"></path>
                      </svg>
                      보고서 다운로드
                    </button> */}
                  {/* <button className="btn btn-info text-uppercase">
                      ANALYTICS
                    </button> */}
                  {/* </div> */}
                </div>
              </div>

              <div className="card" data-aos="fade-up" data-aos-delay="800" style={{ height: "400px" }}>
                <div className="flex-wrap card-header d-flex justify-content-between">
                  <div className="header-title mb-2">
                    <h4 className="card-title">Conversions</h4>
                    <p className="mb-0">진동값 평균</p>
                  </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      as={Button}
                      variant="text-gray"
                      type="button"
                      id="dropdownMenuButtonSM"
                    >
                      기간 설정
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="#">이번 주</Dropdown.Item>
                      <Dropdown.Item href="#">이번 달</Dropdown.Item>
                      <Dropdown.Item href="#">올해</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="card-body">
                  <Chart
                    className="d-activity"
                    options={chart3.options}
                    series={chart3.series}
                    type="bar"
                    height="240"
                    margin="10 0 0 0"
                  />
                </div>
              </div>
              <div className="card" data-aos="fade-up" data-aos-delay="900">
                <div className="flex-wrap card-header d-flex justify-content-between">
                  <div className="header-title mt-2">
                    <h4 className="card-title">불량 유형</h4>
                  </div>
                  <Dropdown>
                    <Dropdown.Toggle
                      as={Button}
                      variant="text-gray"
                      type="button"
                      id="dropdownMenuButtonSM"
                    >
                      기간 설정
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="#">이번 주</Dropdown.Item>
                      <Dropdown.Item href="#">이번 달</Dropdown.Item>
                      <Dropdown.Item href="#">올 해</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="card-body">
                  <div className="flex-wrap d-flex align-items-center justify-content-between">
                    <Chart
                      className="col-md-8 col-lg-8"
                      options={chart2.options}
                      series={chart2.series}
                      type="donut"
                      height="250"
                    />
                    <div className="d-grid gap col-md-4 col-lg-4">
                      {chartLegendData.map((item, index) => (
                        <div className="d-flex align-items-start" key={index}>
                          <svg
                            className="mt-2"
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            viewBox="0 0 24 24"
                            fill={item.color}
                          >
                            <circle cx="12" cy="12" r="8" fill={item.color}></circle>
                          </svg>
                          <div className="ms-3">
                            <span className="text-gray">{item.label}</span>
                            <h6>
                              {item.count}건 <span className="text-muted">({item.percent}%)</span>
                            </h6>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </Col>
          </Row>
          <Row>
            <Col>

            </Col>
          </Row>
        </Col>
      </Row>
      <section id="fault-diagnosis">
        <div className="iq-side-content sticky-xl-top">
          <Card className="">
            <Card.Body className="">
              <h4 className="fw-bold">고장 진단</h4>
            </Card.Body>
          </Card>
        </div>

        <WavPredictionCard /> {/* WavPredictionCard 컴포넌트 렌더링 */}
        <CsvPredictionCard />  {/* ✅ 여기에 정확히 들어감 */}
      </section>

      {/* ✅ RecentPredictionsCard는 위에서 테이블에 적용했으므로 이 부분은 제거합니다. */}
      {/* <section id="prediction-history">
        <RecentPredictionsCard />
      </section> */}

    </Fragment>
  );
})

export default Index
