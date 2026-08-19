import type { ReactNode } from "react";
import { colors } from "../../styles/theme";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  type?: "button" | "submit";
}

export default function Button({
  children,
  onClick,
  color = colors.primary,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: color,
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "13px 22px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "15px",
        transition: ".2s",
      }}
    >
      {children}
    </button>
  );
}