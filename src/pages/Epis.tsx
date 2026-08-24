import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  HardHat,
  Plus,
  Search,
  Package,
  PackageX,
  TriangleAlert,
  CalendarClock,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  FileBadge,
  Boxes,
  SlidersHorizontal,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

interface Epi {
  id: number;
  nome: string;
  ca: string;
  quantidade: number;
  validade: string;
}

type FiltroSituacao =
  | ""
  | "normal"
  | "baixo"
  | "sem-estoque"
  | "vencido"
  | "proximo-vencimento";

const epiInicial: Epi = {
  id: 0,
  nome: "",
  ca: "",
  quantidade: 1,
  validade: "",
};

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

export default function Epis() {
  const largura =
    useViewportWidth();

  const mobile =
    largura <= 650;

  const mobilePequeno =
    largura <= 430;

  const tablet =
    largura <= 900;

  const telaMedia =
    largura <= 1100;

  const [
    epis,
    setEpis,
  ] =
    useState<Epi[]>([]);

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    filtroSituacao,
    setFiltroSituacao,
  ] =
    useState<FiltroSituacao>(
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
    useState<Epi | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<Epi>(
      epiInicial
    );

  /*
   * CARREGAR EPIs DO SUPABASE
   */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarEpis() {
      const { data, error } =
        await supabase
          .from("epis")
          .select(
            "id, nome, ca, quantidade, validade"
          )
          .order("id", {
            ascending: true,
          });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar EPIs:",
          error
        );

        setEpis([]);

        window.alert(
          "Não foi possível carregar os EPIs."
        );

        return;
      }

      setEpis(
        (data ?? []) as Epi[]
      );
    }

    void carregarEpis();

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
        setDrawerAberto(false);

        setEditando(null);

        setFormulario({
          ...epiInicial,
        });
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

  const quantidadeTotal =
    epis.reduce(
      (total, epi) =>
        total +
        epi.quantidade,
      0
    );

  const estoqueBaixo =
    epis.filter(
      (epi) =>
        epi.quantidade > 0 &&
        epi.quantidade < 5
    ).length;

  const semEstoque =
    epis.filter(
      (epi) =>
        epi.quantidade === 0
    ).length;

  const vencidos =
    epis.filter(
      (epi) =>
        validadeVencida(
          epi.validade
        )
    ).length;

  const proximosVencimento =
    epis.filter(
      (epi) =>
        proximoDoVencimento(
          epi.validade
        )
    ).length;

  const itensDisponiveis =
    epis.filter(
      (epi) =>
        epi.quantidade >= 5 &&
        !validadeVencida(
          epi.validade
        )
    ).length;

  /*
   * FILTROS
   */

  const episFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return epis.filter(
        (epi) => {
          const correspondePesquisa =
            !termo ||
            epi.nome
              .toLowerCase()
              .includes(termo) ||
            epi.ca
              .toLowerCase()
              .includes(termo);

          const correspondeSituacao =
            !filtroSituacao ||
            verificarSituacao(
              epi,
              filtroSituacao
            );

          return (
            correspondePesquisa &&
            correspondeSituacao
          );
        }
      );
    }, [
      epis,
      pesquisa,
      filtroSituacao,
    ]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroSituacao !== "";

  /*
   * CRUD
   */

  function abrirNovoEpi() {
    setEditando(null);

    setFormulario({
      ...epiInicial,
    });

    setDrawerAberto(true);
  }

  function editarEpi(
    epi: Epi
  ) {
    setEditando(epi);

    setFormulario({
      ...epi,
    });

    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);

    setEditando(null);

    setFormulario({
      ...epiInicial,
    });
  }

  async function salvarEpi() {
    if (
      !formulario.nome.trim()
    ) {
      window.alert(
        "Informe o nome do EPI."
      );

      return;
    }

    if (
      !formulario.ca.trim()
    ) {
      window.alert(
        "Informe o número do CA."
      );

      return;
    }

    if (
      !formulario.validade
    ) {
      window.alert(
        "Informe a data de validade."
      );

      return;
    }

    if (
      !Number.isFinite(
        formulario.quantidade
      ) ||
      formulario.quantidade < 0
    ) {
      window.alert(
        "Informe uma quantidade válida."
      );

      return;
    }

    const payload = {
      nome: formulario.nome.trim(),
      ca: formulario.ca.trim(),
      quantidade: Math.trunc(
        Math.max(
          0,
          formulario.quantidade
        )
      ),
      validade: formulario.validade,
    };

    if (editando) {
      const { data, error } =
        await supabase
          .from("epis")
          .update(payload)
          .eq("id", editando.id)
          .select(
            "id, nome, ca, quantidade, validade"
          )
          .single();

      if (error || !data) {
        console.error(
          "Erro ao atualizar EPI:",
          error
        );

        window.alert(
          "Não foi possível atualizar o EPI."
        );

        return;
      }

      const epiAtualizado =
        data as Epi;

      setEpis(
        (listaAtual) =>
          listaAtual.map(
            (epi) =>
              epi.id ===
              epiAtualizado.id
                ? epiAtualizado
                : epi
          )
      );
    } else {
      const { data, error } =
        await supabase
          .from("epis")
          .insert(payload)
          .select(
            "id, nome, ca, quantidade, validade"
          )
          .single();

      if (error || !data) {
        console.error(
          "Erro ao cadastrar EPI:",
          error
        );

        window.alert(
          "Não foi possível cadastrar o EPI."
        );

        return;
      }

      const novoEpi =
        data as Epi;

      setEpis(
        (listaAtual) => [
          ...listaAtual,
          novoEpi,
        ]
      );
    }

    fecharDrawer();
  }

  async function excluirEpi(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este EPI?"
      );

    if (!confirmar) {
      return;
    }

    const { error } =
      await supabase
        .from("epis")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "Erro ao excluir EPI:",
        error
      );

      window.alert(
        "Não foi possível excluir o EPI."
      );

      return;
    }

    setEpis(
      (listaAtual) =>
        listaAtual.filter(
          (epi) =>
            epi.id !== id
        )
    );
  }

  function limparFiltros() {
    setPesquisa("");

    setFiltroSituacao("");
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
        title="Gestão de EPIs"
        subtitle="Controle de equipamentos de proteção individual, estoque, CA e validade."
        icon={HardHat}
      >
        <Button
          onClick={
            abrirNovoEpi
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

            Novo EPI
          </span>
        </Button>
      </PageHeader>

      {/* INDICADORES PRINCIPAIS */}

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
              ? 14
              : 20,
        }}
      >
        <StatCard
          title="EPIs Cadastrados"
          value={
            epis.length
          }
          icon={
            <HardHat
              size={22}
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Quantidade em Estoque"
          value={
            quantidadeTotal
          }
          icon={
            <Boxes
              size={22}
            />
          }
          color="#16A34A"
        />

        <StatCard
          title="Estoque Baixo"
          value={
            estoqueBaixo
          }
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Sem Estoque"
          value={
            semEstoque
          }
          icon={
            <PackageX
              size={22}
            />
          }
          color="#DC2626"
        />
      </div>

      {/* INDICADORES DE VALIDADE */}

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
                : "repeat(3, minmax(0, 1fr))",

          gap: mobile
            ? 10
            : 14,

          marginBottom:
            mobile
              ? 18
              : 28,
        }}
      >
        <IndicadorSecundario
          titulo="Validades vencidas"
          valor={
            vencidos
          }
          icon={
            <CalendarClock
              size={19}
            />
          }
          cor="#DC2626"
        />

        <IndicadorSecundario
          titulo="Próximos do vencimento"
          valor={
            proximosVencimento
          }
          icon={
            <TriangleAlert
              size={19}
            />
          }
          cor="#D97706"
        />

        <IndicadorSecundario
          titulo="Itens disponíveis"
          valor={
            itensDisponiveis
          }
          icon={
            <ShieldCheck
              size={19}
            />
          }
          cor="#16A34A"
        />
      </div>

      {/* PAINEL PRINCIPAL */}

      <section
        style={{
          width: "100%",

          minWidth: 0,

          boxSizing:
            "border-box",

          padding: mobile
            ? 16
            : 24,

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
            Controle de Equipamentos
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
            Consulte estoque, certificado
            de aprovação e validade dos
            EPIs.
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

              Filtros de EPIs
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
                placeholder="Pesquisar EPI ou CA..."
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

            {/* SITUAÇÃO */}

            <select
              value={
                filtroSituacao
              }
              onChange={(e) =>
                setFiltroSituacao(
                  e.target
                    .value as FiltroSituacao
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todas as situações
              </option>

              <option value="normal">
                Estoque normal
              </option>

              <option value="baixo">
                Estoque baixo
              </option>

              <option value="sem-estoque">
                Sem estoque
              </option>

              <option value="vencido">
                Validade vencida
              </option>

              <option value="proximo-vencimento">
                Próximo do vencimento
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
                episFiltrados.length
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
                epis.length
              }
            </strong>{" "}
            EPI(s)
          </div>
        </div>

        {/* TABELA */}

        {episFiltrados.length ===
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
                    ? 850
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
                    EPI
                  </Th>

                  <Th>
                    CA
                  </Th>

                  <Th>
                    Quantidade
                  </Th>

                  <Th>
                    Estoque
                  </Th>

                  <Th>
                    Validade
                  </Th>

                  <Th>
                    Situação
                  </Th>

                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {episFiltrados.map(
                  (epi) => (
                    <tr
                      key={
                        epi.id
                      }
                      style={{
                        borderTop:
                          "1px solid #E2E8F0",
                      }}
                    >
                      {/* EPI */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: 11,

                            width:
                              mobile
                                ? 175
                                : 200,

                            minWidth:
                              mobile
                                ? 175
                                : 200,
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
                            <HardHat
                              size={
                                19
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
                                epi.nome
                              }
                            </div>

                            <div
                              style={{
                                marginTop:
                                  3,

                                color:
                                  "#94A3B8",

                                fontSize:
                                  10,
                              }}
                            >
                              Equipamento de proteção
                            </div>
                          </div>
                        </div>
                      </Td>

                      {/* CA */}

                      <Td>
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: 7,

                            minWidth:
                              105,

                            color:
                              "#475569",

                            fontSize:
                              12,

                            fontWeight:
                              650,
                          }}
                        >
                          <FileBadge
                            size={
                              15
                            }
                            color="#94A3B8"
                            style={{
                              flexShrink:
                                0,
                            }}
                          />

                          <span
                            style={{
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {epi.ca ||
                              "Não informado"}
                          </span>
                        </div>
                      </Td>

                      {/* QUANTIDADE */}

                      <Td>
                        <strong
                          style={{
                            color:
                              "#0F172A",

                            fontSize:
                              16,
                          }}
                        >
                          {
                            epi.quantidade
                          }
                        </strong>
                      </Td>

                      {/* ESTOQUE */}

                      <Td>
                        {epi.quantidade ===
                        0 ? (
                          <Badge color="red">
                            Sem estoque
                          </Badge>
                        ) : epi.quantidade <
                          5 ? (
                          <Badge color="yellow">
                            Estoque baixo
                          </Badge>
                        ) : (
                          <Badge color="green">
                            Normal
                          </Badge>
                        )}
                      </Td>

                      {/* VALIDADE */}

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
                              validadeVencida(
                                epi.validade
                              )
                                ? "#DC2626"
                                : "#475569",

                            fontSize:
                              12,

                            fontWeight:
                              validadeVencida(
                                epi.validade
                              )
                                ? 700
                                : 500,

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <CalendarClock
                            size={
                              15
                            }
                            style={{
                              flexShrink:
                                0,
                            }}
                          />

                          {formatarData(
                            epi.validade
                          )}
                        </div>
                      </Td>

                      {/* SITUAÇÃO */}

                      <Td>
                        {validadeVencida(
                          epi.validade
                        ) ? (
                          <Badge color="red">
                            Vencido
                          </Badge>
                        ) : proximoDoVencimento(
                            epi.validade
                          ) ? (
                          <Badge color="yellow">
                            Próximo do vencimento
                          </Badge>
                        ) : (
                          <Badge color="green">
                            Regular
                          </Badge>
                        )}
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
                            title="Editar EPI"
                            aria-label="Editar EPI"
                            onClick={() =>
                              editarEpi(
                                epi
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
                            title="Excluir EPI"
                            aria-label="Excluir EPI"
                            onClick={() =>
                              excluirEpi(
                                epi.id
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
          className="epi-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="epi-drawer">
            {/* CABEÇALHO */}

            <header className="epi-drawer-header">
              <div className="epi-drawer-header-main">
                <div className="epi-drawer-icon">
                  <HardHat
                    size={22}
                  />
                </div>

                <div className="epi-drawer-title">
                  <h2>
                    {editando
                      ? "Editar EPI"
                      : "Novo EPI"}
                  </h2>

                  <p>
                    Controle de estoque,
                    CA e validade do
                    equipamento.
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

            <div className="epi-drawer-content">
              <Secao
                titulo="Identificação"
                descricao="Informe o equipamento e seu Certificado de Aprovação."
              >
                <Campo
                  label="Nome do EPI"
                  placeholder="Ex.: Luva térmica"
                  value={
                    formulario.nome
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      nome:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Número do CA"
                  placeholder="Ex.: 12345"
                  value={
                    formulario.ca
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      ca:
                        valor,
                    })
                  }
                />
              </Secao>

              <Secao
                titulo="Controle de estoque"
                descricao="Informe a quantidade disponível atualmente."
              >
                <Campo
                  label="Quantidade"
                  type="number"
                  value={String(
                    formulario.quantidade
                  )}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      quantidade:
                        Math.max(
                          0,
                          Number(
                            valor
                          )
                        ),
                    })
                  }
                />

                <div className="epi-estoque-resumo">
                  <div>
                    <div className="epi-estoque-label">
                      Situação do estoque
                    </div>

                    <div className="epi-estoque-quantidade">
                      {
                        formulario.quantidade
                      }{" "}
                      un.
                    </div>
                  </div>

                  {formulario.quantidade ===
                  0 ? (
                    <Badge color="red">
                      Sem estoque
                    </Badge>
                  ) : formulario.quantidade <
                    5 ? (
                    <Badge color="yellow">
                      Estoque baixo
                    </Badge>
                  ) : (
                    <Badge color="green">
                      Normal
                    </Badge>
                  )}
                </div>
              </Secao>

              <Secao
                titulo="Validade"
                descricao="Registre a data limite de utilização do equipamento."
              >
                <Campo
                  label="Data de validade"
                  type="date"
                  value={
                    formulario.validade
                  }
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,

                      validade:
                        valor,
                    })
                  }
                />

                {formulario.validade && (
                  <div
                    style={{
                      marginTop:
                        5,
                    }}
                  >
                    {validadeVencida(
                      formulario.validade
                    ) ? (
                      <Aviso
                        titulo="Validade vencida"
                        texto="Este equipamento já ultrapassou a data de validade cadastrada."
                        cor="#DC2626"
                      />
                    ) : proximoDoVencimento(
                        formulario.validade
                      ) ? (
                      <Aviso
                        titulo="Validade próxima"
                        texto="Este equipamento vence nos próximos 30 dias."
                        cor="#D97706"
                      />
                    ) : (
                      <Aviso
                        titulo="Validade regular"
                        texto="A validade cadastrada está dentro do período regular."
                        cor="#16A34A"
                      />
                    )}
                  </div>
                )}
              </Secao>
            </div>

            {/* RODAPÉ */}

            <footer className="epi-drawer-footer">
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
                  salvarEpi
                }
              >
                {editando
                  ? "Salvar alterações"
                  : "Cadastrar EPI"}
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

function IndicadorSecundario({
  titulo,
  valor,
  icon,
  cor,
}: {
  titulo: string;
  valor: number;
  icon: ReactNode;
  cor: string;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        display: "flex",

        alignItems:
          "center",

        gap: 13,

        padding:
          "15px 17px",

        boxSizing:
          "border-box",

        background:
          "#FFFFFF",

        border:
          "1px solid #E2E8F0",

        borderRadius:
          13,
      }}
    >
      <div
        style={{
          width: 37,

          height: 37,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          flexShrink: 0,

          borderRadius:
            9,

          background:
            `${cor}12`,

          color:
            cor,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            color:
              "#64748B",

            fontSize:
              11,

            fontWeight:
              650,

            lineHeight:
              1.4,

            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            marginTop:
              2,

            color:
              "#0F172A",

            fontSize:
              20,

            fontWeight:
              800,
          }}
        >
          {valor}
        </div>
      </div>
    </div>
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
    <section className="epi-form-secao">
      <div className="epi-form-secao-header">
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
    <div className="epi-grupo-campo">
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

function Aviso({
  titulo,
  texto,
  cor,
}: {
  titulo: string;
  texto: string;
  cor: string;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        padding: 14,

        boxSizing:
          "border-box",

        border:
          `1px solid ${cor}35`,

        borderRadius:
          11,

        background:
          `${cor}09`,
      }}
    >
      <div
        style={{
          color:
            cor,

          fontSize:
            12,

          fontWeight:
            750,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          marginTop:
            4,

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
        {texto}
      </div>
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
        <Package
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
        Nenhum EPI encontrado
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
        Altere os filtros ou cadastre
        um novo equipamento.
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

function verificarSituacao(
  epi: Epi,
  filtro: FiltroSituacao
) {
  if (
    filtro ===
    "sem-estoque"
  ) {
    return (
      epi.quantidade ===
      0
    );
  }

  if (
    filtro ===
    "baixo"
  ) {
    return (
      epi.quantidade > 0 &&
      epi.quantidade < 5
    );
  }

  if (
    filtro ===
    "vencido"
  ) {
    return validadeVencida(
      epi.validade
    );
  }

  if (
    filtro ===
    "proximo-vencimento"
  ) {
    return proximoDoVencimento(
      epi.validade
    );
  }

  if (
    filtro ===
    "normal"
  ) {
    return (
      epi.quantidade >= 5 &&
      !validadeVencida(
        epi.validade
      )
    );
  }

  return true;
}

function validadeVencida(
  validade: string
) {
  if (!validade) {
    return false;
  }

  const data =
    new Date(
      `${validade}T23:59:59`
    );

  return (
    data.getTime() <
    new Date().getTime()
  );
}

function proximoDoVencimento(
  validade: string
) {
  if (!validade) {
    return false;
  }

  const hoje =
    new Date();

  const dataValidade =
    new Date(
      `${validade}T23:59:59`
    );

  if (
    dataValidade.getTime() <
    hoje.getTime()
  ) {
    return false;
  }

  const diferenca =
    dataValidade.getTime() -
    hoje.getTime();

  const dias =
    diferenca /
    (1000 *
      60 *
      60 *
      24);

  return dias <= 30;
}

function formatarData(
  data: string
) {
  if (!data) {
    return "Não informada";
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
  .epi-drawer-overlay {
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

  .epi-drawer {
    width: 510px;
    max-width: 100%;

    height: 100vh;
    height: 100dvh;

    display: flex;
    flex-direction: column;

    box-sizing: border-box;

    background: #ffffff;

    box-shadow:
      -16px 0 45px
      rgba(15, 23, 42, .16);

    overflow: hidden;
  }

  .epi-drawer-header {
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

  .epi-drawer-header-main {
    min-width: 0;

    display: flex;

    gap: 12px;
  }

  .epi-drawer-icon {
    width: 43px;
    height: 43px;

    display: flex;

    align-items: center;

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

  .epi-drawer-title {
    min-width: 0;
  }

  .epi-drawer-title h2 {
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

  .epi-drawer-title p {
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

  .epi-drawer-content {
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

  .epi-form-secao {
    width: 100%;

    min-width: 0;

    margin-bottom:
      28px;
  }

  .epi-form-secao-header {
    margin-bottom:
      16px;
  }

  .epi-form-secao-header h3 {
    margin: 0;

    color:
      #0f172a;

    font-size:
      14px;

    font-weight:
      800;
  }

  .epi-form-secao-header p {
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

  .epi-grupo-campo {
    width: 100%;

    min-width: 0;

    display: flex;

    flex-direction:
      column;

    gap: 8px;

    margin-bottom:
      16px;
  }

  .epi-grupo-campo label {
    color:
      #334155;

    font-size:
      13px;

    font-weight:
      650;
  }

  .epi-estoque-resumo {
    width: 100%;

    min-width: 0;

    padding: 15px;

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

  .epi-estoque-label {
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

  .epi-estoque-quantidade {
    margin-top:
      4px;

    color:
      #0f172a;

    font-size:
      22px;

    font-weight:
      800;
  }

  .epi-drawer-footer {
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
    .epi-drawer {
      width: 100%;

      max-width: none;
    }

    .epi-drawer-header {
      padding:
        18px 16px;

      gap: 12px;
    }

    .epi-drawer-icon {
      width: 40px;

      height: 40px;

      border-radius:
        11px;
    }

    .epi-drawer-title h2 {
      font-size:
        18px;
    }

    .epi-drawer-title p {
      font-size:
        11px;
    }

    .epi-drawer-content {
      padding:
        20px 16px 26px;
    }

    .epi-drawer-footer {
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

    .epi-drawer-footer > * {
      flex:
        1 1 0;
    }
  }

  @media (max-width: 430px) {
    .epi-drawer-header {
      padding:
        16px 14px;
    }

    .epi-drawer-content {
      padding:
        18px 14px 24px;
    }

    .epi-estoque-resumo {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .epi-drawer-footer {
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

    .epi-drawer-footer > * {
      width: 100%;
    }
  }
`;