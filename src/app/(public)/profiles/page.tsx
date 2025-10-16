'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import ProfileCard from '@/components/ProfileCard'
import SearchFilters from '@/components/SearchFilters'

interface Account {
  id: string
  type: 'instagram' | 'whatsapp' | 'whatsapp_group'
  name: string
  username?: string
  phone?: string
  description?: string
  group_link?: string
  user: {
    id: string
    display_name?: string
  }
  categories?: {
    id: string
    name: string
    color: string
  }[]
  created_at: string
}

interface SearchParams {
  search?: string
  type?: string
  category?: string
}

export default function ProfilesPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [showFilters, setShowFilters] = useState(false)
  const [useJoins, setUseJoins] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get search params from URL
    const urlParams = new URLSearchParams(window.location.search)
    const params: SearchParams = {
      search: urlParams.get('search') || '',
      type: urlParams.get('type') || '',
      category: urlParams.get('category') || ''
    }
    setSearchParams(params)
    fetchAccounts(params)
  }, [])

  const fetchAccounts = async (params: SearchParams = searchParams) => {
    try {
      setLoading(true)
      
      // Try with joins first, fallback to separate queries if it fails
      if (useJoins) {
        try {
          const { data, error } = await supabase
            .from('accounts')
            .select(`
              *,
              user:users_profiles(id, display_name),
              category:categories(*)
            `)
            .order('created_at', { ascending: false })

          if (!error && data) {
            console.log('✅ Using joins - Fetched accounts:', data.length)
            setAccounts(data)
            return
          }
        } catch (joinError) {
          console.log('⚠️ Joins failed, falling back to separate queries')
          setUseJoins(false)
        }
      }

      // Fallback: separate queries
      let query = supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,username.ilike.%${params.search}%`)
      }

      if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type)
      }

      if (params.category && params.category !== 'all') {
        // Filter by category using the accounts_categories table
        query = query.in('id', 
          supabase
            .from('accounts_categories')
            .select('account_id')
            .eq('category_id', params.category)
        )
      }

      const { data: accountsData, error } = await query

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      // Fetch related data separately
      const enrichedAccounts = await Promise.all(
        (accountsData || []).map(async (account) => {
          // Fetch user data
          const { data: userData } = await supabase
            .from('users_profiles')
            .select('id, display_name')
            .eq('id', account.user_id)
            .single()

          // Fetch categories data
          const { data: categoriesData } = await supabase
            .from('accounts_categories')
            .select(`
              categories (
                id,
                name,
                color
              )
            `)
            .eq('account_id', account.id)

          const categories = categoriesData?.map(ac => ac.categories).filter(Boolean) || []

          return {
            ...account,
            user: userData || { id: account.user_id, display_name: null },
            categories: categories
          }
        })
      )
      
      console.log('✅ Using separate queries - Fetched accounts:', enrichedAccounts.length)
      setAccounts(enrichedAccounts)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      // Show user-friendly error message
      alert('Erro ao carregar perfis. Verifique se a política pública foi aplicada corretamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newParams: SearchParams) => {
    setSearchParams(newParams)
    
    // Update URL
    const url = new URL(window.location.href)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })
    window.history.pushState({}, '', url.toString())
    
    fetchAccounts(newParams)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'instagram': return 'Instagram'
      case 'whatsapp': return 'WhatsApp'
      case 'whatsapp_group': return 'Grupo WhatsApp'
      default: return 'Todos'
    }
  }

  const getTypeCount = (type: string) => {
    return accounts.filter(account => account.type === type).length
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Descubra Perfis Incríveis
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore uma coleção diversificada de perfis do Instagram e WhatsApp. 
          Encontre pessoas interessantes e conecte-se com comunidades.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{accounts.length}</div>
          <div className="text-sm text-gray-600">Total de Perfis</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-2xl font-bold text-pink-600">{getTypeCount('instagram')}</div>
          <div className="text-sm text-gray-600">Instagram</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{getTypeCount('whatsapp')}</div>
          <div className="text-sm text-gray-600">WhatsApp</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{getTypeCount('whatsapp_group')}</div>
          <div className="text-sm text-gray-600">Grupos</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, descrição ou username..."
                value={searchParams.search || ''}
                onChange={(e) => handleSearch({ ...searchParams, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <SearchFilters
            searchParams={searchParams}
            onSearch={handleSearch}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.search ? `Resultados para "${searchParams.search}"` : 'Todos os Perfis'}
          </h2>
          <div className="text-sm text-gray-600">
            {accounts.length} {accounts.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <ProfileCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum perfil encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou termos de busca para encontrar perfis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}