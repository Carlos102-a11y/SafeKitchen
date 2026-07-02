import { useEffect, useState } from "react";

interface Checklist {
  id: number;
  data: string;
  epis: boolean;
  piso: boolean;
  extintor: boolean;
  exaustao: boolean;
  iluminacao: boolean;
  facas: boolean;
  quimicos: boolean;
  emergencia: boolean;
}

export default function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[]>(() => {
    const dados = localStorage.getItem("checklists");
    return dados ? JSON.parse(dados) : [];
  });

  const [novo, setNovo] = useState<Checklist>({
    id: Date.now(),
    data: new Date().toISOString().split("T")[0],
    epis: false,
    piso: false,
    extintor: false,
    exaustao: false,
    iluminacao: false,
    facas: false,
    quimicos: false,
    emergencia: false,
  });

  useEffect(() => {
    localStorage.setItem(
      "checklists",
      JSON.stringify(checklists)
    );
  }, [checklists]);

  function salvarChecklist() {
    setChecklists([
      ...checklists,
      {
        ...novo,
        id: Date.now(),
      },
    ]);
  }

  function excluirChecklist(id: number) {
    setChecklists(
      checklists.filter((c) => c.id !== id)
    );
  }

  const itens = [
    ["epis", "Uso correto de EPIs"],
    ["piso", "Piso limpo e seco"],
    ["extintor", "Extintor acessível"],
    ["exaustao", "Exaustão funcionando"],
    ["iluminacao", "Iluminação adequada"],
    ["facas", "Facas armazenadas corretamente"],
    ["quimicos", "Produtos químicos identificados"],
    ["emergencia", "Saídas de emergência livres"],
  ];

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          color: "#0f172a",
          fontSize: "42px",
          fontWeight: "800",
          marginBottom: "30px",
        }}
      >
        📋 Checklists
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            color: "#0f172a",
            marginBottom: "25px",
          }}
        >
          Inspeção Diária da Cozinha
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(350px,1fr))",
            gap: "15px",
          }}
        >
          {itens.map(([campo, texto]) => (
            <label
              key={campo}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#334155",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                checked={(novo as any)[campo]}
                onChange={(e) =>
                  setNovo({
                    ...novo,
                    [campo]: e.target.checked,
                  })
                }
                style={{
                  width: "18px",
                  height: "18px",
                }}
              />

              {texto}
            </label>
          ))}
        </div>

        <button
          onClick={salvarChecklist}
          style={{
            marginTop: "25px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "14px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Salvar Inspeção
        </button>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            color: "#0f172a",
            marginBottom: "20px",
          }}
        >
          Inspeções Realizadas
        </h2>

        {checklists.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Nenhuma inspeção cadastrada.
          </p>
        ) : (
          checklists.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <strong>{item.data}</strong>

              <button
                onClick={() =>
                  excluirChecklist(item.id)
                }
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}