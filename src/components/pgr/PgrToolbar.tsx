import { Search, Plus } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

interface Props {
  pesquisa: string;
  onPesquisar: (texto: string) => void;
  onNovo: () => void;
}

export default function PgrToolbar({
  pesquisa,
  onPesquisar,
  onNovo,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        marginBottom: 25,
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 450,
        }}
      >
        <Input
          placeholder="Pesquisar por setor, atividade ou perigo..."
          value={pesquisa}
          onChange={(e) =>
            onPesquisar(e.target.value)
          }
          icon={<Search size={18} />}
        />
      </div>

      <Button onClick={onNovo}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plus size={18} />
          Novo Risco
        </div>
      </Button>
    </div>
  );
}