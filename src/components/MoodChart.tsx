'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';

interface MoodData {
  name: string;
  mood: number;
  date?: string;
}

interface MoodChartProps {
  data: MoodData[];
  type?: 'area' | 'line';
  height?: number;
  className?: string;
}

export function MoodChart({ 
  data, 
  type = 'area', 
  height = 250, 
  className 
}: MoodChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  
  // Responsive height based on screen size
  const responsiveHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : height;

  return (
    <div className={cn("w-full", className)} style={{ height: responsiveHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent 
          data={data} 
          margin={{ 
            top: 10, 
            right: 10, 
            left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -20, 
            bottom: 0 
          }}
        >
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--border))" 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
            }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
            }} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              background: 'hsl(var(--card))', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }} 
            itemStyle={{ 
              color: 'hsl(var(--foreground))', 
              fontWeight: 'bold' 
            }}
          />
          {type === 'area' ? (
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorMood)" 
            />
          ) : (
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}