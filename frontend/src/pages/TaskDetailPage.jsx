import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, Edit3, Trash2, Save, X, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data.data;
    },
    staleTime: 0,
  });

  // Sync form whenever task data loads
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || '',
        assigneeId: task.assignee?.id || '',
      });
    }
  }, [task]);

  const { data: projectMembers } = useQuery({
    queryKey: ['project-members', task?.projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${task.projectId}`);
      return res.data.data.members;
    },
    enabled: !!task?.projectId && editing,
  });

  // Helper: invalidate all related queries after any task change
  const invalidateAll = (projectId) => {
    queryClient.invalidateQueries({ queryKey: ['task', id] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['tasks', String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  };

  const updateTask = useMutation({
    mutationFn: (payload) => api.put(`/tasks/${id}`, payload),
    onSuccess: (res) => {
      const updatedTask = res.data.data;
      invalidateAll(updatedTask?.projectId ?? task?.projectId);
      setEditing(false);
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update task'),
  });

  const updateStatus = useMutation({
    mutationFn: (status) => api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: (res) => {
      const updatedTask = res.data.data;
      invalidateAll(updatedTask?.projectId ?? task?.projectId);
      toast.success('Status updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
  });

  const deleteTask = useMutation({
    mutationFn: () => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      // Invalidate before navigating
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (task?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', String(task.projectId)] });
        queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
      }
      toast.success('Task deleted');
      navigate(`/projects/${task?.projectId}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete task'),
  });

  if (isLoading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  const isAssignee = task?.assignee?.id === user?.id;
  const canUpdateStatus = isAdmin || isAssignee;

  const startEdit = () => {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      assigneeId: task.assignee?.id || '',
    });
    setEditing(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link to={`/projects/${task?.projectId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to project
          </Link>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                {editing ? (
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="text-xl font-bold bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-white">{task?.title}</h1>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  Project: <Link to={`/projects/${task?.projectId}`} className="text-indigo-400 hover:underline">{task?.projectName}</Link>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editing && canUpdateStatus && (
                  <select
                    value={task?.status}
                    onChange={(e) => updateStatus.mutate(e.target.value)}
                    disabled={updateStatus.isPending}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {(isAdmin || isAssignee) && !editing && (
                  <button onClick={startEdit}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {isAdmin && !editing && (
                  <button onClick={() => deleteTask.mutate()}
                    disabled={deleteTask.isPending}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {editing && (
                  <>
                    <button onClick={() => setEditing(false)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateTask.mutate({
                      ...form,
                      assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null,
                    })} disabled={updateTask.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors">
                      {updateTask.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Badges */}
            {!editing && (
              <div className="flex items-center gap-2 mb-6">
                <StatusBadge status={task?.status} />
                <PriorityBadge priority={task?.priority} />
              </div>
            )}

            {/* Edit Priority & Status */}
            {editing && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
              {editing ? (
                <textarea rows={4} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Task description..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {task?.description || <span className="text-slate-500 italic">No description</span>}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" />Assignee</p>
                {editing ? (
                  <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none">
                    <option value="">Unassigned</option>
                    {(projectMembers ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-white">{task?.assignee?.name || 'Unassigned'}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Due Date</p>
                {editing ? (
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none" />
                ) : (
                  <p className={`text-sm ${task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400' : 'text-white'}`}>
                    {task?.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'No due date'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Created by</p>
                <p className="text-sm text-white">{task?.createdBy?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
