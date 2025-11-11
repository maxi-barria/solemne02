import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant: "info" | "success" | "error" | "warning";
  children: ReactNode;
  onClose?: () => void;
}

const Alert = ({ variant, children, onClose }: AlertProps) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
  };

  const Icon = icons[variant];

  const styles = {
    info: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border text-sm",
        styles[variant]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-smooth"
          aria-label="Cerrar alerta"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
