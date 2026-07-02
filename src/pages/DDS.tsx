import { useEffect, useState } from "react";

interface DDS {
  id: number;
  data: string;
  tema: string;
  responsavel: string;
  participantes: number;
  observacoes: string;
}

export default function DDS() {
  const [dds, setDds] = useState<DDS[]>(() => {
    const dados = localStorage.getItem("dds");
    return dados ? JSON.parse(dados) : [];
  });

  const [novoDDS, setNovoDDS] = useState({
    data: new Date().toISOString().split("T")[0],
    tema: "",
    responsavel: "",
    participantes: 0,
    observacoes: "",
  });

  useEffect(() => {
    localStorage.setItem("dds", JSON.stringify(dds));
  }, [dds]);

  function adicionarDDS() {
    if (!novoDDS.tema || !novoDDS.responsavel) return;

    setDds([
      ...dds,
      {
        id: Date.now(),
        ...novoDDS,
      },
    ]);

    setNovoDDS({
      data: new Date().toISOString().split("T")[0],
      tema: "",
      responsavel: "",
      participantes: 0,
      observacoes: "",
    });
  }

  function excluirDDS(id: number) {
    setDds(dds.filter((d) => d.id !== id));
  }

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
          fontSize: "42px",
          color: "#0f172a",
          marginBottom: "30px",
        }}
      >
        📚 DDS
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        <h2>Novo DDS</h2>

        <input
          type="date"
          value={novoDDS.data}
          onChange={(e) =>
            setNovoDDS({
              ...novoDDS,
              data: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Tema"
          value={novoDDS.tema}
          onChange={(e) =>
            setNovoDDS({
              ...novoDDS,
              tema: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Responsável"
          value={novoDDS.responsavel}
          onChange={(e) =>
            setNovoDDS({
              ...novoDDS,
              responsavel: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Participantes"
          value={novoDDS.participantes}
          onChange={(e) =>
            setNovoDDS({
              ...novoDDS,
              participantes: Number(e.target.value),
            })
          }
          style={inputStyle}
        />

        <textarea
          placeholder="Observações"
          value={novoDDS.observacoes}
          onChange={(e) =>
            setNovoDDS({
              ...novoDDS,
              observacoes: e.target.value,
            })
          }
          style={{
            ...inputStyle,
            height: "120px",
          }}
        />

        <button
          onClick={adicionarDDS}
          style={botaoAzul}
        >
          Adicionar DDS
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
        <h2>DDS Cadastrados</h2>

        {dds.map((item) => (
          <div
            key={item.id}
            style={{
              borderBottom: "1px solid #e2e8f0",
              padding: "15px 0",
            }}
          >
            <h3>{item.tema}</h3>

            <p>
              <strong>Responsável:</strong>{" "}
              {item.responsavel}
            </p>

            <p>
              <strong>Participantes:</strong>{" "}
              {item.participantes}
            </p>

            <button
              onClick={() =>
                excluirDDS(item.id)
              }
              style={botaoVermelho}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box" as const,
};

const botaoAzul = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  cursor: "pointer",
};

const botaoVermelho = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};