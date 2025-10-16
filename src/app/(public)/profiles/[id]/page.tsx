'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  UserIcon, 
  PhoneIcon, 
  CalendarIcon,
  TagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import InstagramEmbed from '@/components/InstagramEmbed'
import InstagramEmbedPost from '@/components/InstagramEmbedPost'

interface Account {
  id: string
  type: 'instagram' | 'whatsapp' | 'whatsapp_group'
  name: string
  username?: string
  phone?: string
  description?: string
  embed_code?: string
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

export default function ProfileDetailPage() {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchAccount(params.id as string)
    }
  }, [params.id])

  const fetchAccount = async (id: string) => {
    try {
      setLoading(true)
      const { data: accountData, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase account error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      if (!accountData) {
        throw new Error('Account not found')
      }

      // Type assertion to fix TypeScript issues
      const account = accountData as any

      // Fetch related data separately
      const { data: userData } = await supabase
        .from('users_profiles')
        .select('id, display_name')
        .eq('id', account.user_id)
        .single()

      const { data: categoriesData } = await supabase
        .from('accounts_categories')
        .select(`
          categories (
            id,
            name,
            color
          )
        `)
        .eq('account_id', id)

      const categories = categoriesData?.map((ac: any) => ac.categories).filter(Boolean) || []

      const enrichedAccount = {
        ...account,
        user: userData || { id: account.user_id, display_name: null },
        categories: categories
      }
      
      console.log('Fetched account:', enrichedAccount)
      setAccount(enrichedAccount)
    } catch (error) {
      console.error('Error fetching account:', error)
      setError('Perfil não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return (
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">IG</span>
          </div>
        )
      case 'whatsapp':
        return (
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">WA</span>
          </div>
        )
      case 'whatsapp_group':
        return (
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
          </div>
        )
      default:
        return <UserIcon className="h-16 w-16 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'instagram': return 'Instagram'
      case 'whatsapp': return 'WhatsApp'
      case 'whatsapp_group': return 'Grupo WhatsApp'
      default: return 'Perfil'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleContactClick = () => {
    if (!account) return

    if (account.type === 'instagram' && account.username) {
      window.open(`https://instagram.com/${account.username}`, '_blank')
    } else if (account.type === 'whatsapp' && account.phone) {
      const cleanPhone = account.phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    } else if (account.type === 'whatsapp_group' && account.phone) {
      const cleanPhone = account.phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-gray-400 mb-4">
          <UserIcon className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Perfil não encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          O perfil que você está procurando não existe ou foi removido.
        </p>
        <Link 
          href="/profiles"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar para perfis
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back Button */}
      <Link 
        href="/profiles"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Voltar para perfis
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {getTypeIcon(account.type)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{account.name}</h1>
                <p className="text-lg text-gray-600">{getTypeLabel(account.type)}</p>
                {account.categories && account.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {account.categories.map((category) => (
                      <span 
                        key={category.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${category.color}20`,
                          color: category.color
                        }}
                      >
                        <TagIcon className="h-4 w-4 mr-1" />
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          {account.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre</h3>
              <p className="text-gray-700 leading-relaxed">
                {account.description}
              </p>
            </div>
          )}

          {/* Instagram Profile */}
          {account.type === 'instagram' && account.username && (
            <div>           
              {/* Layout lado a lado para desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Post Destacado */}
                {account.embed_code && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                      <h4 className="text-md font-semibold text-gray-800">Post Destacado</h4>
                    </div>
                    <div className="p-1">
                      <InstagramEmbedPost embedCode={account.embed_code} />
                    </div>
                  </div>
                )}

                {/* Perfil Completo */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <h4 className="text-md font-semibold text-gray-800 p-4 border-b">Perfil Completo @{account.username}</h4>
                  
                  {/* Instagram Profile Embed */}
                  <div className="p-1 max-h-200 overflow-hidden">
                    <InstagramEmbed username={account.username} />
                  </div>

                  {/* Link direto */}
                  <div className="p-4 bg-gray-50 border-t">
                    <a
                      href={`https://www.instagram.com/${account.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center w-full justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Ver @{account.username} no Instagram
                    </a>
                  </div>
                </div>
              </div>

              {/* Instrução para Admin */}
              {!account.embed_code && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">💡 Para Administradores:</h5>
                  <p className="text-sm text-blue-800">
                    Para incorporar posts específicos deste perfil, acesse o painel admin e adicione o código HTML do embed do Instagram no campo "Embed Code".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações de Contato</h3>
            <div className="space-y-3">
              {account.username && (
                <div className="flex items-center text-gray-700">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium">@</span>
                  <span className="ml-1">{account.username}</span>
                </div>
              )}
              
              {account.phone && (
                <div className="flex items-center text-gray-700">
                  <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{account.phone}</span>
                </div>
              )}

              {account.group_link && (
                <div className="flex items-center text-gray-700">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <a 
                    href={account.group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Entrar no Grupo WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-6">
            <div className="flex items-center text-sm text-gray-500 space-x-6">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>Cadastrado em {formatDate(account.created_at)}</span>
              </div>
              {account.user.display_name && (
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>por {account.user.display_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleContactClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {account.type === 'instagram' ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Ver no Instagram
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contatar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
