import React, { useState } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { useApp } from '../context/AppContext';
import { calculateAccruedSalary } from '../utils/calculations';

interface LineChartProps {
  records: AttendanceRecord[];
  employees: Employee[];
  daysCount?: number;
}

export const ProductivityLineChart: React.FC<LineChartProps> = ({ records, employees, daysCount = 7 }) => {
  const { lang } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate last N days data
  const data = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    const dayRecords = records.filter(r => r.date === dateStr);
    const presentCount = dayRecords.filter(r => r.status === 'present').length;
    const ratedRecords = dayRecords.filter(r => r.adminRating && r.adminRating > 0);
    const avgRating = ratedRecords.length > 0
      ? ratedRecords.reduce((acc, curr) => acc + (curr.adminRating || 0), 0) / ratedRecords.length
      : 4.6;

    const dayName = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { weekday: 'short' }).format(d);
    const dayShortDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { day: 'numeric', month: 'numeric' }).format(d);

    return {
      date: dateStr,
      label: `${dayName} (${dayShortDate})`,
      presentRate: employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 100,
      avgScore: Math.round(avgRating * 20), // convert 5-star to 100%
      realRating: avgRating.toFixed(1)
    };
  });

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.avgScore / 100) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Create SVG path
  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E06D28] shadow-sm shadow-[#E06D28]/50"></span>
            <span className="text-[#FFFFFF] font-medium">{lang === 'ar' ? 'متوسط جودة التقييم (من 5)' : 'Quality Rating'}</span>
          </span>
        </div>
        <span className="text-[11px] text-[#6B7280]">{lang === 'ar' ? 'آخر 7 أيام عمل' : 'Last 7 Days'}</span>
      </div>

      <div className="relative w-full h-44 overflow-visible">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="curveGradientOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E06D28" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E06D28" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStrokeOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#E06D28" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level, i) => {
            const y = height - paddingY - (level / 100) * (height - paddingY * 2);
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#2D3039" strokeDasharray="3 3" strokeWidth="1" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="#6B7280" fontSize="10">
                  {(level / 20).toFixed(0)}★
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#curveGradientOrange)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="url(#lineStrokeOrange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? "6.5" : "4.5"}
                fill="#17181D"
                stroke="#E06D28"
                strokeWidth="2.5"
                className="transition-all duration-150"
              />
              {/* X Axis label */}
              <text x={p.x} y={height - 8} textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">
                {p.label.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute bg-[#1F2127] border border-[#E06D28]/40 text-xs p-2.5 rounded-xl shadow-xl pointer-events-none z-20 whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 10}%`
            }}
          >
            <div className="font-bold text-[#FB923C] text-xs mb-0.5">{points[hoveredIndex].label}</div>
            <div className="text-[#FFFFFF] flex items-center gap-1">
              <span>{lang === 'ar' ? 'التقييم:' : 'Rating:'}</span>
              <span className="font-semibold text-[#FFA05C]">{points[hoveredIndex].realRating} / 5.0 ★</span>
            </div>
            <div className="text-[#9CA3AF] text-[10px]">
              {lang === 'ar' ? `نسبة الحضور: ${points[hoveredIndex].presentRate}%` : `Attendance: ${points[hoveredIndex].presentRate}%`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RolesDoughnutChart: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const { lang, t } = useApp();
  
  const roleColors: Record<string, string> = {
    video_editor: '#E06D28',       // Signature Terracotta Orange
    motion_designer: '#F97316',    // Bright Amber Orange
    thumbnail_designer: '#FB923C', // Soft Orange
    scriptwriter: '#F59E0B',       // Amber
    sound_designer: '#D97706',     // Deep Amber
    social_media_manager: '#10B981', // Emerald
    developer: '#6366F1',         // Indigo
    other: '#9CA3AF'
  };

  const roleCounts = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = employees.length || 1;
  const roles = Object.entries(roleCounts) as [string, number][];

  let cumulativeAngle = 0;
  const radius = 60;
  const center = 75;
  const strokeWidth = 24;

  const slices = roles.map(([role, count]) => {
    const percentage = Number(count) / total;
    const strokeDasharray = `${percentage * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`;
    const strokeDashoffset = -cumulativeAngle * (2 * Math.PI * radius);
    cumulativeAngle += percentage;

    return {
      role,
      count,
      percentage: Math.round(percentage * 100),
      color: roleColors[role] || '#9CA3AF',
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between h-full">
      {/* Donut SVG */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 150 150" className="w-full h-full transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#2D3039"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-500 hover:opacity-90"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-[#FFFFFF]">{employees.length}</span>
          <span className="text-[10px] text-[#9CA3AF]">{lang === 'ar' ? 'مبدع' : 'Members'}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        {slices.map((s, i) => {
          const roleKey = `role_${s.role}` as keyof typeof t;
          const roleLabel = (t[roleKey] as string)?.split('(')[0] || s.role;
          return (
            <div key={i} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }}></span>
                <span className="text-[#F3F4F6] truncate font-medium">{roleLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-[#9CA3AF] shrink-0">
                <span className="font-semibold text-[#FB923C]">{s.count}</span>
                <span className="text-[10px]">({s.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AttendanceComparisonBarChart: React.FC<{
  employees: Employee[];
  records: AttendanceRecord[];
  currentDate: string;
}> = ({ employees, records, currentDate }) => {
  const { lang, settings } = useApp();

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-[#9CA3AF] px-1">
        <span className="font-medium text-[#FFFFFF]">{lang === 'ar' ? 'مقارنة الحضور والغياب للموظفين هذا الشهر' : 'Monthly Attendance by Member'}</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
            <span>{lang === 'ar' ? 'أيام الحضور' : 'Present'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F43F5E]"></span>
            <span>{lang === 'ar' ? 'أيام الغياب' : 'Absent'}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
        {employees.map(emp => {
          const stats = calculateAccruedSalary(emp, records, currentDate, settings);
          const totalDays = Math.max(1, stats.totalPresentDays + stats.totalAbsentDays);
          const presentWidth = (stats.totalPresentDays / Math.max(15, totalDays)) * 100;
          const absentWidth = (stats.totalAbsentDays / Math.max(15, totalDays)) * 100;

          return (
            <div key={emp.id} className="flex flex-col gap-1 p-2 rounded-xl bg-[#17181D] border border-[#2D3039]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: emp.avatarColor || '#E06D28' }}
                  >
                    {emp.avatarInitial || emp.name.slice(0, 1)}
                  </div>
                  <span className="font-semibold text-[#FFFFFF] truncate max-w-[140px] sm:max-w-[200px]">{emp.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#34D399] font-bold">{stats.totalPresentDays} {lang === 'ar' ? 'حاضر' : 'p'}</span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#FB7185] font-bold">{stats.totalAbsentDays} {lang === 'ar' ? 'غياب' : 'a'}</span>
                </div>
              </div>

              {/* Stacked/Parallel Bar */}
              <div className="w-full bg-[#141518] h-2 rounded-full overflow-hidden flex gap-0.5">
                <div 
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${Math.min(100, presentWidth)}%` }}
                  title={`${stats.totalPresentDays} present days`}
                />
                {stats.totalAbsentDays > 0 && (
                  <div 
                    className="bg-[#F43F5E] h-full rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${Math.min(100, absentWidth)}%` }}
                    title={`${stats.totalAbsentDays} absent days`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
