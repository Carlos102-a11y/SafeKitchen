import { colors } from "../../styles/theme";

interface BadgeProps {
  text: string;
  color: string;
}

export default function Badge({
  text,
  color,
}: BadgeProps) {
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}