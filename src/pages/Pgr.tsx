import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ShieldCheck,
  TriangleAlert,
  ClipboardList,
  Search,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";

import PgrTable from "../components/pgr/PgrTable";
import PgrDrawer from "../components/pgr/PgrDrawer";

import type { PgrItem } from "../models/Pgr";

import { supabase } from "../lib/supabase";

type FiltroCategoria =
  | ""
  | PgrItem["categoria"];

type FiltroClassificacao =
  | ""
  | PgrItem["classificacao"];

type FiltroStatus =
  | ""
  | PgrItem["status"];

interface PgrRow {
  id: number;

  setor: string;

  atividade: string;

  perigo: string;

  categoria:
    PgrItem["categoria"];

  probabilidade:
    PgrItem["probabilidade"];

  severidade:
    PgrItem["severidade"];

  nivel: number;

  classificacao:
    PgrItem["classificacao"];

  medida_controle: string;

  responsavel: string;

  prazo: string | null;

  status:
    PgrItem["status"];
}

const CAMPOS_PGR = `
  id,
  setor,
  atividade,
  perigo,
  categoria,
  probabilidade,
  severidade,
  nivel,
  classificacao,
  medida_controle,
  responsavel,
  prazo,
  status
`;

function converterLinhaPgr(
  linha: PgrRow
): PgrItem {
  return {
    id: linha.id,

    setor:
      linha.setor,

    atividade:
      linha.atividade,

    perigo:
      linha.perigo,

    categoria:
      linha.categoria,

    probabilidade:
      linha.probabilidade,

    severidade:
      linha.severidade,

    nivel:
      linha.nivel,

    classificacao:
      linha.classificacao,

    medidaControle:
      linha.medida_controle,

    responsavel:
      linha.responsavel,

    prazo:
      linha.prazo ?? "",

    status:
      linha.status,
  };
}

function criarPayloadPgr(
  risco: PgrItem
) {
  return {
    setor:
      risco.setor,

    atividade:
      risco.atividade,

    perigo:
      risco.perigo,

    categoria:
      risco.categoria,

    probabilidade:
      risco.probabilidade,

    severidade:
      risco.severidade,

    nivel:
      risco.nivel,

    classificacao:
      risco.classificacao,

    medida_controle:
      risco.medidaControle,

    responsavel:
      risco.responsavel,

    prazo:
      risco.prazo ||
      null,

    status:
      risco.status,
  };
}

function useViewportWidth() {
  const [
    largura,
    setLargura,
  ] =
    useState(() =>
      typeof window !== "undefined"
        ? window.innerWidth
        : 1440
    );

  useEffect(() => {
    function atualizar() {
      setLargura(
        window.innerWidth
      );
    }

    window.addEventListener(
      "resize",
      atualizar
    );

    atualizar();

    return () => {
      window.removeEventListener(
        "resize",
        atualizar
      );
    };
  }, []);

  return largura;
}

