'use client'

import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UserGroupIcon, 
  TagIcon, 
  CogIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Minhas Contas', href: '/accounts', icon: UserGroupIcon },
]

const userNavigation = [
  { name: 'Meu Perfil', href: '/profile', icon: UserCircleIcon },
]

const publicNavigation = [
  { name: 'Página Inicial', href: '/', icon: GlobeAltIcon },
  { name: 'Explorar Perfis', href: '/profiles', icon: MagnifyingGlassIcon },
]

const adminNavigation = [
  { name: 'Categorias', href: '/categories', icon: TagIcon },
  { name: 'Todas as Contas', href: '/admin/accounts', icon: UserGroupIcon },
  { name: 'Usuários', href: '/admin/users', icon: UsersIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Efeito para redirecionamento quando não há usuário
  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true)
    }
  }, [loading, user])

  // Efeito para executar o redirecionamento
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login')
    }
  }, [shouldRedirect, router])

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('users_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      if (!error && profile) {
        setIsAdmin(profile.role === 'admin')
      } else if (error) {
        console.log('⚠️ Não foi possível carregar role (aplique a migração 010):', error.message)
        // Não é admin se não conseguir carregar
        setIsAdmin(false)
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err)
      setIsAdmin(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Aguardar um pouco mais se não há usuário mas há cookie de auth
  const hasAuthCookie = typeof window !== 'undefined' && 
    document.cookie.includes('sb-iotpchnaacvqsavqnszj-auth-token')
  
  if (!user && hasAuthCookie) {
    // Aguardar um pouco mais para o usuário ser carregado
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (shouldRedirect) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-indigo-600">Linstax</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
              
              {/* User Menu */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Conta
                </div>
              </div>
              {userNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
              
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administração
                    </div>
                  </div>
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      >
                        <item.icon className="mr-4 h-6 w-6" />
                        {item.name}
                      </Link>
                    )
                  })}
                </>
              )}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Site Público
                </div>
              </div>
              {publicNavigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-indigo-600">Linstax</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* User Menu */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Conta
                  </div>
                </div>
                {userNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
                
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administração
                      </div>
                    </div>
                    {adminNavigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`${
                            isActive
                              ? 'bg-indigo-100 text-indigo-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </>
                )}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Site Público
                  </div>
                </div>
                {publicNavigation.map((item) => {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}