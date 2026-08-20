import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  ClipboardList,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  Clock3,
  CalendarDays,
  UserRound,
  Building2,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
  FileSearch,
  AlertCircle,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

type TipoAuditoria =
  | "Interna"
  | "Inspeção de rotina"
  | "Extraordinária";

type StatusAuditoria =
  | "Pendente"
  | "Em andamento"
  | "Concluída";

interface Auditoria {
  id: number;

  data: string;

  auditor: string;

  setor: string;

  tipo: TipoAuditoria;

  conformidade: number;

  naoConformidades: number;

  observacoes: string;

  acaoCorretiva: string;

  prazo: string;

  status: StatusAuditoria;
}

interface AuditoriaRow {
  id: number;

  data: string;

  auditor: string;

  setor: string;

  tipo: TipoAuditoria;

  conformidade: number;

  nao_conformidades: number;

  observacoes: string;

  acao_corretiva: string;

  prazo: string | null;

  status: StatusAuditoria;
}

const CAMPOS_AUDITORIAS = `
  id,
  data,
  auditor,
  setor,
  tipo,
  conformidade,
  nao_conformidades,
  observacoes,
  acao_corretiva,
  prazo,
  status
`;

function criarAuditoriaInicial(): Auditoria {
  return {
    id: 0,

    data: dataHoje(),

    auditor: "",

    setor: "Cozinha Industrial",

    tipo: "Inspeção de rotina",

    conformidade: 100,

    naoConformidades: 0,

    observacoes: "",

    acaoCorretiva: "",

    prazo: "",

    status: "Pendente",
  };
}

function converterAuditoria(
  linha: AuditoriaRow
): Auditoria {
  return {
    id:
      linha.id,

    data:
      linha.data,

    auditor:
      linha.auditor,

    setor:
      linha.setor,

    tipo:
      linha.tipo,

    conformidade:
      limitarPercentual(
        Number(
          linha.conformidade
        )
      ),

    naoConformidades:
      Math.max(
        0,
        Number(
          linha.nao_conformidades ??
            0
        )
      ),

    observacoes:
      linha.observacoes ??
      "",

    acaoCorretiva:
      linha.acao_corretiva ??
      "",

    prazo:
      linha.prazo ??
      "",

    status:
      linha.status,
  };
}

function criarPayloadAuditoria(
  auditoria: Auditoria
) {
  return {
    data:
      auditoria.data,

    auditor:
      auditoria.auditor.trim(),

    setor:
      auditoria.setor.trim(),

    tipo:
      auditoria.tipo,

    conformidade:
      limitarPercentual(
        auditoria.conformidade
      ),

    nao_conformidades:
      Math.max(
        0,
        auditoria.naoConformidades
      ),

    observacoes:
      auditoria.observacoes.trim(),

    acao_corretiva:
      auditoria.acaoCorretiva.trim(),

    prazo:
      auditoria.prazo ||
      null,

    status:
      auditoria.status,
  };
}

function useViewportWidth() {
  const [largura, setLargura] =
    useState(() =>
      typeof window !==
      "undefined"
        ? window.innerWidth
        : 1440
    );

  useEffect(() => {
    function atualizar() {
      setLargura(
        window.innerWidth
      );
    }

    atualizar();

    window.addEventListener(
      "resize",
      atualizar
    );

    return () => {
      window.removeEventListener(
        "resize",
        atualizar
      );
    };
  }, []);

  return largura;
}

