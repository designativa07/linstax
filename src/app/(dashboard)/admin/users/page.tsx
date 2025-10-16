'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { 
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  role: 'admin' | 'user'
  display_name?: string
  created_at: string
  user: {
    id: string
    email: string
    created_at: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAccess()
      fetchUsers()
    }
  }, [user])

  const checkAdminAccess = async () => {
    try {
      await requireAdmin()
    } catch {
      redirect('/dashboard')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select(`
          *,
          user:auth.users(id, email, created_at)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    if (!confirm(`Tem certeza que deseja ${newRole === 'admin' ? 'promover' : 'rebaixar'} este usuário?`)) return

    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'admin' | 'user' } : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Erro ao atualizar permissões do usuário')
    }
  }

  const filteredUsers = users.filter(userProfile => {
    const matchesRole = filterRole === 'all' || userProfile.role === filterRole
    const matchesSearch = userProfile.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userProfile.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesRole && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm text-indigo-600 font-medium">Modo Administrador</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Usuários
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Administradores
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuários Comuns
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'user').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissão
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos os usuários</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuários comuns</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {users.length === 0 ? 'Nenhum usuário cadastrado ainda' : 'Nenhum usuário encontrado com os filtros aplicados'}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((userProfile) => (
              <li key={userProfile.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {userProfile.role === 'admin' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <UserIcon className="h-3 w-3 mr-1" />
                            Usuário
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {userProfile.display_name || 'Sem nome'}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{userProfile.user?.email}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Cadastrado em {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserRole(userProfile.id, userProfile.role)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          userProfile.role === 'admin'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                        }`}
                        title={userProfile.role === 'admin' ? 'Remover privilégios de admin' : 'Promover a administrador'}
                      >
                        {userProfile.role === 'admin' ? (
                          <>
                            <ShieldExclamationIcon className="h-3 w-3 mr-1 inline" />
                            Rebaixar
                          </>
                        ) : (
                          <>
                            <ShieldCheckIcon className="h-3 w-3 mr-1 inline" />
                            Promover
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
