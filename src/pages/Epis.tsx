import { useState, useEffect } from "react";

interface Epi {
  id: number;
  nome: string;
  ca: string;
  quantidade: number;
  validade: string;
}

export default function Epis() {
  const [epis, setEpis] = useState<Epi[]>(() => {
    const dados = localStorage.getItem("epis");

    return dados
      ? JSON.parse(dados)
      : [
          {
            id: 1,
            nome: "Luva Térmica",
            ca: "12345",
            quantidade: 20,
            validade: "2027-12-31",
          },
        ];
  });

  const [nome, setNome] = useState("");
  const [ca, setCa] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [validade, setValidade] = useState("");

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<number | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem(
      "epis",
      JSON.stringify(epis)
    );
  }, [epis]);

  function adicionarEpi() {
    if (!nome.trim()) return;

    if (editando) {
      setEpis(
        epis.map((epi) =>
          epi.id === editando
            ? {
                ...epi,
                nome,
                ca,
                quantidade,
                validade,
              }
            : epi
        )
      );

      setEditando(null);
    } else {
      const novoEpi: Epi = {
        id: Date.now(),
        nome,
        ca,
        quantidade,
        validade,
      };

      setEpis([...epis, novoEpi]);
    }

    setNome("");
    setCa("");
    setQuantidade(1);
    setValidade("");
  }

  function excluirEpi(id: number) {
    setEpis(
      epis.filter((epi) => epi.id !== id)
    );
  }

  function editarEpi(epi: Epi) {
    setNome(epi.nome);
    setCa(epi.ca);
    setQuantidade(epi.quantidade);
    setValidade(epi.validade);

    setEditando(epi.id);
  }

  const episFiltrados = epis.filter((epi) =>
    epi.nome
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const estoqueBaixo = epis.filter(
    (epi) => epi.quantidade < 5
  ).length;

  return (
    <div
      style={{
        padding: "40px",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          color: "#0f172a",
          fontSize: "38px",
          marginBottom: "25px",
          fontWeight: "700",
        }}
      >
        🦺 Gestão de EPIs
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <Card
          titulo="Total de EPIs"
          valor={epis.length}
          cor="#2563eb"
        />

        <Card
          titulo="Quantidade Total"
          valor={epis.reduce(
            (acc, item) =>
              acc + item.quantidade,
            0
          )}
          cor="#16a34a"
        />

        <Card
          titulo="Estoque Baixo"
          valor={estoqueBaixo}
          cor="#dc2626"
        />
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          {editando
            ? "✏️ Editar EPI"
            : "➕ Novo EPI"}
        </h2>

        <input
          placeholder="Nome do EPI"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Número CA"
          value={ca}
          onChange={(e) =>
            setCa(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) =>
            setQuantidade(
              Number(e.target.value)
            )
          }
          style={inputStyle}
        />

        <input
          type="date"
          value={validade}
          onChange={(e) =>
            setValidade(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={adicionarEpi}
          style={botaoSalvar}
        >
          {editando
            ? "Salvar Alterações"
            : "Adicionar EPI"}
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2>EPIs Cadastrados</h2>

        <input
          placeholder="🔍 Pesquisar EPI..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          style={inputStyle}
        />

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>CA</th>
              <th style={thStyle}>Quantidade</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Validade</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {episFiltrados.map((epi) => (
              <tr
                key={epi.id}
                style={{
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <td style={tdStyle}>
                  {epi.nome}
                </td>

                <td style={tdStyle}>
                  {epi.ca}
                </td>

                <td style={tdStyle}>
                  {epi.quantidade}
                </td>

                <td style={tdStyle}>
                  {epi.quantidade < 5 ? (
                    <span
                      style={{
                        color: "#dc2626",
                        fontWeight: "bold",
                      }}
                    >
                      🔴 Estoque Baixo
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                      }}
                    >
                      🟢 OK
                    </span>
                  )}
                </td>

                <td style={tdStyle}>
                  {epi.validade}
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() =>
                      editarEpi(epi)
                    }
                    style={botaoEditar}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      excluirEpi(epi.id)
                    }
                    style={botaoExcluir}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {episFiltrados.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "25px",
              color: "#64748b",
            }}
          >
            Nenhum EPI encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: number;
  cor: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "20px",
        boxShadow:
          "0 8px 25px rgba(0,0,0,.08)",
        borderLeft: `5px solid ${cor}`,
      }}
    >
      <h3
        style={{
          color: "#64748b",
          marginBottom: "10px",
        }}
      >
        {titulo}
      </h3>

      <h1
        style={{
          color: cor,
          fontSize: "42px",
          margin: 0,
        }}
      >
        {valor}
      </h1>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#111827",
  marginBottom: "12px",
  boxSizing: "border-box" as const,
};

const thStyle = {
  textAlign: "left" as const,
  padding: "14px",
  background: "#f8fafc",
  color: "#334155",
};

const tdStyle = {
  padding: "14px",
};

const botaoSalvar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px 22px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botaoEditar = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "8px",
};

const botaoExcluir = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};