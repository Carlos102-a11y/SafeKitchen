import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  TriangleAlert,
  ShieldCheck,
  Clock3,
  CircleCheckBig,
  Search,
  SlidersHorizontal,
  ArrowRight,
  CalendarDays,
  UserRound,
  Building2,
  Target,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

import type { PgrItem } from "../models/Pgr";

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
  categoria: PgrItem["categoria"];
  probabilidade: PgrItem["probabilidade"];
  severidade: PgrItem["severidade"];
  nivel: number;
  classificacao: PgrItem["classificacao"];
  medida_controle: string;
  responsavel: string;
  prazo: string | null;
  status: PgrItem["status"];
}

const CAMPOS_PGR =
  "id, setor, atividade, perigo, categoria, probabilidade, severidade, nivel, classificacao, medida_controle, responsavel, prazo, status";

function converterPgr(
  item: PgrRow
): PgrItem {
  return {
    id: item.id,
    setor: item.setor,
    atividade: item.atividade,
    perigo: item.perigo,
    categoria: item.categoria,
    probabilidade: item.probabilidade,
    severidade: item.severidade,
    nivel: item.nivel,
    classificacao: item.classificacao,
    medidaControle:
      item.medida_controle,
    responsavel:
      item.responsavel,
    prazo: item.prazo ?? "",
    status: item.status,
  };
}

