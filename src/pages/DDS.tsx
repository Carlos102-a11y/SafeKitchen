import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock3,
  CalendarDays,
  UserRound,
  Building2,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
  MessageSquareText,
  Presentation,
  Activity,
  TriangleAlert,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

interface DDSItem {
  id: number;
  data: string;
  tema: string;
  responsavel: string;
  setor: string;
  participantes: number;
  duracao: number;
  observacoes: string;
}

type FiltroPeriodo =
  | ""
  | "30"
  | "90";

function criarDDSInicial(): DDSItem {
  return {
    id: 0,
    data: dataHoje(),
    tema: "",
    responsavel: "",
    setor: "",
    participantes: 0,
    duracao: 15,
    observacoes: "",
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

export default function DDS() {
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
    dds,
    setDds,
  ] =
    useState<DDSItem[]>([]);

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
    filtroPeriodo,
    setFiltroPeriodo,
  ] =
    useState<FiltroPeriodo>(
      ""
    );

  const [
    drawerAberto,
    setDrawerAberto,
  ] = useState(false);

  const [
    editando,
    setEditando,
  ] =
    useState<DDSItem | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<DDSItem>(
      criarDDSInicial()
    );

  /*
   * CARREGAR DDS DO SUPABASE
   */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarDDS() {
      setCarregando(true);
      setErroBanco("");

      const {
        data,
        error,
      } = await supabase
        .from("dds")
        .select(
          "id, data, tema, responsavel, setor, participantes, duracao, observacoes"
        )
        .order(
          "data",
          { ascending: false }
        )
        .order(
          "id",
          { ascending: false }
        );

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar DDS:",
          error
        );

        setDds([]);
        setErroBanco(
          "Não foi possível carregar os registros de DDS."
        );
        setCarregando(false);

        return;
      }

      setDds(
        (data ?? []) as DDSItem[]
      );

      setCarregando(false);
    }

    void carregarDDS();

    return () => {
      componenteAtivo = false;
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
          criarDDSInicial()
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

  const totalParticipantes =
    dds.reduce(
      (total, item) =>
        total +
        item.participantes,
      0
    );

  const duracaoTotal =
    dds.reduce(
      (total, item) =>
        total +
        item.duracao,
      0
    );

  const mediaParticipantes =
    dds.length > 0
      ? Math.round(
          totalParticipantes /
            dds.length
        )
      : 0;

  const ddsUltimos30Dias =
    dds.filter(
      (item) =>
        dentroDosUltimosDias(
          item.data,
          30
        )
    ).length;

  const ddsUltimos90Dias =
    dds.filter(
      (item) =>
        dentroDosUltimosDias(
          item.data,
          90
        )
    ).length;

  const mediaDuracao =
    dds.length > 0
      ? Math.round(
          duracaoTotal /
            dds.length
        )
      : 0;

  const setoresCobertos =
    new Set(
      dds
        .map((item) =>
          item.setor
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    ).size;

  const atividadeRecente =
    ddsUltimos90Dias > 0
      ? Math.round(
          (ddsUltimos30Dias /
            ddsUltimos90Dias) *
            100
        )
      : 0;

  const temasRecentes =
    dds.slice(0, 3);

  /*
   * FILTROS
   */

  const ddsFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return dds.filter(
        (item) => {
          const correspondePesquisa =
            !termo ||
            item.tema
              .toLowerCase()
              .includes(
                termo
              ) ||
            item.responsavel
              .toLowerCase()
              .includes(
                termo
              ) ||
            item.setor
              .toLowerCase()
              .includes(
                termo
              );

          const correspondePeriodo =
            !filtroPeriodo ||
            dentroDosUltimosDias(
              item.data,
              Number(
                filtroPeriodo
              )
            );

          return (
            correspondePesquisa &&
            correspondePeriodo
          );
        }
      );
    }, [
      dds,
      pesquisa,
      filtroPeriodo,
    ]);

  /*
   * CRUD
   */

  function abrirNovoDDS() {
    setEditando(null);
    setErroBanco("");

    setFormulario(
      criarDDSInicial()
    );

    setDrawerAberto(true);
  }

  function editarDDS(
    item: DDSItem
  ) {
    setEditando(item);
    setErroBanco("");

    setFormulario({
      ...item,
    });

    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);

    setEditando(null);

    setFormulario(
      criarDDSInicial()
    );
  }

  async function salvarDDS() {
    if (salvando) {
      return;
    }

    if (!formulario.data) {
      window.alert(
        "Informe a data do DDS."
      );

      return;
    }

    if (
      !formulario.tema.trim()
    ) {
      window.alert(
        "Informe o tema do DDS."
      );

      return;
    }

    if (
      !formulario.responsavel.trim()
    ) {
      window.alert(
        "Informe o responsável pelo DDS."
      );

      return;
    }

    if (
      !formulario.setor.trim()
    ) {
      window.alert(
        "Informe o setor."
      );

      return;
    }

    if (
      !Number.isFinite(
        formulario.participantes
      ) ||
      formulario.participantes < 0
    ) {
      window.alert(
        "Informe uma quantidade válida de participantes."
      );

      return;
    }

    if (
      !Number.isFinite(
        formulario.duracao
      ) ||
      formulario.duracao < 0
    ) {
      window.alert(
        "Informe uma duração válida."
      );

      return;
    }

    const payload = {
      data:
        formulario.data,

      tema:
        formulario.tema.trim(),

      responsavel:
        formulario.responsavel.trim(),

      setor:
        formulario.setor.trim(),

      participantes:
        Math.max(
          0,
          formulario.participantes
        ),

      duracao:
        Math.max(
          0,
          formulario.duracao
        ),

      observacoes:
        formulario.observacoes.trim(),
    };

    setSalvando(true);
    setErroBanco("");

    try {
      if (editando) {
        const {
          data,
          error,
        } = await supabase
          .from("dds")
          .update(payload)
          .eq(
            "id",
            editando.id
          )
          .select(
            "id, data, tema, responsavel, setor, participantes, duracao, observacoes"
          )
          .single();

        if (error || !data) {
          console.error(
            "Erro ao atualizar DDS:",
            error
          );

          setErroBanco(
            "Não foi possível atualizar o DDS."
          );

          return;
        }

        const atualizado =
          data as DDSItem;

        setDds(
          (listaAtual) =>
            listaAtual.map(
              (item) =>
                item.id ===
                atualizado.id
                  ? atualizado
                  : item
            )
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("dds")
          .insert(payload)
          .select(
            "id, data, tema, responsavel, setor, participantes, duracao, observacoes"
          )
          .single();

        if (error || !data) {
          console.error(
            "Erro ao cadastrar DDS:",
            error
          );

          setErroBanco(
            "Não foi possível registrar o DDS."
          );

          return;
        }

        const novoDDS =
          data as DDSItem;

        setDds(
          (listaAtual) => [
            novoDDS,
            ...listaAtual,
          ]
        );
      }

      fecharDrawer();
    } finally {
      setSalvando(false);
    }
  }

  async function excluirDDS(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este DDS?"
      );

    if (!confirmar) {
      return;
    }

    setErroBanco("");

    const { error } =
      await supabase
        .from("dds")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "Erro ao excluir DDS:",
        error
      );

      setErroBanco(
        "Não foi possível excluir o DDS."
      );

      return;
    }

    setDds(
      (listaAtual) =>
        listaAtual.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function limparFiltros() {
    setPesquisa("");

    setFiltroPeriodo("");
  }

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroPeriodo !== "";

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
        title="Diálogo Diário de Segurança"
        subtitle="Registro e acompanhamento das orientações de segurança realizadas com as equipes."
        icon={BookOpen}
      >
        <Button
          onClick={
            abrirNovoDDS
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

            Novo DDS
          </span>
        </Button>
      </PageHeader>

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

            borderRadius: 12,

            background:
              "#FEF2F2",

            color:
              "#B91C1C",

            fontSize: "calc(12px * var(--sk-text-scale, 1))",

            fontWeight: 650,

            lineHeight: 1.5,
          }}
        >
          <div
            style={{
              display: "flex",

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
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink: 0,

              padding: 2,

              border: "none",

              background:
                "transparent",

              color:
                "#B91C1C",

              cursor:
                "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CONTEXTO GERENCIAL */}

      <section className="dds-contexto">
        <div className="dds-contexto-main">
          <div className="dds-contexto-icon">
            <Presentation size={22} />
          </div>

          <div className="dds-contexto-texto">
            <span>
              CAPACITAÇÃO PREVENTIVA
            </span>

            <h2>
              Orientação contínua para fortalecer a cultura de segurança
            </h2>

            <p>
              Registre os DDS realizados com as equipes, acompanhe participação,
              frequência e tempo dedicado às orientações preventivas.
            </p>
          </div>
        </div>

        <div className="dds-fluxo">
          <div>
            <strong>1</strong>
            <span>Orientar</span>
          </div>

          <div>
            <strong>2</strong>
            <span>Registrar</span>
          </div>

          <div>
            <strong>3</strong>
            <span>Acompanhar</span>
          </div>

          <div>
            <strong>4</strong>
            <span>Reforçar</span>
          </div>
        </div>
      </section>

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
          title="DDS Realizados"
          value={
            dds.length
          }
          icon={
            <BookOpen
              size={22}
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Participações"
          value={
            totalParticipantes
          }
          icon={
            <Users
              size={22}
            />
          }
          color="#16A34A"
        />

        <StatCard
          title="Média de Participantes"
          value={
            mediaParticipantes
          }
          icon={
            <Activity
              size={22}
            />
          }
          color="#7C3AED"
        />

        <StatCard
          title="Últimos 30 dias"
          value={
            ddsUltimos30Dias
          }
          icon={
            <CalendarDays
              size={22}
            />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Tempo Total"
          value={`${duracaoTotal} min`}
          icon={
            <Clock3
              size={22}
            />
          }
          color="#0EA5E9"
        />
      </div>

      {/* VISÃO OPERACIONAL */}

      <div className="dds-overview-grid">
        <section className="dds-overview-card">
          <div className="dds-overview-header">
            <div>
              <span className="dds-kicker">
                ATIVIDADE RECENTE
              </span>

              <h3>
                Ritmo das orientações
              </h3>
            </div>

            <Activity size={20} />
          </div>

          <div className="dds-overview-metrics">
            <IndicadorOperacional
              titulo="Últimos 30 dias"
              valor={String(
                ddsUltimos30Dias
              )}
              descricao="DDS realizados"
              icon={
                <CalendarDays
                  size={18}
                />
              }
              cor="#2563EB"
            />

            <IndicadorOperacional
              titulo="Últimos 90 dias"
              valor={String(
                ddsUltimos90Dias
              )}
              descricao="DDS realizados"
              icon={
                <BookOpen
                  size={18}
                />
              }
              cor="#7C3AED"
            />

            <IndicadorOperacional
              titulo="Duração média"
              valor={`${mediaDuracao} min`}
              descricao="por orientação"
              icon={
                <Clock3
                  size={18}
                />
              }
              cor="#0EA5E9"
            />

            <IndicadorOperacional
              titulo="Setores alcançados"
              valor={String(
                setoresCobertos
              )}
              descricao="setores distintos"
              icon={
                <Building2
                  size={18}
                />
              }
              cor="#16A34A"
            />
          </div>

          <div className="dds-atividade-barra">
            <div className="dds-atividade-barra-topo">
              <span>
                Concentração da atividade nos últimos 30 dias
              </span>

              <strong>
                {atividadeRecente}%
              </strong>
            </div>

            <div className="dds-atividade-track">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    atividadeRecente
                  )}%`,
                }}
              />
            </div>

            <p>
              Percentual dos DDS dos últimos 90 dias que ocorreu no período
              mais recente de 30 dias.
            </p>
          </div>
        </section>

        <section className="dds-overview-card">
          <div className="dds-overview-header">
            <div>
              <span className="dds-kicker">
                TEMAS MAIS RECENTES
              </span>

              <h3>
                Conteúdos abordados
              </h3>
            </div>

            <MessageSquareText
              size={20}
            />
          </div>

          {temasRecentes.length === 0 ? (
            <div className="dds-temas-vazio">
              Nenhum DDS registrado até o momento.
            </div>
          ) : (
            <div className="dds-temas-lista">
              {temasRecentes.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="dds-tema-item"
                  >
                    <div className="dds-tema-numero">
                      <Presentation
                        size={16}
                      />
                    </div>

                    <div className="dds-tema-conteudo">
                      <strong>
                        {item.tema}
                      </strong>

                      <span>
                        {item.setor} •{" "}
                        {formatarData(
                          item.data
                        )}
                      </span>
                    </div>

                    <div className="dds-tema-participantes">
                      <Users
                        size={14}
                      />

                      {
                        item.participantes
                      }
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="dds-temas-resumo">
            <Users size={17} />

            <span>
              Média de{" "}
              <strong>
                {mediaParticipantes}
              </strong>{" "}
              participante(s) por DDS.
            </span>
          </div>
        </section>
      </div>

      {/* HISTÓRICO */}

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
                  ? "calc(16px * var(--sk-text-scale, 1))"
                  : "calc(18px * var(--sk-text-scale, 1))",

              fontWeight:
                800,

              lineHeight:
                1.3,
            }}
          >
            Histórico de DDS
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",

              color:
                "#94A3B8",

              fontSize:
                "calc(12px * var(--sk-text-scale, 1))",

              lineHeight:
                1.5,

              overflowWrap:
                "anywhere",
            }}
          >
            Consulte os temas abordados,
            equipes participantes e
            responsáveis pelas orientações.
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
                  "calc(12px * var(--sk-text-scale, 1))",

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

              Filtros de DDS
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
                    "calc(11px * var(--sk-text-scale, 1))",

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
                  : "minmax(0, 1fr) minmax(200px, 230px)",

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
                    ? "Pesquisar DDS..."
                    : "Pesquisar tema, setor ou responsável..."
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
                    "calc(12px * var(--sk-text-scale, 1))",
                }}
              />
            </div>

            {/* PERÍODO */}

            <select
              value={
                filtroPeriodo
              }
              onChange={(e) =>
                setFiltroPeriodo(
                  e.target
                    .value as FiltroPeriodo
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todo o período
              </option>

              <option value="30">
                Últimos 30 dias
              </option>

              <option value="90">
                Últimos 90 dias
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
                "calc(11px * var(--sk-text-scale, 1))",

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
                ddsFiltrados.length
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
                dds.length
              }
            </strong>{" "}
            registro(s)
          </div>
        </div>

        {/* TABELA */}

        {carregando ? (
          <div
            style={{
              width: "100%",

              padding: mobile
                ? "34px 16px"
                : "46px 20px",

              boxSizing:
                "border-box",

              border:
                "1px solid #E2E8F0",

              borderRadius: 14,

              background:
                "#FFFFFF",

              color:
                "#64748B",

              fontSize: "calc(12px * var(--sk-text-scale, 1))",

              fontWeight: 600,

              textAlign:
                "center",
            }}
          >
            Carregando DDS...
          </div>
        ) : ddsFiltrados.length ===
        0 ? (
          <EstadoVazio
            mobile={
              mobile
            }
          />
        ) : mobile ? (
          <div className="dds-mobile-list">
            {ddsFiltrados.map(
              (item) => (
                <DDSCardMobile
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  onEditar={
                    editarDDS
                  }
                  onExcluir={
                    excluirDDS
                  }
                />
              )
            )}
          </div>
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
                    ? 900
                    : 1000,

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
                    DDS
                  </Th>

                  <Th>
                    Responsável
                  </Th>

                  <Th>
                    Setor
                  </Th>

                  <Th>
                    Participantes
                  </Th>

                  <Th>
                    Duração
                  </Th>

                  <Th>
                    Observações
                  </Th>

                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {ddsFiltrados.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      style={{
                        borderTop:
                          "1px solid #E2E8F0",
                      }}
                    >
                      {/* DDS */}

                      <Td>
                        <div
                          style={{
                            width:
                              210,

                            minWidth:
                              210,

                            display:
                              "flex",

                            alignItems:
                              "flex-start",

                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width:
                                37,

                              height:
                                37,

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
                            <Presentation
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
                                color:
                                  "#0F172A",

                                fontSize:
                                  "calc(13px * var(--sk-text-scale, 1))",

                                fontWeight:
                                  750,

                                lineHeight:
                                  1.4,

                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {
                                item.tema
                              }
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: 5,

                                marginTop:
                                  5,

                                color:
                                  "#64748B",

                                fontSize:
                                  "calc(10px * var(--sk-text-scale, 1))",

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
                                item.data
                              )}
                            </div>
                          </div>
                        </div>
                      </Td>

                      {/* RESPONSÁVEL */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "flex-start",

                            gap: 7,

                            width:
                              150,

                            minWidth:
                              150,

                            color:
                              "#475569",

                            fontSize:
                              "calc(12px * var(--sk-text-scale, 1))",
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
                              item.responsavel
                            }
                          </span>
                        </div>
                      </Td>

                      {/* SETOR */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "flex-start",

                            gap: 7,

                            width:
                              135,

                            minWidth:
                              135,

                            color:
                              "#475569",

                            fontSize:
                              "calc(12px * var(--sk-text-scale, 1))",
                          }}
                        >
                          <Building2
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
                              item.setor
                            }
                          </span>
                        </div>
                      </Td>

                      {/* PARTICIPANTES */}

                      <Td>
                        <Badge color="blue">
                          {
                            item.participantes
                          }{" "}
                          participante(s)
                        </Badge>
                      </Td>

                      {/* DURAÇÃO */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: 6,

                            minWidth:
                              80,

                            color:
                              "#475569",

                            fontSize:
                              "calc(12px * var(--sk-text-scale, 1))",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Clock3
                            size={
                              15
                            }
                            style={{
                              flexShrink:
                                0,
                            }}
                          />

                          {
                            item.duracao
                          }{" "}
                          min
                        </div>
                      </Td>

                      {/* OBSERVAÇÕES */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "flex-start",

                            gap: 7,

                            width:
                              220,

                            maxWidth:
                              220,

                            color:
                              "#64748B",

                            fontSize:
                              "calc(11px * var(--sk-text-scale, 1))",

                            lineHeight:
                              1.5,

                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          <MessageSquareText
                            size={
                              14
                            }
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
                            {item.observacoes ||
                              "Sem observações"}
                          </span>
                        </div>
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
                            title="Editar DDS"
                            aria-label="Editar DDS"
                            onClick={() =>
                              editarDDS(
                                item
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
                            title="Excluir DDS"
                            aria-label="Excluir DDS"
                            onClick={() =>
                              excluirDDS(
                                item.id
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
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DRAWER */}

      {drawerAberto && (
        <div
          className="dds-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="dds-drawer">
            {/* CABEÇALHO */}

            <header className="dds-drawer-header">
              <div className="dds-drawer-header-main">
                <div className="dds-drawer-icon">
                  <BookOpen
                    size={22}
                  />
                </div>

                <div className="dds-drawer-title">
                  <h2>
                    {editando
                      ? "Editar DDS"
                      : "Novo DDS"}
                  </h2>

                  <p>
                    Registre uma orientação
                    de segurança realizada
                    com a equipe.
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

            {/* CONTEÚDO */}

            <div className="dds-drawer-content">
              <div className="dds-form-intro">
                <div className="dds-form-intro-icon">
                  <Presentation
                    size={19}
                  />
                </div>

                <div>
                  <strong>
                    Registro de orientação preventiva
                  </strong>

                  <p>
                    Preencha os dados do DDS realizado. Os indicadores da página
                    serão atualizados automaticamente após o salvamento.
                  </p>
                </div>
              </div>

              {/* IDENTIFICAÇÃO */}

              <Secao
                titulo="Identificação"
                descricao="Informe o tema, data e setor onde o DDS foi realizado."
              >
                <Campo
                  label="Tema do DDS"
                  placeholder="Ex.: Prevenção de queimaduras"
                  value={
                    formulario.tema
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      tema:
                        valor,
                    })
                  }
                />

                <div className="dds-grid-2">
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
              </Secao>

              {/* REALIZAÇÃO */}

              <Secao
                titulo="Realização"
                descricao="Informe quem conduziu o DDS e os dados de participação."
              >
                <Campo
                  label="Responsável"
                  placeholder="Nome do responsável"
                  value={
                    formulario.responsavel
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      responsavel:
                        valor,
                    })
                  }
                />

                <div className="dds-grid-2">
                  <Campo
                    label="Participantes"
                    type="number"
                    value={String(
                      formulario.participantes
                    )}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        participantes:
                          Math.max(
                            0,
                            Number(
                              valor
                            )
                          ),
                      })
                    }
                  />

                  <Campo
                    label="Duração (minutos)"
                    type="number"
                    value={String(
                      formulario.duracao
                    )}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,

                        duracao:
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

                <div className="dds-resumo">
                  <div
                    style={{
                      minWidth:
                        0,
                    }}
                  >
                    <div className="dds-resumo-label">
                      Resumo
                    </div>

                    <div className="dds-resumo-texto">
                      {
                        formulario.participantes
                      }{" "}
                      participante(s) •{" "}
                      {
                        formulario.duracao
                      }{" "}
                      min
                    </div>
                  </div>

                  <Users
                    size={24}
                    color="#2563EB"
                    style={{
                      flexShrink:
                        0,
                    }}
                  />
                </div>
              </Secao>

              {/* OBSERVAÇÕES */}

              <Secao
                titulo="Observações"
                descricao="Registre pontos importantes, dúvidas ou orientações adicionais."
              >
                <textarea
                  value={
                    formulario.observacoes
                  }
                  placeholder="Ex.: Equipe orientada sobre uso correto de luvas térmicas..."
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,

                      observacoes:
                        e.target.value,
                    })
                  }
                  rows={5}
                  style={{
                    width:
                      "100%",

                    minWidth:
                      0,

                    padding:
                      "12px 13px",

                    boxSizing:
                      "border-box",

                    resize:
                      "vertical",

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
                      "calc(12px * var(--sk-text-scale, 1))",

                    lineHeight:
                      1.5,

                    outline:
                      "none",
                  }}
                />
              </Secao>
            </div>

            {/* RODAPÉ */}

            <footer className="dds-drawer-footer">
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
                  salvarDDS
                }
              >
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Registrar DDS"}
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
    <section className="dds-form-secao">
      <div className="dds-form-secao-header">
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

function IndicadorOperacional({
  titulo,
  valor,
  descricao,
  icon,
  cor,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icon: ReactNode;
  cor: string;
}) {
  return (
    <div className="dds-indicador-operacional">
      <div
        className="dds-indicador-operacional-icon"
        style={{
          color: cor,
          background: `${cor}12`,
        }}
      >
        {icon}
      </div>

      <div>
        <span>
          {titulo}
        </span>

        <strong>
          {valor}
        </strong>

        <small>
          {descricao}
        </small>
      </div>
    </div>
  );
}

function DDSCardMobile({
  item,
  onEditar,
  onExcluir,
}: {
  item: DDSItem;
  onEditar: (
    item: DDSItem
  ) => void;
  onExcluir: (
    id: number
  ) => void;
}) {
  return (
    <article className="dds-mobile-card">
      <div className="dds-mobile-card-topo">
        <div className="dds-mobile-identidade">
          <div className="dds-mobile-icon">
            <Presentation
              size={18}
            />
          </div>

          <div>
            <strong>
              {item.tema}
            </strong>

            <span>
              {formatarData(
                item.data
              )}
            </span>
          </div>
        </div>

        <Badge color="blue">
          {item.participantes} participante(s)
        </Badge>
      </div>

      <div className="dds-mobile-grid">
        <div>
          <span>
            Responsável
          </span>

          <strong>
            <UserRound
              size={14}
            />

            {item.responsavel}
          </strong>
        </div>

        <div>
          <span>
            Setor
          </span>

          <strong>
            <Building2
              size={14}
            />

            {item.setor}
          </strong>
        </div>

        <div>
          <span>
            Duração
          </span>

          <strong>
            <Clock3
              size={14}
            />

            {item.duracao} min
          </strong>
        </div>
      </div>

      <div className="dds-mobile-observacoes">
        <span>
          Observações
        </span>

        <p>
          {item.observacoes ||
            "Sem observações registradas."}
        </p>
      </div>

      <div className="dds-mobile-acoes">
        <button
          type="button"
          onClick={() =>
            onEditar(
              item
            )
          }
        >
          <Pencil
            size={16}
          />

          Editar
        </button>

        <button
          type="button"
          className="danger"
          onClick={() =>
            onExcluir(
              item.id
            )
          }
        >
          <Trash2
            size={16}
          />

          Excluir
        </button>
      </div>
    </article>
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
    <div className="dds-grupo-campo">
      <label>
        {label}
      </label>

      <input
        type={type}
        value={value}
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
        <BookOpen
          size={25}
        />
      </div>

      <strong
        style={{
          color:
            "#0F172A",

          fontSize:
            "calc(14px * var(--sk-text-scale, 1))",

          lineHeight:
            1.4,
        }}
      >
        Nenhum DDS encontrado
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
            "calc(12px * var(--sk-text-scale, 1))",

          lineHeight:
            1.5,
        }}
      >
        Cadastre um novo DDS ou altere
        os filtros.
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
          "calc(10px * var(--sk-text-scale, 1))",

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
          "calc(12px * var(--sk-text-scale, 1))",
      }}
    >
      {children}
    </td>
  );
}

function dentroDosUltimosDias(
  data: string,
  dias: number
) {
  if (!data) {
    return false;
  }

  const dataRegistro =
    new Date(
      `${data}T12:00:00`
    );

  const hoje =
    new Date();

  const limite =
    new Date();

  limite.setDate(
    hoje.getDate() -
      dias
  );

  return (
    dataRegistro.getTime() >=
      limite.getTime() &&
    dataRegistro.getTime() <=
      hoje.getTime()
  );
}

function formatarData(
  data: string
) {
  if (!data) {
    return "Sem data";
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
    "calc(13px * var(--sk-text-scale, 1))",

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
    "calc(11px * var(--sk-text-scale, 1))",

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
  .dds-contexto {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;

    margin-bottom: 20px;
    padding: 22px 24px;

    box-sizing: border-box;

    border-radius: 18px;

    background:
      linear-gradient(
        135deg,
        #0f172a 0%,
        #172554 100%
      );

    color: #ffffff;

    box-shadow:
      0 14px 30px
      rgba(15, 23, 42, .14);
  }

  .dds-contexto-main {
    min-width: 0;

    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .dds-contexto-icon {
    width: 45px;
    height: 45px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border: 1px solid
      rgba(255, 255, 255, .14);

    border-radius: 13px;

    background:
      rgba(255, 255, 255, .09);

    color: #bfdbfe;
  }

  .dds-contexto-texto {
    min-width: 0;
  }

  .dds-contexto-texto > span,
  .dds-kicker {
    color: #93c5fd;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 850;

    letter-spacing: .8px;
  }

  .dds-contexto-texto h2 {
    margin: 5px 0 0;

    color: #ffffff;

    font-size: calc(18px * var(--sk-text-scale, 1));
    font-weight: 820;

    line-height: 1.3;
  }

  .dds-contexto-texto p {
    max-width: 680px;

    margin: 7px 0 0;

    color: #cbd5e1;

    font-size: calc(12px * var(--sk-text-scale, 1));
    line-height: 1.55;
  }

  .dds-fluxo {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(74px, 1fr)
      );

    gap: 8px;

    flex-shrink: 0;
  }

  .dds-fluxo > div {
    min-width: 74px;

    padding: 10px 11px;

    border: 1px solid
      rgba(255, 255, 255, .12);

    border-radius: 11px;

    background:
      rgba(255, 255, 255, .06);

    text-align: center;
  }

  .dds-fluxo strong {
    width: 22px;
    height: 22px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border-radius: 999px;

    background: #2563eb;

    color: #ffffff;

    font-size: calc(10px * var(--sk-text-scale, 1));
  }

  .dds-fluxo span {
    display: block;

    margin-top: 5px;

    color: #e2e8f0;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 700;
  }

  .dds-overview-grid {
    width: 100%;
    min-width: 0;

    display: grid;

    grid-template-columns:
      minmax(0, 1.45fr)
      minmax(320px, .85fr);

    gap: 16px;

    margin-bottom: 28px;
  }

  .dds-overview-card {
    min-width: 0;

    padding: 20px;

    box-sizing: border-box;

    border: 1px solid #e2e8f0;
    border-radius: 16px;

    background: #ffffff;

    box-shadow:
      0 6px 18px
      rgba(15, 23, 42, .035);
  }

  .dds-overview-header {
    display: flex;

    align-items: flex-start;
    justify-content: space-between;

    gap: 16px;

    margin-bottom: 16px;

    color: #64748b;
  }

  .dds-overview-header h3 {
    margin: 4px 0 0;

    color: #0f172a;

    font-size: calc(15px * var(--sk-text-scale, 1));
    font-weight: 800;
  }

  .dds-overview-metrics {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0, 1fr)
      );

    gap: 10px;
  }

  .dds-indicador-operacional {
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 12px;

    border: 1px solid #e2e8f0;
    border-radius: 12px;

    background: #f8fafc;
  }

  .dds-indicador-operacional-icon {
    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 9px;
  }

  .dds-indicador-operacional > div:last-child {
    min-width: 0;
  }

  .dds-indicador-operacional span {
    display: block;

    color: #64748b;

    font-size: calc(9px * var(--sk-text-scale, 1));
    font-weight: 750;

    line-height: 1.3;
  }

  .dds-indicador-operacional strong {
    display: block;

    margin-top: 2px;

    color: #0f172a;

    font-size: calc(16px * var(--sk-text-scale, 1));
    font-weight: 850;

    line-height: 1.2;
  }

  .dds-indicador-operacional small {
    display: block;

    margin-top: 2px;

    color: #94a3b8;

    font-size: calc(9px * var(--sk-text-scale, 1));

    line-height: 1.3;
  }

  .dds-atividade-barra {
    margin-top: 14px;
    padding-top: 14px;

    border-top: 1px solid #e2e8f0;
  }

  .dds-atividade-barra-topo {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 12px;

    color: #64748b;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 650;
  }

  .dds-atividade-barra-topo strong {
    color: #2563eb;

    font-size: calc(12px * var(--sk-text-scale, 1));
  }

  .dds-atividade-track {
    width: 100%;
    height: 7px;

    margin-top: 8px;

    overflow: hidden;

    border-radius: 999px;

    background: #e2e8f0;
  }

  .dds-atividade-track > div {
    height: 100%;

    border-radius: 999px;

    background: #2563eb;

    transition: width .2s ease;
  }

  .dds-atividade-barra p {
    margin: 7px 0 0;

    color: #94a3b8;

    font-size: calc(9px * var(--sk-text-scale, 1));
    line-height: 1.45;
  }

  .dds-temas-lista {
    display: flex;
    flex-direction: column;

    gap: 9px;
  }

  .dds-tema-item {
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 10px;

    border: 1px solid #e2e8f0;
    border-radius: 11px;

    background: #f8fafc;
  }

  .dds-tema-numero {
    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 9px;

    background: #eff6ff;

    color: #2563eb;
  }

  .dds-tema-conteudo {
    min-width: 0;
    flex: 1;
  }

  .dds-tema-conteudo strong {
    display: block;

    color: #0f172a;

    font-size: calc(11px * var(--sk-text-scale, 1));
    font-weight: 750;

    line-height: 1.35;

    overflow-wrap: anywhere;
  }

  .dds-tema-conteudo span {
    display: block;

    margin-top: 3px;

    color: #94a3b8;

    font-size: calc(9px * var(--sk-text-scale, 1));
    line-height: 1.35;

    overflow-wrap: anywhere;
  }

  .dds-tema-participantes {
    display: flex;
    align-items: center;

    gap: 4px;

    flex-shrink: 0;

    color: #475569;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 750;
  }

  .dds-temas-resumo {
    display: flex;
    align-items: center;

    gap: 8px;

    margin-top: 12px;
    padding-top: 12px;

    border-top: 1px solid #e2e8f0;

    color: #64748b;

    font-size: calc(10px * var(--sk-text-scale, 1));
  }

  .dds-temas-resumo strong {
    color: #0f172a;
  }

  .dds-temas-vazio {
    padding: 22px 14px;

    border: 1px dashed #cbd5e1;
    border-radius: 11px;

    color: #94a3b8;

    font-size: calc(11px * var(--sk-text-scale, 1));
    text-align: center;
  }

  .dds-mobile-list {
    display: flex;
    flex-direction: column;

    gap: 12px;
  }

  .dds-mobile-card {
    min-width: 0;

    padding: 15px;

    border: 1px solid #e2e8f0;
    border-radius: 14px;

    background: #ffffff;

    box-shadow:
      0 5px 15px
      rgba(15, 23, 42, .035);
  }

  .dds-mobile-card-topo {
    display: flex;

    align-items: flex-start;
    justify-content: space-between;

    gap: 12px;
  }

  .dds-mobile-identidade {
    min-width: 0;

    display: flex;

    align-items: flex-start;

    gap: 10px;
  }

  .dds-mobile-icon {
    width: 37px;
    height: 37px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background: #eff6ff;

    color: #2563eb;
  }

  .dds-mobile-identidade > div:last-child {
    min-width: 0;
  }

  .dds-mobile-identidade strong {
    display: block;

    color: #0f172a;

    font-size: calc(13px * var(--sk-text-scale, 1));
    font-weight: 780;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  .dds-mobile-identidade span {
    display: block;

    margin-top: 4px;

    color: #94a3b8;

    font-size: calc(10px * var(--sk-text-scale, 1));
  }

  .dds-mobile-grid {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );

    gap: 8px;

    margin-top: 14px;
  }

  .dds-mobile-grid > div {
    min-width: 0;

    padding: 10px;

    border-radius: 10px;

    background: #f8fafc;
  }

  .dds-mobile-grid span,
  .dds-mobile-observacoes > span {
    display: block;

    color: #94a3b8;

    font-size: calc(9px * var(--sk-text-scale, 1));
    font-weight: 750;

    text-transform: uppercase;

    letter-spacing: .35px;
  }

  .dds-mobile-grid strong {
    display: flex;
    align-items: flex-start;

    gap: 5px;

    margin-top: 5px;

    color: #334155;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 700;

    line-height: 1.35;

    overflow-wrap: anywhere;
  }

  .dds-mobile-grid strong svg {
    flex-shrink: 0;
  }

  .dds-mobile-observacoes {
    margin-top: 10px;
    padding: 11px;

    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .dds-mobile-observacoes p {
    margin: 5px 0 0;

    color: #64748b;

    font-size: calc(10px * var(--sk-text-scale, 1));
    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .dds-mobile-acoes {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 8px;

    margin-top: 11px;
  }

  .dds-mobile-acoes button {
    min-height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 7px;

    border: 1px solid #bfdbfe;
    border-radius: 9px;

    background: #eff6ff;

    color: #2563eb;

    font-family: inherit;
    font-size: calc(11px * var(--sk-text-scale, 1));
    font-weight: 750;

    cursor: pointer;
  }

  .dds-mobile-acoes button.danger {
    border-color: #fecaca;

    background: #fef2f2;

    color: #dc2626;
  }

  .dds-form-intro {
    display: flex;
    align-items: flex-start;

    gap: 11px;

    margin-bottom: 18px;
    padding: 14px;

    border: 1px solid #bfdbfe;
    border-radius: 12px;

    background: #eff6ff;
  }

  .dds-form-intro-icon {
    width: 36px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background: #dbeafe;

    color: #2563eb;
  }

  .dds-form-intro strong {
    color: #1e3a8a;

    font-size: calc(11px * var(--sk-text-scale, 1));
    font-weight: 800;
  }

  .dds-form-intro p {
    margin: 4px 0 0;

    color: #475569;

    font-size: calc(10px * var(--sk-text-scale, 1));
    line-height: 1.45;
  }

  .dds-drawer-overlay {
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

  .dds-drawer {
    width: 550px;
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

  .dds-drawer-header {
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

  .dds-drawer-header-main {
    min-width: 0;

    display: flex;

    gap: 12px;
  }

  .dds-drawer-icon {
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

  .dds-drawer-title {
    min-width: 0;
  }

  .dds-drawer-title h2 {
    margin: 0;

    color:
      #0f172a;

    font-size: calc(20px * var(--sk-text-scale, 1));

    font-weight:
      800;

    line-height:
      1.25;
  }

  .dds-drawer-title p {
    margin:
      5px 0 0;

    color:
      #64748b;

    font-size: calc(12px * var(--sk-text-scale, 1));

    line-height:
      1.5;

    overflow-wrap:
      anywhere;
  }

  .dds-drawer-content {
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

  .dds-grid-2 {
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

  .dds-form-secao {
    width: 100%;
    min-width: 0;

    margin-bottom: 16px;
    padding: 18px;

    box-sizing: border-box;

    border: 1px solid #e2e8f0;
    border-radius: 14px;

    background: #ffffff;
  }

  .dds-form-secao-header {
    margin-bottom:
      16px;
  }

  .dds-form-secao-header h3 {
    margin: 0;

    color:
      #0f172a;

    font-size: calc(14px * var(--sk-text-scale, 1));

    font-weight:
      800;
  }

  .dds-form-secao-header p {
    margin:
      4px 0 0;

    color:
      #94a3b8;

    font-size: calc(11px * var(--sk-text-scale, 1));

    line-height:
      1.5;

    overflow-wrap:
      anywhere;
  }

  .dds-grupo-campo {
    width: 100%;

    min-width: 0;

    display: flex;

    flex-direction:
      column;

    gap: 8px;

    margin-bottom:
      16px;
  }

  .dds-grupo-campo label {
    color:
      #334155;

    font-size: calc(13px * var(--sk-text-scale, 1));

    font-weight:
      650;
  }

  .dds-resumo {
    width: 100%;

    min-width: 0;

    padding: 16px;

    display: flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap: 15px;

    box-sizing:
      border-box;

    background:
      #f8fafc;

    border:
      1px solid #e2e8f0;

    border-radius:
      12px;
  }

  .dds-resumo-label {
    color:
      #64748b;

    font-size: calc(10px * var(--sk-text-scale, 1));

    font-weight:
      800;

    text-transform:
      uppercase;

    letter-spacing:
      .4px;
  }

  .dds-resumo-texto {
    margin-top:
      5px;

    color:
      #0f172a;

    font-size: calc(13px * var(--sk-text-scale, 1));

    font-weight:
      700;

    line-height:
      1.45;

    overflow-wrap:
      anywhere;
  }

  .dds-drawer-footer {
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

  @media (max-width: 1150px) {
    .dds-contexto {
      align-items: flex-start;
      flex-direction: column;
    }

    .dds-fluxo {
      width: 100%;
    }

    .dds-overview-grid {
      grid-template-columns:
        minmax(0, 1fr);
    }

    .dds-overview-metrics {
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
    }
  }

  @media (max-width: 650px) {
    .dds-contexto {
      gap: 18px;

      margin-bottom: 14px;
      padding: 17px 15px;

      border-radius: 14px;
    }

    .dds-contexto-icon {
      width: 40px;
      height: 40px;

      border-radius: 11px;
    }

    .dds-contexto-texto h2 {
      font-size: calc(15px * var(--sk-text-scale, 1));
    }

    .dds-contexto-texto p {
      font-size: calc(11px * var(--sk-text-scale, 1));
    }

    .dds-fluxo {
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
    }

    .dds-fluxo > div {
      min-width: 0;
    }

    .dds-overview-grid {
      gap: 12px;

      margin-bottom: 18px;
    }

    .dds-overview-card {
      padding: 15px;

      border-radius: 14px;
    }

    .dds-overview-metrics {
      grid-template-columns:
        minmax(0, 1fr);
    }

    .dds-mobile-card-topo {
      flex-direction: column;
    }

    .dds-mobile-grid {
      grid-template-columns:
        minmax(0, 1fr);
    }

    .dds-form-secao {
      padding: 15px;

      border-radius: 12px;
    }

    .dds-drawer {
      width: 100%;

      max-width: none;
    }

    .dds-drawer-header {
      padding:
        18px 16px;

      gap: 12px;
    }

    .dds-drawer-icon {
      width: 40px;

      height: 40px;

      border-radius:
        11px;
    }

    .dds-drawer-title h2 {
      font-size: calc(18px * var(--sk-text-scale, 1));
    }

    .dds-drawer-title p {
      font-size: calc(11px * var(--sk-text-scale, 1));
    }

    .dds-drawer-content {
      padding:
        20px 16px 26px;
    }

    .dds-grid-2 {
      grid-template-columns:
        minmax(0, 1fr);

      gap: 0;
    }

    .dds-drawer-footer {
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

    .dds-drawer-footer > * {
      flex:
        1 1 0;
    }
  }

  @media (max-width: 430px) {
    .dds-drawer-header {
      padding:
        16px 14px;
    }

    .dds-drawer-content {
      padding:
        18px 14px 24px;
    }

    .dds-resumo {
      align-items:
        flex-start;
    }

    .dds-drawer-footer {
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

    .dds-drawer-footer > * {
      width: 100%;
    }
  }
`;