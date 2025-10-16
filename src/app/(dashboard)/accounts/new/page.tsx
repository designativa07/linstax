'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  color: string
}

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function NewAccountPage() {
  const [formData, setFormData] = useState({
    type: 'instagram' as 'instagram' | 'whatsapp' | 'whatsapp_group',
    name: '',
    username: '',
    phone: '',
    description: '',
    embed_code: '',
    group_link: '',
    category_ids: [] as string[]
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      setLoading(false)
      return
    }

    if (formData.type === 'instagram' && !formData.username.trim()) {
      setError('Username é obrigatório para contas do Instagram')
      setLoading(false)
      return
    }

    if (formData.type === 'whatsapp' && !formData.phone.trim()) {
      setError('Telefone é obrigatório para contas do WhatsApp')
      setLoading(false)
      return
    }

    if (formData.type === 'whatsapp_group' && !formData.description.trim()) {
      setError('Descrição é obrigatória para grupos do WhatsApp')
      setLoading(false)
      return
    }

    try {
      // Criar a conta
      const { data: accountData, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user?.id,
          type: formData.type,
          name: formData.name.trim(),
          username: formData.username.trim() || null,
          phone: formData.phone.trim() || null,
          description: formData.description.trim() || null,
          embed_code: formData.embed_code.trim() || null,
          group_link: formData.group_link.trim() || null
        })
        .select()
        .single()

      if (error) throw error

      // Inserir categorias relacionadas
      if (formData.category_ids && formData.category_ids.length > 0) {
        const categoryInserts = formData.category_ids.map(categoryId => ({
          account_id: accountData.id,
          category_id: categoryId
        }))

        const { error: categoriesError } = await supabase
          .from('accounts_categories')
          .insert(categoryInserts)

        if (categoriesError) throw categoriesError
      }

      router.push('/accounts')
    } catch (error) {
      console.error('Error creating account:', error)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category_ids: checked 
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter(id => id !== categoryId)
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
        <h1 className="text-2xl font-bold text-gray-900">Nova Conta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Adicione uma nova conta de Instagram, WhatsApp ou grupo
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
            Tipo de Conta *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="whatsapp_group">Grupo WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nome da conta"
            required
          />
        </div>

        {formData.type === 'instagram' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="@username"
              required
            />
          </div>
        )}

        {formData.type === 'whatsapp' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+55 11 99999-9999"
              required
            />
          </div>
        )}

        {formData.type === 'whatsapp_group' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descrição do grupo"
              required
            />
          </div>
        )}

        {formData.type === 'whatsapp_group' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Grupo WhatsApp
            </label>
            <input
              type="url"
              name="group_link"
              value={formData.group_link}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://chat.whatsapp.com/..."
            />
            <p className="mt-1 text-xs text-gray-500">
              💡 Cole aqui o link de convite do grupo WhatsApp (opcional)
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categorias
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma categoria criada ainda</p>
            ) : (
              categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Selecione uma ou mais categorias para organizar sua conta
          </p>
        </div>

        {(formData.type === 'instagram' || formData.type === 'whatsapp') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descrição opcional"
            />
          </div>
        )}

        {formData.type === 'instagram' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Embed do Post Específico
            </label>
            <textarea
              name="embed_code"
              value={formData.embed_code}
              onChange={handleInputChange}
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Cole aqui o código HTML do embed do Instagram (opcional)"
            />
            <p className="mt-1 text-xs text-gray-500">
              💡 Para obter o código: vá ao post no Instagram → três pontos (...) → "Incorporar" → copie o código HTML
            </p>
          </div>
        )}

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
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </div>
      </form>
    </div>
  )
}
