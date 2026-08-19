import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  ClipboardCheck,
  Plus,
  Search,
  CircleCheckBig,
  TriangleAlert,
  ShieldAlert,
  Activity,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  UserRound,
  Building2,
  ListChecks,
  SlidersHorizontal,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

type CampoChecklist =
  | "epis"
  | "piso"
  | "extintor"
  | "exaustao"
  | "iluminacao"
  | "facas"
  | "quimicos"
  | "emergencia";

type StatusChecklist =
  | "Conforme"
  | "Atenção"
  | "Crítico";

interface Checklist {
  id: number;

  data: string;

  setor: string;
  responsavel: string;

  observacoes: string;

  epis: boolean;
  piso: boolean;
  extintor: boolean;
  exaustao: boolean;
  iluminacao: boolean;
  facas: boolean;
  quimicos: boolean;
  emergencia: boolean;
}

const STORAGE = "checklists";

const itensChecklist: {
  campo: CampoChecklist;
  texto: string;
  descricao: string;
}[] = [
  {
    campo: "epis",
    texto: "Uso correto de EPIs",
    descricao:
      "Funcionários utilizando os EPIs necessários.",
  },
  {
    campo: "piso",
    texto: "Piso limpo e seco",
    descricao:
      "Ausência de líquidos, gordura ou obstáculos.",
  },
  {
    campo: "extintor",
    texto: "Extintor acessível",
    descricao:
      "Equipamento livre e disponível para emergência.",
  },
  {
    campo: "exaustao",
    texto: "Exaustão funcionando",
    descricao:
      "Sistema de ventilação e exaustão operando normalmente.",
  },
  {
    campo: "iluminacao",
    texto: "Iluminação adequada",
    descricao:
      "Ambiente com iluminação suficiente para as atividades.",
  },
  {
    campo: "facas",
    texto: "Facas armazenadas corretamente",
    descricao:
      "Objetos cortantes guardados em local apropriado.",
  },
  {
    campo: "quimicos",
    texto: "Produtos químicos identificados",
    descricao:
      "Produtos armazenados e identificados corretamente.",
  },
  {
    campo: "emergencia",
    texto: "Saídas de emergência livres",
    descricao:
      "Rotas e saídas sem bloqueios ou obstáculos.",
  },
];

function criarChecklistInicial(): Checklist {
  return {
    id: 0,

    data: dataHoje(),

    setor: "",
    responsavel: "",

    observacoes: "",

    epis: false,
    piso: false,
    extintor: false,
    exaustao: false,
    iluminacao: false,
    facas: false,
    quimicos: false,
    emergencia: false,
  };
}

