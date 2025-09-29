import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const WeeklyDispatchBar = ({ data }) => {
  // data: [{ date: 'YYYY-MM-DD', count: number }]
  const formatted = (data || []).map(d => ({
    date: d.date?.slice(5), // MM-DD
    count: d.count || 0
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
          <Tooltip 
            formatter={(v) => [`${v}건`, "배차 수"]} 
            labelFormatter={(l) => `날짜 ${l}`}
            contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '8px' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyDispatchBar;
