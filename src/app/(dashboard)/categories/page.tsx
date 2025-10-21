'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#DC2626'
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAndFetchCategories()
    }
  }, [user])

  const checkAdminAndFetchCategories = async () => {
    try {
      // Verificar se é admin
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      const isAdminUser = profile?.role === 'admin'
      setIsAdmin(isAdminUser)
      
      // Se não for admin, redirecionar para o dashboard
      if (!isAdminUser) {
        router.push('/dashboard')
        return
      }
      
      await fetchCategories(isAdminUser)
    } catch (error) {
      console.error('Error checking admin:', error)
      // Se houver erro ao verificar admin, redirecionar para dashboard
      router.push('/dashboard')
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

  const deleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? As contas associadas ficarão sem categoria.')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setCategories(categories.filter(category => category.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Erro ao excluir categoria')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Gerencie todas as categorias do sistema' : 'Organize suas contas em categorias personalizadas'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/categories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Categoria
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar categorias
          </label>
          <input
            type="text"
            placeholder="Nome da categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {categories.length === 0 ? 'Nenhuma categoria criada ainda' : 'Nenhuma categoria encontrada'}
          </div>
          {categories.length === 0 && (
            <Link
              href="/categories/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar primeira categoria
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Criada em {new Date(category.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteCategory(category.id)}
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

      {/* Color Palette Reference */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paleta de Cores Disponível</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {colors.map((color, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
