import {
    ShieldCheck,
    TriangleAlert,
    ClipboardList,
  } from "lucide-react";
  
  import StatCard from "../ui/StatCard";
  
  interface Props {
    total: number;
    criticos: number;
    andamento: number;
    concluidos: number;
  }
  
  export default function PgrStats({
    total,
    criticos,
    andamento,
    concluidos,
  }: Props) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(230px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Inventário"
          value={total}
          icon={<ShieldCheck size={22} />}
          color="#2563eb"
        />
  
        <StatCard
          title="Riscos Críticos"
          value={criticos}
          icon={<TriangleAlert size={22} />}
          color="#dc2626"
        />
  
        <StatCard
          title="Em andamento"
          value={andamento}
          icon={<ClipboardList size={22} />}
          color="#f59e0b"
        />
  
        <StatCard
          title="Concluídos"
          value={concluidos}
          icon={<ShieldCheck size={22} />}
          color="#16a34a"
        />
      </div>
    );
  }