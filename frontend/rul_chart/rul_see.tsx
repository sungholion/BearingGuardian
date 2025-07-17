        {/* RUL 예측 (개선된 버전) */}
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle className="text-lg">예측 수명 분석</CardTitle>
            <div className="text-sm text-gray-500">잔존의 예측 수명을 분석합니다</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <RULGauge value={75} maxValue={100} unit="일" confidence={87} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-500">예상 잔존수명</div>
                  <div className="text-lg font-bold">75일</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">정상 운영 구간</span>
                  </div>
                  <div className="text-xs text-gray-600">60일 이상 - 정상 운영 가능</div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">주의 구간</span>
                  </div>
                  <div className="text-xs text-gray-600">30-60일 - 점검 주기 단축 권장</div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium">교체 권장</span>
                  </div>
                  <div className="text-xs text-gray-600">30일 미만 - 즉시 교체 검토</div>
                </div>
              </div>
            </div>

            {/* 30일 트렌드 */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm font-medium mb-3">최근 30일 RUL 변화 추이</div>
              <div className="h-20 bg-gray-50 rounded flex items-end justify-between px-2">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 w-1 rounded-t"
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>