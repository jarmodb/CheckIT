'use client'
import { useState } from 'react'

export default function NameModal({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) onSave(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to Checkit</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your name so others know who added or checked off items.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
