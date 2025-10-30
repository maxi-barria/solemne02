import React from 'react'
import { useState } from 'react'

function Login() {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const j = await r.json()
    if (j.access_token) localStorage.setItem('token', j.access_token)
    alert(j.access_token ? 'Login OK' : (j.error ?? 'Error'))
  }
  return (
    <form className="max-w-sm mx-auto mt-24 space-y-3" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <input className="border p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="bg-black text-white px-4 py-2 rounded">Entrar</button>
    </form>
  )
}

function Dashboard() {
  const [data,setData] = useState<any[]>([])
  const load = async () => {
    const token = localStorage.getItem('token')
    const r = await fetch('/api/dashboard/metrics',{headers:{Authorization:`Bearer ${token}`}})
    const j = await r.json()
    setData(j.metrics ?? [])
  }
  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button className="border px-3 py-1" onClick={load}>Cargar métricas</button>
      <ul className="list-disc pl-6">
        {data.map((m,i)=><li key={i}>{m.name}: {m.value}</li>)}
      </ul>
    </div>
  )
}

export default function App(){
  return (
    <div className="p-6">
      <Login />
      <hr className="my-10"/>
      <Dashboard />
    </div>
  )
}
