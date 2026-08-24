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

            fontSize: 12,

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
                  ? 16
                  : 18,

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
                12,

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
                    12,
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

              fontSize: 12,

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
                                  13,

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
                              12,
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
                              12,

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
                              11,

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
                      12,

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
            14,

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
            12,

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

    font-size:
      20px;

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

    font-size:
      12px;

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

    margin-bottom:
      28px;
  }

  .dds-form-secao-header {
    margin-bottom:
      16px;
  }

  .dds-form-secao-header h3 {
    margin: 0;

    color:
      #0f172a;

    font-size:
      14px;

    font-weight:
      800;
  }

  .dds-form-secao-header p {
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

    font-size:
      13px;

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

    font-size:
      10px;

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

    font-size:
      13px;

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

  @media (max-width: 650px) {
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
      font-size:
        18px;
    }

    .dds-drawer-title p {
      font-size:
        11px;
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