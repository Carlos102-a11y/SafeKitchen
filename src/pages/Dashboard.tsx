import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import type { ReactNode } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  LayoutDashboard,
  ShieldCheck,
  TriangleAlert,
  Ambulance,
  HardHat,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  FileText,
  CircleCheckBig,
  Clock3,
  AlertTriangle,
  ArrowRight,
  Activity,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { gerarPDF } from "../utils/pdf";
import { supabase } from "../lib/supabase";

import type { PgrItem } from "../models/Pgr";

interface EpiItem {
  id?: number;
  nome?: string;
  quantidade?: number;
  validade?: string;
}

interface ChecklistItem {
  id?: number;
  data?: string;
  setor?: string;

  epis?: boolean;
  piso?: boolean;
  extintor?: boolean;
  exaustao?: boolean;
  iluminacao?: boolean;
  facas?: boolean;
  quimicos?: boolean;
  emergencia?: boolean;
}

interface DDSItem {
  id?: number;
  data?: string;
  tema?: string;
  participantes?: number;
  duracao?: number;
}

interface AuditoriaItem {
  id?: number;
  data?: string;
  setor?: string;
  conformidade?: number;
  naoConformidades?: number;
  prazo?: string;

  status?:
    | "Pendente"
    | "Em andamento"
    | "Concluída";
}

interface AcidenteItem {
  id?: number;
  data?: string;
  funcionario?: string;
  setor?: string;

  tipo?:
    | "Acidente"
    | "Incidente"
    | "Quase acidente";

  gravidade?:
    | "Leve"
    | "Moderada"
    | "Grave"
    | "Crítica";

  afastamento?: boolean;
}

const coresRisco: Record<
  PgrItem["classificacao"],
  string
> = {
  Baixo: "#16A34A",
  Médio: "#F59E0B",
  Alto: "#F97316",
  Crítico: "#DC2626",
};

function useViewportWidth() {
  const [largura, setLargura] =
    useState(() =>
      typeof window !== "undefined"
        ? window.innerWidth
        : 1440
    );

  useEffect(() => {
    function atualizarLargura() {
      setLargura(
        window.innerWidth
      );
    }

    window.addEventListener(
      "resize",
      atualizarLargura
    );

    atualizarLargura();

    return () => {
      window.removeEventListener(
        "resize",
        atualizarLargura
      );
    };
  }, []);

  return largura;
}

