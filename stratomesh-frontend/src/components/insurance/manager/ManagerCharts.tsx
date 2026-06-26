"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ManagerChartsProps = {
  stats: {
    inProgressWork: number;
    waitingWork: number;
    blockedCases: number;
    monthEndPriority: number;
  };
};

const statusColors = ["#2563eb", "#f97316", "#e11d48", "#7c3aed"];

const premiumRiskData = [
  {
    caseName: "Sunrise Foods",
    premium: 36,
    team: "Policy",
  },
  {
    caseName: "Delta Logistics",
    premium: 18,
    team: "Finance",
  },
  {
    caseName: "Nova Infra",
    premium: 25,
    team: "Policy",
  },
  {
    caseName: "Metro Health",
    premium: 9,
    team: "Claims",
  },
];

const teamWorkloadData = [
  {
    team: "Sales",
    inProgress: 9,
    waiting: 1,
    blocked: 0,
    completed: 4,
  },
  {
    team: "Underwriting",
    inProgress: 1,
    waiting: 0,
    blocked: 1,
    completed: 6,
  },
  {
    team: "Pricing",
    inProgress: 1,
    waiting: 0,
    blocked: 0,
    completed: 5,
  },
  {
    team: "Finance",
    inProgress: 1,
    waiting: 1,
    blocked: 0,
    completed: 4,
  },
  {
    team: "Policy",
    inProgress: 1,
    waiting: 0,
    blocked: 1,
    completed: 3,
  },
  {
    team: "Claims",
    inProgress: 1,
    waiting: 0,
    blocked: 0,
    completed: 1,
  },
  {
    team: "Manager",
    inProgress: 0,
    waiting: 0,
    blocked: 0,
    completed: 2,
  },
];

export default function ManagerCharts({ stats }: ManagerChartsProps) {
  const statusData = [
    {
      name: "In Progress",
      value: Math.max(stats.inProgressWork, 0),
    },
    {
      name: "Waiting",
      value: Math.max(stats.waitingWork, 0),
    },
    {
      name: "Blocked",
      value: Math.max(stats.blockedCases, 0),
    },
    {
      name: "Month-End",
      value: Math.max(stats.monthEndPriority, 0),
    },
  ].filter((item) => item.value > 0);

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
              Operating Health
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Case Status Donut
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Current pressure across in-progress, waiting, blocked, and
              month-end cases.
            </p>
          </div>
        </div>

        <div className="mt-5 h-[310px]">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={78}
                  outerRadius={112}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[index % statusColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [Number(value || 0), "Cases"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              No active case status data available.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
            Business Exposure
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Risk Bar Chart
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Demo premium value by operating case. Amounts are shown in lakhs.
          </p>
        </div>

        <div className="mt-5 h-[310px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={premiumRiskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="caseName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [
                  `₹${Number(value || 0)}L`,
                  "Premium",
                ]}
                labelFormatter={(label) => `Case: ${label}`}
              />
              <Bar dataKey="premium" name="Premium Risk" radius={[8, 8, 0, 0]}>
                {premiumRiskData.map((entry, index) => (
                  <Cell
                    key={entry.caseName}
                    fill={
                      index === 0
                        ? "#10b981"
                        : index === 1
                          ? "#f97316"
                          : index === 2
                            ? "#e11d48"
                            : "#2563eb"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
            Team Movement
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Team Workload Stacked Chart
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manager view of team workload across completed, active, waiting,
            and blocked work.
          </p>
        </div>

        <div className="mt-5 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamWorkloadData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="team" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completed"
                name="Completed"
                stackId="work"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="inProgress"
                name="In Progress"
                stackId="work"
                fill="#2563eb"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="waiting"
                name="Waiting"
                stackId="work"
                fill="#f97316"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="blocked"
                name="Blocked"
                stackId="work"
                fill="#e11d48"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}