function carregarChecklists(): Checklist[] {
  try {
    const dados =
      localStorage.getItem(
        STORAGE
      );

    if (!dados) {
      return [];
    }

    const convertido =
      JSON.parse(dados);

    if (
      !Array.isArray(
        convertido
      )
    ) {
      return [];
    }

    return convertido.map(
      (
        item: Partial<Checklist>,
        index: number
      ) => ({
        id:
          typeof item.id ===
          "number"
            ? item.id
            : Date.now() +
              index,

        data:
          item.data ||
          dataHoje(),

        setor:
          item.setor ||
          "Cozinha",

        responsavel:
          item.responsavel ||
          "Não informado",

        observacoes:
          item.observacoes ||
          "",

        epis:
          Boolean(
            item.epis
          ),

        piso:
          Boolean(
            item.piso
          ),

        extintor:
          Boolean(
            item.extintor
          ),

        exaustao:
          Boolean(
            item.exaustao
          ),

        iluminacao:
          Boolean(
            item.iluminacao
          ),

        facas:
          Boolean(
            item.facas
          ),

        quimicos:
          Boolean(
            item.quimicos
          ),

        emergencia:
          Boolean(
            item.emergencia
          ),
      })
    );
  } catch {
    return [];
  }
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

export default function Checklists() {
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
    checklists,
    setChecklists,
  ] =
    useState<Checklist[]>(
      carregarChecklists
    );

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<
      StatusChecklist | ""
    >("");

  const [
    drawerAberto,
    setDrawerAberto,
  ] = useState(false);

  const [
    editando,
    setEditando,
  ] =
    useState<Checklist | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<Checklist>(
      criarChecklistInicial()
    );

  /*
   * PERSISTÊNCIA
   */

  useEffect(() => {
    localStorage.setItem(
      STORAGE,
      JSON.stringify(
        checklists
      )
    );
  }, [checklists]);

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
          criarChecklistInicial()
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

  const conformes =
    checklists.filter(
      (checklist) =>
        obterStatus(
          checklist
        ) === "Conforme"
    ).length;

  const atencao =
    checklists.filter(
      (checklist) =>
        obterStatus(
          checklist
        ) === "Atenção"
    ).length;

  const criticos =
    checklists.filter(
      (checklist) =>
        obterStatus(
          checklist
        ) === "Crítico"
    ).length;

  const mediaConformidade =
    checklists.length > 0
      ? Math.round(
          checklists.reduce(
            (
              total,
              checklist
            ) =>
              total +
              calcularPercentual(
                checklist
              ),
            0
          ) /
            checklists.length
        )
      : 0;

  /*
   * FILTROS
   */

  const checklistsFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return checklists.filter(
        (checklist) => {
          const correspondePesquisa =
            !termo ||
            checklist.setor
              .toLowerCase()
              .includes(
                termo
              ) ||
            checklist.responsavel
              .toLowerCase()
              .includes(
                termo
              ) ||
            checklist.data
              .toLowerCase()
              .includes(
                termo
              );

          const correspondeStatus =
            !filtroStatus ||
            obterStatus(
              checklist
            ) ===
              filtroStatus;

          return (
            correspondePesquisa &&
            correspondeStatus
          );
        }
      );
    }, [
      checklists,
      pesquisa,
      filtroStatus,
    ]);

  /*
   * CRUD
   */

  function abrirNovaInspecao() {
    setEditando(null);

    setFormulario(
      criarChecklistInicial()
    );

    setDrawerAberto(true);
  }

  function editarChecklist(
    checklist: Checklist
  ) {
    setEditando(
      checklist
    );

    setFormulario({
      ...checklist,
    });

    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);

    setEditando(null);

    setFormulario(
      criarChecklistInicial()
    );
  }

  function salvarChecklist() {
    if (!formulario.data) {
      window.alert(
        "Informe a data da inspeção."
      );

      return;
    }

    if (
      !formulario.setor.trim()
    ) {
      window.alert(
        "Informe o setor da inspeção."
      );

      return;
    }

    if (
      !formulario.responsavel.trim()
    ) {
      window.alert(
        "Informe o responsável pela inspeção."
      );

      return;
    }

    if (editando) {
      setChecklists(
        (listaAtual) =>
          listaAtual.map(
            (checklist) =>
              checklist.id ===
              formulario.id
                ? formulario
                : checklist
          )
      );
    } else {
      const novoChecklist: Checklist =
        {
          ...formulario,

          id: Date.now(),
        };

      setChecklists(
        (listaAtual) => [
          ...listaAtual,
          novoChecklist,
        ]
      );
    }

    fecharDrawer();
  }

  function excluirChecklist(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir esta inspeção?"
      );

    if (!confirmar) {
      return;
    }

    setChecklists(
      (listaAtual) =>
        listaAtual.filter(
          (checklist) =>
            checklist.id !==
            id
        )
    );
  }

  function limparFiltros() {
    setPesquisa("");

    setFiltroStatus("");
  }

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroStatus !== "";

  const percentualFormulario =
    calcularPercentual(
      formulario
    );

  const statusFormulario =
    obterStatus(
      formulario
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
        title="Checklists de Segurança"
        subtitle="Inspeções preventivas das condições de segurança da cozinha."
        icon={
          ClipboardCheck
        }
      >
        <Button
          onClick={
            abrirNovaInspecao
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

            Nova Inspeção
          </span>
        </Button>
      </PageHeader>

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
          title="Inspeções Realizadas"
          value={
            checklists.length
          }
          icon={
            <ClipboardCheck
              size={22}
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Conformes"
          value={
            conformes
          }
          icon={
            <CircleCheckBig
              size={22}
            />
          }
          color="#16A34A"
        />

        <StatCard
          title="Requerem Atenção"
          value={
            atencao
          }
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Críticos"
          value={
            criticos
          }
          icon={
            <ShieldAlert
              size={22}
            />
          }
          color="#DC2626"
        />

        <StatCard
          title="Conformidade Média"
          value={`${mediaConformidade}%`}
          icon={
            <Activity
              size={22}
            />
          }
          color="#7C3AED"
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
            Histórico de Inspeções
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
            Acompanhe os resultados e
            níveis de conformidade das
            inspeções realizadas.
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

              Filtros de inspeções
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
                  : "minmax(0, 1fr) minmax(200px, 240px)",

              gap: mobile
                ? 10
                : 12,
            }}
          >
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
                    ? "Pesquisar inspeções..."
                    : "Pesquisar setor ou responsável..."
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

            <select
              value={
                filtroStatus
              }
              onChange={(e) =>
                setFiltroStatus(
                  e.target
                    .value as
                    | StatusChecklist
                    | ""
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todos os resultados
              </option>

              <option value="Conforme">
                Conforme
              </option>

              <option value="Atenção">
                Atenção
              </option>

              <option value="Crítico">
                Crítico
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
                checklistsFiltrados.length
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
                checklists.length
              }
            </strong>{" "}
            inspeção(ões)
          </div>
        </div>

        {/* LISTAGEM */}

        {checklistsFiltrados.length ===
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
                    ? 820
                    : 950,

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
                    Inspeção
                  </Th>

                  <Th>
                    Responsável
                  </Th>

                  <Th>
                    Conformidade
                  </Th>

                  <Th>
                    Resultado
                  </Th>

                  <Th>
                    Itens Conformes
                  </Th>

                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {checklistsFiltrados.map(
                  (checklist) => {
                    const percentual =
                      calcularPercentual(
                        checklist
                      );

                    const status =
                      obterStatus(
                        checklist
                      );

                    const itensConformes =
                      contarItensConformes(
                        checklist
                      );

                    return (
                      <tr
                        key={
                          checklist.id
                        }
                        style={{
                          borderTop:
                            "1px solid #E2E8F0",
                        }}
                      >
                        {/* INSPEÇÃO */}

                        <Td>
                          <div
                            style={{
                              width:
                                185,

                              minWidth:
                                185,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "flex-start",

                                gap: 8,

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
                                  16
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
                                {
                                  checklist.setor
                                }
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: 6,

                                marginTop:
                                  6,

                                color:
                                  "#64748B",

                                fontSize:
                                  11,

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
                                checklist.data
                              )}
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
                                155,

                              minWidth:
                                155,

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
                                checklist.responsavel
                              }
                            </span>
                          </div>
                        </Td>

                        {/* PERCENTUAL */}

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

                                justifyContent:
                                  "space-between",

                                gap: 8,

                                marginBottom:
                                  7,

                                color:
                                  "#475569",

                                fontSize:
                                  11,
                              }}
                            >
                              <span>
                                Resultado
                              </span>

                              <strong
                                style={{
                                  color:
                                    corStatus(
                                      status
                                    ),
                                }}
                              >
                                {
                                  percentual
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
                                  width: `${percentual}%`,

                                  height:
                                    "100%",

                                  background:
                                    corStatus(
                                      status
                                    ),

                                  borderRadius:
                                    999,
                                }}
                              />
                            </div>
                          </div>
                        </Td>

                        {/* STATUS */}

                        <Td>
                          <Badge
                            color={
                              status ===
                              "Conforme"
                                ? "green"
                                : status ===
                                    "Atenção"
                                  ? "yellow"
                                  : "red"
                            }
                          >
                            {
                              status
                            }
                          </Badge>
                        </Td>

                        {/* ITENS */}

                        <Td>
                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap: 7,

                              minWidth:
                                90,

                              color:
                                "#475569",

                              fontSize:
                                12,

                              fontWeight:
                                650,

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            <ListChecks
                              size={
                                15
                              }
                              color="#94A3B8"
                            />

                            {
                              itensConformes
                            }
                            /
                            {
                              itensChecklist.length
                            }
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
                              title="Editar inspeção"
                              aria-label="Editar inspeção"
                              onClick={() =>
                                editarChecklist(
                                  checklist
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
                              title="Excluir inspeção"
                              aria-label="Excluir inspeção"
                              onClick={() =>
                                excluirChecklist(
                                  checklist.id
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
          className="checklist-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="checklist-drawer">
            {/* CABEÇALHO */}

            <header className="checklist-drawer-header">
              <div className="checklist-drawer-header-main">
                <div className="checklist-drawer-icon">
                  <ClipboardCheck
                    size={22}
                  />
                </div>

                <div className="checklist-drawer-title">
                  <h2>
                    {editando
                      ? "Editar inspeção"
                      : "Nova inspeção"}
                  </h2>

                  <p>
                    Checklist de segurança das
                    condições da cozinha.
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

            <div className="checklist-drawer-content">
              {/* IDENTIFICAÇÃO */}

              <Secao
                titulo="Identificação da inspeção"
                descricao="Informe quando, onde e por quem a inspeção foi realizada."
              >
                <div className="checklist-grid-2">
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
                  label="Responsável pela inspeção"
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
              </Secao>

              {/* ITENS */}

              <Secao
                titulo="Itens de verificação"
                descricao="Marque os itens que estão em conformidade durante a inspeção."
              >
                <div className="checklist-itens">
                  {itensChecklist.map(
                    (item) => {
                      const marcado =
                        formulario[
                          item.campo
                        ];

                      return (
                        <label
                          key={
                            item.campo
                          }
                          className={
                            marcado
                              ? "checklist-item checklist-item-marcado"
                              : "checklist-item"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              marcado
                            }
                            onChange={(e) =>
                              setFormulario({
                                ...formulario,

                                [item.campo]:
                                  e.target
                                    .checked,
                              })
                            }
                          />

                          <div
                            style={{
                              minWidth:
                                0,
                            }}
                          >
                            <div className="checklist-item-titulo">
                              {
                                item.texto
                              }
                            </div>

                            <div className="checklist-item-descricao">
                              {
                                item.descricao
                              }
                            </div>
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>
              </Secao>

              {/* RESULTADO AUTOMÁTICO */}

              <Secao
                titulo="Resultado da inspeção"
                descricao="A conformidade é calculada automaticamente com base nos itens marcados."
              >
                <div className="checklist-resultado">
                  <div className="checklist-resultado-topo">
                    <div>
                      <div className="checklist-resultado-label">
                        Conformidade
                      </div>

                      <div className="checklist-resultado-numero">
                        {
                          percentualFormulario
                        }
                        %
                      </div>
                    </div>

                    <Badge
                      color={
                        statusFormulario ===
                        "Conforme"
                          ? "green"
                          : statusFormulario ===
                              "Atenção"
                            ? "yellow"
                            : "red"
                      }
                    >
                      {
                        statusFormulario
                      }
                    </Badge>
                  </div>

                  <div className="checklist-progress">
                    <div
                      style={{
                        width: `${percentualFormulario}%`,

                        height:
                          "100%",

                        background:
                          corStatus(
                            statusFormulario
                          ),

                        borderRadius:
                          999,

                        transition:
                          "width .2s ease",
                      }}
                    />
                  </div>

                  <div className="checklist-resultado-texto">
                    {
                      contarItensConformes(
                        formulario
                      )
                    }{" "}
                    de{" "}
                    {
                      itensChecklist.length
                    }{" "}
                    itens em conformidade.
                  </div>
                </div>
              </Secao>

              {/* OBSERVAÇÕES */}

              <Secao
                titulo="Observações"
                descricao="Registre informações adicionais ou não conformidades identificadas."
              >
                <textarea
                  value={
                    formulario.observacoes
                  }
                  placeholder="Ex.: Piso molhado próximo à área de lavagem..."
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,

                      observacoes:
                        e.target.value,
                    })
                  }
                  rows={4}
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

            <footer className="checklist-drawer-footer">
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
                  salvarChecklist
                }
              >
                {editando
                  ? "Salvar alterações"
                  : "Registrar inspeção"}
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
    <section className="checklist-form-secao">
      <div className="checklist-form-secao-header">
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
    <div className="checklist-grupo-campo">
      <label>
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
        <ClipboardCheck
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
        Nenhuma inspeção encontrada
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
        Cadastre uma nova inspeção ou
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
 * REGRAS DO CHECKLIST
 */

function contarItensConformes(
  checklist: Checklist
) {
  return itensChecklist.reduce(
    (total, item) =>
      checklist[
        item.campo
      ]
        ? total + 1
        : total,
    0
  );
}

function calcularPercentual(
  checklist: Checklist
) {
  const conformes =
    contarItensConformes(
      checklist
    );

  return Math.round(
    (conformes /
      itensChecklist.length) *
      100
  );
}

function obterStatus(
  checklist: Checklist
): StatusChecklist {
  const percentual =
    calcularPercentual(
      checklist
    );

  if (
    percentual ===
    100
  ) {
    return "Conforme";
  }

  if (
    percentual >= 75
  ) {
    return "Atenção";
  }

  return "Crítico";
}

function corStatus(
  status: StatusChecklist
) {
  if (
    status ===
    "Conforme"
  ) {
    return "#16A34A";
  }

  if (
    status ===
    "Atenção"
  ) {
    return "#F59E0B";
  }

  return "#DC2626";
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

/*
 * ESTILOS
 */

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
  .checklist-drawer-overlay {
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

  .checklist-drawer {
    width: 620px;
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

  .checklist-drawer-header {
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

  .checklist-drawer-header-main {
    min-width: 0;

    display: flex;

    gap: 12px;
  }

  .checklist-drawer-icon {
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

  .checklist-drawer-title {
    min-width: 0;
  }

  .checklist-drawer-title h2 {
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

  .checklist-drawer-title p {
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

  .checklist-drawer-content {
    flex: 1;

    min-height: 0;

    padding:
      24px 26px 30px;

    box-sizing:
      border-box;

    overflow-y:
      auto;

    overflow-x:
      hidden;

    -webkit-overflow-scrolling:
      touch;
  }

  .checklist-grid-2 {
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

  .checklist-form-secao {
    width: 100%;

    min-width: 0;

    margin-bottom:
      28px;
  }

  .checklist-form-secao-header {
    margin-bottom:
      16px;
  }

  .checklist-form-secao-header h3 {
    margin: 0;

    color:
      #0f172a;

    font-size:
      14px;

    font-weight:
      800;
  }

  .checklist-form-secao-header p {
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

  .checklist-grupo-campo {
    width: 100%;

    min-width: 0;

    display: flex;

    flex-direction:
      column;

    gap: 8px;

    margin-bottom:
      16px;
  }

  .checklist-grupo-campo label {
    color:
      #334155;

    font-size:
      13px;

    font-weight:
      650;
  }

  .checklist-itens {
    display: flex;

    flex-direction:
      column;

    gap: 9px;
  }

  .checklist-item {
    width: 100%;

    min-width: 0;

    display: flex;

    align-items:
      flex-start;

    gap: 12px;

    padding:
      13px 14px;

    box-sizing:
      border-box;

    border:
      1px solid #e2e8f0;

    border-radius:
      11px;

    background:
      #ffffff;

    cursor:
      pointer;

    transition:
      .15s ease;
  }

  .checklist-item-marcado {
    border-color:
      #86efac;

    background:
      #f0fdf4;
  }

  .checklist-item input {
    width: 17px;
    height: 17px;

    margin-top: 2px;

    flex-shrink: 0;

    cursor:
      pointer;
  }

  .checklist-item-titulo {
    color:
      #0f172a;

    font-size:
      12px;

    font-weight:
      700;

    line-height:
      1.4;

    overflow-wrap:
      anywhere;
  }

  .checklist-item-descricao {
    margin-top:
      3px;

    color:
      #94a3b8;

    font-size:
      10px;

    line-height:
      1.45;

    overflow-wrap:
      anywhere;
  }

  .checklist-resultado {
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

  .checklist-resultado-topo {
    display: flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap: 20px;

    margin-bottom:
      13px;
  }

  .checklist-resultado-label {
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

  .checklist-resultado-numero {
    margin-top:
      4px;

    color:
      #0f172a;

    font-size:
      32px;

    font-weight:
      850;
  }

  .checklist-progress {
    width: 100%;

    height: 9px;

    overflow:
      hidden;

    background:
      #e2e8f0;

    border-radius:
      999px;
  }

  .checklist-resultado-texto {
    margin-top:
      9px;

    color:
      #64748b;

    font-size:
      10px;

    line-height:
      1.45;
  }

  .checklist-drawer-footer {
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
    .checklist-drawer {
      width: 100%;

      max-width: none;
    }

    .checklist-drawer-header {
      padding:
        18px 16px;

      gap: 12px;
    }

    .checklist-drawer-icon {
      width: 40px;

      height: 40px;

      border-radius:
        11px;
    }

    .checklist-drawer-title h2 {
      font-size:
        18px;
    }

    .checklist-drawer-title p {
      font-size:
        11px;
    }

    .checklist-drawer-content {
      padding:
        20px 16px 26px;
    }

    .checklist-grid-2 {
      grid-template-columns:
        minmax(0, 1fr);

      gap: 0;
    }

    .checklist-drawer-footer {
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

    .checklist-drawer-footer > * {
      flex:
        1 1 0;
    }
  }

  @media (max-width: 430px) {
    .checklist-drawer-header {
      padding:
        16px 14px;
    }

    .checklist-drawer-content {
      padding:
        18px 14px 24px;
    }

    .checklist-item {
      padding:
        12px;
    }

    .checklist-resultado {
      padding:
        15px;
    }

    .checklist-resultado-topo {
      flex-direction:
        column;

      align-items:
        flex-start;

      gap: 10px;
    }

    .checklist-drawer-footer {
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

    .checklist-drawer-footer > * {
      width: 100%;
    }
  }
`;