export default function Pgr() {
  const largura =
    useViewportWidth();

  const mobile =
    largura <= 650;

  const mobilePequeno =
    largura <= 430;

  const tablet =
    largura <= 900;

  const telaMedia =
    largura <= 1150;

  const [
    riscos,
    setRiscos,
  ] =
    useState<PgrItem[]>(
      []
    );

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    erroBanco,
    setErroBanco,
  ] =
    useState("");

  const [
    pesquisa,
    setPesquisa,
  ] =
    useState("");

  const [
    filtroCategoria,
    setFiltroCategoria,
  ] =
    useState<FiltroCategoria>(
      ""
    );

  const [
    filtroClassificacao,
    setFiltroClassificacao,
  ] =
    useState<FiltroClassificacao>(
      ""
    );

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<FiltroStatus>(
      ""
    );

  const [
    drawerAberto,
    setDrawerAberto,
  ] =
    useState(false);

  const [
    editando,
    setEditando,
  ] =
    useState<PgrItem | null>(
      null
    );

  /*
   * CARREGAR PGR DO SUPABASE
   */
  useEffect(() => {
    let componenteAtivo =
      true;

    async function carregarPgr() {
      setCarregando(true);

      setErroBanco("");

      const {
        data,
        error,
      } =
        await supabase
          .from("pgr")
          .select(
            CAMPOS_PGR
          )
          .order(
            "id",
            {
              ascending: true,
            }
          );

      if (
        !componenteAtivo
      ) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar PGR:",
          error
        );

        setRiscos(
          []
        );

        setErroBanco(
          "Não foi possível carregar o inventário de riscos."
        );

        setCarregando(
          false
        );

        return;
      }

      const linhas =
        (data ??
          []) as PgrRow[];

      setRiscos(
        linhas.map(
          converterLinhaPgr
        )
      );

      setCarregando(
        false
      );
    }

    void carregarPgr();

    return () => {
      componenteAtivo =
        false;
    };
  }, []);

  /*
   * FILTROS
   */
  const riscosFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return riscos.filter(
        (risco) => {
          const correspondePesquisa =
            !termo ||
            risco.setor
              .toLowerCase()
              .includes(termo) ||
            risco.atividade
              .toLowerCase()
              .includes(termo) ||
            risco.perigo
              .toLowerCase()
              .includes(termo) ||
            risco.categoria
              .toLowerCase()
              .includes(termo) ||
            risco.responsavel
              .toLowerCase()
              .includes(termo);

          const correspondeCategoria =
            !filtroCategoria ||
            risco.categoria ===
              filtroCategoria;

          const correspondeClassificacao =
            !filtroClassificacao ||
            risco.classificacao ===
              filtroClassificacao;

          const correspondeStatus =
            !filtroStatus ||
            risco.status ===
              filtroStatus;

          return (
            correspondePesquisa &&
            correspondeCategoria &&
            correspondeClassificacao &&
            correspondeStatus
          );
        }
      );
    }, [
      riscos,
      pesquisa,
      filtroCategoria,
      filtroClassificacao,
      filtroStatus,
    ]);

  /*
   * INDICADORES
   */
  const totalCriticos =
    riscos.filter(
      (risco) =>
        risco.classificacao ===
        "Crítico"
    ).length;

  const totalAndamento =
    riscos.filter(
      (risco) =>
        risco.status ===
        "Em andamento"
    ).length;

  const totalConcluidos =
    riscos.filter(
      (risco) =>
        risco.status ===
        "Concluído"
    ).length;

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroCategoria !== "" ||
    filtroClassificacao !== "" ||
    filtroStatus !== "";

  /*
   * NOVO RISCO
   */
  function abrirNovoRisco() {
    setEditando(null);

    setErroBanco("");

    setDrawerAberto(
      true
    );
  }

  /*
   * EDITAR RISCO
   */
  function editarRisco(
    item: PgrItem
  ) {
    setEditando(
      item
    );

    setErroBanco("");

    setDrawerAberto(
      true
    );
  }

  /*
   * EXCLUIR RISCO
   */
  async function excluirRisco(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este risco?"
      );

    if (!confirmar) {
      return;
    }

    setErroBanco("");

    const {
      error,
    } =
      await supabase
        .from("pgr")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Erro ao excluir risco:",
        error
      );

      setErroBanco(
        "Não foi possível excluir o risco."
      );

      return;
    }

    setRiscos(
      (
        listaAtual
      ) =>
        listaAtual.filter(
          (risco) =>
            risco.id !==
            id
        )
    );
  }

  /*
   * SALVAR RISCO
   */
  async function salvarRisco(
    risco: PgrItem
  ) {
    setErroBanco("");

    const payload =
      criarPayloadPgr(
        risco
      );

    /*
     * EDIÇÃO
     */
    if (editando) {
      const {
        data,
        error,
      } =
        await supabase
          .from("pgr")
          .update(
            payload
          )
          .eq(
            "id",
            risco.id
          )
          .select(
            CAMPOS_PGR
          )
          .single();

      if (
        error ||
        !data
      ) {
        console.error(
          "Erro ao atualizar risco:",
          error
        );

        setErroBanco(
          "Não foi possível atualizar o risco."
        );

        return;
      }

      const riscoAtualizado =
        converterLinhaPgr(
          data as PgrRow
        );

      setRiscos(
        (
          listaAtual
        ) =>
          listaAtual.map(
            (item) =>
              item.id ===
              riscoAtualizado.id
                ? riscoAtualizado
                : item
          )
      );

      setDrawerAberto(
        false
      );

      setEditando(
        null
      );

      return;
    }

    /*
     * NOVO REGISTRO
     */
    const {
      data,
      error,
    } =
      await supabase
        .from("pgr")
        .insert(
          payload
        )
        .select(
          CAMPOS_PGR
        )
        .single();

    if (
      error ||
      !data
    ) {
      console.error(
        "Erro ao cadastrar risco:",
        error
      );

      setErroBanco(
        "Não foi possível cadastrar o risco."
      );

      return;
    }

    const novoRisco =
      converterLinhaPgr(
        data as PgrRow
      );

    setRiscos(
      (
        listaAtual
      ) => [
        ...listaAtual,
        novoRisco,
      ]
    );

    setDrawerAberto(
      false
    );

    setEditando(
      null
    );
  }

  /*
   * FECHAR DRAWER
   */
  function fecharDrawer() {
    setDrawerAberto(
      false
    );

    setEditando(
      null
    );
  }

  /*
   * LIMPAR FILTROS
   */
  function limparFiltros() {
    setPesquisa("");

    setFiltroCategoria("");

    setFiltroClassificacao("");

    setFiltroStatus("");
  }

  return (
    <main
      style={{
        width: "100%",

        minWidth: 0,

        padding: mobile
          ? "18px 14px 28px"
          : tablet
            ? "24px 20px 32px"
            : "32px",

        boxSizing:
          "border-box",

        overflowX:
          "hidden",
      }}
    >
      {/* CABEÇALHO */}

      <PageHeader
        title="Programa de Gerenciamento de Riscos"
        subtitle="Inventário, avaliação e controle dos riscos ocupacionais."
        icon={ShieldCheck}
      >
        <Button
          onClick={
            abrirNovoRisco
          }
        >
          <span
            style={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: 8,
            }}
          >
            <Plus
              size={18}
            />

            Novo Risco
          </span>
        </Button>
      </PageHeader>

      {/* ERRO DO BANCO */}

      {erroBanco && (
        <div
          role="alert"
          style={{
            width: "100%",

            display: "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap: 14,

            marginBottom: 20,

            padding:
              "13px 15px",

            boxSizing:
              "border-box",

            border:
              "1px solid #FECACA",

            borderRadius:
              12,

            background:
              "#FEF2F2",

            color:
              "#B91C1C",

            fontSize: 12,

            fontWeight:
              650,

            lineHeight:
              1.5,
          }}
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "flex-start",

              gap: 9,
            }}
          >
            <TriangleAlert
              size={17}
              style={{
                flexShrink: 0,

                marginTop: 1,
              }}
            />

            <span>
              {erroBanco}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setErroBanco("")
            }
            aria-label="Fechar aviso"
            style={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink: 0,

              padding: 2,

              border:
                "none",

              background:
                "transparent",

              color:
                "#B91C1C",

              cursor:
                "pointer",
            }}
          >
            <X
              size={16}
            />
          </button>
        </div>
      )}

      {/* INDICADORES */}

      <div
        style={{
          width: "100%",

          minWidth: 0,

          display: "grid",

          gridTemplateColumns:
            mobile
              ? "minmax(0, 1fr)"
              : telaMedia
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",

          gap: mobile
            ? 12
            : 20,

          marginBottom:
            mobile
              ? 18
              : 28,
        }}
      >
        <StatCard
          title="Inventário"
          value={
            riscos.length
          }
          icon={
            <ShieldCheck
              size={22}
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Riscos Críticos"
          value={
            totalCriticos
          }
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#DC2626"
        />

        <StatCard
          title="Em andamento"
          value={
            totalAndamento
          }
          icon={
            <ClipboardList
              size={22}
            />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Concluídos"
          value={
            totalConcluidos
          }
          icon={
            <ShieldCheck
              size={22}
            />
          }
          color="#16A34A"
        />
      </div>

      {/* INVENTÁRIO */}

      <div
        style={{
          width: "100%",

          minWidth: 0,
        }}
      >
        <Section title="Inventário de Riscos">
          {/* BARRA DE FILTROS */}

          <div
            style={{
              width: "100%",

              minWidth: 0,

              marginBottom:
                mobile
                  ? 16
                  : 22,

              padding: mobile
                ? 14
                : 18,

              boxSizing:
                "border-box",

              background:
                "#F8FAFC",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                mobile
                  ? 12
                  : 14,
            }}
          >
            {/* TÍTULO DOS FILTROS */}

            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  mobilePequeno
                    ? "column"
                    : "row",

                alignItems:
                  mobilePequeno
                    ? "flex-start"
                    : "center",

                justifyContent:
                  "space-between",

                gap: mobile
                  ? 10
                  : 16,

                marginBottom:
                  mobile
                    ? 13
                    : 15,

                minWidth: 0,
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: 9,

                  minWidth: 0,

                  color:
                    "#334155",

                  fontSize: 13,

                  fontWeight:
                    700,

                  lineHeight:
                    1.4,
                }}
              >
                <SlidersHorizontal
                  size={17}
                  color="#64748B"
                  style={{
                    flexShrink:
                      0,
                  }}
                />

                <span>
                  Filtros do inventário
                </span>
              </div>

              {filtrosAtivos && (
                <button
                  type="button"
                  onClick={
                    limparFiltros
                  }
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    padding: 0,

                    border:
                      "none",

                    background:
                      "transparent",

                    color:
                      "#2563EB",

                    fontSize:
                      12,

                    fontWeight:
                      700,

                    whiteSpace:
                      "nowrap",

                    cursor:
                      "pointer",
                  }}
                >
                  <X
                    size={14}
                  />

                  Limpar filtros
                </button>
              )}
            </div>

            {/* CAMPOS */}

            <div
              style={{
                width: "100%",

                minWidth: 0,

                display:
                  "grid",

                gridTemplateColumns:
                  mobile
                    ? "minmax(0, 1fr)"
                    : tablet
                      ? "repeat(2, minmax(0, 1fr))"
                      : "minmax(260px, 2fr) repeat(3, minmax(160px, 1fr))",

                gap: mobile
                  ? 10
                  : 12,
              }}
            >
              {/* PESQUISA */}

              <div
                style={{
                  width:
                    "100%",

                  minWidth:
                    0,

                  height:
                    44,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: 10,

                  padding:
                    "0 13px",

                  boxSizing:
                    "border-box",

                  background:
                    "#FFFFFF",

                  border:
                    "1px solid #CBD5E1",

                  borderRadius:
                    10,
                }}
              >
                <Search
                  size={17}
                  color="#94A3B8"
                  style={{
                    flexShrink:
                      0,
                  }}
                />

                <input
                  type="text"
                  placeholder={
                    mobile
                      ? "Pesquisar riscos..."
                      : "Pesquisar risco, setor, atividade ou responsável..."
                  }
                  value={
                    pesquisa
                  }
                  onChange={(e) =>
                    setPesquisa(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",

                    minWidth:
                      0,

                    border:
                      "none",

                    outline:
                      "none",

                    background:
                      "transparent",

                    color:
                      "#0F172A",

                    fontSize:
                      13,

                    fontFamily:
                      "inherit",
                  }}
                />
              </div>

              {/* CATEGORIA */}

              <select
                value={
                  filtroCategoria
                }
                onChange={(e) =>
                  setFiltroCategoria(
                    e.target
                      .value as FiltroCategoria
                  )
                }
                style={
                  estiloSelect
                }
              >
                <option value="">
                  Todas as categorias
                </option>

                <option value="Físico">
                  Físico
                </option>

                <option value="Químico">
                  Químico
                </option>

                <option value="Biológico">
                  Biológico
                </option>

                <option value="Ergonômico">
                  Ergonômico
                </option>

                <option value="Acidente">
                  Acidente
                </option>
              </select>

              {/* CLASSIFICAÇÃO */}

              <select
                value={
                  filtroClassificacao
                }
                onChange={(e) =>
                  setFiltroClassificacao(
                    e.target
                      .value as FiltroClassificacao
                  )
                }
                style={
                  estiloSelect
                }
              >
                <option value="">
                  Todas as classificações
                </option>

                <option value="Baixo">
                  Baixo
                </option>

                <option value="Médio">
                  Médio
                </option>

                <option value="Alto">
                  Alto
                </option>

                <option value="Crítico">
                  Crítico
                </option>
              </select>

              {/* STATUS */}

              <select
                value={
                  filtroStatus
                }
                onChange={(e) =>
                  setFiltroStatus(
                    e.target
                      .value as FiltroStatus
                  )
                }
                style={
                  estiloSelect
                }
              >
                <option value="">
                  Todos os status
                </option>

                <option value="Pendente">
                  Pendente
                </option>

                <option value="Em andamento">
                  Em andamento
                </option>

                <option value="Concluído">
                  Concluído
                </option>
              </select>
            </div>

            {/* RESULTADO */}

            <div
              style={{
                marginTop:
                  12,

                color:
                  "#64748B",

                fontSize:
                  11,

                fontWeight:
                  600,

                lineHeight:
                  1.5,
              }}
            >
              Exibindo{" "}
              <strong
                style={{
                  color:
                    "#0F172A",
                }}
              >
                {
                  riscosFiltrados.length
                }
              </strong>{" "}
              de{" "}
              <strong
                style={{
                  color:
                    "#0F172A",
                }}
              >
                {
                  riscos.length
                }
              </strong>{" "}
              registro(s)
            </div>
          </div>

          {/* TABELA */}

          {carregando ? (
            <div
              style={{
                width:
                  "100%",

                padding:
                  "42px 20px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid #E2E8F0",

                borderRadius:
                  12,

                background:
                  "#FFFFFF",

                color:
                  "#64748B",

                fontSize:
                  12,

                fontWeight:
                  600,

                textAlign:
                  "center",
              }}
            >
              Carregando inventário de riscos...
            </div>
          ) : (
            <div
              style={{
                width:
                  "100%",

                minWidth:
                  0,

                overflowX:
                  "auto",

                WebkitOverflowScrolling:
                  "touch",
              }}
            >
              <PgrTable
                riscos={
                  riscosFiltrados
                }
                onEditar={
                  editarRisco
                }
                onExcluir={
                  excluirRisco
                }
              />
            </div>
          )}
        </Section>
      </div>

      {/* DRAWER */}

      <PgrDrawer
        open={
          drawerAberto
        }
        editingItem={
          editando
        }
        onClose={
          fecharDrawer
        }
        onSave={
          salvarRisco
        }
      />
    </main>
  );
}

const estiloSelect = {
  width: "100%",

  minWidth: 0,

  height: 44,

  padding:
    "0 12px",

  boxSizing:
    "border-box" as const,

  border:
    "1px solid #CBD5E1",

  borderRadius:
    10,

  background:
    "#FFFFFF",

  color:
    "#475569",

  fontFamily:
    "inherit",

  fontSize:
    12,

  fontWeight:
    600,

  outline:
    "none",

  cursor:
    "pointer",
};