export default function Auditorias() {
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
    auditorias,
    setAuditorias,
  ] =
    useState<Auditoria[]>(
      []
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    erroBanco,
    setErroBanco,
  ] = useState("");

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState<
      TipoAuditoria | ""
    >("");

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<
      StatusAuditoria | ""
    >("");

  const [
    drawerAberto,
    setDrawerAberto,
  ] = useState(false);

  const [
    editando,
    setEditando,
  ] =
    useState<Auditoria | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<Auditoria>(
      criarAuditoriaInicial()
    );

  /*
   * CARREGAR AUDITORIAS DO SUPABASE
   */

  useEffect(() => {
    let componenteAtivo =
      true;

    async function carregarAuditorias() {
      setCarregando(
        true
      );

      setErroBanco(
        ""
      );

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "auditorias"
          )
          .select(
            CAMPOS_AUDITORIAS
          )
          .order(
            "data",
            {
              ascending:
                false,
            }
          )
          .order(
            "id",
            {
              ascending:
                false,
            }
          );

      if (
        !componenteAtivo
      ) {
        return;
      }

      if (
        error
      ) {
        console.error(
          "Erro ao carregar auditorias:",
          error
        );

        setAuditorias(
          []
        );

        setErroBanco(
          "Não foi possível carregar as auditorias."
        );

        setCarregando(
          false
        );

        return;
      }

      setAuditorias(
        (
          (
            data ??
            []
          ) as AuditoriaRow[]
        ).map(
          converterAuditoria
        )
      );

      setCarregando(
        false
      );
    }

    void carregarAuditorias();

    return () => {
      componenteAtivo =
        false;
    };
  }, []);

  /*
   * DRAWER
   */

  useEffect(() => {
    if (!drawerAberto) {
      return;
    }

    const overflowAnterior =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function fecharComEsc(
      evento: KeyboardEvent
    ) {
      if (
        evento.key ===
        "Escape"
      ) {
        setDrawerAberto(
          false
        );

        setEditando(null);

        setFormulario(
          criarAuditoriaInicial()
        );
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [drawerAberto]);

  /*
   * INDICADORES
   */

  const conformidadeMedia =
    auditorias.length > 0
      ? Math.round(
          auditorias.reduce(
            (
              total,
              auditoria
            ) =>
              total +
              auditoria.conformidade,
            0
          ) /
            auditorias.length
        )
      : 0;

  const totalNaoConformidades =
    auditorias.reduce(
      (
        total,
        auditoria
      ) =>
        total +
        auditoria.naoConformidades,
      0
    );

  const pendentes =
    auditorias.filter(
      (auditoria) =>
        auditoria.status ===
          "Pendente" ||
        auditoria.status ===
          "Em andamento"
    ).length;

  const vencidas =
    auditorias.filter(
      (auditoria) =>
        prazoVencido(
          auditoria
        )
    ).length;

  /*
   * FILTROS
   */

  const auditoriasFiltradas =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return auditorias.filter(
        (auditoria) => {
          const correspondePesquisa =
            !termo ||
            auditoria.auditor
              .toLowerCase()
              .includes(
                termo
              ) ||
            auditoria.setor
              .toLowerCase()
              .includes(
                termo
              ) ||
            auditoria.observacoes
              .toLowerCase()
              .includes(
                termo
              ) ||
            auditoria.acaoCorretiva
              .toLowerCase()
              .includes(
                termo
              );

          const correspondeTipo =
            !filtroTipo ||
            auditoria.tipo ===
              filtroTipo;

          const correspondeStatus =
            !filtroStatus ||
            auditoria.status ===
              filtroStatus;

          return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeStatus
          );
        }
      );
    }, [
      auditorias,
      pesquisa,
      filtroTipo,
      filtroStatus,
    ]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroTipo !== "" ||
    filtroStatus !== "";

  /*
   * CRUD
   */

  function abrirNovaAuditoria() {
    setEditando(null);

    setErroBanco("");

    setFormulario(
      criarAuditoriaInicial()
    );

    setDrawerAberto(true);
  }

  function editarAuditoria(
    auditoria: Auditoria
  ) {
    setEditando(
      auditoria
    );

    setErroBanco("");

    setFormulario({
      ...auditoria,
    });

    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);

    setEditando(null);

    setFormulario(
      criarAuditoriaInicial()
    );
  }

  async function salvarAuditoria() {
    if (
      salvando
    ) {
      return;
    }

    if (!formulario.data) {
      window.alert(
        "Informe a data da auditoria."
      );

      return;
    }

    if (
      !formulario.auditor.trim()
    ) {
      window.alert(
        "Informe o responsável pela auditoria."
      );

      return;
    }

    if (
      !formulario.setor.trim()
    ) {
      window.alert(
        "Informe o setor auditado."
      );

      return;
    }

    const payload =
      criarPayloadAuditoria(
        formulario
      );

    setSalvando(true);

    setErroBanco("");

    try {
      if (editando) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "auditorias"
            )
            .update(
              payload
            )
            .eq(
              "id",
              editando.id
            )
            .select(
              CAMPOS_AUDITORIAS
            )
            .single();

        if (
          error ||
          !data
        ) {
          console.error(
            "Erro ao atualizar auditoria:",
            error
          );

          setErroBanco(
            "Não foi possível atualizar a auditoria."
          );

          return;
        }

        const atualizada =
          converterAuditoria(
            data as AuditoriaRow
          );

        setAuditorias(
          (
            listaAtual
          ) =>
            listaAtual.map(
              (
                auditoria
              ) =>
                auditoria.id ===
                atualizada.id
                  ? atualizada
                  : auditoria
            )
        );
      } else {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "auditorias"
            )
            .insert(
              payload
            )
            .select(
              CAMPOS_AUDITORIAS
            )
            .single();

        if (
          error ||
          !data
        ) {
          console.error(
            "Erro ao cadastrar auditoria:",
            error
          );

          setErroBanco(
            "Não foi possível registrar a auditoria."
          );

          return;
        }

        const novaAuditoria =
          converterAuditoria(
            data as AuditoriaRow
          );

        setAuditorias(
          (
            listaAtual
          ) => [
            novaAuditoria,
            ...listaAtual,
          ]
        );
      }

      fecharDrawer();
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAuditoria(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir esta auditoria?"
      );

    if (!confirmar) {
      return;
    }

    setErroBanco("");

    const {
      error,
    } =
      await supabase
        .from(
          "auditorias"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      console.error(
        "Erro ao excluir auditoria:",
        error
      );

      setErroBanco(
        "Não foi possível excluir a auditoria."
      );

      return;
    }

    setAuditorias(
      (
        listaAtual
      ) =>
        listaAtual.filter(
          (
            auditoria
          ) =>
            auditoria.id !==
            id
        )
    );
  }

  function limparFiltros() {
    setPesquisa("");

    setFiltroTipo("");

    setFiltroStatus("");
  }

  const classificacaoFormulario =
    obterClassificacao(
      formulario.conformidade
    );

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
        title="Auditorias de SST"
        subtitle="Inspeções, conformidade e acompanhamento das ações corretivas."
        icon={ClipboardList}
      >
        <Button
          onClick={
            abrirNovaAuditoria
          }
        >
          <span
            style={{
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: 8,
            }}
          >
            <Plus size={18} />

            Nova Auditoria
          </span>
        </Button>
      </PageHeader>

      {erroBanco && (
        <div
          role="alert"
          style={{
            width:
              "100%",

            display:
              "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap:
              14,

            marginBottom:
              20,

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

            fontSize:
              12,

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

              gap:
                9,
            }}
          >
            <TriangleAlert
              size={
                17
              }
              style={{
                flexShrink:
                  0,

                marginTop:
                  1,
              }}
            />

            <span>
              {
                erroBanco
              }
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setErroBanco(
                ""
              )
            }
            aria-label="Fechar aviso"
            style={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink:
                0,

              padding:
                2,

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
              size={
                16
              }
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
                : "repeat(5, minmax(0, 1fr))",

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
          title="Auditorias Realizadas"
          value={
            auditorias.length
          }
          icon={
            <FileSearch
              size={22}
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Conformidade Média"
          value={`${conformidadeMedia}%`}
          icon={
            <ShieldCheck
              size={22}
            />
          }
          color="#16A34A"
        />

        <StatCard
          title="Não Conformidades"
          value={
            totalNaoConformidades
          }
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Ações Pendentes"
          value={
            pendentes
          }
          icon={
            <Clock3
              size={22}
            />
          }
          color="#7C3AED"
        />

        <StatCard
          title="Prazos Vencidos"
          value={
            vencidas
          }
          icon={
            <AlertCircle
              size={22}
            />
          }
          color="#DC2626"
        />
      </div>

      {/* PAINEL */}

      <section
        style={{
          width: "100%",

          minWidth: 0,

          padding: mobile
            ? 16
            : 24,

          boxSizing:
            "border-box",

          background:
            "#FFFFFF",

          border:
            "1px solid #E2E8F0",

          borderRadius:
            mobile
              ? 14
              : 18,

          boxShadow:
            "0 6px 20px rgba(15, 23, 42, .04)",

          overflow:
            "hidden",
        }}
      >
        {/* TÍTULO */}

        <div
          style={{
            minWidth: 0,

            marginBottom:
              mobile
                ? 17
                : 20,
          }}
        >
          <h2
            style={{
              margin: 0,

              color:
                "#0F172A",

              fontSize:
                mobile
                  ? 16
                  : 18,

              fontWeight:
                800,

              lineHeight:
                1.3,
            }}
          >
            Histórico de Auditorias
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",

              color:
                "#94A3B8",

              fontSize:
                12,

              lineHeight:
                1.5,

              overflowWrap:
                "anywhere",
            }}
          >
            Acompanhe resultados, não
            conformidades e planos de
            correção identificados nas
            inspeções.
          </p>
        </div>

        {/* FILTROS */}

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
          <div
            style={{
              display: "flex",

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

              gap: 10,

              marginBottom:
                14,

              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",

                alignItems:
                  "center",

                gap: 8,

                minWidth: 0,

                color:
                  "#475569",

                fontSize:
                  12,

                fontWeight:
                  700,
              }}
            >
              <SlidersHorizontal
                size={16}
                style={{
                  flexShrink:
                    0,
                }}
              />

              Filtros de auditorias
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

                  gap: 5,

                  padding: 0,

                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#2563EB",

                  fontSize:
                    11,

                  fontWeight:
                    700,

                  whiteSpace:
                    "nowrap",

                  cursor:
                    "pointer",
                }}
              >
                <X size={13} />

                Limpar filtros
              </button>
            )}
          </div>

          <div
            style={{
              width: "100%",

              minWidth: 0,

              display: "grid",

              gridTemplateColumns:
                mobile
                  ? "minmax(0, 1fr)"
                  : tablet
                    ? "repeat(2, minmax(0, 1fr))"
                    : "minmax(280px, 2fr) repeat(2, minmax(190px, 1fr))",

              gap: mobile
                ? 10
                : 12,
            }}
          >
            {/* PESQUISA */}

            <div
              style={{
                width: "100%",

                minWidth: 0,

                height: 44,

                display: "flex",

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

                gridColumn:
                  tablet &&
                  !mobile
                    ? "1 / -1"
                    : undefined,
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
                    ? "Pesquisar auditorias..."
                    : "Pesquisar auditor, setor ou observação..."
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
                  width: "100%",

                  minWidth: 0,

                  flex: 1,

                  border:
                    "none",

                  outline:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#0F172A",

                  fontFamily:
                    "inherit",

                  fontSize:
                    12,
                }}
              />
            </div>

            {/* TIPO */}

            <select
              value={
                filtroTipo
              }
              onChange={(e) =>
                setFiltroTipo(
                  e.target
                    .value as
                    | TipoAuditoria
                    | ""
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todos os tipos
              </option>

              <option value="Interna">
                Interna
              </option>

              <option value="Inspeção de rotina">
                Inspeção de rotina
              </option>

              <option value="Extraordinária">
                Extraordinária
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
                    .value as
                    | StatusAuditoria
                    | ""
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

              <option value="Concluída">
                Concluída
              </option>
            </select>
          </div>

          <div
            style={{
              marginTop:
                11,

              color:
                "#64748B",

              fontSize:
                11,

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
                auditoriasFiltradas.length
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
                auditorias.length
              }
            </strong>{" "}
            auditoria(s)
          </div>
        </div>

        {/* TABELA */}

        {carregando ? (
          <div
            style={{
              width:
                "100%",

              padding:
                mobile
                  ? "34px 16px"
                  : "46px 20px",

              boxSizing:
                "border-box",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                14,

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
            Carregando auditorias...
          </div>
        ) : auditoriasFiltradas.length ===
        0 ? (
          <EstadoVazio
            mobile={
              mobile
            }
          />
        ) : (
          <div
            style={{
              width: "100%",

              maxWidth:
                "100%",

              minWidth: 0,

              overflowX:
                "auto",

              overflowY:
                "hidden",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                mobile
                  ? 12
                  : 14,

              WebkitOverflowScrolling:
                "touch",
            }}
          >
            <table
              style={{
                width: "100%",

                minWidth:
                  mobile
                    ? 1050
                    : 1180,

                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#F8FAFC",
                  }}
                >
                  <Th>
                    Auditoria
                  </Th>

                  <Th>
                    Auditor
                  </Th>

                  <Th>
                    Conformidade
                  </Th>

                  <Th>
                    Não Conformidades
                  </Th>

                  <Th>
                    Ação Corretiva
                  </Th>

                  <Th>
                    Prazo
                  </Th>

                  <Th>
                    Status
                  </Th>

                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {auditoriasFiltradas.map(
                  (auditoria) => {
                    const classificacao =
                      obterClassificacao(
                        auditoria.conformidade
                      );

                    return (
                      <tr
                        key={
                          auditoria.id
                        }
                        style={{
                          borderTop:
                            "1px solid #E2E8F0",
                        }}
                      >
                        {/* AUDITORIA */}

                        <Td>
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "flex-start",

                              gap: 11,

                              width:
                                210,

                              minWidth:
                                210,
                            }}
                          >
                            <div
                              style={{
                                width:
                                  39,

                                height:
                                  39,

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                flexShrink:
                                  0,

                                borderRadius:
                                  10,

                                background:
                                  "#EFF6FF",

                                color:
                                  "#2563EB",
                              }}
                            >
                              <ClipboardList
                                size={
                                  18
                                }
                              />
                            </div>

                            <div
                              style={{
                                minWidth:
                                  0,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "flex-start",

                                  gap: 6,

                                  color:
                                    "#0F172A",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    750,
                                }}
                              >
                                <Building2
                                  size={
                                    14
                                  }
                                  style={{
                                    flexShrink:
                                      0,

                                    marginTop:
                                      2,
                                  }}
                                />

                                <span
                                  style={{
                                    minWidth:
                                      0,

                                    overflowWrap:
                                      "anywhere",
                                  }}
                                >
                                  {
                                    auditoria.setor
                                  }
                                </span>
                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap: 5,

                                  marginTop:
                                    6,

                                  color:
                                    "#64748B",

                                  fontSize:
                                    10,

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                <CalendarDays
                                  size={
                                    13
                                  }
                                  style={{
                                    flexShrink:
                                      0,
                                  }}
                                />

                                {formatarData(
                                  auditoria.data
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    7,
                                }}
                              >
                                <Badge color="blue">
                                  {
                                    auditoria.tipo
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Td>

                        {/* AUDITOR */}

                        <Td>
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "flex-start",

                              gap: 7,

                              width:
                                145,

                              minWidth:
                                145,

                              color:
                                "#475569",

                              fontSize:
                                12,
                            }}
                          >
                            <UserRound
                              size={
                                15
                              }
                              color="#94A3B8"
                              style={{
                                flexShrink:
                                  0,

                                marginTop:
                                  1,
                              }}
                            />

                            <span
                              style={{
                                minWidth:
                                  0,

                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {
                                auditoria.auditor
                              }
                            </span>
                          </div>
                        </Td>

                        {/* CONFORMIDADE */}

                        <Td>
                          <div
                            style={{
                              width:
                                150,

                              minWidth:
                                150,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "space-between",

                                gap: 8,

                                marginBottom:
                                  7,
                              }}
                            >
                              <Badge
                                color={
                                  classificacao ===
                                  "Excelente"
                                    ? "green"
                                    : classificacao ===
                                        "Adequada"
                                      ? "blue"
                                      : classificacao ===
                                          "Atenção"
                                        ? "yellow"
                                        : "red"
                                }
                              >
                                {
                                  classificacao
                                }
                              </Badge>

                              <strong
                                style={{
                                  color:
                                    corConformidade(
                                      auditoria.conformidade
                                    ),

                                  fontSize:
                                    12,

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  auditoria.conformidade
                                }
                                %
                              </strong>
                            </div>

                            <div
                              style={{
                                width:
                                  "100%",

                                height:
                                  7,

                                overflow:
                                  "hidden",

                                background:
                                  "#E2E8F0",

                                borderRadius:
                                  999,
                              }}
                            >
                              <div
                                style={{
                                  width: `${auditoria.conformidade}%`,

                                  height:
                                    "100%",

                                  background:
                                    corConformidade(
                                      auditoria.conformidade
                                    ),

                                  borderRadius:
                                    999,
                                }}
                              />
                            </div>
                          </div>
                        </Td>

                        {/* NÃO CONFORMIDADES */}

                        <Td>
                          <Badge
                            color={
                              auditoria.naoConformidades ===
                              0
                                ? "green"
                                : auditoria.naoConformidades <=
                                    2
                                  ? "yellow"
                                  : "red"
                            }
                          >
                            {
                              auditoria.naoConformidades
                            }{" "}
                            ocorrência(s)
                          </Badge>
                        </Td>

                        {/* AÇÃO */}

                        <Td>
                          <div
                            style={{
                              width:
                                220,

                              maxWidth:
                                220,

                              color:
                                "#475569",

                              fontSize:
                                11,

                              lineHeight:
                                1.5,

                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {auditoria.acaoCorretiva ||
                              "Nenhuma ação cadastrada"}
                          </div>
                        </Td>

                        {/* PRAZO */}

                        <Td>
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap: 7,

                              minWidth:
                                120,

                              color:
                                prazoVencido(
                                  auditoria
                                )
                                  ? "#DC2626"
                                  : "#475569",

                              fontSize:
                                11,

                              fontWeight:
                                prazoVencido(
                                  auditoria
                                )
                                  ? 700
                                  : 500,

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            <CalendarDays
                              size={
                                14
                              }
                              style={{
                                flexShrink:
                                  0,
                              }}
                            />

                            {formatarData(
                              auditoria.prazo
                            )}
                          </div>

                          {prazoVencido(
                            auditoria
                          ) && (
                            <div
                              style={{
                                marginTop:
                                  5,

                                color:
                                  "#DC2626",

                                fontSize:
                                  9,

                                fontWeight:
                                  800,

                                textTransform:
                                  "uppercase",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              Prazo vencido
                            </div>
                          )}
                        </Td>

                        {/* STATUS */}

                        <Td>
                          <Badge
                            color={
                              auditoria.status ===
                              "Concluída"
                                ? "green"
                                : auditoria.status ===
                                    "Em andamento"
                                  ? "yellow"
                                  : "gray"
                            }
                          >
                            {
                              auditoria.status
                            }
                          </Badge>
                        </Td>

                        {/* AÇÕES */}

                        <Td align="center">
                          <div
                            style={{
                              display:
                                "flex",

                              justifyContent:
                                "center",

                              gap: 7,

                              minWidth:
                                80,
                            }}
                          >
                            <button
                              type="button"
                              title="Editar auditoria"
                              aria-label="Editar auditoria"
                              onClick={() =>
                                editarAuditoria(
                                  auditoria
                                )
                              }
                              style={{
                                ...botaoAcao,

                                background:
                                  "#EFF6FF",

                                color:
                                  "#2563EB",
                              }}
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Excluir auditoria"
                              aria-label="Excluir auditoria"
                              onClick={() =>
                                excluirAuditoria(
                                  auditoria.id
                                )
                              }
                              style={{
                                ...botaoAcao,

                                background:
                                  "#FEF2F2",

                                color:
                                  "#DC2626",
                              }}
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DRAWER */}

      {drawerAberto && (
        <div
          className="auditoria-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="auditoria-drawer">
            {/* HEADER */}

            <header className="auditoria-drawer-header">
              <div className="auditoria-drawer-header-main">
                <div className="auditoria-drawer-icon">
                  <ClipboardList
                    size={22}
                  />
                </div>

                <div className="auditoria-drawer-title">
                  <h2>
                    {editando
                      ? "Editar auditoria"
                      : "Nova auditoria"}
                  </h2>

                  <p>
                    Registre a inspeção,
                    conformidade e ações
                    corretivas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  fecharDrawer
                }
                aria-label="Fechar formulário"
                style={
                  botaoFechar
                }
              >
                <X size={19} />
              </button>
            </header>

            {/* FORMULÁRIO */}

            <div className="auditoria-drawer-content">
              {/* IDENTIFICAÇÃO */}

              <Secao
                titulo="Identificação"
                descricao="Informe os dados da auditoria realizada."
              >
                <div className="auditoria-grid-2">
                  <Campo
                    label="Data"
                    type="date"
                    value={
                      formulario.data
                    }
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        data:
                          valor,
                      })
                    }
                  />

                  <Campo
                    label="Setor"
                    placeholder="Ex.: Cozinha quente"
                    value={
                      formulario.setor
                    }
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        setor:
                          valor,
                      })
                    }
                  />
                </div>

                <Campo
                  label="Auditor responsável"
                  placeholder="Nome do auditor"
                  value={
                    formulario.auditor
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      auditor:
                        valor,
                    })
                  }
                />

                <SelectCampo
                  label="Tipo de auditoria"
                  value={
                    formulario.tipo
                  }
                  options={[
                    "Interna",
                    "Inspeção de rotina",
                    "Extraordinária",
                  ]}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      tipo:
                        valor as TipoAuditoria,
                    })
                  }
                />
              </Secao>

              {/* RESULTADO */}

              <Secao
                titulo="Resultado"
                descricao="Registre o percentual de conformidade e as não conformidades encontradas."
              >
                <div className="auditoria-grid-2">
                  <Campo
                    label="Conformidade (%)"
                    type="number"
                    value={String(
                      formulario.conformidade
                    )}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        conformidade:
                          limitarPercentual(
                            Number(
                              valor
                            )
                          ),
                      })
                    }
                  />

                  <Campo
                    label="Não conformidades"
                    type="number"
                    value={String(
                      formulario.naoConformidades
                    )}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        naoConformidades:
                          Math.max(
                            0,
                            Number(
                              valor
                            )
                          ),
                      })
                    }
                  />
                </div>

                <div className="auditoria-resultado">
                  <div className="auditoria-resultado-topo">
                    <div>
                      <div className="auditoria-resultado-label">
                        Conformidade
                      </div>

                      <div className="auditoria-resultado-numero">
                        {
                          formulario.conformidade
                        }
                        %
                      </div>
                    </div>

                    <Badge
                      color={
                        classificacaoFormulario ===
                        "Excelente"
                          ? "green"
                          : classificacaoFormulario ===
                              "Adequada"
                            ? "blue"
                            : classificacaoFormulario ===
                                "Atenção"
                              ? "yellow"
                              : "red"
                      }
                    >
                      {
                        classificacaoFormulario
                      }
                    </Badge>
                  </div>

                  <div className="auditoria-progress">
                    <div
                      style={{
                        width: `${formulario.conformidade}%`,

                        height:
                          "100%",

                        background:
                          corConformidade(
                            formulario.conformidade
                          ),

                        borderRadius:
                          999,

                        transition:
                          "width .2s ease",
                      }}
                    />
                  </div>
                </div>
              </Secao>

              {/* ANÁLISE */}

              <Secao
                titulo="Análise da auditoria"
                descricao="Registre observações e desvios identificados."
              >
                <CampoTexto
                  label="Observações"
                  placeholder="Descreva os principais pontos encontrados durante a auditoria..."
                  value={
                    formulario.observacoes
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      observacoes:
                        valor,
                    })
                  }
                />
              </Secao>

              {/* PLANO DE AÇÃO */}

              <Secao
                titulo="Plano de ação"
                descricao="Defina as correções necessárias, prazo e situação."
              >
                <CampoTexto
                  label="Ação corretiva"
                  placeholder="Ex.: Corrigir armazenamento de produtos químicos..."
                  value={
                    formulario.acaoCorretiva
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      acaoCorretiva:
                        valor,
                    })
                  }
                />

                <div className="auditoria-grid-2">
                  <Campo
                    label="Prazo"
                    type="date"
                    value={
                      formulario.prazo
                    }
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        prazo:
                          valor,
                      })
                    }
                  />

                  <SelectCampo
                    label="Status"
                    value={
                      formulario.status
                    }
                    options={[
                      "Pendente",
                      "Em andamento",
                      "Concluída",
                    ]}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        status:
                          valor as StatusAuditoria,
                      })
                    }
                  />
                </div>
              </Secao>
            </div>

            {/* RODAPÉ */}

            <footer className="auditoria-drawer-footer">
              <Button
                onClick={
                  fecharDrawer
                }
                color="#64748B"
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  salvarAuditoria
                }
              >
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Registrar auditoria"}
              </Button>
            </footer>
          </aside>
        </div>
      )}

      <style>
        {estilosResponsivos}
      </style>
    </main>
  );
}

