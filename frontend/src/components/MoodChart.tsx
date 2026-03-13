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
  Line,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

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

const moodLabels: Record<number, { en: string; hi: string; kn: string }> = {
  1: { en: 'Very Low', hi: 'बहुत कम', kn: 'ತುಂಬಾ ಕಡಿಮೆ' },
  2: { en: 'Low', hi: 'कम', kn: 'ಕಡಿಮೆ' },
  3: { en: 'Below Average', hi: 'औसत से नीचे', kn: 'ಸರಾಸರಿಗಿಂತ ಕಡಿಮೆ' },
  4: { en: 'Average', hi: 'औसत', kn: 'ಸರಾಸರಿ' },
  5: { en: 'Good', hi: 'अच्छा', kn: 'ಒಳ್ಳೆಯದು' },
  6: { en: 'Very Good', hi: 'बहुत अच्छा', kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು' },
  7: { en: 'Excellent', hi: 'उत्कृष्ट', kn: 'ಅತ್ಯುತ್ತಮ' },
  8: { en: 'Outstanding', hi: 'शानदार', kn: 'ಅದ್ಭುತ' },
  9: { en: 'Exceptional', hi: 'असाधारण', kn: 'ಅಸಾಧಾರಣ' },
  10: { en: 'Perfect', hi: 'परफेक्ट', kn: 'ಪರಿಪೂರ್ಣ' }
};

export function MoodChart({ 
  data, 
  type = 'area', 
  height = 250, 
  className 
}: MoodChartProps) {
  const { language } = useLanguage();
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const responsiveHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : height;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      const moodLabel = moodLabels[moodValue]?.[language as 'en' | 'hi' | 'kn'] || moodLabels[moodValue]?.en || 'Unknown';
      
      return (
        <div className="bg-card border border-border rounded-2xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'hi' ? 'मूड' : language === 'kn' ? 'ಮನಸ್ಥಿತಿ' : 'Mood'}: <span className="font-bold text-primary">{moodValue}/10</span>
          </p>
          <p className="text-xs text-primary font-medium mt-1">{moodLabel}</p>
        </div>
      );
    }
    return null;
  };

  const legendLabel = language === 'hi' ? 'मूड स्कोर' : language === 'kn' ? 'ಮನಸ್ಥಿತಿ ಅಂಕ' : 'Mood Score';

  return (
    <div className={cn("w-full", className)} style={{ height: responsiveHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent 
          data={data} 
          margin={{ 
            top: 10, 
            right: 10, 
            left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -20, 
            bottom: 5 
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
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            axisLine={false} 
            tickLine={false} 
            tick={{
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
            }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
            formatter={() => legendLabel}
            wrapperStyle={{
              fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? '11px' : '13px',
              fontWeight: 600,
              color: 'hsl(var(--foreground))'
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
              name={legendLabel}
            />
          ) : (
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              name={legendLabel}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}