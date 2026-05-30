/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 차분한 행정 도구 톤 — 남색/파랑 기조 (5-A.7)
        brand: {
          50: "#f3f7fc",
          100: "#e3edf8",
          200: "#c9d9ef",
          300: "#a0bce2",
          400: "#6f97d1",
          500: "#4a76bf",
          600: "#2f6bbf",
          700: "#2a548f",
          800: "#284975",
          900: "#263f61",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
