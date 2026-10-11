import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  colors,
} from "../../styles/theme";

interface ButtonProps {
  children: ReactNode;

  onClick?: () => void;

  color?: string;

  type?: "button" | "submit";

  disabled?: boolean;

  title?: string;
}

export default function Button({
  children,
  onClick,
  color = colors.primary,
  type = "button",
  disabled = false,
  title,
}: ButtonProps) {
  const [
    hover,
    setHover,
  ] = useState(false);

  const [
    foco,
    setFoco,
  ] = useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() =>
        setHover(true)
      }
      onMouseLeave={() =>
        setHover(false)
      }
      onFocus={() =>
        setFoco(true)
      }
      onBlur={() =>
        setFoco(false)
      }
      style={{
        minHeight: 44,

        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        gap: 8,

        padding:
          "11px 20px",

        boxSizing:
          "border-box",

        border: "none",

        borderRadius: 11,

        background: color,

        color: "#FFFFFF",

        fontFamily: "inherit",

        fontSize: "calc(13px * var(--sk-text-scale, 1))",
        fontWeight: 700,
        lineHeight: 1.2,

        textAlign: "center",

        whiteSpace: "normal",

        cursor: disabled
          ? "not-allowed"
          : "pointer",

        opacity: disabled
          ? 0.58
          : 1,

        transform:
          hover &&
          !disabled
            ? "translateY(-1px)"
            : "translateY(0)",

        filter:
          hover &&
          !disabled
            ? "brightness(.94)"
            : "none",

        boxShadow:
          foco &&
          !disabled
            ? `0 0 0 4px ${color}25`
            : hover &&
                !disabled
              ? `0 7px 18px ${color}28`
              : "none",

        transition:
          "transform .18s ease, filter .18s ease, box-shadow .18s ease, opacity .18s ease",
      }}
    >
      {children}
    </button>
  );
}