function useViewportWidth() {
  const [largura, setLargura] =
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

export default function Riscos() {
  const navigate =
    useNavigate();

  const largura =
    useViewportWidth();

  const mobile =
    largura <= 650;

  const mobilePequeno =
    largura <= 430;

  const tablet =
    largura <= 900;

  const telaMedia =
    largura <= 1200;

  const [
    riscos,
    setRiscos,
  ] = useState<PgrItem[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erroBanco,
    setErroBanco,
  ] = useState<string | null>(
    null
  );

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    filtroCategoria,
    setFiltroCategoria,
  ] =
    useState<FiltroCategoria>("");

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
    useState<FiltroStatus>("");

  /*
   * SUPABASE
   */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarRiscos() {
      setCarregando(true);
      setErroBanco(null);

      const {
        data,
        error,
      } = await supabase
        .from("pgr")
        .select(CAMPOS_PGR)
        .order("id", {
          ascending: true,
        });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar riscos:",
          error
        );

        setRiscos([]);

        setErroBanco(
          "Não foi possível carregar os riscos do PGR."
        );

        setCarregando(false);
        return;
      }

      const registros =
        (data ?? []).map(
          (item) =>
            converterPgr(
              item as PgrRow
            )
        );

      setRiscos(registros);
      setCarregando(false);
    }

    void carregarRiscos();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  /*
   * INDICADORES
   */

  const riscosCriticos =
    riscos.filter(
      (risco) =>
        risco.classificacao ===
        "Crítico"
    ).length;

  const riscosAltos =
    riscos.filter(
      (risco) =>
        risco.classificacao ===
        "Alto"
    ).length;

  const riscosConcluidos =
    riscos.filter(
      (risco) =>
        risco.status ===
        "Concluído"
    ).length;

  const prazosVencidos =
    riscos.filter(
      (risco) =>
        prazoVencido(risco)
    ).length;

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
            risco.perigo
              .toLowerCase()
              .includes(termo) ||
            risco.setor
              .toLowerCase()
              .includes(termo) ||
            risco.atividade
              .toLowerCase()
              .includes(termo) ||
            risco.responsavel
              .toLowerCase()
              .includes(termo) ||
            risco.medidaControle
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

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroCategoria !== "" ||
    filtroClassificacao !== "" ||
    filtroStatus !== "";

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
        title="Gestão de Riscos"
        subtitle="Visão operacional dos riscos identificados no Programa de Gerenciamento de Riscos."
        icon={TriangleAlert}
      >
        <Button
          onClick={() =>
            navigate("/pgr")
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
            <ShieldCheck
              size={18}
            />

            Acessar PGR
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
          title="Riscos Monitorados"
          value={riscos.length}
          icon={
            <Target size={22} />
          }
          color="#2563EB"
        />

        <StatCard
          title="Críticos"
          value={riscosCriticos}
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#DC2626"
        />

        <StatCard
          title="Altos"
          value={riscosAltos}
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#F97316"
        />

        <StatCard
          title="Prazos Vencidos"
          value={prazosVencidos}
          icon={
            <Clock3 size={22} />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Controles Concluídos"
          value={riscosConcluidos}
          icon={
            <CircleCheckBig
              size={22}
            />
          }
          color="#16A34A"
        />
      </div>

      {/* PAINEL */}

      <section
        style={{
          width: "100%",
          minWidth: 0,
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
          padding: mobile
            ? 16
            : 24,
          boxShadow:
            "0 6px 20px rgba(15, 23, 42, .04)",
          overflow:
            "hidden",
        }}
      >
        {/* CABEÇALHO DA SEÇÃO */}

        <div
          style={{
            display: "flex",
            flexDirection:
              mobile
                ? "column"
                : "row",
            alignItems:
              mobile
                ? "stretch"
                : "flex-start",
            justifyContent:
              "space-between",
            gap: mobile
              ? 12
              : 20,
            marginBottom:
              mobile
                ? 18
                : 22,
            minWidth: 0,
          }}
        >
          <div
            style={{
              minWidth: 0,
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
              Monitoramento dos Riscos
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#94A3B8",
                fontSize: 12,
                lineHeight: 1.5,
                overflowWrap:
                  "anywhere",
              }}
            >
              Acompanhe classificação,
              medidas de controle,
              responsáveis e prazos.
            </p>
          </div>

          <div
            style={{
              alignSelf:
                mobile
                  ? "flex-start"
                  : "auto",
              padding:
                "8px 11px",
              borderRadius: 9,
              background:
                "#EFF6FF",
              color:
                "#2563EB",
              fontSize: 11,
              fontWeight: 700,
              whiteSpace:
                "nowrap",
            }}
          >
            Sincronizado com o PGR
          </div>
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
              marginBottom: 14,
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
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <SlidersHorizontal
                size={16}
                style={{
                  flexShrink: 0,
                }}
              />

              Filtros operacionais
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
                  fontSize: 11,
                  fontWeight: 700,
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
                    : "minmax(280px, 2fr) repeat(3, minmax(160px, 1fr))",
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
                borderRadius: 10,
              }}
            >
              <Search
                size={17}
                color="#94A3B8"
                style={{
                  flexShrink: 0,
                }}
              />

              <input
                type="text"
                value={pesquisa}
                placeholder={
                  mobile
                    ? "Pesquisar riscos..."
                    : "Pesquisar risco, setor, responsável ou controle..."
                }
                onChange={(e) =>
                  setPesquisa(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  minWidth: 0,
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
                  fontSize: 12,
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
              style={estiloSelect}
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
              style={estiloSelect}
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
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(
                  e.target
                    .value as FiltroStatus
                )
              }
              style={estiloSelect}
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

          <div
            style={{
              marginTop: 11,
              color:
                "#64748B",
              fontSize: 11,
              lineHeight: 1.5,
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
              {riscos.length}
            </strong>{" "}
            risco(s)
          </div>
        </div>

        {/* LISTAGEM */}

        {carregando ? (
          <div
            style={{
              width: "100%",
              minHeight:
                mobile
                  ? 220
                  : 260,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: 30,
              boxSizing:
                "border-box",
              border:
                "1px dashed #CBD5E1",
              borderRadius: 14,
              color:
                "#64748B",
              fontSize: 12,
              fontWeight: 600,
              textAlign:
                "center",
            }}
          >
            Carregando riscos do PGR...
          </div>
        ) : erroBanco ? (
          <div
            style={{
              width: "100%",
              minHeight:
                mobile
                  ? 220
                  : 260,
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
                "1px dashed #FCA5A5",
              borderRadius: 14,
              background:
                "#FEF2F2",
              textAlign:
                "center",
            }}
          >
            <TriangleAlert
              size={27}
              color="#DC2626"
            />

            <strong
              style={{
                marginTop: 10,
                color:
                  "#991B1B",
                fontSize: 14,
              }}
            >
              Erro ao carregar os riscos
            </strong>

            <span
              style={{
                maxWidth: 400,
                marginTop: 6,
                color:
                  "#B91C1C",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {erroBanco}
            </span>
          </div>
        ) : riscosFiltrados.length ===
        0 ? (
          <EstadoVazio
            possuiRiscos={
              riscos.length > 0
            }
            onAbrirPgr={() =>
              navigate("/pgr")
            }
            mobile={mobile}
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
                    ? 980
                    : 1100,
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
                  <th style={thStyle}>
                    Risco
                  </th>

                  <th style={thStyle}>
                    Classificação
                  </th>

                  <th style={thStyle}>
                    Medida de Controle
                  </th>

                  <th style={thStyle}>
                    Responsável
                  </th>

                  <th style={thStyle}>
                    Prazo
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "center",
                    }}
                  >
                    PGR
                  </th>
                </tr>
              </thead>

              <tbody>
                {riscosFiltrados.map(
                  (risco) => (
                    <tr
                      key={risco.id}
                      style={{
                        borderTop:
                          "1px solid #E2E8F0",
                      }}
                    >
                      {/* RISCO */}

                      <td style={tdStyle}>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "flex-start",
                            gap: 11,
                            width:
                              mobile
                                ? 190
                                : 215,
                            minWidth:
                              mobile
                                ? 190
                                : 215,
                          }}
                        >
                          <div
                            style={{
                              width: 37,
                              height: 37,
                              flexShrink:
                                0,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              borderRadius:
                                10,
                              background:
                                "#F1F5F9",
                              color:
                                "#64748B",
                            }}
                          >
                            <Building2
                              size={17}
                            />
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                color:
                                  "#0F172A",
                                fontSize: 13,
                                fontWeight:
                                  750,
                                lineHeight:
                                  1.4,
                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {risco.perigo}
                            </div>

                            <div
                              style={{
                                marginTop: 4,
                                color:
                                  "#64748B",
                                fontSize: 11,
                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {risco.setor}
                            </div>

                            <div
                              style={{
                                marginTop: 3,
                                color:
                                  "#94A3B8",
                                fontSize: 10,
                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {risco.atividade}
                            </div>

                            <div
                              style={{
                                marginTop: 7,
                              }}
                            >
                              <Badge color="blue">
                                {
                                  risco.categoria
                                }
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CLASSIFICAÇÃO */}

                      <td style={tdStyle}>
                        <div
                          style={{
                            minWidth: 120,
                          }}
                        >
                          <Badge
                            color={
                              risco.classificacao ===
                              "Crítico"
                                ? "red"
                                : risco.classificacao ===
                                    "Alto"
                                  ? "orange"
                                  : risco.classificacao ===
                                      "Médio"
                                    ? "yellow"
                                    : "green"
                            }
                          >
                            {
                              risco.classificacao
                            }
                          </Badge>

                          <div
                            style={{
                              marginTop: 7,
                              color:
                                "#64748B",
                              fontSize: 11,
                              fontWeight:
                                650,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Nível {risco.nivel}
                          </div>
                        </div>
                      </td>

                      {/* CONTROLE */}

                      <td style={tdStyle}>
                        <div
                          style={{
                            width:
                              mobile
                                ? 185
                                : 230,
                            maxWidth:
                              mobile
                                ? 185
                                : 230,
                            color:
                              "#475569",
                            fontSize: 12,
                            lineHeight: 1.5,
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {risco.medidaControle ||
                            "Nenhuma medida cadastrada"}
                        </div>
                      </td>

                      {/* RESPONSÁVEL */}

                      <td style={tdStyle}>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 7,
                            width: 135,
                            minWidth: 135,
                            color:
                              "#475569",
                            fontSize: 12,
                          }}
                        >
                          <UserRound
                            size={15}
                            color="#94A3B8"
                            style={{
                              flexShrink:
                                0,
                            }}
                          />

                          <span
                            style={{
                              minWidth: 0,
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {risco.responsavel ||
                              "Não definido"}
                          </span>
                        </div>
                      </td>

                      {/* PRAZO */}

                      <td style={tdStyle}>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 7,
                            minWidth: 120,
                            color:
                              prazoVencido(
                                risco
                              )
                                ? "#DC2626"
                                : "#475569",
                            fontSize: 12,
                            fontWeight:
                              prazoVencido(
                                risco
                              )
                                ? 700
                                : 500,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <CalendarDays
                            size={15}
                            style={{
                              flexShrink:
                                0,
                            }}
                          />

                          {formatarData(
                            risco.prazo
                          )}
                        </div>

                        {prazoVencido(
                          risco
                        ) && (
                          <div
                            style={{
                              marginTop: 5,
                              color:
                                "#DC2626",
                              fontSize: 9,
                              fontWeight:
                                800,
                              textTransform:
                                "uppercase",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Vencido
                          </div>
                        )}
                      </td>

                      {/* STATUS */}

                      <td style={tdStyle}>
                        <Badge
                          color={
                            risco.status ===
                            "Concluído"
                              ? "green"
                              : risco.status ===
                                  "Em andamento"
                                ? "yellow"
                                : "gray"
                          }
                        >
                          {risco.status}
                        </Badge>
                      </td>

                      {/* ABRIR PGR */}

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center",
                        }}
                      >
                        <button
                          type="button"
                          title="Abrir PGR"
                          aria-label="Abrir PGR"
                          onClick={() =>
                            navigate(
                              "/pgr"
                            )
                          }
                          style={{
                            width: 36,
                            height: 36,
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            flexShrink: 0,
                            padding: 0,
                            border:
                              "none",
                            borderRadius:
                              9,
                            background:
                              "#EFF6FF",
                            color:
                              "#2563EB",
                            cursor:
                              "pointer",
                          }}
                        >
                          <ArrowRight
                            size={17}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function EstadoVazio({
  possuiRiscos,
  onAbrirPgr,
  mobile = false,
}: {
  possuiRiscos: boolean;
  onAbrirPgr: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        minHeight:
          mobile
            ? 220
            : 260,
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
        borderRadius: 14,
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          marginBottom: 13,
          borderRadius: 14,
          background:
            "#EFF6FF",
          color:
            "#2563EB",
        }}
      >
        <ShieldCheck
          size={25}
        />
      </div>

      <strong
        style={{
          color:
            "#0F172A",
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {possuiRiscos
          ? "Nenhum risco corresponde aos filtros"
          : "Nenhum risco cadastrado"}
      </strong>

      <p
        style={{
          maxWidth: 380,
          margin:
            "6px 0 16px",
          color:
            "#94A3B8",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {possuiRiscos
          ? "Altere os filtros para visualizar outros riscos."
          : "Os riscos são cadastrados e avaliados diretamente no módulo PGR."}
      </p>

      {!possuiRiscos && (
        <Button
          onClick={onAbrirPgr}
        >
          Acessar PGR
        </Button>
      )}
    </div>
  );
}

function prazoVencido(
  risco: PgrItem
) {
  if (
    !risco.prazo ||
    risco.status ===
      "Concluído"
  ) {
    return false;
  }

  const prazo =
    new Date(
      `${risco.prazo}T23:59:59`
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
  borderRadius: 10,
  background:
    "#FFFFFF",
  color:
    "#475569",
  fontFamily:
    "inherit",
  fontSize: 11,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const thStyle = {
  padding:
    "15px 18px",
  textAlign:
    "left" as const,
  color:
    "#64748B",
  fontSize: 10,
  fontWeight: 800,
  textTransform:
    "uppercase" as const,
  letterSpacing:
    ".5px",
  whiteSpace:
    "nowrap" as const,
};

const tdStyle = {
  padding: 18,
  verticalAlign:
    "middle" as const,
  color:
    "#475569",
  fontSize: 12,
};