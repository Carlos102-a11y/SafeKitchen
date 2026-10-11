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
        maxWidth: "100%",

        minHeight: 26,

        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "5px 10px",

        boxSizing: "border-box",

        borderRadius: 999,

        background: variante.background,

        color: variante.color,

        fontSize: "calc(11px * var(--sk-text-scale, 1))",
        fontWeight: 750,
        lineHeight: 1.3,

        textAlign: "center",

        overflowWrap: "anywhere",
      }}
    >
      {children ?? text}
    </span>
  );
}