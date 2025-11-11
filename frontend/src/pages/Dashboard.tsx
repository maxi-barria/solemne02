import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Users, TrendingUp, Activity, BarChart3 } from "../components/icons";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import Alert from "../components/auth/Alert";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<Record<string, number> | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [seriesActivity, setSeriesActivity] = useState<Array<{date:string; value:number}>|null>(null);
  const [seriesRevenue, setSeriesRevenue] = useState<Array<{mes:string; valor:number}>|null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    // Fetch dashboard metrics from backend
    (async () => {
      try {
        const res = await fetch('/api/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          // Try to parse JSON error body first, fall back to plain text
          let errMsg = `Error ${res.status}`;
          try {
            const j = await res.json();
            errMsg = j?.error || j?.msg || j?.message || JSON.stringify(j) || errMsg;
          } catch (e) {
            const txt = await res.text().catch(() => "");
            if (txt) errMsg = txt;
          }
          setFetchError(errMsg);
          setIsLoading(false);
          return;
        }
        const j = await res.json();
        // j.metrics is expected to be an array of {name, value}
        const map: Record<string, number> = {};
        (j.metrics || []).forEach((m: any) => { if (m && m.name) map[m.name] = Number(m.value || 0); });
        setMetricsData(map);
        // series: activity and revenue (optional)
        if (j.series) {
          if (j.series.activity) setSeriesActivity(j.series.activity.map((x: any) => ({ date: x.date, value: Number(x.value) })));
          if (j.series.revenue) setSeriesRevenue(j.series.revenue.map((x: any) => ({ mes: x.mes, valor: Number(x.valor) })));
        }
      } catch (err: any) {
        setFetchError(err.message || 'Error fetching metrics');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Sesión cerrada correctamente");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mock data for stats and charts
  const stats = [
    { title: "Total Usuarios", value: "2,543", change: "+12.5%", Icon: Users, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { title: "Sesiones Activas", value: "342", change: "+8.2%", Icon: Activity, colorClass: "text-accent", bgClass: "bg-accent/10" },
    { title: "Tasa de Conversión", value: "24.8%", change: "+3.1%", Icon: TrendingUp, colorClass: "text-success", bgClass: "bg-success/10" },
    { title: "Ingresos Totales", value: "$32,450", change: "+18.7%", Icon: BarChart3, colorClass: "text-accent", bgClass: "bg-accent/10" },
  ];

  const activityData = [45, 52, 48, 61, 55, 38, 42];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Panel de Estadísticas</h1>
          </div>
          <ButtonPrimary onClick={handleLogout} variant="secondary" className="w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </ButtonPrimary>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">¡Bienvenido de vuelta!</h2>
            <p className="text-muted-foreground">Aquí está el resumen de tu actividad y estadísticas principales.</p>
          </div>

          {fetchError && (
            <div className="max-w-3xl">
              <Alert variant="error">Error al cargar métricas: {fetchError}</Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              // override values from metricsData when available
              const overridden = (() => {
                if (!metricsData) return null;
                if (s.title === 'Total Usuarios' && metricsData['usuarios_totales'] != null) return String(metricsData['usuarios_totales']);
                if (s.title === 'Ingresos Totales' && metricsData['ingresos_totales'] != null) return `$${metricsData['ingresos_totales']}`;
                return null;
              })();
              const displayValue = overridden ?? s.value;
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{s.title}</div>
                      <div className="text-2xl font-bold text-foreground">{displayValue}</div>
                      <div className="text-xs text-success mt-1">{s.change} desde el último mes</div>
                    </div>
                    <div className={`${s.bgClass} p-2 rounded-full`}>
                      <s.Icon className={`w-5 h-5 ${s.colorClass}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium">Actividad Semanal</h3>
              <p className="text-xs text-muted-foreground mb-3">Sesiones en los últimos 7 días</p>
                  <div className="h-40 w-full flex items-end gap-2">
                    {(seriesActivity || activityData.map((v,i)=>({date:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"][i], value:v}))).map((d, idx) => (
                      <div key={idx} className="flex-1">
                        <div className="bg-accent rounded-t-md" style={{ height: `${(d.value / 70) * 100}%` }} />
                        <div className="text-xs text-muted-foreground text-center mt-1">{d.date}</div>
                      </div>
                    ))}
                  </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium">Ingresos Mensuales</h3>
              <p className="text-xs text-muted-foreground mb-3">Evolución de ingresos últimos 6 meses</p>
              <div className="h-40 w-full flex items-end gap-2">
                {(seriesRevenue || [4200,3800,5100,4600,5400,6200].map((v,i)=>({mes:["Ene","Feb","Mar","Abr","May","Jun"][i], valor:v}))).map((d, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="bg-primary rounded-t-md" style={{ height: `${(d.valor / 7000) * 100}%` }} />
                    <div className="text-xs text-muted-foreground text-center mt-1">{d.mes}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
