import { CheckCircle2, ClipboardList } from "lucide-react";

type DashboardHeaderProps = {
  activeCount: number;
  completedCount: number;
};

export function DashboardHeader({
  activeCount,
  completedCount,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          Your tasks
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Organize what matters, focus on one thing at a time, and keep your day
          moving.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:w-auto">
        <StatCard
          icon={<ClipboardList className="size-3.5 text-violet-500" />}
          label="Active"
          value={activeCount}
        />
        <StatCard
          icon={<CheckCircle2 className="size-3.5 text-emerald-500" />}
          label="Done"
          value={completedCount}
        />
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
