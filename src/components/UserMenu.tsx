'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

export default function UserMenu() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Carregar nome do usuário
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('users_profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (data?.display_name) {
        setDisplayName(data.display_name)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const getDisplayName = () => {
    if (displayName) return displayName
    if (user?.email) return user.email.split('@')[0]
    return 'Usuário'
  }

  // Se não estiver logado, mostrar botões de login/cadastro
  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link 
          href="/login" 
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Entrar
        </Link>
        <Link 
          href="/register" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Cadastrar
        </Link>
      </div>
    )
  }

  // Se estiver logado, mostrar menu de usuário
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
          {getInitials(displayName)}
        </div>
        <span className="hidden md:block max-w-[150px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-3 text-gray-400" />
                Dashboard
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                Meu Perfil
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

