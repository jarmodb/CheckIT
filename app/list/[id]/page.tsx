'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase, LISTS_TABLE, ITEMS_TABLE, type Item, type List } from '@/lib/supabase'
import { useUsername } from '@/hooks/useUsername'
import NameModal from '@/components/NameModal'

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { username, saveUsername } = useUsername()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [newHeadNumber, setNewHeadNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchList()
    fetchItems()

    const channel = supabase
      .channel(`list-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: ITEMS_TABLE, filter: `list_id=eq.${id}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setItems(prev => [...prev, payload.new as Item])
        } else if (payload.eventType === 'UPDATE') {
          setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new as Item : item))
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(item => item.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function fetchList() {
    const { data } = await supabase.from(LISTS_TABLE).select('*').eq('id', id).single()
    setList(data)
  }

  async function fetchItems() {
    const { data } = await supabase.from(ITEMS_TABLE).select('*').eq('list_id', id).order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemText.trim() || !username) return
    await supabase.from(ITEMS_TABLE).insert({
      list_id: id,
      text: newItemText.trim(),
      head_number: newHeadNumber.trim() || null,
      created_by: username,
    })
    setNewItemText('')
    setNewHeadNumber('')
  }

  async function toggleItem(item: Item) {
    if (!username) return
    if (item.completed) {
      await supabase.from(ITEMS_TABLE).update({ completed: false, completed_by: null, completed_at: null }).eq('id', item.id)
    } else {
      await supabase.from(ITEMS_TABLE).update({ completed: true, completed_by: username, completed_at: new Date().toISOString() }).eq('id', item.id)
    }
  }

  async function deleteItem(itemId: string) {
    await supabase.from(ITEMS_TABLE).delete().eq('id', itemId)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pending = items.filter(i => !i.completed)
  const done = items.filter(i => i.completed)

  return (
    <>
      {!username && <NameModal onSave={saveUsername} />}
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-xl mx-auto px-4 py-12">
<div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{list?.name ?? '...'}</h1>
              {username && <p className="text-gray-400 text-xs mt-1">Logged in as <span className="font-medium text-gray-600 dark:text-gray-300">{username}</span></p>}
            </div>
            <button
              onClick={copyLink}
              className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors text-gray-600 dark:text-gray-300"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <form onSubmit={addItem} className="flex flex-col gap-2 mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Head number (optional)"
                value={newHeadNumber}
                onChange={e => setNewHeadNumber(e.target.value)}
                className="w-36 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Describe the issue..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newItemText.trim()}
                className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </form>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm">No items yet. Add one above.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {pending.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {pending.map(item => (
                    <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                  ))}
                </ul>
              )}

              {done.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Done</p>
                  <ul className="flex flex-col gap-2">
                    {done.map(item => (
                      <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function ItemRow({ item, onToggle, onDelete }: { item: Item; onToggle: (i: Item) => void; onDelete: (id: string) => void }) {
  return (
    <li className="flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 group">
      <button
        onClick={() => onToggle(item)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
      >
        {item.completed && (
          <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          {item.head_number && (
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded flex-shrink-0">
              #{item.head_number}
            </span>
          )}
          <p className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{item.text}</p>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Added by <span className="font-medium">{item.created_by}</span>
          {item.completed && item.completed_by && (
            <> · Checked by <span className="font-medium">{item.completed_by}</span></>
          )}
        </p>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-all text-lg leading-none"
        aria-label="Delete item"
      >
        ×
      </button>
    </li>
  )
}