export default function Dashboard() {
  const navigate = useNavigate();

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
    pgr,
    setPgr,
  ] = useState<PgrItem[]>([]);

  const [
    epis,
    setEpis,
  ] = useState<EpiItem[]>([]);

  const [
    checklists,
    setChecklists,
  ] =
    useState<ChecklistItem[]>([]);

  const [
    dds,
    setDds,
  ] = useState<DDSItem[]>([]);

  const [
    auditorias,
    setAuditorias,
  ] =
    useState<AuditoriaItem[]>([]);

  const [
    acidentes,
    setAcidentes,
  ] =
    useState<AcidenteItem[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erroBanco,
    setErroBanco,
  ] =
    useState<string | null>(
      null
    );

  /*
   * SUPABASE
   */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErroBanco(null);

      const [
        respostaPgr,
        respostaEpis,
        respostaChecklists,
        respostaDds,
        respostaAuditorias,
        respostaAcidentes,
      ] = await Promise.all([
        supabase
          .from("pgr")
          .select(
            "id, setor, atividade, perigo, categoria, probabilidade, severidade, nivel, classificacao, medida_controle, responsavel, prazo, status"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("epis")
          .select(
            "id, nome, quantidade, validade"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("checklists")
          .select(
            "id, data, setor, epis, piso, extintor, exaustao, iluminacao, facas, quimicos, emergencia"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("dds")
          .select(
            "id, data, tema, participantes, duracao"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("auditorias")
          .select(
            "id, data, setor, conformidade, nao_conformidades, prazo, status"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("acidentes")
          .select(
            "id, data, funcionario, setor, tipo, gravidade, afastamento"
          )
          .order("id", {
            ascending: true,
          }),
      ]);

      if (!componenteAtivo) {
        return;
      }

      const algumErro =
        respostaPgr.error ||
        respostaEpis.error ||
        respostaChecklists.error ||
        respostaDds.error ||
        respostaAuditorias.error ||
        respostaAcidentes.error;

      if (algumErro) {
        console.error(
          "Erro ao carregar Dashboard:",
          {
            pgr: respostaPgr.error,
            epis: respostaEpis.error,
            checklists:
              respostaChecklists.error,
            dds: respostaDds.error,
            auditorias:
              respostaAuditorias.error,
            acidentes:
              respostaAcidentes.error,
          }
        );

        setErroBanco(
          "Alguns indicadores não puderam ser carregados."
        );
      }

      setPgr(
        (respostaPgr.data ?? []).map(
          (item) => ({
            id: item.id,
            setor: item.setor,
            atividade: item.atividade,
            perigo: item.perigo,

            categoria:
              item.categoria as PgrItem["categoria"],

            probabilidade:
              item.probabilidade as PgrItem["probabilidade"],

            severidade:
              item.severidade as PgrItem["severidade"],

            nivel: item.nivel,

            classificacao:
              item.classificacao as PgrItem["classificacao"],

            medidaControle:
              item.medida_controle,

            responsavel:
              item.responsavel,

            prazo:
              item.prazo ?? "",

            status:
              item.status as PgrItem["status"],
          })
        )
      );

      setEpis(
        (respostaEpis.data ??
          []) as EpiItem[]
      );

      setChecklists(
        (respostaChecklists.data ??
          []) as ChecklistItem[]
      );

      setDds(
        (respostaDds.data ??
          []) as DDSItem[]
      );

      setAuditorias(
        (
          respostaAuditorias.data ??
          []
        ).map(
          (item) => ({
            id: item.id,
            data: item.data,
            setor: item.setor,
            conformidade:
              item.conformidade,

            naoConformidades:
              item.nao_conformidades,

            prazo:
              item.prazo ?? "",

            status:
              item.status as AuditoriaItem["status"],
          })
        )
      );

      setAcidentes(
        (respostaAcidentes.data ??
          []) as AcidenteItem[]
      );

      setCarregando(false);
    }

    void carregarDashboard();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  /*
   * PGR
   */

  const riscosCriticos =
    pgr.filter(
      (risco) =>
        risco.classificacao ===
        "Crítico"
    ).length;

  const riscosAltos =
    pgr.filter(
      (risco) =>
        risco.classificacao ===
        "Alto"
    ).length;

  const acoesPgrPendentes =
    pgr.filter(
      (risco) =>
        risco.status ===
        "Pendente"
    ).length;

  const acoesPgrAndamento =
    pgr.filter(
      (risco) =>
        risco.status ===
        "Em andamento"
    ).length;

  const acoesPgrConcluidas =
    pgr.filter(
      (risco) =>
        risco.status ===
        "Concluído"
    ).length;

  const prazosPgrVencidos =
    pgr.filter(
      prazoPgrVencido
    ).length;

  /*
   * EPIs
   */

  const quantidadeEpis =
    epis.reduce(
      (total, epi) =>
        total +
        Number(
          epi.quantidade ?? 0
        ),
      0
    );

  const episEstoqueBaixo =
    epis.filter((epi) => {
      const quantidade =
        Number(
          epi.quantidade ?? 0
        );

      return (
        quantidade > 0 &&
        quantidade < 5
      );
    }).length;

  const episSemEstoque =
    epis.filter(
      (epi) =>
        Number(
          epi.quantidade ?? 0
        ) === 0
    ).length;

  const episVencidos =
    epis.filter(
      (epi) =>
        validadeVencida(
          epi.validade ?? ""
        )
    ).length;

  const episProximosVencimento =
    epis.filter(
      (epi) =>
        proximoDoVencimento(
          epi.validade ?? ""
        )
    ).length;

  /*
   * CHECKLISTS
   */

  const conformidadeChecklists =
    checklists.length > 0
      ? Math.round(
          checklists.reduce(
            (total, checklist) =>
              total +
              calcularConformidadeChecklist(
                checklist
              ),
            0
          ) /
            checklists.length
        )
      : 0;

  const checklistsCriticos =
    checklists.filter(
      (checklist) =>
        calcularConformidadeChecklist(
          checklist
        ) < 75
    ).length;

  /*
   * DDS
   */

  const ddsUltimos30Dias =
    dds.filter(
      (item) =>
        dentroDosUltimosDias(
          item.data ?? "",
          30
        )
    ).length;

  const totalParticipacoesDDS =
    dds.reduce(
      (total, item) =>
        total +
        Number(
          item.participantes ?? 0
        ),
      0
    );

  /*
   * AUDITORIAS
   */

  const conformidadeAuditorias =
    auditorias.length > 0
      ? Math.round(
          auditorias.reduce(
            (total, auditoria) =>
              total +
              Number(
                auditoria.conformidade ??
                  0
              ),
            0
          ) /
            auditorias.length
        )
      : 0;

  const naoConformidades =
    auditorias.reduce(
      (total, auditoria) =>
        total +
        Number(
          auditoria.naoConformidades ??
            0
        ),
      0
    );

  const auditoriasPendentes =
    auditorias.filter(
      (auditoria) =>
        auditoria.status ===
          "Pendente" ||
        auditoria.status ===
          "Em andamento"
    ).length;

  const auditoriasVencidas =
    auditorias.filter(
      prazoAuditoriaVencido
    ).length;

  /*
   * ACIDENTES
   */

  const acidentesReais =
    acidentes.filter(
      (item) =>
        item.tipo ===
        "Acidente"
    ).length;

  const ocorrenciasGraves =
    acidentes.filter(
      (item) =>
        item.gravidade ===
          "Grave" ||
        item.gravidade ===
          "Crítica"
    ).length;

  const afastamentos =
    acidentes.filter(
      (item) =>
        item.afastamento
    ).length;

  /*
   * GRÁFICO
   */

  const distribuicaoRiscos =
    useMemo(() => {
      const classificacoes: PgrItem["classificacao"][] =
        [
          "Baixo",
          "Médio",
          "Alto",
          "Crítico",
        ];

      return classificacoes.map(
        (classificacao) => ({
          name: classificacao,

          value:
            pgr.filter(
              (risco) =>
                risco.classificacao ===
                classificacao
            ).length,

          color:
            coresRisco[
              classificacao
            ],
        })
      );
    }, [pgr]);

  /*
   * RISCOS RECENTES
   */

  const riscosRecentes =
    useMemo(
      () =>
        [...pgr]
          .reverse()
          .slice(0, 3),
      [pgr]
    );

  /*
   * ALERTAS
   */

  const totalAlertas =
    riscosCriticos +
    prazosPgrVencidos +
    episEstoqueBaixo +
    episSemEstoque +
    episVencidos +
    episProximosVencimento +
    checklistsCriticos +
    auditoriasVencidas +
    ocorrenciasGraves;

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

        overflow:
          "hidden",
      }}
    >
      {/* CABEÇALHO */}

      <PageHeader
        title="Dashboard Executivo"
        subtitle="Visão consolidada dos indicadores de Segurança e Saúde no Trabalho."
        icon={LayoutDashboard}
      >
        <Button
  onClick={() => {
    void gerarPDF();
  }}
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
            <FileText
              size={18}
            />

            Gerar Relatório
          </span>
        </Button>
      </PageHeader>

      {(carregando || erroBanco) && (
        <div
          style={{
            width: "100%",
            minWidth: 0,
            marginBottom: 18,
            padding:
              "12px 14px",
            boxSizing:
              "border-box",
            border: erroBanco
              ? "1px solid #FECACA"
              : "1px solid #DBEAFE",
            borderRadius: 12,
            background: erroBanco
              ? "#FEF2F2"
              : "#EFF6FF",
            color: erroBanco
              ? "#B91C1C"
              : "#1D4ED8",
            fontSize: 11,
            fontWeight: 650,
            lineHeight: 1.5,
          }}
        >
          {erroBanco
            ? erroBanco
            : "Carregando indicadores do Supabase..."}
        </div>
      )}

      {/* INDICADORES PRINCIPAIS */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            mobile
              ? "minmax(0, 1fr)"
              : "repeat(auto-fit, minmax(220px, 1fr))",

          gap: mobile
            ? 12
            : 20,

          marginBottom: 20,

          minWidth: 0,
        }}
      >
        <StatCard
          title="Inventário PGR"
          value={pgr.length}
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
            riscosCriticos
          }
          icon={
            <TriangleAlert
              size={22}
            />
          }
          color="#DC2626"
        />

        <StatCard
          title="Acidentes"
          value={
            acidentesReais
          }
          icon={
            <Ambulance
              size={22}
            />
          }
          color="#7C3AED"
        />

        <StatCard
          title="Alertas Ativos"
          value={
            totalAlertas
          }
          icon={
            <AlertTriangle
              size={22}
            />
          }
          color="#F59E0B"
        />
      </div>

      {/* INDICADORES OPERACIONAIS */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            mobile
              ? "minmax(0, 1fr)"
              : "repeat(auto-fit, minmax(185px, 1fr))",

          gap: mobile
            ? 10
            : 14,

          marginBottom:
            mobile
              ? 18
              : 28,

          minWidth: 0,
        }}
      >
        <MiniCard
          titulo="EPIs"
          valor={epis.length}
          detalhe={`${quantidadeEpis} unidade(s)`}
          icon={
            <HardHat
              size={19}
            />
          }
          mobile={mobile}
        />

        <MiniCard
          titulo="Checklists"
          valor={
            checklists.length
          }
          detalhe={`${conformidadeChecklists}% conformidade`}
          icon={
            <ClipboardCheck
              size={19}
            />
          }
          mobile={mobile}
        />

        <MiniCard
          titulo="DDS"
          valor={dds.length}
          detalhe={`${ddsUltimos30Dias} nos últimos 30 dias`}
          icon={
            <BookOpen
              size={19}
            />
          }
          mobile={mobile}
        />

        <MiniCard
          titulo="Auditorias"
          valor={
            auditorias.length
          }
          detalhe={`${conformidadeAuditorias}% conformidade`}
          icon={
            <ClipboardList
              size={19}
            />
          }
          mobile={mobile}
        />
      </div>

      {/* GRÁFICO + PGR */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            telaMedia
              ? "minmax(0, 1fr)"
              : "minmax(0, 1.35fr) minmax(330px, .8fr)",

          gap: mobile
            ? 14
            : 22,

          marginBottom:
            mobile
              ? 14
              : 22,

          minWidth: 0,
        }}
      >
        <Painel
          titulo="Distribuição dos Riscos"
          subtitulo="Classificação dos riscos cadastrados no PGR."
          mobile={mobile}
        >
          {pgr.length === 0 ? (
            <EstadoVazio
              texto="Nenhum risco cadastrado no PGR."
            />
          ) : (
            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  mobile
                    ? "minmax(0, 1fr)"
                    : "minmax(250px, 1fr) 180px",

                gap: mobile
                  ? 12
                  : 20,

                alignItems:
                  "center",

                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "100%",

                  minWidth: 0,

                  height: mobile
                    ? 230
                    : 280,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        distribuicaoRiscos
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={
                        mobile
                          ? 52
                          : 65
                      }
                      outerRadius={
                        mobile
                          ? 82
                          : 103
                      }
                      paddingAngle={4}
                      stroke="none"
                    >
                      {distribuicaoRiscos.map(
                        (item) => (
                          <Cell
                            key={
                              item.name
                            }
                            fill={
                              item.color
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display:
                    mobile
                      ? "grid"
                      : "flex",

                  gridTemplateColumns:
                    mobile
                      ? "repeat(2, minmax(0, 1fr))"
                      : undefined,

                  flexDirection:
                    mobile
                      ? undefined
                      : "column",

                  gap: 12,
                }}
              >
                {distribuicaoRiscos.map(
                  (item) => (
                    <Legenda
                      key={
                        item.name
                      }
                      titulo={
                        item.name
                      }
                      valor={
                        item.value
                      }
                      cor={
                        item.color
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </Painel>

        <Painel
          titulo="Plano de Controle"
          subtitulo="Acompanhamento das medidas definidas no PGR."
          mobile={mobile}
        >
          <ResumoLinha
            titulo="Concluídas"
            valor={
              acoesPgrConcluidas
            }
            cor="#16A34A"
          />

          <ResumoLinha
            titulo="Em andamento"
            valor={
              acoesPgrAndamento
            }
            cor="#F59E0B"
          />

          <ResumoLinha
            titulo="Pendentes"
            valor={
              acoesPgrPendentes
            }
            cor="#64748B"
          />

          <ResumoLinha
            titulo="Riscos altos"
            valor={
              riscosAltos
            }
            cor="#F97316"
          />

          <ResumoLinha
            titulo="Prazos vencidos"
            valor={
              prazosPgrVencidos
            }
            cor="#DC2626"
          />

          <button
            type="button"
            onClick={() =>
              navigate("/pgr")
            }
            style={botaoLink}
          >
            Abrir PGR

            <ArrowRight
              size={16}
            />
          </button>
        </Painel>
      </div>

      {/* CONFORMIDADE */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            tablet
              ? "minmax(0, 1fr)"
              : "repeat(2, minmax(0, 1fr))",

          gap: mobile
            ? 14
            : 22,

          marginBottom:
            mobile
              ? 14
              : 22,

          minWidth: 0,
        }}
      >
        <Painel
          titulo="Conformidade Operacional"
          subtitulo="Indicadores calculados a partir dos registros do sistema."
          mobile={mobile}
        >
          <IndicadorProgresso
            titulo="Checklists"
            valor={
              conformidadeChecklists
            }
            cor={
              corConformidade(
                conformidadeChecklists
              )
            }
          />

          <IndicadorProgresso
            titulo="Auditorias"
            valor={
              conformidadeAuditorias
            }
            cor={
              corConformidade(
                conformidadeAuditorias
              )
            }
          />

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobilePequeno
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",

              gap: 12,

              marginTop: 20,
            }}
          >
            <DadoPequeno
              titulo="Não conformidades"
              valor={
                naoConformidades
              }
            />

            <DadoPequeno
              titulo="Auditorias pendentes"
              valor={
                auditoriasPendentes
              }
            />
          </div>
        </Painel>

        <Painel
          titulo="DDS e Capacitação"
          subtitulo="Indicadores dos diálogos de segurança registrados."
          mobile={mobile}
        >
          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobilePequeno
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",

              gap: 12,
            }}
          >
            <DadoDestaque
              titulo="DDS realizados"
              valor={dds.length}
              icon={
                <BookOpen
                  size={20}
                />
              }
            />

            <DadoDestaque
              titulo="Participações"
              valor={
                totalParticipacoesDDS
              }
              icon={
                <Activity
                  size={20}
                />
              }
            />

            <DadoDestaque
              titulo="Últimos 30 dias"
              valor={
                ddsUltimos30Dias
              }
              icon={
                <Clock3
                  size={20}
                />
              }
            />

            <DadoDestaque
              titulo="Checklists críticos"
              valor={
                checklistsCriticos
              }
              icon={
                <TriangleAlert
                  size={20}
                />
              }
            />
          </div>
        </Painel>
      </div>

      {/* ALERTAS + RISCOS RECENTES */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            telaMedia
              ? "minmax(0, 1fr)"
              : "minmax(340px, .85fr) minmax(0, 1.3fr)",

          gap: mobile
            ? 14
            : 22,

          marginBottom:
            mobile
              ? 14
              : 22,

          minWidth: 0,
        }}
      >
        <Painel
          titulo="Alertas Prioritários"
          subtitulo="Itens que exigem acompanhamento da gestão."
          mobile={mobile}
        >
          {totalAlertas === 0 ? (
            <div
              style={{
                minHeight: 180,

                display: "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                textAlign:
                  "center",

                padding:
                  "0 10px",
              }}
            >
              <CircleCheckBig
                size={34}
                color="#16A34A"
              />

              <strong
                style={{
                  marginTop: 10,

                  color:
                    "#0F172A",

                  fontSize: 13,
                }}
              >
                Nenhum alerta prioritário
              </strong>

              <span
                style={{
                  marginTop: 4,

                  color:
                    "#94A3B8",

                  fontSize: 11,

                  lineHeight: 1.5,
                }}
              >
                Os principais controles estão
                dentro dos parâmetros.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",

                flexDirection:
                  "column",

                gap: 10,

                minWidth: 0,
              }}
            >
              {riscosCriticos >
                0 && (
                <Alerta
                  titulo="Riscos críticos"
                  texto={`${riscosCriticos} risco(s) classificados como críticos.`}
                  tipo="critico"
                />
              )}

              {prazosPgrVencidos >
                0 && (
                <Alerta
                  titulo="PGR com prazo vencido"
                  texto={`${prazosPgrVencidos} medida(s) de controle estão atrasadas.`}
                  tipo="critico"
                />
              )}

              {episSemEstoque >
                0 && (
                <Alerta
                  titulo="EPIs sem estoque"
                  texto={`${episSemEstoque} equipamento(s) estão sem unidades disponíveis.`}
                  tipo="critico"
                />
              )}

              {episEstoqueBaixo >
                0 && (
                <Alerta
                  titulo="Estoque baixo"
                  texto={`${episEstoqueBaixo} EPI(s) possuem menos de 5 unidades.`}
                  tipo="atencao"
                />
              )}

              {episVencidos >
                0 && (
                <Alerta
                  titulo="EPIs vencidos"
                  texto={`${episVencidos} EPI(s) possuem validade vencida.`}
                  tipo="critico"
                />
              )}

              {episProximosVencimento >
                0 && (
                <Alerta
                  titulo="Validade próxima"
                  texto={`${episProximosVencimento} EPI(s) vencem nos próximos 30 dias.`}
                  tipo="atencao"
                />
              )}

              {checklistsCriticos >
                0 && (
                <Alerta
                  titulo="Checklists críticos"
                  texto={`${checklistsCriticos} checklist(s) possuem conformidade inferior a 75%.`}
                  tipo="atencao"
                />
              )}

              {auditoriasVencidas >
                0 && (
                <Alerta
                  titulo="Ações de auditoria atrasadas"
                  texto={`${auditoriasVencidas} ação(ões) possuem prazo vencido.`}
                  tipo="atencao"
                />
              )}

              {ocorrenciasGraves >
                0 && (
                <Alerta
                  titulo="Ocorrências graves"
                  texto={`${ocorrenciasGraves} ocorrência(s) possuem gravidade Grave ou Crítica.`}
                  tipo="critico"
                />
              )}
            </div>
          )}
        </Painel>

        <Painel
          titulo="Riscos Recentes"
          subtitulo="Últimos registros adicionados ao inventário do PGR."
          mobile={mobile}
        >
          {riscosRecentes.length ===
          0 ? (
            <EstadoVazio
              texto="Nenhum risco cadastrado."
            />
          ) : (
            <div
              style={{
                minWidth: 0,
              }}
            >
              {riscosRecentes.map(
                (
                  risco,
                  index
                ) => (
                  <div
                    key={risco.id}
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        mobile
                          ? "minmax(0, 1fr)"
                          : "minmax(130px, 1fr) minmax(180px, 1.5fr) auto",

                      alignItems:
                        mobile
                          ? "start"
                          : "center",

                      gap: mobile
                        ? 9
                        : 14,

                      padding:
                        mobile
                          ? "14px 0"
                          : "15px 2px",

                      borderBottom:
                        index ===
                        riscosRecentes.length -
                          1
                          ? "none"
                          : "1px solid #E2E8F0",

                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "#0F172A",

                          fontSize:
                            12,

                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {
                          risco.setor
                        }
                      </strong>

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
                        {
                          risco.categoria
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: 0,

                        color:
                          "#475569",

                        fontSize:
                          12,

                        lineHeight:
                          1.5,

                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {
                        risco.perigo
                      }
                    </div>

                    <div
                      style={{
                        justifySelf:
                          mobile
                            ? "start"
                            : "end",
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
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  navigate("/pgr")
                }
                style={botaoLink}
              >
                Ver inventário completo

                <ArrowRight
                  size={16}
                />
              </button>
            </div>
          )}
        </Painel>
      </div>

      {/* EPIs + ACIDENTES */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            tablet
              ? "minmax(0, 1fr)"
              : "repeat(2, minmax(0, 1fr))",

          gap: mobile
            ? 14
            : 22,

          marginBottom:
            mobile
              ? 14
              : 22,

          minWidth: 0,
        }}
      >
        <Painel
          titulo="Controle de EPIs"
          subtitulo="Situação atual do estoque e validade."
          mobile={mobile}
        >
          <ResumoLinha
            titulo="Itens cadastrados"
            valor={epis.length}
            cor="#2563EB"
          />

          <ResumoLinha
            titulo="Unidades em estoque"
            valor={
              quantidadeEpis
            }
            cor="#16A34A"
          />

          <ResumoLinha
            titulo="Estoque baixo"
            valor={
              episEstoqueBaixo
            }
            cor="#F59E0B"
          />

          <ResumoLinha
            titulo="Sem estoque"
            valor={
              episSemEstoque
            }
            cor="#DC2626"
          />

          <ResumoLinha
            titulo="Validade vencida"
            valor={
              episVencidos
            }
            cor="#DC2626"
          />

          <ResumoLinha
            titulo="Próximos do vencimento"
            valor={
              episProximosVencimento
            }
            cor="#F59E0B"
          />

          <button
            type="button"
            onClick={() =>
              navigate("/epis")
            }
            style={botaoLink}
          >
            Abrir Gestão de EPIs

            <ArrowRight
              size={16}
            />
          </button>
        </Painel>

        <Painel
          titulo="Ocorrências de SST"
          subtitulo="Resumo dos acidentes e incidentes registrados."
          mobile={mobile}
        >
          <ResumoLinha
            titulo="Registros"
            valor={
              acidentes.length
            }
            cor="#2563EB"
          />

          <ResumoLinha
            titulo="Acidentes"
            valor={
              acidentesReais
            }
            cor="#DC2626"
          />

          <ResumoLinha
            titulo="Graves / críticos"
            valor={
              ocorrenciasGraves
            }
            cor="#F97316"
          />

          <ResumoLinha
            titulo="Com afastamento"
            valor={
              afastamentos
            }
            cor="#7C3AED"
          />

          <button
            type="button"
            onClick={() =>
              navigate(
                "/acidentes"
              )
            }
            style={botaoLink}
          >
            Abrir Ocorrências

            <ArrowRight
              size={16}
            />
          </button>
        </Painel>
      </div>

      {/* ATALHOS */}

      <Painel
        titulo="Acesso Rápido"
        subtitulo="Acesse os principais módulos do SafeKitchen."
        mobile={mobile}
      >
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              mobile
                ? "minmax(0, 1fr)"
                : "repeat(auto-fit, minmax(180px, 1fr))",

            gap: 10,

            minWidth: 0,
          }}
        >
          <Atalho
            titulo="PGR"
            icon={
              <ShieldCheck
                size={20}
              />
            }
            onClick={() =>
              navigate("/pgr")
            }
          />

          <Atalho
            titulo="Acidentes"
            icon={
              <Ambulance
                size={20}
              />
            }
            onClick={() =>
              navigate(
                "/acidentes"
              )
            }
          />

          <Atalho
            titulo="EPIs"
            icon={
              <HardHat
                size={20}
              />
            }
            onClick={() =>
              navigate("/epis")
            }
          />

          <Atalho
            titulo="Checklists"
            icon={
              <ClipboardCheck
                size={20}
              />
            }
            onClick={() =>
              navigate(
                "/checklists"
              )
            }
          />

          <Atalho
            titulo="DDS"
            icon={
              <BookOpen
                size={20}
              />
            }
            onClick={() =>
              navigate("/dds")
            }
          />

          <Atalho
            titulo="Auditorias"
            icon={
              <ClipboardList
                size={20}
              />
            }
            onClick={() =>
              navigate(
                "/auditorias"
              )
            }
          />
        </div>
      </Painel>
    </main>
  );
}

