import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildWeeklyChartData,
  type StudyProgress,
  type WeeklyChartPoint,
} from "../data/curriculum";

interface WeeklyProgressChartProps {
  progress: StudyProgress;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeeklyChartPoint }>;
}

function WeeklyChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-md text-xs space-y-1">
      <div className="font-semibold text-slate-900">
        {point.dayLabel}
        <span className="font-normal text-slate-500"> · {point.fullDate}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-700">
        <span>Sessions completed</span>
        <span className="font-mono font-medium text-emerald-700 tabular-nums">
          {point.sessions}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-700">
        <span>Quiz performance</span>
        <span className="font-mono font-medium text-amber-700 tabular-nums">
          {point.quizPerformance !== null
            ? `${point.quizPerformance}% (${point.quizCorrect}/${point.quizAnswered})`
            : "No quiz"}
        </span>
      </div>
    </div>
  );
}

export function WeeklyProgressChart({ progress }: WeeklyProgressChartProps) {
  const data = buildWeeklyChartData(progress);
  const activeDays = data.filter(
    (d) => d.sessions > 0 || d.quizAnswered > 0
  ).length;
  const weeklySessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const hasAnyData = activeDays > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Weekly Consistency
          </h3>
          <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
            Last 7 days
            <span aria-hidden="true"> · </span>
            {activeDays} active {activeDays === 1 ? "day" : "days"}
            <span aria-hidden="true"> · </span>
            {weeklySessions} {weeklySessions === 1 ? "session" : "sessions"}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs bg-emerald-700 inline-block"
              aria-hidden="true"
            />
            Sessions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 bg-amber-700 inline-block"
              aria-hidden="true"
            />
            Quiz %
          </span>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="sessions"
              allowDecimals={false}
              domain={[0, (max: number) => Math.max(3, max + 1)]}
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="quiz"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<WeeklyChartTooltip />} />
            <Bar
              yAxisId="sessions"
              dataKey="sessions"
              name="Sessions Completed"
              fill="#047857"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Line
              yAxisId="quiz"
              type="monotone"
              dataKey="quizPerformance"
              name="Quiz Performance"
              stroke="#B45309"
              strokeWidth={2}
              dot={{ r: 3.5, fill: "#B45309", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#B45309" }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!hasAnyData && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Start a phone call or complete an ECZ practice quiz today to plot your
          weekly consistency.
        </p>
      )}
    </div>
  );
}
