import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import ButtonPrimary from "@/components/auth/ButtonPrimary";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Sesión cerrada correctamente");
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

  // Mock data for charts
  const activityData = [
    { date: "Lun", sesiones: 45 },
    { date: "Mar", sesiones: 52 },
    { date: "Mié", sesiones: 48 },
    { date: "Jue", sesiones: 61 },
    { date: "Vie", sesiones: 55 },
    { date: "Sáb", sesiones: 38 },
    { date: "Dom", sesiones: 42 },
  ];

  const revenueData = [
    { mes: "Ene", valor: 4200 },
    { mes: "Feb", valor: 3800 },
    { mes: "Mar", valor: 5100 },
    { mes: "Abr", valor: 4600 },
    { mes: "May", valor: 5400 },
    { mes: "Jun", valor: 6200 },
  ];

  const stats = [
    {
      title: "Total Usuarios",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Sesiones Activas",
      value: "342",
      change: "+8.2%",
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Tasa de Conversión",
      value: "24.8%",
      change: "+3.1%",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Ingresos Totales",
      value: "$32,450",
      change: "+18.7%",
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

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
          <ButtonPrimary
            onClick={handleLogout}
            variant="secondary"
            className="w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </ButtonPrimary>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-muted-foreground">
              Aquí está el resumen de tu actividad y estadísticas principales.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-full`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-success mt-1">
                    {stat.change} desde el último mes
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
                <CardDescription>Sesiones de usuario en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sesiones: {
                      label: "Sesiones",
                      color: "hsl(var(--accent))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sesiones"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
                <CardDescription>Evolución de ingresos en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    valor: {
                      label: "Ingresos",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="mes"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="valor"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
