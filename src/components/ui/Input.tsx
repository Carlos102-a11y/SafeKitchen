import type { ChangeEvent } from "react";
import type { ReactNode } from "react";

interface InputProps {
  label?: string;

  placeholder?: string;

  value: string | number;

  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;

  type?: string;

  icon?: ReactNode;

  disabled?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  disabled = false,
}: InputProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        marginBottom: 18,
      }}
    >
      {label && (
        <label
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#334155",
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,

          background: "#fff",

          border: "1px solid #CBD5E1",

          borderRadius: 12,

          padding: "12px 14px",

          transition: ".2s",
        }}
      >
        {icon && (
          <div
            style={{
              color: "#64748B",
              display: "flex",
            }}
          >
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            flex: 1,

            border: "none",

            outline: "none",

            background: "transparent",

            fontSize: 15,

            color: "#0F172A",
          }}
        />
      </div>
    </div>
  );
}