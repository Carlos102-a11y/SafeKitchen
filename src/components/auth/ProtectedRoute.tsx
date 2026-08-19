import {
    Navigate,
    Outlet,
  } from "react-router-dom";
  
  import {
    ShieldCheck,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../../contexts/AuthContext";
  
  export default function ProtectedRoute() {
    const {
      user,
      loading,
    } = useAuth();
  
    if (loading) {
      return (
        <div
          style={{
            width: "100%",
            minHeight: "100vh",
  
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
  
            padding: 24,
  
            boxSizing: "border-box",
  
            background: "#F8FAFC",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
  
              alignItems: "center",
  
              gap: 14,
  
              color: "#64748B",
  
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
  
                display: "flex",
  
                alignItems: "center",
                justifyContent: "center",
  
                borderRadius: 16,
  
                background: "#EFF6FF",
  
                color: "#2563EB",
              }}
            >
              <ShieldCheck
                size={27}
              />
            </div>
  
            <div>
              <strong
                style={{
                  display: "block",
  
                  color: "#0F172A",
  
                  fontSize: 14,
                }}
              >
                SafeKitchen
              </strong>
  
              <span
                style={{
                  display: "block",
  
                  marginTop: 4,
  
                  fontSize: 12,
                }}
              >
                Verificando sua sessão...
              </span>
            </div>
          </div>
        </div>
      );
    }
  
    if (!user) {
      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  
    return <Outlet />;
  }