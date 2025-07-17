"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const animationRef = useRef<number>()

  // 스펙트로그램 데이터 생성 (시뮬레이션)
  const generateSpectrogramData = () => {
    const timeSteps = 200
    const freqBins = 100
    const data: number[][] = []

    for (let t = 0; t < timeSteps; t++) {
      const timeSlice: number[] = []
      for (let f = 0; f < freqBins; f++) {
        // 다양한 주파수 패턴 시뮬레이션
        let intensity = 0

        // 기본 배경 노이즈
        intensity += Math.random() * 0.1

        // 저주파 성분 (베이스)
        if (f < 20) {
          intensity += 0.3 + 0.2 * Math.sin(t * 0.1) * Math.exp(-f * 0.1)
        }

        // 중간 주파수 멜로디
        if (f > 30 && f < 60) {
          intensity += 0.4 * Math.sin(t * 0.05 + f * 0.1) * Math.exp(-Math.abs(f - 45) * 0.05)
        }

        // 고주파 하모닉스
        if (f > 70) {
          intensity += 0.2 * Math.sin(t * 0.03) * Math.exp(-(f - 70) * 0.02)
        }

        // 시간에 따른 변화
        intensity *= 1 + 0.3 * Math.sin(t * 0.02)

        timeSlice.push(Math.max(0, Math.min(1, intensity)))
      }
      data.push(timeSlice)
    }

    return data
  }

  const drawSpectrogram = (ctx: CanvasRenderingContext2D, data: number[][], currentTime: number) => {
    const canvas = ctx.canvas
    const width = canvas.width
    const height = canvas.height

    // 배경 클리어
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    const timeSteps = data.length
    const freqBins = data[0].length
    const cellWidth = width / timeSteps
    const cellHeight = height / freqBins

    // 스펙트로그램 그리기
    for (let t = 0; t < timeSteps; t++) {
      for (let f = 0; f < freqBins; f++) {
        const intensity = data[t][f]

        // 색상 매핑 (강도에 따라 파란색 -> 초록색 -> 노란색 -> 빨간색)
        let r, g, b
        if (intensity < 0.25) {
          // 파란색 -> 청록색
          const t = intensity / 0.25
          r = 0
          g = Math.floor(t * 255)
          b = 255
        } else if (intensity < 0.5) {
          // 청록색 -> 초록색
          const t = (intensity - 0.25) / 0.25
          r = 0
          g = 255
          b = Math.floor((1 - t) * 255)
        } else if (intensity < 0.75) {
          // 초록색 -> 노란색
          const t = (intensity - 0.5) / 0.25
          r = Math.floor(t * 255)
          g = 255
          b = 0
        } else {
          // 노란색 -> 빨간색
          const t = (intensity - 0.75) / 0.25
          r = 255
          g = Math.floor((1 - t) * 255)
          b = 0
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(
          t * cellWidth,
          height - (f + 1) * cellHeight, // Y축 뒤집기 (낮은 주파수가 아래)
          cellWidth,
          cellHeight,
        )
      }
    }

    // 현재 시간 표시선
    if (isPlaying) {
      const timePosition = (currentTime / 100) * width
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(timePosition, 0)
      ctx.lineTo(timePosition, height)
      ctx.stroke()
    }

    // 축 레이블 그리기
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px Arial"

    // Y축 레이블 (주파수)
    for (let i = 0; i <= 5; i++) {
      const freq = (i * 4000) / 5 // 0 ~ 4000 Hz
      const y = height - (i * height) / 5
      ctx.fillText(`${freq}Hz`, 5, y - 5)
    }

    // X축 레이블 (시간)
    for (let i = 0; i <= 5; i++) {
      const time = (i * 10) / 5 // 0 ~ 10 초
      const x = (i * width) / 5
      ctx.fillText(`${time}s`, x, height - 5)
    }
  }

  const animate = () => {
    if (isPlaying) {
      setCurrentTime((prev) => (prev + 0.5) % 100)
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Canvas 크기 설정
    canvas.width = 800
    canvas.height = 400

    const data = generateSpectrogramData()
    drawSpectrogram(ctx, data, currentTime)
  }, [currentTime, isPlaying])

  useEffect(() => {
    if (isPlaying) {
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>주파수-시간 히트맵 (Spectrogram)</CardTitle>
          <CardDescription>
          
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={handlePlayPause} variant="outline" size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "일시정지" : "재생"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
              리셋
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-black">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ maxWidth: "100%", height: "auto" }} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">색상 범례</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500"></div>
                  <span>낮은 강도</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500"></div>
                  <span>중간 강도</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500"></div>
                  <span>높은 강도</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span>매우 높은 강도</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">축 정보</h4>
              <div className="space-y-1">
                <div>
                  <strong>X축:</strong> 시간 (0-10초)
                </div>
                <div>
                  <strong>Y축:</strong> 주파수 (0-4000Hz)
                </div>
                <div>
                  <strong>색상:</strong> 신호 강도 (dB)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
