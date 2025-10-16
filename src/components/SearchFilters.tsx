'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface SearchParams {
  search?: string
  type?: string
  category?: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface SearchFiltersProps {
  searchParams: SearchParams
  onSearch: (params: SearchParams) => void
  onClose: () => void
}

export default function SearchFilters({ searchParams, onSearch, onClose }: SearchFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Supabase categories error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Fetched categories:', data?.length || 0)
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Continue with empty categories array
      setCategories([])
    }
  }

  const handleFilterChange = (key: keyof SearchParams, value: string) => {
    const newParams = { ...searchParams, [key]: value }
    onSearch(newParams)
  }

  const clearFilters = () => {
    onSearch({})
  }

  const hasActiveFilters = searchParams.type || searchParams.category

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Perfil
          </label>
          <select
            value={searchParams.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="whatsapp_group">Grupo WhatsApp</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={searchParams.category || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchParams.type && searchParams.type !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Tipo: {searchParams.type === 'instagram' ? 'Instagram' : 
                       searchParams.type === 'whatsapp' ? 'WhatsApp' : 
                       'Grupo WhatsApp'}
                <button
                  onClick={() => handleFilterChange('type', 'all')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchParams.category && searchParams.category !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Categoria: {categories.find(c => c.id === searchParams.category)?.name}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
