'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  TagIcon, 
  CameraIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Account {
  id: string
  type: 'instagram' | 'whatsapp' | 'whatsapp_group'
  name: string
  username?: string
  phone?: string
  description?: string
  category?: {
    id: string
    name: string
    color: string
  }
  created_at: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface Stats {
  totalAccounts: number
  totalCategories: number
  accountsByType: { type: string; count: number }[]
  accountsByCategory: { category: string; count: number }[]
  recentAccounts: Account[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0,
    totalCategories: 0,
    accountsByType: [],
    accountsByCategory: [],
    recentAccounts: []
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAndFetchStats()
    }
  }, [user])

  const checkAdminAndFetchStats = async () => {
    try {
      // Verificar se é admin
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      const isAdminUser = profile?.role === 'admin'
      setIsAdmin(isAdminUser)
      
      await fetchStats(isAdminUser)
    } catch (error) {
      console.error('Error checking admin:', error)
      await fetchStats(false)
    }
  }

  const fetchStats = async (isAdminUser: boolean) => {
    try {
      // Fetch accounts - se for admin, busca todas; se não, apenas do usuário
      let accountsQuery = supabase
        .from('accounts')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (!isAdminUser) {
        accountsQuery = accountsQuery.eq('user_id', user?.id)
      }

      const { data: accounts, error: accountsError } = await accountsQuery

      if (accountsError) throw accountsError

      // Fetch categories - se for admin, busca todas; se não, apenas do usuário
      let categoriesQuery = supabase
        .from('categories')
        .select('*')

      if (!isAdminUser) {
        categoriesQuery = categoriesQuery.eq('user_id', user?.id)
      }

      const { data: categories, error: categoriesError } = await categoriesQuery

      if (categoriesError) throw categoriesError

      // Calculate stats
      const accountsByType = [
        { type: 'Instagram', count: accounts?.filter(a => a.type === 'instagram').length || 0 },
        { type: 'WhatsApp', count: accounts?.filter(a => a.type === 'whatsapp').length || 0 },
        { type: 'Grupo WhatsApp', count: accounts?.filter(a => a.type === 'whatsapp_group').length || 0 }
      ]

      const accountsByCategory = categories?.map(category => ({
        category: category.name,
        count: accounts?.filter(a => a.category_id === category.id).length || 0
      })) || []

      setStats({
        totalAccounts: accounts?.length || 0,
        totalCategories: categories?.length || 0,
        accountsByType,
        accountsByCategory,
        recentAccounts: accounts?.slice(0, 5) || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B']

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instagram': return CameraIcon
      case 'whatsapp': return ChatBubbleLeftRightIcon
      case 'whatsapp_group': return UsersIcon
      default: return UserGroupIcon
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'instagram': return 'Instagram'
      case 'whatsapp': return 'WhatsApp'
      case 'whatsapp_group': return 'Grupo WhatsApp'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin ? 'Visão geral de todas as contas do sistema' : 'Visão geral das suas contas e estatísticas'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Contas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalAccounts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/accounts" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ver todas
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Categorias
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalCategories}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/categories" className="font-medium text-indigo-600 hover:text-indigo-500">
                Gerenciar
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CameraIcon className="h-6 w-6 text-pink-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Instagram
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.accountsByType.find(t => t.type === 'Instagram')?.count || 0}
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
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    WhatsApp
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(stats.accountsByType.find(t => t.type === 'WhatsApp')?.count || 0) + 
                     (stats.accountsByType.find(t => t.type === 'Grupo WhatsApp')?.count || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contas por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.accountsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.accountsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Accounts by Category */}
        {stats.accountsByCategory.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.accountsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Accounts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Contas Recentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentAccounts.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              Nenhuma conta cadastrada ainda
            </div>
          ) : (
            stats.recentAccounts.map((account) => {
              const IconComponent = getTypeIcon(account.type)
              return (
                <div key={account.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {account.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getTypeLabel(account.type)}
                          {account.username && ` • @${account.username}`}
                          {account.phone && ` • ${account.phone}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {account.category && (
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: account.category.color }}
                        >
                          {account.category.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(account.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {stats.recentAccounts.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link
              href="/accounts"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver todas as contas
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
