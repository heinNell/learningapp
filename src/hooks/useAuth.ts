import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  userName?: string
  userRole: 'ADMIN' | 'USER'
  createdAt: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Helper to transform Supabase user to your User type
  const transformUser = useCallback(async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null

    // Fetch user profile/role from your users table if needed
    const { data: profile } = await supabase
      .from('users')
      .select('user_name, user_role')
      .eq('id', supabaseUser.id)
      .single()

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      userName: profile?.user_name || supabaseUser.user_metadata?.user_name,
      userRole: profile?.user_role || 'USER',
      createdAt: supabaseUser.created_at
    }
  }, [])

  useEffect(() => {
    // Check existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const transformedUser = await transformUser(session.user)
          setUser(transformedUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const transformedUser = await transformUser(session.user)
          setUser(transformedUser)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [transformUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // User state will be updated via onAuthStateChange callback
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userName?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: userName
          }
        }
      })

      if (error) throw error

      // Create user profile in users table
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          user_name: userName,
          user_role: 'USER'
        })
      }

      return data
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // User state will be updated via onAuthStateChange callback
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    userRole: user?.userRole,
    signIn,
    signInWithGoogle,
    signUp,
    signOut
  }
}