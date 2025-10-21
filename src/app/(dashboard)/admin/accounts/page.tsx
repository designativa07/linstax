'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
// Verificação de admin é tratada no layout; evitar imports server-only aqui
import Link from 'next/link'
import { 
  UserGroupIcon, 
  PencilIcon, 
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

interface Account {
  id: string
  type: 'instagram' | 'whatsapp' | 'whatsapp_group'
  name: string
  username?: string
  phone?: string
  description?: string
  user_id?: string
  category_id?: string
  created_at: string
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  // Access control: o layout já redireciona usuários não-admin

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
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
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone?.includes(searchTerm)
    
    return matchesType && matchesSearch
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
          <h1 className="text-2xl font-bold text-gray-900">Todas as Contas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todas as contas cadastradas no sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm text-indigo-600 font-medium">Modo Administrador</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nome, usuário, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {accounts.length === 0 ? 'Nenhuma conta cadastrada ainda' : 'Nenhuma conta encontrada com os filtros aplicados'}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAccounts.map((account) => (
              <li key={account.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                          {getTypeLabel(account.type)}
                        </span>
                        {/* Categoria omitida na visão admin simplificada */}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {account.name}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {account.username && (
                          <p>@{account.username}</p>
                        )}
                        {account.phone && (
                          <p>{account.phone}</p>
                        )}
                        {account.description && (
                          <p>{account.description}</p>
                        )}
                        {/* Proprietário omitido para evitar join com auth.users no client */}
                        <p className="text-xs text-gray-400">
                          Criado em {new Date(account.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir conta"
                      >
                        <TrashIcon className="h-4 w-4" />
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
