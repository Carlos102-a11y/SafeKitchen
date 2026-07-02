import { ReactNode } from "react";
import { colors, shadow, radius } from "../../styles/theme";

interface SectionProps {
  title?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function Section({
  title,
  children,
  style,
}: SectionProps) {
  return (
    <section
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius,
        boxShadow: shadow,
        padding: "24px",
        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: colors.title,
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}