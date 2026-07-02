import { useEffect, useState } from "react";

interface Auditoria {
  id: number;
  data: string;
  auditor: string;
  setor: string;
  conformidade: number;
  observacoes: string;
}

export default function Auditorias() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>(() => {
    const dados = localStorage.getItem("auditorias");
    return dados ? JSON.parse(dados) : [];
  });

  const [nova, setNova] = useState({
    data: new Date().toISOString().split("T")[0],
    auditor: "",
    setor: "Cozinha Industrial",
    conformidade: 100,
    observacoes: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "auditorias",
      JSON.stringify(auditorias)
    );
  }, [auditorias]);

  function adicionarAuditoria() {
    if (!nova.auditor.trim()) return;

    setAuditorias([
      ...auditorias,
      {
        id: Date.now(),
        ...nova,
      },
    ]);

    setNova({
      data: new Date().toISOString().split("T")[0],
      auditor: "",
      setor: "Cozinha Industrial",
      conformidade: 100,
      observacoes: "",
    });
  }

  function excluir(id: number) {
    setAuditorias(
      auditorias.filter((a) => a.id !== id)
    );
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
          fontWeight: "800",
          color: "#0f172a",
          marginBottom: "30px",
        }}
      >
        📊 Auditorias
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        <h2>Nova Auditoria</h2>

        <input
          type="date"
          value={nova.data}
          onChange={(e) =>
            setNova({
              ...nova,
              data: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Nome do Auditor"
          value={nova.auditor}
          onChange={(e) =>
            setNova({
              ...nova,
              auditor: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          placeholder="Setor"
          value={nova.setor}
          onChange={(e) =>
            setNova({
              ...nova,
              setor: e.target.value,
            })
          }
          style={inputStyle}
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Conformidade"
          value={nova.conformidade}
          onChange={(e) =>
            setNova({
              ...nova,
              conformidade: Number(e.target.value),
            })
          }
          style={inputStyle}
        />

        <textarea
          placeholder="Observações"
          value={nova.observacoes}
          onChange={(e) =>
            setNova({
              ...nova,
              observacoes: e.target.value,
            })
          }
          style={{
            ...inputStyle,
            height: "120px",
          }}
        />

        <button
          onClick={adicionarAuditoria}
          style={botaoAzul}
        >
          Registrar Auditoria
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
        <h2>Auditorias Registradas</h2>

        {auditorias.map((item) => (
          <div
            key={item.id}
            style={{
              borderBottom: "1px solid #e2e8f0",
              padding: "15px 0",
            }}
          >
            <h3>{item.setor}</h3>

            <p>
              <strong>Auditor:</strong> {item.auditor}
            </p>

            <p>
              <strong>Conformidade:</strong>{" "}
              {item.conformidade}%
            </p>

            <button
              onClick={() => excluir(item.id)}
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