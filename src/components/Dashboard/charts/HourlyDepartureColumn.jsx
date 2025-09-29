import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const HourlyDepartureColumn = ({ data }) => {
  // data: [{ hour: 0..23, count: number }]
  const formatted = (data || []).map(d => ({
    hour: String(d.hour).padStart(2, '0'),
    count: d.count || 0
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
          <Tooltip 
            formatter={(v) => [`${v}건`, "출발"]} 
            labelFormatter={(l) => `${l}시`}
            contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '8px' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyDepartureColumn;
