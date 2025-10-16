import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = createClient()
  const user = await getUser()
  
  if (!user) return null
  
  try {
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return profile
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const profile = await getUserProfile()
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }
  
  return { user, profile }
}