/*
 * COMPONENTES AUXILIARES
 */

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section className="auditoria-form-secao">
      <div className="auditoria-form-secao-header">
        <h3>
          {titulo}
        </h3>

        <p>
          {descricao}
        </p>
      </div>

      {children}
    </section>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="auditoria-grupo-campo">
      <label
        style={
          estiloLabel
        }
      >
        {label}
      </label>

      <input
        type={type}
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={
          estiloInput
        }
      />
    </div>
  );
}

function SelectCampo({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (valor: string) => void;
}) {
  return (
    <div className="auditoria-grupo-campo">
      <label
        style={
          estiloLabel
        }
      >
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={{
          ...estiloInput,

          cursor:
            "pointer",
        }}
      >
        {options.map(
          (option) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function CampoTexto({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="auditoria-grupo-campo">
      <label
        style={
          estiloLabel
        }
      >
        {label}
      </label>

      <textarea
        rows={4}
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={{
          ...estiloInput,

          height:
            "auto",

          minHeight:
            100,

          padding:
            "12px 13px",

          resize:
            "vertical",

          lineHeight:
            1.5,
        }}
      />
    </div>
  );
}

function EstadoVazio({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        minHeight:
          mobile
            ? 210
            : 250,

        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding: mobile
          ? "26px 16px"
          : 30,

        boxSizing:
          "border-box",

        border:
          "1px dashed #CBD5E1",

        borderRadius:
          14,

        textAlign:
          "center",
      }}
    >
      <div
        style={{
          width: 53,

          height: 53,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          marginBottom:
            13,

          borderRadius:
            14,

          background:
            "#EFF6FF",

          color:
            "#2563EB",
        }}
      >
        <ClipboardList
          size={25}
        />
      </div>

      <strong
        style={{
          color:
            "#0F172A",

          fontSize:
            14,

          lineHeight:
            1.4,
        }}
      >
        Nenhuma auditoria encontrada
      </strong>

      <span
        style={{
          marginTop:
            5,

          maxWidth:
            340,

          color:
            "#94A3B8",

          fontSize:
            12,

          lineHeight:
            1.5,
        }}
      >
        Registre uma nova auditoria ou
        altere os filtros.
      </span>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "center"
    | "right";
}) {
  return (
    <th
      style={{
        padding:
          "15px 18px",

        textAlign:
          align,

        color:
          "#64748B",

        fontSize:
          10,

        fontWeight:
          800,

        textTransform:
          "uppercase",

        letterSpacing:
          ".5px",

        whiteSpace:
          "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "center"
    | "right";
}) {
  return (
    <td
      style={{
        padding:
          18,

        textAlign:
          align,

        verticalAlign:
          "middle",

        color:
          "#475569",

        fontSize:
          12,
      }}
    >
      {children}
    </td>
  );
}

/*
 * REGRAS
 */

function limitarPercentual(
  valor: number
) {
  if (
    Number.isNaN(
      valor
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      valor
    )
  );
}

function obterClassificacao(
  conformidade: number
) {
  if (
    conformidade >=
    90
  ) {
    return "Excelente";
  }

  if (
    conformidade >=
    75
  ) {
    return "Adequada";
  }

  if (
    conformidade >=
    50
  ) {
    return "Atenção";
  }

  return "Crítica";
}

function corConformidade(
  conformidade: number
) {
  if (
    conformidade >=
    90
  ) {
    return "#16A34A";
  }

  if (
    conformidade >=
    75
  ) {
    return "#2563EB";
  }

  if (
    conformidade >=
    50
  ) {
    return "#F59E0B";
  }

  return "#DC2626";
}

function prazoVencido(
  auditoria: Auditoria
) {
  if (
    !auditoria.prazo ||
    auditoria.status ===
      "Concluída"
  ) {
    return false;
  }

  const prazo =
    new Date(
      `${auditoria.prazo}T23:59:59`
    );

  return (
    prazo.getTime() <
    new Date().getTime()
  );
}

function formatarData(
  data: string
) {
  if (!data) {
    return "Sem prazo";
  }

  const [
    ano,
    mes,
    dia,
  ] = data.split("-");

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function dataHoje() {
  const agora =
    new Date();

  const ano =
    agora.getFullYear();

  const mes =
    String(
      agora.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${ano}-${mes}-${dia}`;
}

/*
 * ESTILOS
 */

const estiloLabel = {
  color:
    "#334155",

  fontSize:
    13,

  fontWeight:
    650,
};

const estiloInput = {
  width: "100%",

  minWidth: 0,

  height: 46,

  padding:
    "0 13px",

  boxSizing:
    "border-box" as const,

  border:
    "1px solid #CBD5E1",

  borderRadius:
    11,

  background:
    "#FFFFFF",

  color:
    "#0F172A",

  fontFamily:
    "inherit",

  fontSize:
    13,

  outline:
    "none",
};

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
    11,

  fontWeight:
    600,

  outline:
    "none",

  cursor:
    "pointer",
};

const botaoAcao = {
  width: 36,

  height: 36,

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  flexShrink:
    0,

  padding: 0,

  border:
    "none",

  borderRadius:
    9,

  cursor:
    "pointer",
};

const botaoFechar = {
  width: 38,

  height: 38,

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  flexShrink:
    0,

  padding: 0,

  border:
    "1px solid #E2E8F0",

  borderRadius:
    10,

  background:
    "#FFFFFF",

  color:
    "#64748B",

  cursor:
    "pointer",
};

const estilosResponsivos = `
  .auditoria-drawer-overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: flex-end;

    background:
      rgba(15, 23, 42, .48);

    backdrop-filter:
      blur(3px);

    z-index: 2000;
  }

  .auditoria-drawer {
    width: 600px;
    max-width: 100%;

    height: 100vh;
    height: 100dvh;

    display: flex;
    flex-direction: column;

    box-sizing: border-box;

    background:
      #ffffff;

    box-shadow:
      -16px 0 45px
      rgba(15, 23, 42, .16);

    overflow:
      hidden;
  }

  .auditoria-drawer-header {
    padding:
      24px 26px;

    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap: 20px;

    flex-shrink: 0;

    border-bottom:
      1px solid #e2e8f0;
  }

  .auditoria-drawer-header-main {
    min-width: 0;

    display: flex;

    gap: 12px;
  }

  .auditoria-drawer-icon {
    width: 44px;

    height: 44px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    flex-shrink: 0;

    border-radius:
      12px;

    background:
      #eff6ff;

    color:
      #2563eb;
  }

  .auditoria-drawer-title {
    min-width: 0;
  }

  .auditoria-drawer-title h2 {
    margin: 0;

    color:
      #0f172a;

    font-size:
      20px;

    font-weight:
      800;

    line-height:
      1.25;
  }

  .auditoria-drawer-title p {
    margin:
      5px 0 0;

    color:
      #64748b;

    font-size:
      12px;

    line-height:
      1.5;

    overflow-wrap:
      anywhere;
  }

  .auditoria-drawer-content {
    flex: 1;

    min-height: 0;

    padding:
      24px 26px;

    box-sizing:
      border-box;

    overflow-y:
      auto;

    overflow-x:
      hidden;

    -webkit-overflow-scrolling:
      touch;
  }

  .auditoria-grid-2 {
    width: 100%;

    min-width: 0;

    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 14px;
  }

  .auditoria-form-secao {
    width: 100%;

    min-width: 0;

    margin-bottom:
      28px;
  }

  .auditoria-form-secao-header {
    margin-bottom:
      16px;
  }

  .auditoria-form-secao-header h3 {
    margin: 0;

    color:
      #0f172a;

    font-size:
      14px;

    font-weight:
      800;
  }

  .auditoria-form-secao-header p {
    margin:
      4px 0 0;

    color:
      #94a3b8;

    font-size:
      11px;

    line-height:
      1.5;

    overflow-wrap:
      anywhere;
  }

  .auditoria-grupo-campo {
    width: 100%;

    min-width: 0;

    display: flex;

    flex-direction:
      column;

    gap: 8px;

    margin-bottom:
      16px;
  }

  .auditoria-resultado {
    width: 100%;

    min-width: 0;

    padding: 18px;

    box-sizing:
      border-box;

    background:
      #f8fafc;

    border:
      1px solid #e2e8f0;

    border-radius:
      13px;
  }

  .auditoria-resultado-topo {
    display: flex;

    justify-content:
      space-between;

    align-items:
      flex-end;

    gap: 16px;

    margin-bottom:
      12px;
  }

  .auditoria-resultado-label {
    color:
      #64748b;

    font-size:
      10px;

    font-weight:
      800;

    text-transform:
      uppercase;

    letter-spacing:
      .5px;
  }

  .auditoria-resultado-numero {
    margin-top:
      4px;

    color:
      #0f172a;

    font-size:
      32px;

    font-weight:
      850;
  }

  .auditoria-progress {
    width: 100%;

    height: 9px;

    overflow:
      hidden;

    background:
      #e2e8f0;

    border-radius:
      999px;
  }

  .auditoria-drawer-footer {
    padding:
      17px 26px;

    display: flex;

    justify-content:
      flex-end;

    gap: 10px;

    flex-shrink: 0;

    box-sizing:
      border-box;

    border-top:
      1px solid #e2e8f0;

    background:
      #ffffff;

    padding-bottom:
      max(
        17px,
        env(
          safe-area-inset-bottom
        )
      );
  }

  @media (max-width: 650px) {
    .auditoria-drawer {
      width: 100%;

      max-width: none;
    }

    .auditoria-drawer-header {
      padding:
        18px 16px;

      gap: 12px;
    }

    .auditoria-drawer-icon {
      width: 40px;

      height: 40px;

      border-radius:
        11px;
    }

    .auditoria-drawer-title h2 {
      font-size:
        18px;
    }

    .auditoria-drawer-title p {
      font-size:
        11px;
    }

    .auditoria-drawer-content {
      padding:
        20px 16px 26px;
    }

    .auditoria-grid-2 {
      grid-template-columns:
        minmax(0, 1fr);

      gap: 0;
    }

    .auditoria-drawer-footer {
      padding:
        14px 16px;

      padding-bottom:
        max(
          14px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    .auditoria-drawer-footer > * {
      flex:
        1 1 0;
    }
  }

  @media (max-width: 430px) {
    .auditoria-drawer-header {
      padding:
        16px 14px;
    }

    .auditoria-drawer-content {
      padding:
        18px 14px 24px;
    }

    .auditoria-resultado {
      padding:
        15px;
    }

    .auditoria-resultado-topo {
      flex-direction:
        column;

      align-items:
        flex-start;

      gap: 10px;
    }

    .auditoria-drawer-footer {
      flex-direction:
        column;

      align-items:
        stretch;

      padding:
        12px 14px;

      padding-bottom:
        max(
          12px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    .auditoria-drawer-footer > * {
      width: 100%;
    }
  }
`;