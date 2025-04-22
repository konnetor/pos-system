
import React from 'react';
import { 
  Bar, Line, Pie, 
  BarChart as RechartsBarChart, 
  LineChart as RechartsLineChart, 
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// BarChart component
export function BarChart({ 
  data, 
  index, 
  categories, 
  colors = ['#D60C0C'], 
  yAxisWidth = 40,
  height = 300,
  stack = false
}: {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  yAxisWidth?: number;
  height?: number;
  stack?: boolean;
}) {
  const config = categories.reduce((acc, category, i) => {
    acc[category] = { 
      color: colors[i % colors.length] 
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer config={config} className="w-full h-full" style={{ height }}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={index} tick={{ fontSize: 12 }} />
        <YAxis width={yAxisWidth} tick={{ fontSize: 12 }} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {categories.map((category, i) => (
          <Bar 
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            stackId={stack ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

// LineChart component
export function LineChart({ 
  data, 
  index, 
  categories, 
  colors = ['#D60C0C'], 
  yAxisWidth = 40,
  height = 300
}: {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  yAxisWidth?: number;
  height?: number;
}) {
  const config = categories.reduce((acc, category, i) => {
    acc[category] = { 
      color: colors[i % colors.length] 
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer config={config} className="w-full h-full" style={{ height }}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={index} tick={{ fontSize: 12 }} />
        <YAxis width={yAxisWidth} tick={{ fontSize: 12 }} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

// PieChart component
export function PieChart({ 
  data, 
  index, 
  category, 
  colors = ['#D60C0C', '#2563EB'], 
  height = 300,
  valueFormatter = (value: number) => `${value}`
}: {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  height?: number;
  valueFormatter?: (value: number) => string;
}) {
  const config = data.reduce((acc, entry, i) => {
    acc[entry[index]] = { 
      color: colors[i % colors.length] 
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-muted-foreground">{valueFormatter(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer config={config} className="w-full h-full" style={{ height }}>
      <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
}
