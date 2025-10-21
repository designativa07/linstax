'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import ProfileCard from '@/components/ProfileCard'
import ProfileListItem from '@/components/ProfileListItem'
import SearchFilters from '@/components/SearchFilters'
import { useFavorites } from '@/lib/hooks/useFavorites'

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
  favorites?: string
}

type ViewMode = 'grid' | 'list'

export default function ProfilesPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [allAccounts, setAllAccounts] = useState<Account[]>([]) // Todos os accounts sem filtro de favoritos
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [showFilters, setShowFilters] = useState(false)
  const [useJoins, setUseJoins] = useState(false)
  const [previousFavoritesSize, setPreviousFavoritesSize] = useState(0) // Para detectar remoção
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { favorites, loading: favoritesLoading } = useFavorites()
  const supabase = createClient()
  const nextSearchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // Salvar preferência de visualização
  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('profilesViewMode', mode)
  }

  // Debug do estado atual (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Estado:', {
      accounts: accounts.length,
      favorites: favorites.size,
      loading: loading || favoritesLoading
    })
  }

  // Carregar preferência de visualização do localStorage (apenas no cliente)
  useEffect(() => {
    const saved = localStorage.getItem('profilesViewMode')
    if (saved === 'list' || saved === 'grid') {
      setViewMode(saved)
    }
  }, [])

  useEffect(() => {
    // Reagir a mudanças na URL (?search, ?type, ?category, ?favorites)
    const params: SearchParams = {
      search: nextSearchParams.get('search') || '',
      type: nextSearchParams.get('type') || '',
      category: nextSearchParams.get('category') || '',
      favorites: nextSearchParams.get('favorites') || ''
    }
    setSearchParams(params)
    fetchAccounts(params)
  }, [nextSearchParams?.toString()])

  // Reagir às mudanças nos favoritos quando o filtro estiver ativo
  useEffect(() => {
    // Só aplicar filtro se não estiver carregando favoritos e tiver contas
    if (searchParams.favorites === 'true' && allAccounts.length > 0 && !favoritesLoading) {
      if (favorites.size > 0) {
        // Verificar se um favorito foi REMOVIDO (tamanho diminuiu)
        const wasRemoved = previousFavoritesSize > favorites.size
        
        // Se foi removido, adicionar delay de 2s para permitir desfazer
        // Se foi adicionado ou é carregamento inicial, aplicar filtro imediatamente
        const delay = wasRemoved ? 2000 : 0
        
        const timer = setTimeout(() => {
          const filteredAccounts = allAccounts.filter(account => favorites.has(account.id))
          setAccounts(filteredAccounts)
          setPreviousFavoritesSize(favorites.size)
        }, delay)
        
        return () => clearTimeout(timer)
      } else {
        // Se filtro de favoritos está ativo mas não há favoritos, mostrar vazio
        setAccounts([])
        setPreviousFavoritesSize(0)
      }
    } else {
      // Se não está no filtro de favoritos, resetar o contador
      setPreviousFavoritesSize(favorites.size)
    }
  }, [favorites, searchParams.favorites, allAccounts, favoritesLoading, previousFavoritesSize])


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
      
      // Fetch related data em batch (uma query para todas as categorias)
      const accountIds = accountsData?.map(acc => acc.id) || []
      
      // Buscar todas as categorias de uma vez
      const { data: allCategoriesData } = accountIds.length > 0 ? await supabase
        .from('accounts_categories')
        .select(`
          account_id,
          categories (
            id,
            name,
            color
          )
        `)
        .in('account_id', accountIds)
      : { data: [] }

      // Organizar categorias por account_id
      const categoriesByAccount = new Map<string, any[]>()
      allCategoriesData?.forEach(item => {
        if (!categoriesByAccount.has(item.account_id)) {
          categoriesByAccount.set(item.account_id, [])
        }
        if (item.categories) {
          categoriesByAccount.get(item.account_id)!.push(item.categories)
        }
      })

      // Enriquecer accounts com categorias
      const enrichedAccounts = (accountsData || []).map(account => ({
        ...account,
        user: { id: account.user_id, display_name: null },
        categories: categoriesByAccount.get(account.id) || []
      }))
      
      // console.log('✅ Using separate queries - Fetched accounts:', enrichedAccounts.length)
      
      // Salvar todos os accounts (sem filtro de favoritos)
      setAllAccounts(enrichedAccounts)
      
      // Se não é filtro de favoritos, mostrar todas as contas
      if (params.favorites !== 'true') {
        setAccounts(enrichedAccounts)
      }
      // Se é filtro de favoritos, o useEffect vai lidar com isso
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

    // Atualiza a URL usando o roteador do Next (dispara re-render)
    const params = new URLSearchParams()
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      }
    })
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)

    // Busca imediata para evitar atraso visual
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

  // Contadores removidos da UI pública; mantemos apenas os rótulos

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Descubra Perfis Incríveis
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Explore uma coleção diversificada de perfis do Instagram e WhatsApp. 
          Encontre pessoas interessantes e conecte-se com comunidades.
        </p>
        <Link
          href="/accounts/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Minha Conta
        </Link>
      </div>

      {/* Stats removidos */}

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

          {/* Favorites Filter Button */}
          <button
            onClick={() => handleSearch({ ...searchParams, favorites: searchParams.favorites === 'true' ? '' : 'true' })}
            className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              searchParams.favorites === 'true'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <svg 
              className={`h-5 w-5 mr-2 ${searchParams.favorites === 'true' ? 'text-red-500' : 'text-gray-400'}`}
              fill={searchParams.favorites === 'true' ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            {searchParams.favorites === 'true' ? 'Favoritos' : 'Ver Favoritos'}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleViewMode('grid')}
              className={`flex items-center justify-center px-4 py-3 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Visualização em Cards"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleViewMode('list')}
              className={`flex items-center justify-center px-4 py-3 border-l border-gray-300 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Visualização em Lista"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
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
            {searchParams.favorites === 'true' 
              ? 'Meus Favoritos' 
              : searchParams.search 
                ? `Resultados para "${searchParams.search}"` 
                : 'Todos os Perfis'
            }
          </h2>
          <div className="text-sm text-gray-600">
            {accounts.length} {accounts.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}
          </div>
        </div>

        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {console.log('🎨 Renderizando cards:', accounts.length, 'contas')}
                {accounts.map((account) => (
                  <ProfileCard key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {console.log('📋 Renderizando lista:', accounts.length, 'contas')}
                {accounts.map((account) => (
                  <ProfileListItem key={account.id} account={account} />
                ))}
              </div>
            )}
          </>
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
