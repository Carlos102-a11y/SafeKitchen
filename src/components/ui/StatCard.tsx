import { ReactNode } from "react";
import { colors, shadow, radius } from "../../styles/theme";

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
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius,
        boxShadow: shadow,
        padding: "22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <span
          style={{
            color: colors.textLight,
            fontSize: "14px",
          }}
        >
          {title}
        </span>

        <h2
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: colors.title,
            fontSize: "34px",
          }}
        >
          {value}
        </h2>
      </div>

      <div
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "14px",
          background: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
      >
        {icon}
      </div>
    </div>
  );
}