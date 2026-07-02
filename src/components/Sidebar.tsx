import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  TriangleAlert,
  Ambulance,
  HardHat,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
} from "lucide-react";

import { colors } from "../styles/theme";

const menu = [
  {
    nome: "Dashboard",
    rota: "/",
    icon: LayoutDashboard,
  },
  {
    nome: "PGR",
    rota: "/pgr",
    icon: ShieldCheck,
  },
  {
    nome: "Gestão de Riscos",
    rota: "/riscos",
    icon: TriangleAlert,
  },
  {
    nome: "Acidentes",
    rota: "/acidentes",
    icon: Ambulance,
  },
  {
    nome: "EPIs",
    rota: "/epis",
    icon: HardHat,
  },
  {
    nome: "Checklists",
    rota: "/checklists",
    icon: ClipboardCheck,
  },
  {
    nome: "DDS",
    rota: "/dds",
    icon: BookOpen,
  },
  {
    nome: "Auditorias",
    rota: "/auditorias",
    icon: ClipboardList,
  },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "290px",
        background: colors.sidebar,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #1E293B",
      }}
    >
      <div>
        {/* Logo */}

        <div
          style={{
            padding: "30px",
            borderBottom: "1px solid #1E293B",
          }}
        >
          <h1
            style={{
              color: "#fff",
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            SafeKitchen
          </h1>

          <p
            style={{
              color: "#94A3B8",
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "14px",
            }}
          >
            Sistema de Gestão SST
          </p>
        </div>

        {/* Menu */}

        <div
          style={{
            padding: "18px",
          }}
        >
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.nome}
                to={item.rota}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",

                  padding: "14px 18px",

                  marginBottom: "8px",

                  textDecoration: "none",

                  color: isActive ? "#fff" : "#CBD5E1",

                  background: isActive
                    ? colors.primary
                    : "transparent",

                  borderRadius: "12px",

                  transition: ".2s",

                  fontWeight: 600,
                })}
              >
                <Icon size={20} />

                {item.nome}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Rodapé */}

      <div
        style={{
          padding: "22px",
          borderTop: "1px solid #1E293B",
        }}
      >
        <div
          style={{
            color: "#94A3B8",
            fontSize: "13px",
          }}
        >
          SafeKitchen
        </div>

        <div
          style={{
            color: "#64748B",
            marginTop: "5px",
            fontSize: "12px",
          }}
        >
          Versão 2.0 • NR-01 • PGR
        </div>
      </div>
    </aside>
  );
}