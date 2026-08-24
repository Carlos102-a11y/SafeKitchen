import type { ReactNode } from "react";

interface BadgeProps {
  children?: ReactNode;
  text?: string;
  color?: string;
}

const variantes: Record<
  string,
  {
    background: string;
    color: string;
  }
> = {
  red: {
    background: "#FEE2E2",
    color: "#B91C1C",
  },

  orange: {
    background: "#FFEDD5",
    color: "#C2410C",
  },

  yellow: {
    background: "#FEF3C7",
    color: "#92400E",
  },

  green: {
    background: "#DCFCE7",
    color: "#166534",
  },

  blue: {
    background: "#DBEAFE",
    color: "#1D4ED8",
  },

  gray: {
    background: "#F1F5F9",
    color: "#475569",
  },
};

export default function Badge({
  children,
  text,
  color = "gray",
}: BadgeProps) {
  const variante =
    variantes[color] ?? {
      background: color,
      color: "#FFFFFF",
    };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 11px",
        borderRadius: "999px",
        background: variante.background,
        color: variante.color,
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children ?? text}
    </span>
  );
}