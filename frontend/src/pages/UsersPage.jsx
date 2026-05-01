import { useQuery } from '@tanstack/react-query';
import { Users, Shield, User, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function RoleBadge({ role }) {
  return role === 'ADMIN' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
      <Shield className="w-3 h-3" />
      ADMIN
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-slate-400 border border-slate-600 rounded-full text-xs font-medium">
      <User className="w-3 h-3" />
      MEMBER
    </span>
  );
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Guard: non-admins bounce back
  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const users = data?.content ?? data ?? [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" />
              All Users
            </h1>
            <p className="text-slate-400 mt-1">
              {Array.isArray(users) ? users.length : 0} registered user{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Array.isArray(users) && users.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 font-semibold text-sm flex-shrink-0">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{u.name}</p>
                              <p className="text-xs text-slate-500">ID #{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4">
                          {u.createdAt ? (
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 font-semibold">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>
                    {u.createdAt && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
