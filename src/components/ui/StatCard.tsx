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

        width: "100%",
        minWidth: 0,
        minHeight: 132,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        gap: 16,

        padding: "21px 20px 21px 23px",

        boxSizing: "border-box",

        background: colors.surface,

        border: `1px solid ${colors.border}`,
        borderRadius: radius,

        boxShadow: shadow,

        overflow: "hidden",
      }}
    >
      {/* DESTAQUE LATERAL */}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",

          top: 18,
          bottom: 18,
          left: 0,

          width: 4,

          borderRadius: "0 6px 6px 0",

          background: color,
        }}
      />

      {/* CONTEÚDO */}

      <div
        style={{
          flex: "1 1 auto",

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

            fontSize: "calc(13px * var(--sk-text-scale, 1))",
            fontWeight: 650,
            lineHeight: 1.4,

            overflowWrap: "anywhere",
          }}
        >
          {title}
        </span>

        <strong
          style={{
            display: "block",

            minWidth: 0,

            margin: 0,

            color: colors.title,

            fontSize:
              "clamp(25px, 2.2vw, 32px)",

            fontWeight: 800,

            lineHeight: 1.05,

            letterSpacing: "-0.5px",

            overflowWrap: "anywhere",
          }}
        >
          {value}
        </strong>
      </div>

      {/* ÍCONE */}

      <div
        style={{
          width: 50,
          height: 50,

          minWidth: 50,

          flexShrink: 0,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          borderRadius: 14,

          background: color,

          color: "#FFFFFF",

          boxShadow:
            `0 8px 18px ${color}30`,
        }}
      >
        {icon}
      </div>
    </div>
  );
}