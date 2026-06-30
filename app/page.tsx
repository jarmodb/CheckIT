'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, LISTS_TABLE, type List } from '@/lib/supabase'
import { useUsername } from '@/hooks/useUsername'
import NameModal from '@/components/NameModal'

export default function Home() {
  const { username, saveUsername } = useUsername()
  const [lists, setLists] = useState<List[]>([])
  const [newListName, setNewListName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLists()
  }, [])

  async function fetchLists() {
    const { data } = await supabase.from(LISTS_TABLE).select('*').order('created_at', { ascending: false })
    setLists(data ?? [])
    setLoading(false)
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault()
    if (!newListName.trim()) return
    const { data } = await supabase.from(LISTS_TABLE).insert({ name: newListName.trim() }).select().single()
    if (data) {
      setLists(prev => [data, ...prev])
      setNewListName('')
    }
  }

  return (
    <>
      {!username && <NameModal onSave={saveUsername} />}
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Checkit</h1>
          <p className="text-gray-500 text-sm mb-8">Share a list link with your team — no account needed.</p>

          <form onSubmit={createList} className="flex gap-2 mb-8">
            <input
              type="text"
              placeholder="New list name (e.g. Show 14/07)"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newListName.trim()}
              className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Create
            </button>
          </form>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : lists.length === 0 ? (
            <p className="text-gray-400 text-sm">No lists yet. Create one above.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lists.map(list => (
                <li key={list.id}>
                  <Link
                    href={`/list/${list.id}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{list.name}</span>
                    <span className="text-gray-400 text-xs">{new Date(list.created_at).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
