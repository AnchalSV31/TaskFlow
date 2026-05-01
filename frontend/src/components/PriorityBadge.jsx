const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-emerald-500/20 text-emerald-400' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-500/20 text-amber-400' },
  HIGH: { label: 'High', className: 'bg-red-500/20 text-red-400' },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-slate-700 text-slate-300' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
