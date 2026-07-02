import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { colors } from "../styles/theme";

interface LayoutProps {
  title: string;
  children: ReactNode;
}

export default function Layout({
  title,
  children,
}: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.background,
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "35px",
        }}
      >
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: colors.title,
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              color: colors.textLight,
              marginTop: "8px",
            }}
          >
            Sistema de Gestão de Segurança e Saúde no Trabalho
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}