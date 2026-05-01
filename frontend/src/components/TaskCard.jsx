import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function TaskCard({ task }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <StatusBadge status={task.status} />
        <div className="flex items-center gap-3">
          {task.assignee && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">{task.assignee.name.split(' ')[0]}</span>
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
