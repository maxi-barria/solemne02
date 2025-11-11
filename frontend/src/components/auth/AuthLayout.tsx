import { ReactNode } from "react";
import { LockKeyhole } from "../icons";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-xl border border-border p-8 space-y-6">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <LockKeyhole className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
