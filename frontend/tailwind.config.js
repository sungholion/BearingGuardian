module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}', // src 폴더 하위 모든 파일!
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        kor: ['"Noto Sans KR"', 'sans-serif'],
      },
      // 여기서 색상, 여백 등 커스텀도 추가 가능
    },
  },
  plugins: [],
};
