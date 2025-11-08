import { useState } from 'react'

export default function Dashboard() {
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
