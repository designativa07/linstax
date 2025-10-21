'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAndFetchData()
    }
  }, [user])

  const checkAdminAndFetchData = async () => {
    try {
      // Verificar se é admin
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      const isAdminUser = profile?.role === 'admin'
      setIsAdmin(isAdminUser)
      
      await Promise.all([
        fetchAccounts(isAdminUser),
        fetchCategories(isAdminUser)
      ])
    } catch (error) {
      console.error('Error checking admin:', error)
      await Promise.all([
        fetchAccounts(false),
        fetchCategories(false)
      ])
    }
  }

  const fetchAccounts = async (isAdminUser: boolean) => {
    try {
      // Se for admin, busca todas; se não, apenas do usuário
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

      const { data, error } = await accountsQuery

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchCategories = async (isAdminUser: boolean) => {
    try {
      // Se for admin, busca todas; se não, apenas do usuário
      let categoriesQuery = supabase
        .from('categories')
        .select('*')
        .order('name')

      if (!isAdminUser) {
        categoriesQuery = categoriesQuery.eq('user_id', user?.id)
      }

      const { data, error } = await categoriesQuery

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setAccounts(accounts.filter(account => account.id !== id))
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Erro ao excluir conta')
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesType = filterType === 'all' || account.type === filterType
    const matchesCategory = filterCategory === 'all' || account.category?.id === filterCategory
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone?.includes(searchTerm)
    
    return matchesType && matchesCategory && matchesSearch
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'instagram': return 'Instagram'
      case 'whatsapp': return 'WhatsApp'
      case 'whatsapp_group': return 'Grupo WhatsApp'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'instagram': return 'bg-pink-100 text-pink-800'
      case 'whatsapp': return 'bg-green-100 text-green-800'
      case 'whatsapp_group': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Todas as Contas' : 'Minhas Contas'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Gerencie todas as contas do sistema' : 'Gerencie suas contas de Instagram, WhatsApp e grupos'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/accounts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Conta
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="whatsapp_group">Grupo WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nome, usuário ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {accounts.length === 0 ? 'Nenhuma conta cadastrada ainda' : 'Nenhuma conta encontrada com os filtros aplicados'}
          </div>
          {accounts.length === 0 && (
            <Link
              href="/accounts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar primeira conta
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                      {getTypeLabel(account.type)}
                    </span>
                    {account.category && (
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: account.category.color }}
                      >
                        {account.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {account.name}
                  </h3>
                  {account.username && (
                    <p className="text-sm text-gray-600 mb-1">
                      @{account.username}
                    </p>
                  )}
                  {account.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      {account.phone}
                    </p>
                  )}
                  {account.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {account.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/accounts/${account.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteAccount(account.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
