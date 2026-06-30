'use client'
import { useState, useEffect } from 'react'

export function useUsername() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('checkit_username')
    if (stored) setUsername(stored)
  }, [])

  const saveUsername = (name: string) => {
    localStorage.setItem('checkit_username', name)
    setUsername(name)
  }

  return { username, saveUsername }
}