/*
 * COMPONENTES
 */

function Painel({
  titulo,
  subtitulo,
  children,
  mobile = false,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <section
      style={{
        width: "100%",

        minWidth: 0,

        padding:
          mobile
            ? 17
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
          "0 6px 20px rgba(15,23,42,.04)",

        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          marginBottom:
            mobile
              ? 16
              : 20,

          minWidth: 0,
        }}
      >
        <h2
          style={{
            margin: 0,

            color: "#0F172A",

            fontSize:
              mobile
                ? 15
                : 17,

            fontWeight: 800,

            lineHeight: 1.3,

            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </h2>

        {subtitulo && (
          <p
            style={{
              margin:
                "5px 0 0",

              color:
                "#94A3B8",

              fontSize: 11,

              lineHeight: 1.5,

              overflowWrap:
                "anywhere",
            }}
          >
            {subtitulo}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function MiniCard({
  titulo,
  valor,
  detalhe,
  icon,
  mobile = false,
}: {
  titulo: string;
  valor: number;
  detalhe: string;
  icon: ReactNode;
  mobile?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        display: "flex",

        alignItems:
          "center",

        gap: 12,

        padding:
          mobile
            ? "14px 15px"
            : "16px 17px",

        boxSizing:
          "border-box",

        background:
          "#FFFFFF",

        border:
          "1px solid #E2E8F0",

        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 40,

          height: 40,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          flexShrink: 0,

          borderRadius: 10,

          background:
            "#F1F5F9",

          color:
            "#475569",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,

          flex: 1,
        }}
      >
        <div
          style={{
            color:
              "#64748B",

            fontSize: 10,

            fontWeight: 800,

            textTransform:
              "uppercase",
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            marginTop: 2,

            color:
              "#0F172A",

            fontSize: 20,

            fontWeight: 800,
          }}
        >
          {valor}
        </div>

        <div
          style={{
            marginTop: 2,

            color:
              "#94A3B8",

            fontSize: 9,

            lineHeight: 1.4,

            whiteSpace:
              mobile
                ? "normal"
                : "nowrap",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",
          }}
        >
          {detalhe}
        </div>
      </div>
    </div>
  );
}

function Legenda({
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
        minWidth: 0,

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap: 10,
      }}
    >
      <div
        style={{
          minWidth: 0,

          display: "flex",

          alignItems:
            "center",

          gap: 8,

          color:
            "#475569",

          fontSize: 12,
        }}
      >
        <span
          style={{
            width: 8,

            height: 8,

            flexShrink: 0,

            borderRadius:
              "50%",

            background:
              cor,
          }}
        />

        <span
          style={{
            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </span>
      </div>

      <strong
        style={{
          flexShrink: 0,

          color:
            "#0F172A",

          fontSize: 13,
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function ResumoLinha({
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
        minWidth: 0,

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap: 12,

        padding:
          "11px 0",

        borderBottom:
          "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          minWidth: 0,

          display: "flex",

          alignItems:
            "center",

          gap: 8,

          color:
            "#475569",

          fontSize: 12,

          lineHeight: 1.4,
        }}
      >
        <span
          style={{
            width: 8,

            height: 8,

            flexShrink: 0,

            borderRadius:
              "50%",

            background:
              cor,
          }}
        />

        <span
          style={{
            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </span>
      </div>

      <strong
        style={{
          flexShrink: 0,

          color:
            "#0F172A",

          fontSize: 13,
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function IndicadorProgresso({
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
        marginBottom: 20,

        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",

          justifyContent:
            "space-between",

          gap: 12,

          marginBottom: 8,

          color:
            "#475569",

          fontSize: 12,
        }}
      >
        <span>
          {titulo}
        </span>

        <strong
          style={{
            flexShrink: 0,

            color: cor,
          }}
        >
          {valor}%
        </strong>
      </div>

      <div
        style={{
          width: "100%",

          height: 8,

          background:
            "#E2E8F0",

          borderRadius: 999,

          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            width: `${valor}%`,

            height: "100%",

            background:
              cor,

            borderRadius:
              999,
          }}
        />
      </div>
    </div>
  );
}

function DadoPequeno({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div
      style={{
        minWidth: 0,

        padding: 14,

        background:
          "#F8FAFC",

        borderRadius: 11,

        border:
          "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          color:
            "#64748B",

          fontSize: 10,

          lineHeight: 1.4,

          overflowWrap:
            "anywhere",
        }}
      >
        {titulo}
      </div>

      <strong
        style={{
          display:
            "block",

          marginTop: 5,

          color:
            "#0F172A",

          fontSize: 20,
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function DadoDestaque({
  titulo,
  valor,
  icon,
}: {
  titulo: string;
  valor: number;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        minWidth: 0,

        padding: 15,

        background:
          "#F8FAFC",

        border:
          "1px solid #E2E8F0",

        borderRadius: 12,
      }}
    >
      <div
        style={{
          color:
            "#2563EB",
        }}
      >
        {icon}
      </div>

      <strong
        style={{
          display:
            "block",

          marginTop: 10,

          color:
            "#0F172A",

          fontSize: 21,
        }}
      >
        {valor}
      </strong>

      <div
        style={{
          marginTop: 3,

          color:
            "#64748B",

          fontSize: 10,

          lineHeight: 1.4,

          overflowWrap:
            "anywhere",
        }}
      >
        {titulo}
      </div>
    </div>
  );
}

function Alerta({
  titulo,
  texto,
  tipo,
}: {
  titulo: string;
  texto: string;
  tipo:
    | "critico"
    | "atencao";
}) {
  const critico =
    tipo ===
    "critico";

  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        display: "flex",

        gap: 11,

        padding: 13,

        boxSizing:
          "border-box",

        borderRadius: 11,

        border: `1px solid ${
          critico
            ? "#FECACA"
            : "#FDE68A"
        }`,

        background:
          critico
            ? "#FEF2F2"
            : "#FFFBEB",
      }}
    >
      <AlertTriangle
        size={18}
        color={
          critico
            ? "#DC2626"
            : "#D97706"
        }
        style={{
          flexShrink: 0,
        }}
      />

      <div
        style={{
          minWidth: 0,
        }}
      >
        <strong
          style={{
            color:
              critico
                ? "#991B1B"
                : "#92400E",

            fontSize: 11,

            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </strong>

        <div
          style={{
            marginTop: 3,

            color:
              "#64748B",

            fontSize: 10,

            lineHeight: 1.5,

            overflowWrap:
              "anywhere",
          }}
        >
          {texto}
        </div>
      </div>
    </div>
  );
}

function Atalho({
  titulo,
  icon,
  onClick,
}: {
  titulo: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",

        minWidth: 0,

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap: 12,

        padding: 15,

        boxSizing:
          "border-box",

        border:
          "1px solid #E2E8F0",

        borderRadius: 12,

        background:
          "#F8FAFC",

        color:
          "#334155",

        cursor:
          "pointer",

        fontWeight: 700,

        fontSize: 11,
      }}
    >
      <span
        style={{
          minWidth: 0,

          display: "flex",

          alignItems:
            "center",

          gap: 9,
        }}
      >
        <span
          style={{
            flexShrink: 0,

            color:
              "#2563EB",
          }}
        >
          {icon}
        </span>

        <span
          style={{
            overflowWrap:
              "anywhere",
          }}
        >
          {titulo}
        </span>
      </span>

      <ArrowRight
        size={15}
        color="#94A3B8"
        style={{
          flexShrink: 0,
        }}
      />
    </button>
  );
}

function EstadoVazio({
  texto,
}: {
  texto: string;
}) {
  return (
    <div
      style={{
        minHeight: 180,

        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding: 12,

        boxSizing:
          "border-box",

        color:
          "#94A3B8",

        textAlign:
          "center",
      }}
    >
      <ShieldCheck
        size={32}
      />

      <span
        style={{
          marginTop: 9,

          fontSize: 11,

          lineHeight: 1.5,
        }}
      >
        {texto}
      </span>
    </div>
  );
}

/*
 * REGRAS
 */

function prazoPgrVencido(
  risco: PgrItem
) {
  if (
    !risco.prazo ||
    risco.status ===
      "Concluído"
  ) {
    return false;
  }

  return (
    new Date(
      `${risco.prazo}T23:59:59`
    ).getTime() <
    new Date().getTime()
  );
}

function validadeVencida(
  validade: string
) {
  if (!validade) {
    return false;
  }

  return (
    new Date(
      `${validade}T23:59:59`
    ).getTime() <
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

  const data =
    new Date(
      `${validade}T23:59:59`
    );

  if (
    data.getTime() <
    hoje.getTime()
  ) {
    return false;
  }

  const diferenca =
    data.getTime() -
    hoje.getTime();

  const dias =
    diferenca /
    (
      1000 *
      60 *
      60 *
      24
    );

  return dias <= 30;
}

function calcularConformidadeChecklist(
  checklist: ChecklistItem
) {
  const itens = [
    checklist.epis,
    checklist.piso,
    checklist.extintor,
    checklist.exaustao,
    checklist.iluminacao,
    checklist.facas,
    checklist.quimicos,
    checklist.emergencia,
  ];

  const conformes =
    itens.filter(
      Boolean
    ).length;

  return Math.round(
    (
      conformes /
      itens.length
    ) *
      100
  );
}

function dentroDosUltimosDias(
  data: string,
  dias: number
) {
  if (!data) {
    return false;
  }

  const registro =
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
    registro.getTime() >=
      limite.getTime() &&
    registro.getTime() <=
      hoje.getTime()
  );
}

function prazoAuditoriaVencido(
  auditoria: AuditoriaItem
) {
  if (
    !auditoria.prazo ||
    auditoria.status ===
      "Concluída"
  ) {
    return false;
  }

  return (
    new Date(
      `${auditoria.prazo}T23:59:59`
    ).getTime() <
    new Date().getTime()
  );
}

function corConformidade(
  valor: number
) {
  if (valor >= 90) {
    return "#16A34A";
  }

  if (valor >= 75) {
    return "#2563EB";
  }

  if (valor >= 50) {
    return "#F59E0B";
  }

  return "#DC2626";
}

const botaoLink = {
  width: "100%",

  display: "flex",

  alignItems:
    "center",

  justifyContent:
    "space-between",

  gap: 10,

  marginTop: 16,

  padding: "11px 0 0",

  border: "none",

  borderTop:
    "1px solid #F1F5F9",

  background:
    "transparent",

  color:
    "#2563EB",

  fontSize: 11,

  fontWeight: 700,

  lineHeight: 1.4,

  cursor: "pointer",
};