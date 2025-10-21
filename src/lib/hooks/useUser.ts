'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (isMounted) {
          setUser(user)
          setLoading(false)
        }
        
        // Se não há usuário mas há cookie, tentar novamente após um delay
        if (!user && typeof window !== 'undefined' && 
            document.cookie.includes('sb-iotpchnaacvqsavqnszj-auth-token')) {
          setTimeout(async () => {
            const { data: { user: retryUser } } = await supabase.auth.getUser()
            if (retryUser && isMounted) {
              setUser(retryUser)
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading }
}
