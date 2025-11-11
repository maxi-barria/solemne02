import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "../components/icons";
import ButtonPrimary from "../components/auth/ButtonPrimary";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
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
            <h2 className="text-2xl font-bold text-foreground">¡Bienvenido a tu Dashboard!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Has iniciado sesión correctamente. Tu token JWT está almacenado de forma segura en localStorage.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mt-6">
              <p className="text-sm text-muted-foreground mb-2">Token JWT almacenado:</p>
              <code className="text-xs bg-background px-3 py-2 rounded border border-border inline-block max-w-full overflow-x-auto">
                {localStorage.getItem("token")}
              </code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
