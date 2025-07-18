import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export default function RemainingLifeTrendChart() {
  // 정적인 누적 잔여 수명 데이터 (예시)
  const data = [
    { date: '2025-07-01', '잔여 사이클 수': 95.0 },
    { date: '2025-07-02', '잔여 사이클 수': 94.9 },
    { date: '2025-07-03', '잔여 사이클 수': 94.9 },
    { date: '2025-07-04', '잔여 사이클 수': 94.8 },
    { date: '2025-07-05', '잔여 사이클 수': 94.8 },
    { date: '2025-07-06', '잔여 사이클 수': 90.0 }, // OR 발생으로 급감
    { date: '2025-07-07', '잔여 사이클 수': 89.9 },
    { date: '2025-07-08', '잔여 사이클 수': 89.8 },
    { date: '2025-07-09', '잔여 사이클 수': 89.7 },
    { date: '2025-07-10', '잔여 사이클 수': 89.6 },
    { date: '2025-07-11', '잔여 사이클 수': 89.5 },
    { date: '2025-07-12', '잔여 사이클 수': 89.4 },
    { date: '2025-07-13', '잔여 사이클 수': 89.3 },
    { date: '2025-07-14', '잔여 사이클 수': 89.2 },
    { date: '2025-07-15', '잔여 사이클 수': 89.1 },
    { date: '2025-07-16', '잔여 사이클 수': 89.0 },
    { date: '2025-07-17', '잔여 사이클 수': 72.2 }, // IR 발생으로 급감
    { date: '2025-07-18', '잔여 사이클 수': 71.4 },
  ];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 'bold',
          color: '#222',
          letterSpacing: -1,
        }}>
          누적 잔여 사이클 수 추이
        </span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 10, right: 30, left: 0, bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
          <Tooltip />
          <Area type="monotone" dataKey="잔여 사이클 수" stroke="#8884d8" fill="#8884d8" />
          <ReferenceDot x="2025-07-06" y={data.find(d => d.date === '2025-07-06')['잔여 사이클 수']} r={5} fill="red" stroke="none" label={{ value: 'OR 발생', position: 'top', fill: 'red' }} />
          <ReferenceDot x="2025-07-17" y={data.find(d => d.date === '2025-07-17')['잔여 사이클 수']} r={5} fill="blue" stroke="none" label={{ value: 'IR 발생', position: 'top', fill: 'blue' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}