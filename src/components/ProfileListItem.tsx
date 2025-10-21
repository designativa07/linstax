'use client'

import { 
  UserIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  TagIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useUser } from '@/lib/hooks/useUser'
import { useRatings } from '@/lib/hooks/useRatings'
import { useState } from 'react'
import RatingStars from './RatingStars'

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

interface ProfileListItemProps {
  account: Account
}

export default function ProfileListItem({ account }: ProfileListItemProps) {
  const { isFavorite, toggleFavorite, loading: favoritesLoading } = useFavorites()
  const { user } = useUser()
  const { stats, loading: ratingsLoading } = useRatings(account.id)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleFavorite = async () => {
    setIsToggling(true)
    try {
      const success = await toggleFavorite(account.id)
      if (!success) {
        console.log('Redirecionando para login...')
      }
    } finally {
      setIsToggling(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
      case 'whatsapp':
        return (
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">WA</span>
          </div>
        )
      case 'whatsapp_group':
        return (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
        )
      default:
        return <UserIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />
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

  const handleContactClick = () => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        {getTypeIcon(account.type)}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{account.name}</h3>
              <p className="text-sm text-gray-600">{getTypeLabel(account.type)}</p>
            </div>
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling || favoritesLoading}
              className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
                favoritesLoading
                  ? 'text-gray-300'
                  : user 
                    ? (isFavorite(account.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-red-500')
                    : 'text-gray-300 hover:text-gray-400'
              } ${(isToggling || favoritesLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={favoritesLoading ? 'Carregando...' : (user ? (isFavorite(account.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos') : 'Faça login para favoritar')}
            >
              <svg 
                className="w-5 h-5" 
                fill={!favoritesLoading && user && isFavorite(account.id) ? 'currentColor' : 'none'} 
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
            </button>
          </div>

          {/* Description */}
          {account.description && (
            <p className="text-gray-700 text-sm mb-2 line-clamp-1">
              {account.description}
            </p>
          )}

          {/* Contact Info & Categories */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            {account.username && (
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                @{account.username}
              </div>
            )}
            {account.phone && (
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                {account.phone}
              </div>
            )}
            {account.categories && account.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {account.categories.map((category) => (
                  <span 
                    key={category.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${category.color}20`,
                      color: category.color
                    }}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          {!ratingsLoading && stats && stats.total_ratings > 0 && (
            <div className="flex items-center">
              <RatingStars 
                rating={stats.average_rating}
                totalRatings={stats.total_ratings}
                size="sm"
                showCount={true}
              />
            </div>
          )}
          {!ratingsLoading && (!stats || stats.total_ratings === 0) && (
            <div className="flex items-center text-xs text-gray-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>Sem avaliações</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href={`/profiles/${account.id}`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center text-sm"
          >
            <EyeIcon className="h-4 w-4 mr-1.5" />
            Ver Detalhes
          </Link>
          
          <button
            onClick={handleContactClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center text-sm"
          >
            {account.type === 'instagram' ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
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

