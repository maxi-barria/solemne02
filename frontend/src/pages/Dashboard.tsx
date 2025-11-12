// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "../components/icons";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import { clearToken, getToken, getUserEmailFromToken } from "../auth";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type TrainingItem = {
  _id: string;
  type: "Cardio" | "Fuerza" | string;
  hours: number;
  date: string; // YYYY-MM-DD
};

type SummaryRow = { type: string; hours: number };

type SummaryResponse = {
  month: { year: number; month: number; summary: SummaryRow[] };
  week: { year: number; week: number; summary: SummaryRow[] };
};

type ListRes = { items: TrainingItem[] };

type MonthRow = {
  year: number;
  month: number;
  summary: { type: string; hours: number }[];
};

export default function Dashboard() {
  const navigate = useNavigate();

  type Tab = "resumen" | "agregar" | "lista";
  const [tab, setTab] = useState<Tab>("resumen");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos resumen actual y lista
  const [monthData, setMonthData] = useState<SummaryRow[]>([]);
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [period, setPeriod] = useState<{ year: number; month: number } | null>(null);

  // Datos “por mes” (últimos 6)
  const [monthsChart, setMonthsChart] = useState<any[]>([]);

  // Form "Agregar"
  const [mType, setMType] = useState("");
  const [mHours, setMHours] = useState<number | "">("");
  const [mDate, setMDate] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    setUserEmail(getUserEmailFromToken());

    loadAll().finally(() => setLoading(false));
  }, [navigate]);

  async function loadAll() {
    try {
      // Resumen del MES actual (para gráfico izquierdo)
      const s = await apiGet<SummaryResponse>("/metrics/summary-current-month");
      setMonthData(s?.month?.summary ?? []);
      setPeriod({
        year: s?.month?.year ?? new Date().getFullYear(),
        month: s?.month?.month ?? new Date().getMonth() + 1,
      });

      // Lista
      const l = await apiGet<ListRes>("/metrics");
      setItems(l?.items ?? []);

      // Resumen por MES (últimos 6) → gráfico derecho
      const m = await apiGet<{ months: MonthRow[] }>(`/metrics/summary-by-month?limit=6`);
      setMonthsChart(toMonthsChart(m.months ?? []));
    } catch (e: any) {
      console.error("Error al cargar dashboard:", e);
      setError("No se pudieron cargar los datos.");
    }
  }

  async function reloadMetrics() {
    try {
      const l = await apiGet<ListRes>("/metrics");
      setItems(l?.items ?? []);
      const s = await apiGet<SummaryResponse>("/metrics/summary-current-month");
      setMonthData(s?.month?.summary ?? []);
      const m = await apiGet<{ months: MonthRow[] }>(`/metrics/summary-by-month?limit=6`);
      setMonthsChart(toMonthsChart(m.months ?? []));
    } catch (e) {
      console.error("Error recargando métricas:", e);
    }
  }

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  async function handleAddMetric(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!mType || mHours === "" || isNaN(Number(mHours))) {
      setError("Completa tipo y horas válidas");
      return;
    }

    try {
      await apiPost("/metrics", { type: mType, hours: Number(mHours), date: mDate });
      await reloadMetrics();

      // limpia form
      setMType("");
      setMHours("");
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setMDate(`${d.getFullYear()}-${mm}-${dd}`);

      alert("Entrenamiento agregado ✅");
      setTab("resumen");
    } catch (err: any) {
      console.error("Error al guardar entrenamiento:", err);
      setError(err?.message || "Error al guardar entrenamiento");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border border-red-300 rounded-xl p-6 shadow text-center">
          <h2 className="text-xl font-bold mb-2 text-red-600">Error en Dashboard</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Dashboard {userEmail ? `— ${userEmail}` : ""}
            </h1>
          </div>
          <ButtonPrimary onClick={handleLogout} variant="secondary" className="w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </ButtonPrimary>
        </div>
      </header>

      {/* Tabs */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("resumen")}
              className={`px-4 py-2 rounded-lg border ${tab === "resumen" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              Resumen
            </button>
            <button
              onClick={() => setTab("agregar")}
              className={`px-4 py-2 rounded-lg border ${tab === "agregar" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              Agregar entrenamiento
            </button>
            <button
              onClick={() => setTab("lista")}
              className={`px-4 py-2 rounded-lg border ${tab === "lista" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              Ver lista
            </button>
          </div>

          {/* RESUMEN */}
          {tab === "resumen" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-center mb-2">Resumen de entrenamiento</h2>
              {period && (
                <p className="text-center text-gray-600">
                  {`Mes ${period.month}/${period.year}`}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Horas del MES actual por tipo */}
                <div className="bg-white border rounded-xl p-4 shadow">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">
                    Horas entrenadas este mes
                  </h3>
                  {monthData?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center">Sin registros este mes</p>
                  )}
                </div>

                {/* Horas por MES (últimos 6), agrupado por tipo */}
                <div className="bg-white border rounded-xl p-4 shadow">
                  <h3 className="text-lg font-semibold mb-3 text-emerald-700">
                    Horas por mes (últimos 6)
                  </h3>
                  {monthsChart?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthsChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        {/* dos barras agrupadas por mes */}
                        <Bar dataKey="Cardio" fill="#10b981" />
                        <Bar dataKey="Fuerza" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center">Sin datos en los últimos meses</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AGREGAR */}
          {tab === "agregar" && (
            <form
              onSubmit={handleAddMetric}
              className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-xl mx-auto"
            >
              <h2 className="text-xl font-semibold mb-2">Nuevo entrenamiento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={mType}
                    onChange={(e) => setMType(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Fuerza">Fuerza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Horas</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: 1.5"
                    value={mHours}
                    onChange={(e) => setMHours(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <ButtonPrimary type="submit">Guardar entrenamiento</ButtonPrimary>
              </div>
            </form>
          )}

          {/* LISTA */}
          {tab === "lista" && (
            <div className="bg-white border rounded-xl p-4">
              {items?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Horas</th>
                        <th className="py-2 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <MetricRow
                          key={it._id}
                          item={it}
                          onUpdated={reloadMetrics}
                          onDeleted={reloadMetrics}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Aún no hay registros.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Transforma /metrics/summary-by-month a datos para Recharts (agrupado por tipo) */
function toMonthsChart(months: MonthRow[]) {
  // vienen ordenados del más nuevo al más antiguo → invertimos para ver de izq→der
  const arr = [...months].reverse();
  return arr.map((m) => {
    const label = `${String(m.month).padStart(2, "0")}/${m.year}`;
    const base: any = { label, Cardio: 0, Fuerza: 0 };
    for (const s of m.summary) {
      if (s.type === "Cardio") base.Cardio = s.hours;
      else if (s.type === "Fuerza") base.Fuerza = s.hours;
    }
    return base;
  });
}

/** Fila editable con PUT/DELETE reales */
function MetricRow({
  item,
  onUpdated,
  onDeleted,
}: {
  item: TrainingItem;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(item.type);
  const [hours, setHours] = useState<string>(String(item.hours));
  const [date, setDate] = useState(item.date);

  async function saveEdit() {
    const num = parseFloat(hours);
    if (!type || isNaN(num)) {
      alert("Completa tipo y horas válidas");
      return;
    }
    try {
      await apiPut(`/metrics/${item._id}`, { type, hours: num, date });
      alert("Métrica actualizada ✅");
      setEditing(false);
      onUpdated();
    } catch (e: any) {
      alert("Error al actualizar: " + (e?.message || "desconocido"));
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta métrica?")) return;
    try {
      await apiDelete(`/metrics/${item._id}`);
      alert("Métrica eliminada 🗑️");
      onDeleted();
    } catch (e: any) {
      alert("Error al eliminar: " + (e?.message || "desconocido"));
    }
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      {editing ? (
        <>
          <td className="py-2 px-3">
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </td>
          <td className="py-2 px-3">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Cardio">Cardio</option>
              <option value="Fuerza">Fuerza</option>
            </select>
          </td>
          <td className="py-2 px-3">
            <input
              type="number"
              step="0.1"
              className="border rounded px-2 py-1 text-sm w-24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </td>
          <td className="py-2 px-3 text-center space-x-2">
            <button onClick={saveEdit} className="px-3 py-1 bg-green-600 text-white rounded text-xs">
              Guardar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setType(item.type);
                setHours(String(item.hours));
                setDate(item.date);
              }}
              className="px-3 py-1 bg-gray-400 text-white rounded text-xs"
            >
              Cancelar
            </button>
          </td>
        </>
      ) : (
        <>
          <td className="py-2 px-3">{item.date}</td>
          <td className="py-2 px-3">{item.type}</td>
          <td className="py-2 px-3">{item.hours}</td>
          <td className="py-2 px-3 text-center space-x-2">
            <button onClick={() => setEditing(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
              Editar
            </button>
            <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded text-xs">
              Eliminar
            </button>
          </td>
        </>
      )}
    </tr>
  );
}
