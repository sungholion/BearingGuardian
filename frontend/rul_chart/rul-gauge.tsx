"use client"

import { useEffect, useState } from "react"

interface RULGaugeProps {
  value: number
  maxValue: number
  unit: string
  confidence: number
}

export function RULGauge({ value, maxValue, unit, confidence }: RULGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const percentage = (animatedValue / maxValue) * 100;
  const angle = (percentage / 100) * 180;

  const getColor = (percentage: number) => {
    if (percentage > 60) return "#10B981"; // 초록색
    if (percentage > 30) return "#F59E0B"; // 노란색
    return "#EF4444"; // 빨간색
  };

  const color = getColor(percentage);

  return (
    <div className="relative w-48 h-24">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* 배경 호 */}
        <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="#E5E7EB" strokeWidth="8" />

        {/* 진행 호 */}
        <path
          d="M 20 80 A 80 80 0 0 1 180 80"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1s ease-in-out, opacity 0.5s ease-in-out",
            opacity: isVisible ? 1 : 0,
          }}
        />

        {/* 중앙 텍스트 */}
        <text x="100" y="65" textAnchor="middle" className="text-2xl font-bold fill-current">
          {animatedValue.toFixed(1)}
        </text>
        <text x="100" y="80" textAnchor="middle" className="text-sm fill-gray-500">
          {unit}
        </text>
      </svg>

     
    </div>
  );
}
