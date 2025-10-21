'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { UserIcon, PhoneIcon, AtSymbolIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  display_name: string | null
  phone: string | null
  bio: string | null
  instagram: string | null
  whatsapp: string | null
  website: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  // Carregar perfil quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('⚠️ Erro ao buscar perfil (criando perfil padrão):', error.message)
        
        // Se der erro 406, criar perfil padrão localmente
        const defaultProfile: UserProfile = {
          id: user.id,
          display_name: user.email?.split('@')[0] || 'Usuário',
          phone: null,
          bio: null,
          instagram: null,
          whatsapp: null,
          website: null,
          avatar_url: null
        }
        
        setProfile(defaultProfile)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      
      // Mesmo com erro, criar perfil padrão para permitir uso
      const defaultProfile: UserProfile = {
        id: user.id,
        display_name: user.email?.split('@')[0] || 'Usuário',
        phone: null,
        bio: null,
        instagram: null,
        whatsapp: null,
        website: null,
        avatar_url: null
      }
      
      setProfile(defaultProfile)
      setMessage({ type: 'error', text: 'Perfil carregado em modo offline. Aplique a migração 010 para salvar alterações.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile || !user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
          bio: profile.bio,
          instagram: profile.instagram,
          whatsapp: profile.whatsapp,
          website: profile.website,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Erro ao salvar:', error)
        setMessage({ 
          type: 'error', 
          text: 'Erro ao salvar perfil. Aplique a migração 010 do Supabase.' 
        })
      } else {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        // Limpar mensagem após 3 segundos
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage({ 
        type: 'error', 
        text: 'Erro ao salvar. Verifique se aplicou a migração 010.' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  // Mostrar loading enquanto carrega
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Erro ao carregar perfil. Tente recarregar a página.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Informações Básicas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Informações Básicas
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Exibição *
              </label>
              <input
                type="text"
                id="display_name"
                value={profile.display_name || ''}
                onChange={(e) => handleChange('display_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Como você quer ser chamado"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Este nome será exibido nas suas avaliações e comentários
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2" />
            Contato
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="whatsapp"
                  value={profile.whatsapp || ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="55 00 00000-0000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: código do país + DDD + número (ex: 55 11 99999-9999)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AtSymbolIcon className="h-5 w-5 mr-2" />
            Redes Sociais
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  id="instagram"
                  value={profile.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu_usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="website"
                  value={profile.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://seusite.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="border-t pt-6 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

