'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(initialState)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>()
      return data
    },
    [supabase]
  )

  useEffect(() => {
    // Chargement initial
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setState({ user: null, profile: null, isAdmin: false, isLoading: false })
        return
      }

      const profile = await fetchProfile(user.id)
      setState({
        user,
        profile,
        isAdmin: profile?.role === 'admin',
        isLoading: false,
      })
    }

    init()

    // Écouter les changements de session en temps réel
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setState({ user: null, profile: null, isAdmin: false, isLoading: false })
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const profile = await fetchProfile(session.user.id)
        setState({
          user: session.user,
          profile,
          isAdmin: profile?.role === 'admin',
          isLoading: false,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return state
}

/**
 * Hook simple pour vérifier si l'utilisateur est connecté
 */
export function useUser() {
  const { user, profile, isAdmin, isLoading } = useAuth()
  return { user, profile, isAdmin, isLoading }
}
