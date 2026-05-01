const statusConfig = {
  TODO: { label: 'To Do', className: 'bg-slate-700 text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  DONE: { label: 'Done', className: 'bg-emerald-500/20 text-emerald-400' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-700 text-slate-300' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
