'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Listeners para notificar todas as instâncias do hook sobre mudanças
type FavoritesListener = (favorites: Set<string>, loading: boolean) => void
const listeners = new Set<FavoritesListener>()

// Estado global compartilhado
let globalFavorites: Set<string> = new Set()
let globalLoading = false
let globalInitialized = false
let loadPromise: Promise<void> | null = null

// Função para notificar todos os ouvintes
const notifyListeners = () => {
  listeners.forEach(listener => listener(new Set(globalFavorites), globalLoading))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(globalFavorites))
  const [loading, setLoading] = useState(globalLoading)
  const supabase = createClient()
  const router = useRouter()

  // Registrar listener ao montar e desregistrar ao desmontar
  useEffect(() => {
    const listener: FavoritesListener = (newFavorites, newLoading) => {
      setFavorites(newFavorites)
      setLoading(newLoading)
    }
    
    listeners.add(listener)
    
    return () => {
      listeners.delete(listener)
    }
  }, [])

  // Carregar favoritos do Supabase
  const loadFavorites = async (forceReload = false) => {
    // Se já está carregando, aguardar a promise existente
    if (loadPromise && !forceReload) {
      return loadPromise
    }
    
    // Se já foi inicializado e não é força reload, retornar
    if (globalInitialized && !forceReload) {
      return
    }
    
    // Criar a promise de carregamento
    loadPromise = (async () => {
      if (!forceReload) {
        globalInitialized = true
      }

      try {
        globalLoading = true
        setLoading(true)
        notifyListeners()

        const { data: { user } } = await supabase.auth.getUser()
        
        // Para usuários não autenticados, limpar favoritos
        if (!user) {
          globalFavorites = new Set()
          setFavorites(new Set())
          globalLoading = false
          setLoading(false)
          notifyListeners()
          return
        }

        // Carregar do Supabase
        const { data, error } = await supabase
          .from('favorites')
          .select('account_id')
          .eq('user_id', user.id)

        if (error) {
          console.error('Erro ao carregar favoritos:', error.message)
          globalFavorites = new Set()
        } else {
          globalFavorites = new Set(data?.map(fav => fav.account_id) || [])
        }
        
        setFavorites(new Set(globalFavorites))
        globalLoading = false
        setLoading(false)
        notifyListeners()
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        globalFavorites = new Set()
        setFavorites(new Set())
        globalLoading = false
        setLoading(false)
        notifyListeners()
      } finally {
        loadPromise = null
      }
    })()
    
    return loadPromise
  }

  // Adicionar aos favoritos
  const addToFavorites = async (accountId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/profiles')
        return false
      }

      // Optimistic update - atualizar imediatamente
      const newFavorites = new Set([...globalFavorites, accountId])
      globalFavorites = newFavorites
      setFavorites(new Set(newFavorites))
      notifyListeners()

      // Salvar no Supabase em background
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          account_id: accountId
        })

      if (error) {
        console.error('Erro ao salvar favorito:', error.message)
        // Reverter em caso de erro
        globalFavorites.delete(accountId)
        setFavorites(new Set(globalFavorites))
        notifyListeners()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error)
      return false
    }
  }

  // Remover dos favoritos
  const removeFromFavorites = async (accountId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/profiles')
        return false
      }

      // Optimistic update - atualizar imediatamente
      const newFavorites = new Set(globalFavorites)
      newFavorites.delete(accountId)
      globalFavorites = newFavorites
      setFavorites(new Set(newFavorites))
      notifyListeners()

      // Remover do Supabase em background
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('account_id', accountId)

      if (error) {
        console.error('Erro ao remover favorito:', error.message)
        // Reverter em caso de erro
        globalFavorites.add(accountId)
        setFavorites(new Set(globalFavorites))
        notifyListeners()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      return false
    }
  }

  // Alternar favorito
  const toggleFavorite = async (accountId: string) => {
    if (globalFavorites.has(accountId)) {
      return await removeFromFavorites(accountId)
    } else {
      return await addToFavorites(accountId)
    }
  }

  // Verificar se é favorito
  const isFavorite = (accountId: string) => {
    return globalFavorites.has(accountId)
  }

  // Carregar favoritos na inicialização
  useEffect(() => {
    loadFavorites()
  }, [])

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites: () => loadFavorites(true)
  }
}
