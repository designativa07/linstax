'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#DC2626'
]

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAccess()
    }
  }, [user])

  const checkAdminAccess = async () => {
    try {
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      const isAdminUser = profile?.role === 'admin'
      
      // Se não for admin, redirecionar para o dashboard
      if (!isAdminUser) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user?.id,
          name: formData.name.trim(),
          color: formData.color
        })

      if (error) throw error

      router.push('/categories')
    } catch (error) {
      console.error('Error creating category:', error)
      setError('Erro ao criar categoria. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Categoria</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie uma nova categoria para organizar suas contas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Categoria *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: Trabalho, Pessoal, Clientes..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor da Categoria *
          </label>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {colors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`w-12 h-12 rounded-full border-2 hover:border-gray-400 ${
                  formData.color === color ? 'border-gray-800' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm text-gray-600">{formData.color}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Categoria'}
          </button>
        </div>
      </form>
    </div>
  )
}
