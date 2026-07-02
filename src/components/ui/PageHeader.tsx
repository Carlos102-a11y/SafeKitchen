import { ReactNode } from "react";
import { colors } from "../../styles/theme";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            color: colors.title,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: colors.textLight,
          }}
        >
          {subtitle}
        </p>
      </div>

      {action}
    </div>
  );
}