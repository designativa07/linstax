'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/profiles" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Linstax</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/profiles" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Explorar Perfis
              </Link>
              <Link 
                href="/profiles?type=instagram" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Instagram
              </Link>
              <Link 
                href="/profiles?type=whatsapp" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                WhatsApp
              </Link>
              <Link 
                href="/profiles?type=whatsapp_group" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Grupos
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/profiles" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorar Perfis
              </Link>
              <Link 
                href="/profiles?type=instagram" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Instagram
              </Link>
              <Link 
                href="/profiles?type=whatsapp" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                WhatsApp
              </Link>
              <Link 
                href="/profiles?type=whatsapp_group" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Grupos
              </Link>
              <div className="border-t pt-3 mt-3">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base font-medium mx-3 mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Instagram Embed Script */}
      <script async src="//www.instagram.com/embed.js"></script>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">L</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Linstax</span>
              </div>
              <p className="text-gray-600 text-sm">
                Descubra e conecte-se com perfis interessantes do Instagram e WhatsApp.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Navegação</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/profiles" className="text-gray-600 hover:text-blue-600 text-sm">
                    Explorar Perfis
                  </Link>
                </li>
                <li>
                  <Link href="/profiles?type=instagram" className="text-gray-600 hover:text-blue-600 text-sm">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="/profiles?type=whatsapp" className="text-gray-600 hover:text-blue-600 text-sm">
                    WhatsApp
                  </Link>
                </li>
                <li>
                  <Link href="/profiles?type=whatsapp_group" className="text-gray-600 hover:text-blue-600 text-sm">
                    Grupos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Conta</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 text-sm">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-600 hover:text-blue-600 text-sm">
                    Cadastrar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Linstax. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
