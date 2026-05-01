import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Clock, AlertTriangle, FolderOpen, TrendingUp, Users, BarChart3, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function StatCard({ icon: Icon, label, value, color, bg, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-700 transition-colors">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ statuses, dataMap, total }) {
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-0.5">
        {statuses.map(({ key, color }) => {
          const pct = ((dataMap?.[key] ?? 0) / Math.max(total, 1)) * 100;
          return pct > 0 ? (
            <div key={key} className={`${color} transition-all`} style={{ width: `${pct}%` }} />
          ) : null;
        })}
      </div>
      <div className="flex gap-4 flex-wrap">
        {statuses.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-sm text-slate-400">
              {label}: <span className="text-white font-medium">{dataMap?.[key] ?? 0}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUSES = [
  { key: 'TODO', label: 'To Do', color: 'bg-slate-600' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'DONE', label: 'Done', color: 'bg-emerald-500' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    staleTime: 0,             // Always re-fetch dashboard
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <p className="text-red-400">Failed to load dashboard. Is the backend running?</p>
        </div>
      </>
    );
  }

  const personalStats = [
    { icon: CheckSquare, label: 'My Total Tasks', value: data?.totalMyTasks ?? 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: AlertTriangle, label: 'Overdue Tasks', value: data?.overdueTasks ?? 0, color: 'text-red-400', bg: 'bg-red-500/10', sub: 'Not done & past due date' },
    { icon: TrendingUp, label: 'In Progress', value: data?.tasksByStatus?.IN_PROGRESS ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: FolderOpen, label: 'My Projects', value: data?.myProjects ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const adminStats = [
    { icon: Layers, label: 'All Tasks (System)', value: data?.allTasksCount ?? 0, color: 'text-purple-400', bg: 'bg-purple-500/10', sub: 'Across all projects' },
    { icon: FolderOpen, label: 'Total Projects', value: data?.allProjectsCount ?? 0, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { icon: TrendingUp, label: 'Team In Progress', value: data?.teamTasksByStatus?.IN_PROGRESS ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: CheckSquare, label: 'Team Done', value: data?.teamTasksByStatus?.DONE ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const teamTotal = isAdmin
    ? (data?.teamTasksByStatus?.TODO ?? 0) + (data?.teamTasksByStatus?.IN_PROGRESS ?? 0) + (data?.teamTasksByStatus?.DONE ?? 0)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">Here's what's happening with your tasks today.</p>
          </div>

          {/* ── Personal Stats ── */}
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5" />
              My Tasks
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {personalStats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Personal Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              My Task Progress
            </h2>
            <ProgressBar
              statuses={STATUSES}
              dataMap={data?.tasksByStatus}
              total={data?.totalMyTasks || 1}
            />
          </div>

          {/* ── Admin Team Overview ── */}
          {isAdmin && (
            <>
              <div className="mb-2 mt-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Team Overview (Admin)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {adminStats.map((s) => <StatCard key={s.label} {...s} />)}
              </div>

              {/* Team Progress */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Team Task Progress
                </h2>
                <ProgressBar
                  statuses={STATUSES}
                  dataMap={data?.teamTasksByStatus}
                  total={teamTotal || 1}
                />
              </div>

              {/* Recent All Tasks */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Recent Activity (All Projects)
                </h2>
                {data?.recentAllTasks?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.recentAllTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No tasks yet</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── My Recent Tasks ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {isAdmin ? 'My Assigned Tasks' : 'Recent Tasks'}
            </h2>
            {data?.recentTasks?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recentTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No tasks assigned yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
