import { Link } from 'react-router-dom';
import { CheckSquare, Users, BarChart3, Zap, Shield, ArrowRight, GitBranch, Clock, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';

const features = [
  {
    icon: CheckSquare,
    title: 'Smart Task Management',
    description: 'Create, assign and track tasks with priorities, due dates, and rich descriptions.',
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    icon: GitBranch,
    title: 'Kanban Boards',
    description: 'Visualize your workflow with drag-and-drop Kanban boards across TODO, In Progress, and Done.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Add team members to projects, assign tasks, and track who\'s responsible for what.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    description: 'Real-time stats on your tasks, overdue items, and progress broken down by status.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Admins manage projects and members. Members focus on their tasks. Proper access control built-in.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  {
    icon: Zap,
    title: 'Instant Updates',
    description: 'Changes reflect instantly across the app with smart caching and real-time query invalidation.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
];

const stats = [
  { value: '3', label: 'Task Statuses', sub: 'TODO · In Progress · Done' },
  { value: '3', label: 'Priority Levels', sub: 'Low · Medium · High' },
  { value: 'JWT', label: 'Secure Auth', sub: 'Access + Refresh tokens' },
  { value: '2', label: 'Roles', sub: 'Admin · Member' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400 mb-6">
            <Star className="w-3 h-3 fill-current" />
            Full-Stack Team Task Manager
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Manage Tasks.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ship Faster.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskFlow is a full-stack team task manager with role-based access, Kanban boards,
            live dashboards, and JWT-secured authentication — built for real teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] text-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] text-sm"
                >
                  Start for Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-7 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Demo credentials hint */}
          <p className="mt-6 text-xs text-slate-500">
            Try demo: <span className="text-indigo-400 font-mono">admin@test.com</span> /{' '}
            <span className="text-indigo-400 font-mono">Admin@123</span>
          </p>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-slate-300">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything your team needs
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A production-ready task manager packed with features that modern teams demand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Preview ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/50 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-slate-400">Get your team up and running in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
            {[
              { step: '01', icon: Users, title: 'Create an account', desc: 'Sign up and your admin sets up projects and invites team members.' },
              { step: '02', icon: CheckSquare, title: 'Add & assign tasks', desc: 'Create tasks with priorities, due dates, and assign them to team members.' },
              { step: '03', icon: Clock, title: 'Track progress', desc: 'Move tasks through your Kanban board and watch the dashboard update live.' },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">{s.step}</span>
                <h3 className="text-base font-semibold text-white mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Ready to organize
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              your team?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join TaskFlow and take control of your team's productivity today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-2xl shadow-indigo-900/50 hover:scale-[1.02] text-base"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-400">TaskFlow</span>
          </div>
          <p className="text-xs text-slate-600">
            Built with Spring Boot 3 · React · Tailwind CSS · JWT · MySQL
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
