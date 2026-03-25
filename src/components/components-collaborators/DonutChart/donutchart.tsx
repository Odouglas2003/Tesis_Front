// DonutChart.tsx
import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataItem[];
  totalHoras: number; // Asegúrate de recibir esta propiedad
}
interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent?: number;
  index?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, totalHoras }) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
  }: CustomizedLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-bold"
      >
        {/* Eliminé el porcentaje del gráfico */}
      </text>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <PieChart width={300} height={180}>
        <Pie
          data={data}
          cx={150}
          cy={90}
          innerRadius={40}
          outerRadius={60}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
      </PieChart>
      <div className="flex flex-wrap justify-center gap-2 pt-[10px]">
        {data.map((item, index) => {
          // Calculo del porcentaje
          const porcentaje = ((item.value / totalHoras) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">
                {item.name} - {porcentaje}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
