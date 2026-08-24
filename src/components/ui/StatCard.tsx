import type { ReactNode } from "react";

import {
  colors,
  shadow,
  radius,
} from "../../styles/theme";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div
      style={{
        position: "relative",

        minHeight: 132,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        gap: 24,

        padding: "22px 22px 22px 24px",

        background: colors.surface,

        border: `1px solid ${colors.border}`,
        borderRadius: radius,

        boxShadow: shadow,

        overflow: "hidden",
      }}
    >
      {/* CONTEÚDO */}
      <div
        style={{
          flex: 1,
          minWidth: 0,

          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            display: "block",

            marginBottom: 10,

            color: colors.textLight,

            fontSize: 13,
            fontWeight: 600,

            lineHeight: 1.4,

            maxWidth: 170,
          }}
        >
          {title}
        </span>

        <strong
          style={{
            margin: 0,

            color: colors.title,

            fontSize: 32,
            fontWeight: 800,

            lineHeight: 1,
          }}
        >
          {value}
        </strong>
      </div>

      {/* ÍCONE */}
      <div
        style={{
          width: 52,
          height: 52,

          minWidth: 52,
          flexShrink: 0,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          borderRadius: 14,

          background: color,

          color: "#FFFFFF",

          boxShadow: `0 8px 18px ${color}30`,
        }}
      >
        {icon}
      </div>
    </div>
  );
}