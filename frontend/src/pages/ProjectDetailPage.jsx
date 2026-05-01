import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, ArrowLeft, UserPlus, UserMinus, Loader2, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data.data,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id, filterStatus],
    queryFn: async () => {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      return (await api.get(`/projects/${id}/tasks${params}`)).data.data;
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data,
    enabled: isAdmin,
  });

  const createTask = useMutation({
    mutationFn: (payload) => api.post(`/projects/${id}/tasks`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // keep dashboard in sync
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task'),
  });

  const addMember = useMutation({
    mutationFn: () => api.post(`/projects/${id}/members`, { userId: parseInt(memberUserId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowMemberModal(false);
      setMemberUserId('');
      toast.success('Member added!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add member'),
  });

  const removeMember = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Member removed');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to remove member'),
  });

  if (projectLoading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.content ?? []);
  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
  const statusColors = { TODO: 'border-slate-600', IN_PROGRESS: 'border-blue-500', DONE: 'border-emerald-500' };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/projects" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
                {project?.description && <p className="text-slate-400 text-sm mt-0.5">{project.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button onClick={() => setShowMemberModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              )}
              <button
                id="create-task-btn"
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Members Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Members ({project?.members?.length})
              </h2>
              <div className="space-y-2">
                {project?.members?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-600/30 rounded-full flex items-center justify-center text-xs text-indigo-400 font-semibold">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                    </div>
                    {isAdmin && m.id !== project?.owner?.id && (
                      <button onClick={() => removeMember.mutate(m.id)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="lg:col-span-3">
              {/* Filter */}
              <div className="flex gap-2 mb-4">
                {['', ...STATUSES].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>

              {tasksLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filterStatus ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STATUSES.map((status) => (
                    <div key={status} className={`bg-slate-900 border-t-2 ${statusColors[status]} rounded-xl p-4`}>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                        {statusLabels[status]}
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                          {tasksByStatus[status].length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {tasksByStatus[status].map((t) => <TaskCard key={t.id} task={t} />)}
                        {tasksByStatus[status].length === 0 && (
                          <div className="text-center py-4 text-slate-600 text-xs border border-dashed border-slate-700 rounded-lg">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={(e) => { e.preventDefault(); createTask.mutate({
          ...taskForm,
          assigneeId: taskForm.assigneeId ? parseInt(taskForm.assigneeId) : null,
        }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input required value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea rows={2} value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Optional description"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
              <input type="date" value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignee</label>
            <select value={taskForm.assigneeId}
              onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option value="">Unassigned</option>
              {project?.members?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium hover:border-slate-500 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createTask.isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {createTask.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={(e) => { e.preventDefault(); addMember.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Select User</label>
            <select required value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option value="">Choose a user...</option>
              {(allUsers?.content ?? allUsers ?? [])
                .filter((u) => !project?.members?.some((m) => m.id === u.id))
                .map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowMemberModal(false)}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium hover:border-slate-500 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={addMember.isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {addMember.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
