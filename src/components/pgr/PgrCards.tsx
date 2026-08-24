import StatCard from "../ui/StatCard";
import {
  ShieldCheck,
  TriangleAlert,
  ClipboardList,
  CircleCheck,
} from "lucide-react";

interface Props {
  total: number;
  criticos: number;
  andamento: number;
  concluidos: number;
}

export default function PgrCards({
  total,
  criticos,
  andamento,
  concluidos,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <StatCard
        title="Inventário"
        value={String(total)}
        color="#2563eb"
        icon={<ShieldCheck size={22} />}
      />

      <StatCard
        title="Riscos Críticos"
        value={String(criticos)}
        color="#dc2626"
        icon={<TriangleAlert size={22} />}
      />

      <StatCard
        title="Em andamento"
        value={String(andamento)}
        color="#f59e0b"
        icon={<ClipboardList size={22} />}
      />

      <StatCard
        title="Concluídos"
        value={String(concluidos)}
        color="#16a34a"
        icon={<CircleCheck size={22} />}
      />
    </div>
  );
}