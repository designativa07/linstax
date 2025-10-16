'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
        
        // Se não há usuário mas há cookie, tentar novamente após um delay
        if (!user && typeof window !== 'undefined' && 
            document.cookie.includes('sb-iotpchnaacvqsavqnszj-auth-token')) {
          setTimeout(async () => {
            const { data: { user: retryUser } } = await supabase.auth.getUser()
            if (retryUser) {
              setUser(retryUser)
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}
