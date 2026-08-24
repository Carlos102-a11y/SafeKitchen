interface RiskBadgeProps {
    classificacao: string;
  }
  
  export default function RiskBadge({
    classificacao,
  }: RiskBadgeProps) {
    let background = "#dcfce7";
    let color = "#166534";
  
    switch (classificacao) {
      case "Médio":
        background = "#fef3c7";
        color = "#92400e";
        break;
  
      case "Alto":
        background = "#fed7aa";
        color = "#c2410c";
        break;
  
      case "Crítico":
        background = "#fee2e2";
        color = "#b91c1c";
        break;
    }
  
    return (
      <span
        style={{
          background,
          color,
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "80px",
        }}
      >
        {classificacao}
      </span>
    );
  }