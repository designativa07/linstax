'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface Rating {
  id: string
  user_id: string
  account_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: {
    display_name?: string
  }
}

export interface RatingStats {
  average_rating: number
  total_ratings: number
  rating_5: number
  rating_4: number
  rating_3: number
  rating_2: number
  rating_1: number
}

// Cache global para estatísticas de avaliações por perfil
const ratingsStatsCache = new Map<string, RatingStats>()
const userRatingsCache = new Map<string, number>()

export function useRatings(accountId?: string) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Carregar estatísticas de avaliações de um perfil
  const loadStats = async (profileId: string) => {
    try {
      setLoading(true)

      // Verificar cache primeiro
      if (ratingsStatsCache.has(profileId)) {
        setStats(ratingsStatsCache.get(profileId)!)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .rpc('get_rating_stats', { account_uuid: profileId })
        .single()

      if (error) {
        console.error('Erro ao carregar estatísticas:', error.message)
        return
      }

      const statsData: RatingStats = {
        average_rating: Number(data.average_rating) || 0,
        total_ratings: data.total_ratings || 0,
        rating_5: data.rating_5 || 0,
        rating_4: data.rating_4 || 0,
        rating_3: data.rating_3 || 0,
        rating_2: data.rating_2 || 0,
        rating_1: data.rating_1 || 0,
      }

      ratingsStatsCache.set(profileId, statsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar avaliação do usuário atual para um perfil
  const loadUserRating = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUserRating(null)
        return
      }

      // Verificar cache
      const cacheKey = `${user.id}-${profileId}`
      if (userRatingsCache.has(cacheKey)) {
        setUserRating(userRatingsCache.get(cacheKey)!)
        return
      }

      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('account_id', profileId)
        .maybeSingle()

      if (error) {
        console.error('Erro ao carregar avaliação do usuário:', error.message)
        return
      }

      const rating = data?.rating || null
      userRatingsCache.set(cacheKey, rating)
      setUserRating(rating)
    } catch (error) {
      console.error('Erro ao carregar avaliação do usuário:', error)
    }
  }

  // Carregar todas as avaliações de um perfil (com informações dos usuários)
  const loadRatings = async (profileId: string, limit?: number) => {
    try {
      setLoading(true)

      let query = supabase
        .from('ratings')
        .select(`
          id,
          user_id,
          account_id,
          rating,
          comment,
          created_at,
          updated_at
        `)
        .eq('account_id', profileId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar avaliações:', error.message)
        return
      }

      // Buscar dados dos usuários para cada avaliação
      const ratingsWithUsers = await Promise.all(
        (data || []).map(async (rating) => {
          const { data: userData } = await supabase
            .from('users_profiles')
            .select('display_name')
            .eq('id', rating.user_id)
            .single()
          
          return {
            ...rating,
            user: {
              display_name: userData?.display_name || 'Usuário'
            }
          }
        })
      )

      setRatings(ratingsWithUsers)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submeter ou atualizar uma avaliação
  const submitRating = async (profileId: string, rating: number, comment?: string) => {
    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/profiles/' + profileId)
        return false
      }

      // Verificar se já existe uma avaliação
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', user.id)
        .eq('account_id', profileId)
        .maybeSingle()

      let result

      if (existingRating) {
        // Atualizar avaliação existente
        result = await supabase
          .from('ratings')
          .update({
            rating,
            comment: comment || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id)
      } else {
        // Criar nova avaliação
        result = await supabase
          .from('ratings')
          .insert({
            user_id: user.id,
            account_id: profileId,
            rating,
            comment: comment || null
          })
      }

      if (result.error) {
        console.error('Erro ao salvar avaliação:', result.error.message)
        return false
      }

      // Limpar caches
      ratingsStatsCache.delete(profileId)
      userRatingsCache.delete(`${user.id}-${profileId}`)

      // Recarregar dados
      await Promise.all([
        loadStats(profileId),
        loadUserRating(profileId),
        loadRatings(profileId)
      ])

      return true
    } catch (error) {
      console.error('Erro ao submeter avaliação:', error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Deletar avaliação
  const deleteRating = async (profileId: string) => {
    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('user_id', user.id)
        .eq('account_id', profileId)

      if (error) {
        console.error('Erro ao deletar avaliação:', error.message)
        return false
      }

      // Limpar caches
      ratingsStatsCache.delete(profileId)
      userRatingsCache.delete(`${user.id}-${profileId}`)

      // Recarregar dados
      await Promise.all([
        loadStats(profileId),
        loadUserRating(profileId),
        loadRatings(profileId)
      ])

      return true
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Carregar dados ao montar o componente (se accountId for fornecido)
  useEffect(() => {
    if (accountId) {
      loadStats(accountId)
      loadUserRating(accountId)
    }
  }, [accountId])

  return {
    ratings,
    stats,
    userRating,
    loading,
    submitting,
    loadStats,
    loadUserRating,
    loadRatings,
    submitRating,
    deleteRating,
  }
}

