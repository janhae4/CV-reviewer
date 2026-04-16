"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  data: Array<{ skill: string; cv: number; jd: number }>;
}

export default function SkillsChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[320px] bg-background p-6 pt-0 relative overflow-hidden group">      
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: 'var(--neutral)', fontSize: 9, fontWeight: 800 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 10]} 
                tick={false} 
                axisLine={false} 
              />
              <Radar
                name="CV SCORE"
                dataKey="cv"
                stroke="var(--accent)"
                fill="var(--accent)"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar
                name="JD TARGET"
                dataKey="jd"
                stroke="rgba(142, 142, 147, 0.5)"
                fill="var(--neutral)"
                fillOpacity={0.15}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0px',
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
                itemStyle={{ padding: '0px' }}
                cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontSize: '8px', 
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
