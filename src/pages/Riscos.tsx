import { useEffect, useState } from "react";

interface Risco {
  id: number;
  descricao: string;
  categoria: string;
  nivel: string;
}

export default function Riscos() {
  const [riscos, setRiscos] = useState<Risco[]>(() => {
    const dados = localStorage.getItem("riscos");
    return dados ? JSON.parse(dados) : [];
  });

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Físico");
  const [nivel, setNivel] = useState("Baixo");

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroNivel, setFiltroNivel] = useState("Todos");

  const [editando, setEditando] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "riscos",
      JSON.stringify(riscos)
    );
  }, [riscos]);

  function adicionarRisco() {
    if (!descricao.trim()) return;

    if (editando) {
      setRiscos(
        riscos.map((r) =>
          r.id === editando
            ? {
                ...r,
                descricao,
                categoria,
                nivel,
              }
            : r
        )
      );

      setEditando(null);
    } else {
      const novo = {
        id: Date.now(),
        descricao,
        categoria,
        nivel,
      };

      setRiscos([...riscos, novo]);
    }

    setDescricao("");
    setCategoria("Físico");
    setNivel("Baixo");
  }

  function excluir(id: number) {
    setRiscos(
      riscos.filter((r) => r.id !== id)
    );
  }

  function editar(risco: Risco) {
    setDescricao(risco.descricao);
    setCategoria(risco.categoria);
    setNivel(risco.nivel);
    setEditando(risco.id);
  }

  const riscosFiltrados = riscos.filter(
    (risco) =>
      risco.descricao
        .toLowerCase()
        .includes(busca.toLowerCase()) &&
      (filtroCategoria === "Todos" ||
        risco.categoria === filtroCategoria) &&
      (filtroNivel === "Todos" ||
        risco.nivel === filtroNivel)
  );

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "40px",
          color: "#0f172a",
          marginBottom: "25px",
        }}
      >
        ⚠️ Gestão de Riscos
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2>
          {editando
            ? "Editar Risco"
            : "Novo Risco"}
        </h2>

        <input
          type="text"
          placeholder="Descrição do risco"
          value={descricao}
          onChange={(e) =>
            setDescricao(e.target.value)
          }
          style={inputStyle}
        />

        <select
          value={categoria}
          onChange={(e) =>
            setCategoria(e.target.value)
          }
          style={inputStyle}
        >
          <option>Físico</option>
          <option>Químico</option>
          <option>Biológico</option>
          <option>Ergonômico</option>
          <option>Acidente</option>
        </select>

        <select
          value={nivel}
          onChange={(e) =>
            setNivel(e.target.value)
          }
          style={inputStyle}
        >
          <option>Baixo</option>
          <option>Médio</option>
          <option>Alto</option>
        </select>

        <button
          onClick={adicionarRisco}
          style={botaoAzul}
        >
          {editando
            ? "Salvar Alterações"
            : "Adicionar Risco"}
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          marginTop: "25px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2>Filtros</h2>

        <input
          placeholder="🔍 Pesquisar risco..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          style={inputStyle}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
            }
            style={filtroStyle}
          >
            <option>Todos</option>
            <option>Físico</option>
            <option>Químico</option>
            <option>Biológico</option>
            <option>Ergonômico</option>
            <option>Acidente</option>
          </select>

          <select
            value={filtroNivel}
            onChange={(e) =>
              setFiltroNivel(
                e.target.value
              )
            }
            style={filtroStyle}
          >
            <option>Todos</option>
            <option>Baixo</option>
            <option>Médio</option>
            <option>Alto</option>
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          background: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.08)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>
                Descrição
              </th>
              <th style={thStyle}>
                Categoria
              </th>
              <th style={thStyle}>
                Nível
              </th>
              <th style={thStyle}>
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {riscosFiltrados.map(
              (risco) => (
                <tr key={risco.id}>
                  <td style={tdStyle}>
                    {risco.descricao}
                  </td>

                  <td style={tdStyle}>
                    {risco.categoria}
                  </td>

                  <td style={tdStyle}>
                    {risco.nivel}
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        editar(risco)
                      }
                      style={botaoEditar}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        excluir(risco.id)
                      }
                      style={
                        botaoExcluir
                      }
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box" as const,
};

const filtroStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
};

const thStyle = {
  padding: "15px",
  textAlign: "left" as const,
};

const tdStyle = {
  padding: "15px",
  borderTop: "1px solid #e2e8f0",
};

const botaoAzul = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
};

const botaoEditar = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  marginRight: "8px",
  cursor: "pointer",
};

const botaoExcluir = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};