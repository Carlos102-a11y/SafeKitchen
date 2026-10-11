import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileSearch,
  Gauge,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  TriangleAlert,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
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

type ClassificacaoAuditoria =
  | "Excelente"
  | "Adequada"
  | "Atenção"
  | "Crítica";

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
    id: linha.id,
    data: linha.data,
    auditor: linha.auditor,
    setor: linha.setor,
    tipo: linha.tipo,
    conformidade: limitarPercentual(
      Number(linha.conformidade)
    ),
    naoConformidades: Math.max(
      0,
      Number(
        linha.nao_conformidades ?? 0
      )
    ),
    observacoes:
      linha.observacoes ?? "",
    acaoCorretiva:
      linha.acao_corretiva ?? "",
    prazo: linha.prazo ?? "",
    status: linha.status,
  };
}

function criarPayloadAuditoria(
  auditoria: Auditoria
) {
  return {
    data: auditoria.data,
    auditor:
      auditoria.auditor.trim(),
    setor:
      auditoria.setor.trim(),
    tipo: auditoria.tipo,
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
      auditoria.prazo || null,
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
    largura <= 720;

  const tablet =
    largura <= 980;

  const telaMedia =
    largura <= 1180;

  const [
    auditorias,
    setAuditorias,
  ] =
    useState<Auditoria[]>([]);

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

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarAuditorias() {
      setCarregando(true);
      setErroBanco("");

      const {
        data,
        error,
      } =
        await supabase
          .from("auditorias")
          .select(
            CAMPOS_AUDITORIAS
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
          "Erro ao carregar auditorias:",
          error
        );

        setAuditorias([]);

        setErroBanco(
          "Não foi possível carregar as auditorias."
        );

        setCarregando(false);

        return;
      }

      setAuditorias(
        (
          (data ?? []) as
            AuditoriaRow[]
        ).map(
          converterAuditoria
        )
      );

      setCarregando(false);
    }

    void carregarAuditorias();

    return () => {
      componenteAtivo = false;
    };
  }, []);

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

  const concluidas =
    auditorias.filter(
      (auditoria) =>
        auditoria.status ===
        "Concluída"
    ).length;

  const vencidas =
    auditorias.filter(
      (auditoria) =>
        prazoVencido(
          auditoria
        )
    ).length;

  const semAcaoCorretiva =
    auditorias.filter(
      (auditoria) =>
        auditoria.naoConformidades >
          0 &&
        !auditoria.acaoCorretiva.trim()
    ).length;

  const criticas =
    auditorias.filter(
      (auditoria) =>
        obterClassificacao(
          auditoria.conformidade
        ) === "Crítica"
    ).length;

  const excelentes =
    auditorias.filter(
      (auditoria) =>
        obterClassificacao(
          auditoria.conformidade
        ) === "Excelente"
    ).length;

  const adequadas =
    auditorias.filter(
      (auditoria) =>
        obterClassificacao(
          auditoria.conformidade
        ) === "Adequada"
    ).length;

  const emAtencao =
    auditorias.filter(
      (auditoria) =>
        obterClassificacao(
          auditoria.conformidade
        ) === "Atenção"
    ).length;

  const taxaConclusao =
    auditorias.length > 0
      ? Math.round(
          (concluidas /
            auditorias.length) *
            100
        )
      : 0;

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
    setEditando(auditoria);
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
    if (salvando) {
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

    if (error) {
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
      className="auditoria-page"
    >
      <PageHeader
        title="Auditorias de SST"
        subtitle="Inspeções, conformidade e acompanhamento estruturado das ações corretivas."
        icon={ClipboardList}
      >
        <Button
          onClick={
            abrirNovaAuditoria
          }
        >
          <span className="auditoria-btn-content">
            <Plus size={18} />
            Nova Auditoria
          </span>
        </Button>
      </PageHeader>

      {erroBanco && (
        <div
          role="alert"
          className="auditoria-error"
        >
          <div className="auditoria-error-main">
            <TriangleAlert
              size={17}
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
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="auditoria-hero">
        <div className="auditoria-hero-copy">
          <div className="auditoria-eyebrow">
            CONTROLE DE CONFORMIDADE E AÇÕES CORRETIVAS
          </div>

          <h2>
            Auditoria como ciclo de
            verificação, correção e
            melhoria contínua.
          </h2>

          <p>
            Consolide desvios, acompanhe
            prazos e mantenha o status das
            ações corretivas visível para
            apoiar a gestão preventiva.
          </p>

          <div className="auditoria-flow">
            <FluxoEtapa
              numero="01"
              titulo="Auditar"
              texto="Verificar condições"
            />

            <ArrowRight
              className="auditoria-flow-arrow"
              size={17}
            />

            <FluxoEtapa
              numero="02"
              titulo="Classificar"
              texto="Medir conformidade"
            />

            <ArrowRight
              className="auditoria-flow-arrow"
              size={17}
            />

            <FluxoEtapa
              numero="03"
              titulo="Corrigir"
              texto="Definir ações"
            />

            <ArrowRight
              className="auditoria-flow-arrow"
              size={17}
            />

            <FluxoEtapa
              numero="04"
              titulo="Monitorar"
              texto="Controlar prazos"
            />
          </div>
        </div>

        <div className="auditoria-hero-side">
          <div className="auditoria-hero-side-label">
            Efetividade das ações
          </div>

          <div className="auditoria-hero-percent">
            {taxaConclusao}%
          </div>

          <div className="auditoria-hero-side-text">
            {concluidas} de{" "}
            {auditorias.length} auditoria(s)
            concluída(s)
          </div>

          <div className="auditoria-hero-progress">
            <div
              style={{
                width: `${taxaConclusao}%`,
              }}
            />
          </div>

          <div className="auditoria-hero-mini">
            <span>
              Pendentes
            </span>
            <strong>
              {pendentes}
            </strong>
          </div>
        </div>
      </section>

      <div
        className={
          telaMedia
            ? "auditoria-metrics auditoria-metrics-medium"
            : "auditoria-metrics"
        }
      >
        <MetricCard
          titulo="Auditorias realizadas"
          valor={auditorias.length}
          detalhe="Registros acumulados"
          icon={
            <FileSearch
              size={20}
            />
          }
          cor="#2563EB"
        />

        <MetricCard
          titulo="Conformidade média"
          valor={`${conformidadeMedia}%`}
          detalhe="Média das avaliações"
          icon={
            <ShieldCheck
              size={20}
            />
          }
          cor="#16A34A"
        />

        <MetricCard
          titulo="Não conformidades"
          valor={totalNaoConformidades}
          detalhe="Desvios registrados"
          icon={
            <TriangleAlert
              size={20}
            />
          }
          cor="#F59E0B"
        />

        <MetricCard
          titulo="Ações pendentes"
          valor={pendentes}
          detalhe="Pendentes ou em andamento"
          icon={
            <Clock3
              size={20}
            />
          }
          cor="#7C3AED"
        />

        <MetricCard
          titulo="Prazos vencidos"
          valor={vencidas}
          detalhe="Exigem acompanhamento"
          icon={
            <AlertCircle
              size={20}
            />
          }
          cor="#DC2626"
        />
      </div>

      <div
        className={
          tablet
            ? "auditoria-insights auditoria-insights-stack"
            : "auditoria-insights"
        }
      >
        <section className="auditoria-panel">
          <div className="auditoria-panel-header">
            <div>
              <div className="auditoria-panel-kicker">
                PERFIL DE CONFORMIDADE
              </div>

              <h3>
                Distribuição das auditorias
              </h3>

              <p>
                Leitura consolidada dos
                resultados por faixa de
                conformidade.
              </p>
            </div>

            <div className="auditoria-panel-icon auditoria-panel-icon-green">
              <Gauge size={20} />
            </div>
          </div>

          <div className="auditoria-distribution">
            <DistribuicaoItem
              titulo="Excelente"
              valor={excelentes}
              total={auditorias.length}
              cor="#16A34A"
            />

            <DistribuicaoItem
              titulo="Adequada"
              valor={adequadas}
              total={auditorias.length}
              cor="#2563EB"
            />

            <DistribuicaoItem
              titulo="Atenção"
              valor={emAtencao}
              total={auditorias.length}
              cor="#F59E0B"
            />

            <DistribuicaoItem
              titulo="Crítica"
              valor={criticas}
              total={auditorias.length}
              cor="#DC2626"
            />
          </div>
        </section>

        <section className="auditoria-panel">
          <div className="auditoria-panel-header">
            <div>
              <div className="auditoria-panel-kicker">
                PRIORIDADES DO PLANO DE AÇÃO
              </div>

              <h3>
                Pontos que exigem atenção
              </h3>

              <p>
                Indicadores para priorizar
                correções e acompanhamento.
              </p>
            </div>

            <div className="auditoria-panel-icon auditoria-panel-icon-red">
              <Target size={20} />
            </div>
          </div>

          <div className="auditoria-priority-grid">
            <Prioridade
              titulo="Prazos vencidos"
              valor={vencidas}
              texto="Ações com prazo expirado"
              cor="#DC2626"
            />

            <Prioridade
              titulo="Sem ação corretiva"
              valor={semAcaoCorretiva}
              texto="Há desvio, mas falta ação"
              cor="#EA580C"
            />

            <Prioridade
              titulo="Classificação crítica"
              valor={criticas}
              texto="Conformidade abaixo de 50%"
              cor="#B91C1C"
            />

            <Prioridade
              titulo="Em acompanhamento"
              valor={pendentes}
              texto="Pendentes ou em andamento"
              cor="#7C3AED"
            />
          </div>
        </section>
      </div>

      <section className="auditoria-history">
        <div className="auditoria-history-head">
          <div>
            <div className="auditoria-panel-kicker">
              HISTÓRICO E ACOMPANHAMENTO
            </div>

            <h2>
              Auditorias registradas
            </h2>

            <p>
              Consulte conformidade, não
              conformidades, plano de ação,
              prazo e situação de cada
              auditoria.
            </p>
          </div>

          <div className="auditoria-history-summary">
            <CheckCircle2
              size={17}
            />
            <span>
              {concluidas} concluída(s)
            </span>
          </div>
        </div>

        <div className="auditoria-filter-box">
          <div className="auditoria-filter-head">
            <div className="auditoria-filter-title">
              <SlidersHorizontal
                size={16}
              />
              Filtros de auditorias
            </div>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={
                  limparFiltros
                }
                className="auditoria-clear-filter"
              >
                <X size={13} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="auditoria-filter-grid">
            <div className="auditoria-search">
              <Search
                size={17}
              />

              <input
                type="text"
                placeholder={
                  mobile
                    ? "Pesquisar auditorias..."
                    : "Pesquisar auditor, setor, observação ou ação corretiva..."
                }
                value={
                  pesquisa
                }
                onChange={(e) =>
                  setPesquisa(
                    e.target.value
                  )
                }
              />
            </div>

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
              className="auditoria-select"
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
              className="auditoria-select"
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

          <div className="auditoria-filter-count">
            Exibindo{" "}
            <strong>
              {
                auditoriasFiltradas.length
              }
            </strong>{" "}
            de{" "}
            <strong>
              {
                auditorias.length
              }
            </strong>{" "}
            auditoria(s)
          </div>
        </div>

        {carregando ? (
          <EstadoCarregando />
        ) : auditoriasFiltradas.length ===
          0 ? (
          <EstadoVazio />
        ) : mobile ? (
          <div className="auditoria-mobile-list">
            {auditoriasFiltradas.map(
              (auditoria) => (
                <AuditoriaCard
                  key={
                    auditoria.id
                  }
                  auditoria={
                    auditoria
                  }
                  onEditar={
                    editarAuditoria
                  }
                  onExcluir={
                    excluirAuditoria
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="auditoria-table-wrap">
            <table className="auditoria-table">
              <thead>
                <tr>
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
                    Não conformidades
                  </Th>

                  <Th>
                    Ação corretiva
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
                  (auditoria) => (
                    <AuditoriaRowItem
                      key={
                        auditoria.id
                      }
                      auditoria={
                        auditoria
                      }
                      onEditar={
                        editarAuditoria
                      }
                      onExcluir={
                        excluirAuditoria
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
            <header className="auditoria-drawer-header">
              <div className="auditoria-drawer-header-main">
                <div className="auditoria-drawer-icon">
                  <ClipboardList
                    size={22}
                  />
                </div>

                <div className="auditoria-drawer-title">
                  <div className="auditoria-drawer-kicker">
                    CONTROLE DE AUDITORIA
                  </div>

                  <h2>
                    {editando
                      ? "Editar auditoria"
                      : "Nova auditoria"}
                  </h2>

                  <p>
                    Registre resultado,
                    desvios, ações corretivas
                    e acompanhamento.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  fecharDrawer
                }
                aria-label="Fechar formulário"
                className="auditoria-drawer-close"
              >
                <X size={19} />
              </button>
            </header>

            <div className="auditoria-drawer-content">
              <Secao
                numero="01"
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

              <Secao
                numero="02"
                titulo="Resultado"
                descricao="Registre o percentual de conformidade e os desvios identificados."
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

                <div className="auditoria-result-box">
                  <div className="auditoria-result-top">
                    <div>
                      <div className="auditoria-result-label">
                        Nível de conformidade
                      </div>

                      <div className="auditoria-result-number">
                        {
                          formulario.conformidade
                        }
                        %
                      </div>
                    </div>

                    <BadgeClassificacao
                      classificacao={
                        classificacaoFormulario
                      }
                    />
                  </div>

                  <div className="auditoria-result-track">
                    <div
                      style={{
                        width: `${formulario.conformidade}%`,
                        background:
                          corConformidade(
                            formulario.conformidade
                          ),
                      }}
                    />
                  </div>

                  <div className="auditoria-result-rule">
                    ≥90 Excelente • ≥75 Adequada • ≥50 Atenção • &lt;50 Crítica
                  </div>
                </div>
              </Secao>

              <Secao
                numero="03"
                titulo="Análise da auditoria"
                descricao="Registre observações e detalhes dos desvios encontrados."
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

              <Secao
                numero="04"
                titulo="Plano de ação"
                descricao="Defina correções, prazo e situação do acompanhamento."
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

                {formulario.naoConformidades >
                  0 &&
                  !formulario.acaoCorretiva.trim() && (
                    <div className="auditoria-form-warning">
                      <TriangleAlert
                        size={17}
                      />

                      <div>
                        <strong>
                          Ação corretiva ainda não definida
                        </strong>

                        <span>
                          Foram registradas não
                          conformidades. Descrever
                          uma ação facilita o
                          acompanhamento do desvio.
                        </span>
                      </div>
                    </div>
                  )}

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

                <div className="auditoria-action-summary">
                  <Wrench
                    size={18}
                  />

                  <div>
                    <strong>
                      Situação do acompanhamento
                    </strong>

                    <span>
                      {formulario.status}
                      {formulario.prazo
                        ? ` • prazo ${formatarData(
                            formulario.prazo
                          )}`
                        : " • sem prazo definido"}
                    </span>
                  </div>
                </div>
              </Secao>
            </div>

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
        {estilos}
      </style>
    </main>
  );
}

function FluxoEtapa({
  numero,
  titulo,
  texto,
}: {
  numero: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="auditoria-flow-step">
      <span>
        {numero}
      </span>

      <div>
        <strong>
          {titulo}
        </strong>

        <small>
          {texto}
        </small>
      </div>
    </div>
  );
}

function MetricCard({
  titulo,
  valor,
  detalhe,
  icon,
  cor,
}: {
  titulo: string;
  valor: ReactNode;
  detalhe: string;
  icon: ReactNode;
  cor: string;
}) {
  return (
    <div className="auditoria-metric-card">
      <div
        className="auditoria-metric-icon"
        style={{
          color: cor,
          background:
            `${cor}12`,
        }}
      >
        {icon}
      </div>

      <div className="auditoria-metric-main">
        <span>
          {titulo}
        </span>

        <strong>
          {valor}
        </strong>

        <small>
          {detalhe}
        </small>
      </div>

      <div
        className="auditoria-metric-line"
        style={{
          background:
            cor,
        }}
      />
    </div>
  );
}

function DistribuicaoItem({
  titulo,
  valor,
  total,
  cor,
}: {
  titulo: string;
  valor: number;
  total: number;
  cor: string;
}) {
  const percentual =
    total > 0
      ? Math.round(
          (valor / total) *
            100
        )
      : 0;

  return (
    <div className="auditoria-distribution-item">
      <div className="auditoria-distribution-head">
        <div>
          <span
            className="auditoria-dot"
            style={{
              background: cor,
            }}
          />

          <strong>
            {titulo}
          </strong>
        </div>

        <b>
          {valor}
        </b>
      </div>

      <div className="auditoria-distribution-track">
        <div
          style={{
            width: `${percentual}%`,
            background: cor,
          }}
        />
      </div>

      <small>
        {percentual}% do total
      </small>
    </div>
  );
}

function Prioridade({
  titulo,
  valor,
  texto,
  cor,
}: {
  titulo: string;
  valor: number;
  texto: string;
  cor: string;
}) {
  return (
    <div className="auditoria-priority">
      <div
        className="auditoria-priority-number"
        style={{
          color: cor,
        }}
      >
        {valor}
      </div>

      <div>
        <strong>
          {titulo}
        </strong>

        <span>
          {texto}
        </span>
      </div>
    </div>
  );
}

function AuditoriaRowItem({
  auditoria,
  onEditar,
  onExcluir,
}: {
  auditoria: Auditoria;
  onEditar: (
    auditoria: Auditoria
  ) => void;
  onExcluir: (
    id: number
  ) => void;
}) {
  const classificacao =
    obterClassificacao(
      auditoria.conformidade
    );

  return (
    <tr className="auditoria-table-row">
      <Td>
        <div className="auditoria-identification">
          <div className="auditoria-identification-icon">
            <ClipboardList
              size={18}
            />
          </div>

          <div>
            <div className="auditoria-setor">
              <Building2
                size={14}
              />

              <span>
                {
                  auditoria.setor
                }
              </span>
            </div>

            <div className="auditoria-date">
              <CalendarDays
                size={13}
              />

              {formatarData(
                auditoria.data
              )}
            </div>

            <div className="auditoria-type-badge">
              <Badge color="blue">
                {
                  auditoria.tipo
                }
              </Badge>
            </div>
          </div>
        </div>
      </Td>

      <Td>
        <div className="auditoria-person">
          <UserRound
            size={15}
          />

          <span>
            {
              auditoria.auditor
            }
          </span>
        </div>
      </Td>

      <Td>
        <div className="auditoria-conformidade-cell">
          <div className="auditoria-conformidade-top">
            <BadgeClassificacao
              classificacao={
                classificacao
              }
            />

            <strong
              style={{
                color:
                  corConformidade(
                    auditoria.conformidade
                  ),
              }}
            >
              {
                auditoria.conformidade
              }
              %
            </strong>
          </div>

          <div className="auditoria-mini-track">
            <div
              style={{
                width: `${auditoria.conformidade}%`,
                background:
                  corConformidade(
                    auditoria.conformidade
                  ),
              }}
            />
          </div>
        </div>
      </Td>

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

      <Td>
        <div className="auditoria-action-text">
          {auditoria.acaoCorretiva ||
            "Nenhuma ação cadastrada"}
        </div>
      </Td>

      <Td>
        <PrazoAuditoria
          auditoria={
            auditoria
          }
        />
      </Td>

      <Td>
        <StatusBadge
          status={
            auditoria.status
          }
        />
      </Td>

      <Td align="center">
        <Acoes
          auditoria={
            auditoria
          }
          onEditar={
            onEditar
          }
          onExcluir={
            onExcluir
          }
        />
      </Td>
    </tr>
  );
}

function AuditoriaCard({
  auditoria,
  onEditar,
  onExcluir,
}: {
  auditoria: Auditoria;
  onEditar: (
    auditoria: Auditoria
  ) => void;
  onExcluir: (
    id: number
  ) => void;
}) {
  const classificacao =
    obterClassificacao(
      auditoria.conformidade
    );

  return (
    <article className="auditoria-mobile-card">
      <div className="auditoria-mobile-card-head">
        <div>
          <div className="auditoria-mobile-card-setor">
            {
              auditoria.setor
            }
          </div>

          <div className="auditoria-mobile-card-date">
            <CalendarDays
              size={13}
            />

            {formatarData(
              auditoria.data
            )}
          </div>
        </div>

        <StatusBadge
          status={
            auditoria.status
          }
        />
      </div>

      <div className="auditoria-mobile-meta">
        <Badge color="blue">
          {auditoria.tipo}
        </Badge>

        <div className="auditoria-mobile-auditor">
          <UserRound
            size={14}
          />
          {
            auditoria.auditor
          }
        </div>
      </div>

      <div className="auditoria-mobile-score">
        <div>
          <span>
            Conformidade
          </span>

          <strong
            style={{
              color:
                corConformidade(
                  auditoria.conformidade
                ),
            }}
          >
            {
              auditoria.conformidade
            }
            %
          </strong>
        </div>

        <BadgeClassificacao
          classificacao={
            classificacao
          }
        />
      </div>

      <div className="auditoria-mobile-track">
        <div
          style={{
            width: `${auditoria.conformidade}%`,
            background:
              corConformidade(
                auditoria.conformidade
              ),
          }}
        />
      </div>

      <div className="auditoria-mobile-grid">
        <InfoMobile
          label="Não conformidades"
          value={`${auditoria.naoConformidades}`}
        />

        <InfoMobile
          label="Prazo"
          value={
            auditoria.prazo
              ? formatarData(
                  auditoria.prazo
                )
              : "Não definido"
          }
          danger={
            prazoVencido(
              auditoria
            )
          }
        />
      </div>

      <div className="auditoria-mobile-action">
        <span>
          Ação corretiva
        </span>

        <p>
          {auditoria.acaoCorretiva ||
            "Nenhuma ação cadastrada"}
        </p>
      </div>

      {prazoVencido(
        auditoria
      ) && (
        <div className="auditoria-mobile-overdue">
          <AlertCircle
            size={15}
          />
          Prazo da ação corretiva vencido
        </div>
      )}

      <div className="auditoria-mobile-card-actions">
        <button
          type="button"
          onClick={() =>
            onEditar(
              auditoria
            )
          }
          className="auditoria-action-btn auditoria-edit-btn"
        >
          <Pencil
            size={16}
          />
          Editar
        </button>

        <button
          type="button"
          onClick={() =>
            onExcluir(
              auditoria.id
            )
          }
          className="auditoria-action-btn auditoria-delete-btn"
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

function InfoMobile({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="auditoria-mobile-info">
      <span>
        {label}
      </span>

      <strong
        style={{
          color: danger
            ? "#DC2626"
            : "#0F172A",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function PrazoAuditoria({
  auditoria,
}: {
  auditoria: Auditoria;
}) {
  const vencido =
    prazoVencido(
      auditoria
    );

  return (
    <div
      className={
        vencido
          ? "auditoria-deadline auditoria-deadline-overdue"
          : "auditoria-deadline"
      }
    >
      <div>
        <CalendarDays
          size={14}
        />

        {formatarData(
          auditoria.prazo
        )}
      </div>

      {vencido && (
        <small>
          Prazo vencido
        </small>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusAuditoria;
}) {
  return (
    <Badge
      color={
        status ===
        "Concluída"
          ? "green"
          : status ===
              "Em andamento"
            ? "yellow"
            : "gray"
      }
    >
      {status}
    </Badge>
  );
}

function BadgeClassificacao({
  classificacao,
}: {
  classificacao:
    ClassificacaoAuditoria;
}) {
  return (
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
      {classificacao}
    </Badge>
  );
}

function Acoes({
  auditoria,
  onEditar,
  onExcluir,
}: {
  auditoria: Auditoria;
  onEditar: (
    auditoria: Auditoria
  ) => void;
  onExcluir: (
    id: number
  ) => void;
}) {
  return (
    <div className="auditoria-actions">
      <button
        type="button"
        title="Editar auditoria"
        aria-label="Editar auditoria"
        onClick={() =>
          onEditar(
            auditoria
          )
        }
        className="auditoria-icon-btn auditoria-icon-edit"
      >
        <Pencil size={17} />
      </button>

      <button
        type="button"
        title="Excluir auditoria"
        aria-label="Excluir auditoria"
        onClick={() =>
          onExcluir(
            auditoria.id
          )
        }
        className="auditoria-icon-btn auditoria-icon-delete"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function Secao({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: string;
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section className="auditoria-form-section">
      <div className="auditoria-form-section-head">
        <span>
          {numero}
        </span>

        <div>
          <h3>
            {titulo}
          </h3>

          <p>
            {descricao}
          </p>
        </div>
      </div>

      <div className="auditoria-form-section-content">
        {children}
      </div>
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
  onChange: (
    valor: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="auditoria-field">
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
  onChange: (
    valor: string
  ) => void;
}) {
  return (
    <div className="auditoria-field">
      <label>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
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
  onChange: (
    valor: string
  ) => void;
}) {
  return (
    <div className="auditoria-field">
      <label>
        {label}
      </label>

      <textarea
        rows={4}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      />
    </div>
  );
}

function EstadoCarregando() {
  return (
    <div className="auditoria-empty">
      <div className="auditoria-loading-icon">
        <ClipboardList
          size={24}
        />
      </div>

      <strong>
        Carregando auditorias...
      </strong>

      <span>
        Aguarde enquanto os registros
        são consultados.
      </span>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="auditoria-empty">
      <div className="auditoria-empty-icon">
        <ClipboardList
          size={25}
        />
      </div>

      <strong>
        Nenhuma auditoria encontrada
      </strong>

      <span>
        Registre uma nova auditoria ou
        altere os filtros aplicados.
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
        textAlign:
          align,
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
        textAlign:
          align,
      }}
    >
      {children}
    </td>
  );
}

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
): ClassificacaoAuditoria {
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

const estilos = `
  .auditoria-page {
    width: 100%;
    min-width: 0;
    padding: 32px;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .auditoria-btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auditoria-error {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 20px;
    padding: 13px 15px;
    box-sizing: border-box;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
  }

  .auditoria-error-main {
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }

  .auditoria-error-main svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .auditoria-error > button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    background: transparent;
    color: #B91C1C;
    cursor: pointer;
  }

  .auditoria-hero {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 290px;
    gap: 28px;
    margin-bottom: 22px;
    padding: 28px 30px;
    box-sizing: border-box;
    border-radius: 20px;
    background: linear-gradient(135deg, #0F172A 0%, #172554 100%);
    color: #FFFFFF;
    box-shadow: 0 16px 36px rgba(15, 23, 42, .14);
    overflow: hidden;
  }

  .auditoria-hero-copy {
    min-width: 0;
  }

  .auditoria-eyebrow,
  .auditoria-panel-kicker,
  .auditoria-drawer-kicker {
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .8px;
    text-transform: uppercase;
  }

  .auditoria-eyebrow {
    color: #93C5FD;
  }

  .auditoria-hero h2 {
    max-width: 760px;
    margin: 8px 0 0;
    color: #FFFFFF;
    font-size: 24px;
    line-height: 1.25;
    font-weight: 850;
    letter-spacing: -.3px;
  }

  .auditoria-hero-copy > p {
    max-width: 800px;
    margin: 10px 0 0;
    color: #CBD5E1;
    font-size: 12px;
    line-height: 1.65;
  }

  .auditoria-flow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
    min-width: 0;
  }

  .auditoria-flow-step {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .auditoria-flow-step > span {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(147, 197, 253, .28);
    border-radius: 8px;
    background: rgba(37, 99, 235, .15);
    color: #BFDBFE;
    font-size: 9px;
    font-weight: 850;
  }

  .auditoria-flow-step div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .auditoria-flow-step strong {
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 750;
  }

  .auditoria-flow-step small {
    color: #94A3B8;
    font-size: 9px;
    white-space: nowrap;
  }

  .auditoria-flow-arrow {
    color: #475569;
    flex-shrink: 0;
  }

  .auditoria-hero-side {
    min-width: 0;
    padding: 20px;
    border: 1px solid rgba(148, 163, 184, .18);
    border-radius: 15px;
    background: rgba(15, 23, 42, .36);
  }

  .auditoria-hero-side-label {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .auditoria-hero-percent {
    margin-top: 8px;
    font-size: 38px;
    line-height: 1;
    font-weight: 900;
  }

  .auditoria-hero-side-text {
    margin-top: 6px;
    color: #CBD5E1;
    font-size: 10px;
    line-height: 1.5;
  }

  .auditoria-hero-progress,
  .auditoria-mini-track,
  .auditoria-mobile-track,
  .auditoria-result-track {
    width: 100%;
    overflow: hidden;
    border-radius: 999px;
    background: #E2E8F0;
  }

  .auditoria-hero-progress {
    height: 7px;
    margin-top: 15px;
    background: rgba(148, 163, 184, .2);
  }

  .auditoria-hero-progress > div {
    height: 100%;
    border-radius: inherit;
    background: #60A5FA;
  }

  .auditoria-hero-mini {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(148, 163, 184, .15);
  }

  .auditoria-hero-mini span {
    color: #94A3B8;
    font-size: 10px;
  }

  .auditoria-hero-mini strong {
    font-size: 15px;
    font-weight: 850;
  }

  .auditoria-metrics {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .auditoria-metrics-medium {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .auditoria-metric-card {
    position: relative;
    min-width: 0;
    min-height: 126px;
    display: flex;
    gap: 12px;
    padding: 18px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    background: #FFFFFF;
    box-shadow: 0 5px 16px rgba(15, 23, 42, .035);
    overflow: hidden;
  }

  .auditoria-metric-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
  }

  .auditoria-metric-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .auditoria-metric-main > span {
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.35;
  }

  .auditoria-metric-main > strong {
    margin-top: 4px;
    color: #0F172A;
    font-size: 23px;
    line-height: 1.1;
    font-weight: 850;
  }

  .auditoria-metric-main > small {
    margin-top: 6px;
    color: #94A3B8;
    font-size: 9px;
    line-height: 1.4;
  }

  .auditoria-metric-line {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    opacity: .85;
  }

  .auditoria-insights {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 18px;
  }

  .auditoria-insights-stack {
    grid-template-columns: minmax(0, 1fr);
  }

  .auditoria-panel {
    min-width: 0;
    padding: 22px;
    border: 1px solid #E2E8F0;
    border-radius: 17px;
    background: #FFFFFF;
    box-shadow: 0 6px 18px rgba(15, 23, 42, .035);
  }

  .auditoria-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  .auditoria-panel-kicker {
    color: #64748B;
  }

  .auditoria-panel-header h3,
  .auditoria-history-head h2 {
    margin: 5px 0 0;
    color: #0F172A;
    font-size: 17px;
    line-height: 1.3;
    font-weight: 820;
  }

  .auditoria-panel-header p,
  .auditoria-history-head p {
    margin: 5px 0 0;
    color: #94A3B8;
    font-size: 10px;
    line-height: 1.5;
  }

  .auditoria-panel-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
  }

  .auditoria-panel-icon-green {
    background: #F0FDF4;
    color: #16A34A;
  }

  .auditoria-panel-icon-red {
    background: #FEF2F2;
    color: #DC2626;
  }

  .auditoria-distribution {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .auditoria-distribution-item {
    min-width: 0;
    padding: 14px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #F8FAFC;
  }

  .auditoria-distribution-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .auditoria-distribution-head > div {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .auditoria-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 999px;
  }

  .auditoria-distribution-head strong {
    color: #334155;
    font-size: 10px;
    font-weight: 750;
  }

  .auditoria-distribution-head b {
    color: #0F172A;
    font-size: 15px;
    font-weight: 850;
  }

  .auditoria-distribution-track {
    width: 100%;
    height: 6px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: #E2E8F0;
  }

  .auditoria-distribution-track > div {
    height: 100%;
    border-radius: inherit;
  }

  .auditoria-distribution-item small {
    display: block;
    margin-top: 7px;
    color: #94A3B8;
    font-size: 9px;
  }

  .auditoria-priority-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .auditoria-priority {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #F8FAFC;
  }

  .auditoria-priority-number {
    min-width: 34px;
    font-size: 24px;
    line-height: 1;
    font-weight: 900;
  }

  .auditoria-priority > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .auditoria-priority strong {
    color: #334155;
    font-size: 10px;
    font-weight: 750;
  }

  .auditoria-priority span {
    color: #94A3B8;
    font-size: 9px;
    line-height: 1.4;
  }

  .auditoria-history {
    width: 100%;
    min-width: 0;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
    overflow: hidden;
  }

  .auditoria-history-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .auditoria-history-summary {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border: 1px solid #BBF7D0;
    border-radius: 9px;
    background: #F0FDF4;
    color: #15803D;
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
  }

  .auditoria-filter-box {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #F8FAFC;
  }

  .auditoria-filter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .auditoria-filter-title {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #475569;
    font-size: 11px;
    font-weight: 750;
  }

  .auditoria-clear-filter {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: none;
    background: transparent;
    color: #2563EB;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }

  .auditoria-filter-grid {
    display: grid;
    grid-template-columns: minmax(280px, 2fr) repeat(2, minmax(170px, 1fr));
    gap: 10px;
  }

  .auditoria-search {
    height: 42px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 10px;
    background: #FFFFFF;
    color: #94A3B8;
  }

  .auditoria-search input {
    width: 100%;
    min-width: 0;
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #0F172A;
    font-family: inherit;
    font-size: 11px;
  }

  .auditoria-select {
    width: 100%;
    min-width: 0;
    height: 42px;
    padding: 0 11px;
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 10px;
    background: #FFFFFF;
    color: #475569;
    font-family: inherit;
    font-size: 10px;
    font-weight: 650;
    outline: none;
    cursor: pointer;
  }

  .auditoria-filter-count {
    margin-top: 10px;
    color: #64748B;
    font-size: 10px;
  }

  .auditoria-filter-count strong {
    color: #0F172A;
  }

  .auditoria-table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    -webkit-overflow-scrolling: touch;
  }

  .auditoria-table {
    width: 100%;
    min-width: 1180px;
    border-collapse: collapse;
  }

  .auditoria-table thead tr {
    background: #F8FAFC;
  }

  .auditoria-table th {
    padding: 13px 15px;
    color: #64748B;
    font-size: 9px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .5px;
    white-space: nowrap;
  }

  .auditoria-table td {
    padding: 16px 15px;
    vertical-align: middle;
    color: #475569;
    font-size: 11px;
    border-top: 1px solid #E2E8F0;
  }

  .auditoria-table-row {
    background: #FFFFFF;
    transition: background .15s ease;
  }

  .auditoria-table-row:hover {
    background: #FAFCFF;
  }

  .auditoria-identification {
    width: 195px;
    min-width: 195px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .auditoria-identification-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-setor {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    color: #0F172A;
    font-size: 11px;
    font-weight: 750;
    line-height: 1.35;
  }

  .auditoria-setor svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .auditoria-setor span {
    overflow-wrap: anywhere;
  }

  .auditoria-date {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    color: #64748B;
    font-size: 9px;
    white-space: nowrap;
  }

  .auditoria-type-badge {
    margin-top: 6px;
  }

  .auditoria-person {
    width: 135px;
    min-width: 135px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    color: #475569;
  }

  .auditoria-person svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #94A3B8;
  }

  .auditoria-person span {
    overflow-wrap: anywhere;
  }

  .auditoria-conformidade-cell {
    width: 145px;
    min-width: 145px;
  }

  .auditoria-conformidade-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
  }

  .auditoria-conformidade-top strong {
    font-size: 11px;
    white-space: nowrap;
  }

  .auditoria-mini-track {
    height: 6px;
    margin-top: 7px;
  }

  .auditoria-mini-track > div,
  .auditoria-mobile-track > div,
  .auditoria-result-track > div {
    height: 100%;
    border-radius: inherit;
  }

  .auditoria-action-text {
    width: 200px;
    max-width: 200px;
    color: #475569;
    font-size: 10px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .auditoria-deadline {
    min-width: 108px;
  }

  .auditoria-deadline > div {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #475569;
    font-size: 10px;
    white-space: nowrap;
  }

  .auditoria-deadline-overdue > div {
    color: #DC2626;
    font-weight: 750;
  }

  .auditoria-deadline small {
    display: block;
    margin-top: 4px;
    color: #DC2626;
    font-size: 8px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .auditoria-actions {
    display: flex;
    justify-content: center;
    gap: 6px;
    min-width: 76px;
  }

  .auditoria-icon-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 9px;
    cursor: pointer;
  }

  .auditoria-icon-edit {
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-icon-delete {
    background: #FEF2F2;
    color: #DC2626;
  }

  .auditoria-empty {
    width: 100%;
    min-height: 230px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px 16px;
    box-sizing: border-box;
    border: 1px dashed #CBD5E1;
    border-radius: 13px;
    text-align: center;
  }

  .auditoria-empty-icon,
  .auditoria-loading-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    border-radius: 13px;
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-loading-icon {
    background: #F8FAFC;
    color: #64748B;
  }

  .auditoria-empty strong {
    color: #0F172A;
    font-size: 13px;
  }

  .auditoria-empty span {
    max-width: 360px;
    margin-top: 5px;
    color: #94A3B8;
    font-size: 10px;
    line-height: 1.5;
  }

  .auditoria-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .auditoria-mobile-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
  }

  .auditoria-mobile-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .auditoria-mobile-card-setor {
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
  }

  .auditoria-mobile-card-date,
  .auditoria-mobile-auditor {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #64748B;
    font-size: 10px;
  }

  .auditoria-mobile-card-date {
    margin-top: 5px;
  }

  .auditoria-mobile-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 13px;
  }

  .auditoria-mobile-score {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 17px;
  }

  .auditoria-mobile-score > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .auditoria-mobile-score span {
    color: #64748B;
    font-size: 9px;
    font-weight: 750;
    text-transform: uppercase;
  }

  .auditoria-mobile-score strong {
    font-size: 24px;
    font-weight: 900;
  }

  .auditoria-mobile-track {
    height: 7px;
    margin-top: 9px;
  }

  .auditoria-mobile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
    margin-top: 14px;
  }

  .auditoria-mobile-info {
    min-width: 0;
    padding: 11px;
    border-radius: 10px;
    background: #F8FAFC;
  }

  .auditoria-mobile-info span {
    display: block;
    color: #94A3B8;
    font-size: 9px;
  }

  .auditoria-mobile-info strong {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .auditoria-mobile-action {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #E2E8F0;
  }

  .auditoria-mobile-action span {
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .auditoria-mobile-action p {
    margin: 5px 0 0;
    color: #475569;
    font-size: 10px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .auditoria-mobile-overdue {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 11px;
    padding: 9px 10px;
    border: 1px solid #FECACA;
    border-radius: 9px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 10px;
    font-weight: 750;
  }

  .auditoria-mobile-card-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .auditoria-action-btn {
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    border-radius: 9px;
    font-family: inherit;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }

  .auditoria-edit-btn {
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-delete-btn {
    background: #FEF2F2;
    color: #DC2626;
  }

  .auditoria-drawer-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, .5);
    backdrop-filter: blur(3px);
    z-index: 2000;
  }

  .auditoria-drawer {
    width: 620px;
    max-width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: #FFFFFF;
    box-shadow: -16px 0 45px rgba(15, 23, 42, .16);
    overflow: hidden;
  }

  .auditoria-drawer-header {
    padding: 22px 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    flex-shrink: 0;
    border-bottom: 1px solid #E2E8F0;
  }

  .auditoria-drawer-header-main {
    min-width: 0;
    display: flex;
    gap: 12px;
  }

  .auditoria-drawer-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 11px;
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-drawer-title {
    min-width: 0;
  }

  .auditoria-drawer-kicker {
    color: #64748B;
  }

  .auditoria-drawer-title h2 {
    margin: 4px 0 0;
    color: #0F172A;
    font-size: 19px;
    font-weight: 850;
    line-height: 1.25;
  }

  .auditoria-drawer-title p {
    margin: 5px 0 0;
    color: #64748B;
    font-size: 10px;
    line-height: 1.5;
  }

  .auditoria-drawer-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid #E2E8F0;
    border-radius: 9px;
    background: #FFFFFF;
    color: #64748B;
    cursor: pointer;
  }

  .auditoria-drawer-content {
    flex: 1;
    min-height: 0;
    padding: 20px 24px 28px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .auditoria-form-section {
    width: 100%;
    min-width: 0;
    margin-bottom: 16px;
    padding: 18px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
  }

  .auditoria-form-section-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
  }

  .auditoria-form-section-head > span {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: #EFF6FF;
    color: #2563EB;
    font-size: 9px;
    font-weight: 850;
  }

  .auditoria-form-section-head > div {
    min-width: 0;
  }

  .auditoria-form-section-head h3 {
    margin: 0;
    color: #0F172A;
    font-size: 13px;
    font-weight: 820;
  }

  .auditoria-form-section-head p {
    margin: 3px 0 0;
    color: #94A3B8;
    font-size: 9px;
    line-height: 1.45;
  }

  .auditoria-form-section-content {
    min-width: 0;
  }

  .auditoria-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .auditoria-field {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 13px;
  }

  .auditoria-field label {
    color: #334155;
    font-size: 11px;
    font-weight: 700;
  }

  .auditoria-field input,
  .auditoria-field select,
  .auditoria-field textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 10px;
    background: #FFFFFF;
    color: #0F172A;
    font-family: inherit;
    font-size: 11px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
  }

  .auditoria-field input,
  .auditoria-field select {
    height: 43px;
    padding: 0 12px;
  }

  .auditoria-field textarea {
    min-height: 96px;
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.5;
  }

  .auditoria-field input:focus,
  .auditoria-field select:focus,
  .auditoria-field textarea:focus {
    border-color: #93C5FD;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);
  }

  .auditoria-result-box {
    padding: 15px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #F8FAFC;
  }

  .auditoria-result-top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 14px;
  }

  .auditoria-result-label {
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
  }

  .auditoria-result-number {
    margin-top: 3px;
    color: #0F172A;
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
  }

  .auditoria-result-track {
    height: 8px;
    margin-top: 12px;
  }

  .auditoria-result-rule {
    margin-top: 8px;
    color: #94A3B8;
    font-size: 8px;
    line-height: 1.4;
  }

  .auditoria-form-warning {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-bottom: 13px;
    padding: 11px;
    border: 1px solid #FED7AA;
    border-radius: 10px;
    background: #FFF7ED;
    color: #C2410C;
  }

  .auditoria-form-warning svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .auditoria-form-warning > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .auditoria-form-warning strong {
    font-size: 10px;
  }

  .auditoria-form-warning span {
    color: #9A3412;
    font-size: 9px;
    line-height: 1.45;
  }

  .auditoria-action-summary {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid #DBEAFE;
    border-radius: 10px;
    background: #EFF6FF;
    color: #2563EB;
  }

  .auditoria-action-summary svg {
    flex-shrink: 0;
  }

  .auditoria-action-summary > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .auditoria-action-summary strong {
    color: #1E3A8A;
    font-size: 10px;
  }

  .auditoria-action-summary span {
    color: #475569;
    font-size: 9px;
  }

  .auditoria-drawer-footer {
    padding: 15px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-top: 1px solid #E2E8F0;
    background: #FFFFFF;
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }

  @media (max-width: 1180px) {
    .auditoria-metrics-medium .auditoria-metric-card:last-child {
      grid-column: 1 / -1;
    }

    .auditoria-filter-grid {
      grid-template-columns: minmax(0, 1fr) repeat(2, minmax(150px, 190px));
    }
  }

  @media (max-width: 980px) {
    .auditoria-page {
      padding: 24px 20px 32px;
    }

    .auditoria-hero {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-hero-side {
      max-width: none;
    }

    .auditoria-flow {
      flex-wrap: wrap;
    }

    .auditoria-flow-arrow {
      display: none;
    }

    .auditoria-filter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .auditoria-search {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 720px) {
    .auditoria-page {
      padding: 18px 14px 28px;
    }

    .auditoria-hero {
      gap: 20px;
      padding: 22px 18px;
      border-radius: 16px;
    }

    .auditoria-hero h2 {
      font-size: 20px;
    }

    .auditoria-flow {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }

    .auditoria-flow-step {
      padding: 9px;
      border: 1px solid rgba(148, 163, 184, .14);
      border-radius: 10px;
      background: rgba(15, 23, 42, .2);
    }

    .auditoria-flow-step small {
      white-space: normal;
    }

    .auditoria-metrics,
    .auditoria-metrics-medium {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .auditoria-metrics .auditoria-metric-card:last-child,
    .auditoria-metrics-medium .auditoria-metric-card:last-child {
      grid-column: 1 / -1;
    }

    .auditoria-metric-card {
      min-height: 118px;
      padding: 15px;
    }

    .auditoria-metric-main > strong {
      font-size: 21px;
    }

    .auditoria-panel,
    .auditoria-history {
      padding: 16px;
      border-radius: 14px;
    }

    .auditoria-distribution,
    .auditoria-priority-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-history-head {
      flex-direction: column;
    }

    .auditoria-filter-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-search {
      grid-column: auto;
    }

    .auditoria-filter-head {
      align-items: flex-start;
    }

    .auditoria-mobile-card {
      padding: 14px;
    }

    .auditoria-drawer {
      width: 100%;
      max-width: none;
    }

    .auditoria-drawer-header {
      padding: 18px 16px;
    }

    .auditoria-drawer-content {
      padding: 16px 14px 22px;
    }

    .auditoria-form-section {
      padding: 15px;
    }

    .auditoria-grid-2 {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    .auditoria-drawer-footer {
      padding: 13px 14px;
      padding-bottom: max(13px, env(safe-area-inset-bottom));
    }

    .auditoria-drawer-footer > * {
      flex: 1 1 0;
    }
  }

  @media (max-width: 430px) {
    .auditoria-metrics,
    .auditoria-metrics-medium {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-metrics .auditoria-metric-card:last-child,
    .auditoria-metrics-medium .auditoria-metric-card:last-child {
      grid-column: auto;
    }

    .auditoria-flow {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-mobile-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-mobile-card-actions {
      grid-template-columns: minmax(0, 1fr);
    }

    .auditoria-drawer-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .auditoria-drawer-footer > * {
      width: 100%;
    }
  }
`;
