import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Users, Archive, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function ProjectCard({ project }) {
  const statusColors = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-400',
    ARCHIVED: 'bg-slate-700 text-slate-400',
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
          <FolderKanban className="w-5 h-5 text-indigo-400" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[project.status] || ''}`}>
          {project.status}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{project.members?.length ?? 0} members</span>
        </div>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/projects', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowModal(false);
      setForm({ name: '', description: '' });
      toast.success('Project created successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create project'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const projects = data?.content ?? data ?? [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Projects</h1>
              <p className="text-slate-400 mt-1">
                {Array.isArray(projects) ? projects.length : 0} project{(Array.isArray(projects) ? projects.length : 0) !== 1 ? 's' : ''}
              </p>
            </div>
            {isAdmin && (
              <button
                id="create-project-btn"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-900/30"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Array.isArray(projects) && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg">No projects yet</p>
              {isAdmin && <p className="text-sm mt-1">Click "New Project" to create one</p>}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name</label>
            <input
              id="project-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-xl transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
