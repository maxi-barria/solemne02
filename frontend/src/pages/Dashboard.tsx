import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "../components/icons";
import ButtonPrimary from "../components/auth/ButtonPrimary";
import { apiGet } from "../api";
import { clearToken, getToken, getUserEmailFromToken } from "../auth";

type Metric = { name: string; value: number };
type MetricsRes = { metrics: Metric[] };

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Al cargar, verifica login, toma el email del JWT y carga métricas
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    setUserEmail(getUserEmailFromToken());

    async function fetchMetrics() {
      try {
        const data = await apiGet<MetricsRes>("/dashboard/metrics");
        setMetrics(data.metrics);
      } catch (e: any) {
        setError("No se pudieron cargar las métricas");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    alert("Sesión cerrada correctamente");
    navigate("/");
  };

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <div className="bg-success/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              ¡Bienvenido{userEmail ? `, ${userEmail}` : ""} a tu Dashboard!
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tus métricas de entrenamiento más recientes se muestran a continuación:
            </p>

            {error && <p className="text-red-600">{error}</p>}

            {metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {metrics.map((m) => (
                  <div
                    key={m.name}
                    className="p-5 border rounded-2xl shadow-md bg-white hover:shadow-lg transition"
                  >
                    <h2 className="text-lg font-semibold text-gray-700">{m.name}</h2>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{m.value}</p>
                  </div>
                ))}
              </div>
            )}

            {!metrics && !error && (
              <p className="text-muted-foreground">No hay métricas disponibles.</p>
            )}

            <div className="bg-muted/50 border border-border rounded-lg p-4 mt-6">
              <p className="text-sm text-muted-foreground mb-2">Token JWT almacenado:</p>
              <code className="text-xs bg-background px-3 py-2 rounded border border-border inline-block max-w-full overflow-x-auto">
                {getToken()}
              </code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
