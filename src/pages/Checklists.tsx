import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Activity,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

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

const CAMPOS_CHECKLIST =
  "id, data, setor, responsavel, observacoes, epis, piso, extintor, exaustao, iluminacao, facas, quimicos, emergencia";

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

function useViewportWidth() {
  const [largura, setLargura] =
    useState(() =>
      typeof window !== "undefined"
        ? window.innerWidth
        : 1440
    );

  useEffect(() => {
    function atualizar() {
      setLargura(window.innerWidth);
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
  const largura = useViewportWidth();
  const mobile = largura <= 680;
  const tablet = largura <= 1020;

  const [checklists, setChecklists] =
    useState<Checklist[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erroBanco, setErroBanco] =
    useState("");

  const [pesquisa, setPesquisa] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState<StatusChecklist | "">("");

  const [drawerAberto, setDrawerAberto] =
    useState(false);

  const [editando, setEditando] =
    useState<Checklist | null>(null);

  const [formulario, setFormulario] =
    useState<Checklist>(
      criarChecklistInicial()
    );

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarChecklists() {
      setCarregando(true);
      setErroBanco("");

      const { data, error } =
        await supabase
          .from("checklists")
          .select(CAMPOS_CHECKLIST)
          .order("data", {
            ascending: false,
          })
          .order("id", {
            ascending: false,
          });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar checklists:",
          error
        );

        setChecklists([]);
        setErroBanco(
          "Não foi possível carregar os checklists."
        );
        setCarregando(false);
        return;
      }

      setChecklists(
        (data ?? []) as Checklist[]
      );
      setCarregando(false);
    }

    void carregarChecklists();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  useEffect(() => {
    if (!drawerAberto) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function fecharComEsc(
      evento: KeyboardEvent
    ) {
      if (evento.key === "Escape") {
        fecharDrawer();
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

  const conformes = checklists.filter(
    (checklist) =>
      obterStatus(checklist) ===
      "Conforme"
  ).length;

  const atencao = checklists.filter(
    (checklist) =>
      obterStatus(checklist) ===
      "Atenção"
  ).length;

  const criticos = checklists.filter(
    (checklist) =>
      obterStatus(checklist) ===
      "Crítico"
  ).length;

  const mediaConformidade =
    checklists.length > 0
      ? Math.round(
          checklists.reduce(
            (total, checklist) =>
              total +
              calcularPercentual(
                checklist
              ),
            0
          ) / checklists.length
        )
      : 0;

  const taxaInspecoesConformes =
    checklists.length > 0
      ? Math.round(
          (conformes /
            checklists.length) *
            100
        )
      : 0;

  const totalNaoConformidades =
    checklists.reduce(
      (total, checklist) =>
        total +
        obterItensNaoConformes(
          checklist
        ).length,
      0
    );

  const ultimaInspecao =
    checklists[0]?.data ?? "";

  const checklistsFiltrados =
    useMemo(() => {
      const termo = pesquisa
        .trim()
        .toLowerCase();

      return checklists.filter(
        (checklist) => {
          const correspondePesquisa =
            !termo ||
            checklist.setor
              .toLowerCase()
              .includes(termo) ||
            checklist.responsavel
              .toLowerCase()
              .includes(termo) ||
            checklist.data
              .toLowerCase()
              .includes(termo) ||
            checklist.observacoes
              .toLowerCase()
              .includes(termo);

          const correspondeStatus =
            !filtroStatus ||
            obterStatus(checklist) ===
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

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroStatus !== "";

  const percentualFormulario =
    calcularPercentual(formulario);

  const statusFormulario =
    obterStatus(formulario);

  const itensNaoConformesFormulario =
    obterItensNaoConformes(formulario);

  function abrirNovaInspecao() {
    setEditando(null);
    setErroBanco("");
    setFormulario(
      criarChecklistInicial()
    );
    setDrawerAberto(true);
  }

  function editarChecklist(
    checklist: Checklist
  ) {
    setEditando(checklist);
    setErroBanco("");
    setFormulario({ ...checklist });
    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
    setEditando(null);
    setFormulario(
      criarChecklistInicial()
    );
  }

  async function salvarChecklist() {
    if (salvando) {
      return;
    }

    if (!formulario.data) {
      window.alert(
        "Informe a data da inspeção."
      );
      return;
    }

    if (!formulario.setor.trim()) {
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

    const payload = {
      data: formulario.data,
      setor: formulario.setor.trim(),
      responsavel:
        formulario.responsavel.trim(),
      observacoes:
        formulario.observacoes.trim(),
      epis: formulario.epis,
      piso: formulario.piso,
      extintor: formulario.extintor,
      exaustao: formulario.exaustao,
      iluminacao:
        formulario.iluminacao,
      facas: formulario.facas,
      quimicos: formulario.quimicos,
      emergencia:
        formulario.emergencia,
    };

    setSalvando(true);
    setErroBanco("");

    try {
      if (editando) {
        const { data, error } =
          await supabase
            .from("checklists")
            .update(payload)
            .eq("id", editando.id)
            .select(CAMPOS_CHECKLIST)
            .single();

        if (error || !data) {
          console.error(
            "Erro ao atualizar checklist:",
            error
          );
          setErroBanco(
            "Não foi possível atualizar a inspeção."
          );
          return;
        }

        const checklistAtualizado =
          data as Checklist;

        setChecklists(
          (listaAtual) =>
            listaAtual.map(
              (checklist) =>
                checklist.id ===
                checklistAtualizado.id
                  ? checklistAtualizado
                  : checklist
            )
        );
      } else {
        const { data, error } =
          await supabase
            .from("checklists")
            .insert(payload)
            .select(CAMPOS_CHECKLIST)
            .single();

        if (error || !data) {
          console.error(
            "Erro ao cadastrar checklist:",
            error
          );
          setErroBanco(
            "Não foi possível registrar a inspeção."
          );
          return;
        }

        const novoChecklist =
          data as Checklist;

        setChecklists(
          (listaAtual) => [
            novoChecklist,
            ...listaAtual,
          ]
        );
      }

      fecharDrawer();
    } finally {
      setSalvando(false);
    }
  }

  async function excluirChecklist(
    id: number
  ) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta inspeção?"
    );

    if (!confirmar) {
      return;
    }

    setErroBanco("");

    const { error } = await supabase
      .from("checklists")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao excluir checklist:",
        error
      );
      setErroBanco(
        "Não foi possível excluir a inspeção."
      );
      return;
    }

    setChecklists((listaAtual) =>
      listaAtual.filter(
        (checklist) =>
          checklist.id !== id
      )
    );
  }

  function limparFiltros() {
    setPesquisa("");
    setFiltroStatus("");
  }

  return (
    <main
      className="checklists-page"
      style={{
        padding: mobile
          ? "18px 14px 28px"
          : tablet
            ? "24px 20px 32px"
            : "32px",
      }}
    >
      <PageHeader
        title="Checklists de Segurança"
        subtitle="Inspeções preventivas das condições de segurança da cozinha."
        icon={ClipboardCheck}
      >
        <Button
          onClick={abrirNovaInspecao}
        >
          <span className="checklists-button-content">
            <Plus size={18} />
            Nova Inspeção
          </span>
        </Button>
      </PageHeader>

      {erroBanco && (
        <div
          className="checklists-error"
          role="alert"
        >
          <div className="checklists-error-main">
            <TriangleAlert size={18} />
            <span>{erroBanco}</span>
          </div>

          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() =>
              setErroBanco("")
            }
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="checklists-hero">
        <div className="checklists-hero-copy">
          <div className="checklists-eyebrow">
            <ClipboardList size={15} />
            ROTINA DE INSPEÇÕES PREVENTIVAS
          </div>

          <h2>
            Verificação operacional das
            condições de segurança
          </h2>

          <p>
            Registre inspeções periódicas,
            acompanhe não conformidades e
            identifique rapidamente os pontos
            que exigem correção na cozinha
            industrial.
          </p>

          <div className="checklists-hero-flow">
            <span>Inspecionar</span>
            <span className="checklists-flow-arrow">
              →
            </span>
            <span>Classificar</span>
            <span className="checklists-flow-arrow">
              →
            </span>
            <span>Corrigir</span>
            <span className="checklists-flow-arrow">
              →
            </span>
            <span>Monitorar</span>
          </div>
        </div>

        <div className="checklists-hero-side">
          <div className="checklists-hero-side-top">
            <div>
              <span>Pontos verificados</span>
              <strong>
                {itensChecklist.length}
              </strong>
            </div>

            <div className="checklists-hero-icon">
              <ListChecks size={24} />
            </div>
          </div>

          <div className="checklists-mini-grid">
            {itensChecklist.map((item) => (
              <div
                key={item.campo}
                className="checklists-mini-item"
              >
                <CheckCircle2 size={13} />
                <span>{item.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="checklists-metrics">
        <MetricCard
          label="Inspeções realizadas"
          value={checklists.length}
          detail={
            ultimaInspecao
              ? `Última em ${formatarData(
                  ultimaInspecao
                )}`
              : "Nenhuma inspeção registrada"
          }
          icon={<ClipboardCheck size={20} />}
          accent="#2563EB"
        />

        <MetricCard
          label="Conformes"
          value={conformes}
          detail={`${taxaInspecoesConformes}% das inspeções`}
          icon={<CircleCheckBig size={20} />}
          accent="#16A34A"
        />

        <MetricCard
          label="Requerem atenção"
          value={atencao}
          detail="75% a 99% de conformidade"
          icon={<TriangleAlert size={20} />}
          accent="#D97706"
        />

        <MetricCard
          label="Críticos"
          value={criticos}
          detail="Abaixo de 75%"
          icon={<ShieldAlert size={20} />}
          accent="#DC2626"
        />

        <MetricCard
          label="Conformidade média"
          value={`${mediaConformidade}%`}
          detail="Média de todas as inspeções"
          icon={<Activity size={20} />}
          accent="#7C3AED"
        />
      </section>

      <section className="checklists-insights">
        <div className="checklists-panel checklists-panel-main">
          <div className="checklists-panel-header">
            <div>
              <span className="checklists-panel-kicker">
                DESEMPENHO OPERACIONAL
              </span>
              <h3>Conformidade geral</h3>
            </div>

            <div
              className="checklists-panel-icon"
              style={{
                color:
                  mediaConformidade === 100
                    ? "#16A34A"
                    : mediaConformidade >= 75
                      ? "#D97706"
                      : "#DC2626",
              }}
            >
              <Activity size={20} />
            </div>
          </div>

          <div className="checklists-performance-row">
            <strong>
              {mediaConformidade}%
            </strong>

            <div className="checklists-performance-copy">
              <span>
                Média das inspeções registradas
              </span>
              <small>
                100% Conforme • 75–99% Atenção
                • abaixo de 75% Crítico
              </small>
            </div>
          </div>

          <div className="checklists-performance-bar">
            <div
              style={{
                width: `${mediaConformidade}%`,
                background:
                  mediaConformidade === 100
                    ? "#16A34A"
                    : mediaConformidade >= 75
                      ? "#F59E0B"
                      : "#DC2626",
              }}
            />
          </div>

          <div className="checklists-performance-legend">
            <div>
              <span className="dot dot-green" />
              <strong>{conformes}</strong>
              <small>Conforme</small>
            </div>
            <div>
              <span className="dot dot-yellow" />
              <strong>{atencao}</strong>
              <small>Atenção</small>
            </div>
            <div>
              <span className="dot dot-red" />
              <strong>{criticos}</strong>
              <small>Crítico</small>
            </div>
          </div>
        </div>

        <div className="checklists-panel">
          <div className="checklists-panel-header">
            <div>
              <span className="checklists-panel-kicker">
                PRIORIDADES
              </span>
              <h3>Pontos que exigem ação</h3>
            </div>

            <div className="checklists-panel-icon checklists-panel-icon-danger">
              <ShieldAlert size={20} />
            </div>
          </div>

          <div className="checklists-priority-list">
            <PriorityRow
              label="Inspeções críticas"
              value={criticos}
              description="Resultados abaixo de 75%"
              accent="#DC2626"
            />

            <PriorityRow
              label="Inspeções em atenção"
              value={atencao}
              description="Resultados entre 75% e 99%"
              accent="#D97706"
            />

            <PriorityRow
              label="Não conformidades registradas"
              value={totalNaoConformidades}
              description="Soma dos itens não conformes"
              accent="#7C3AED"
            />
          </div>
        </div>
      </section>

      <section className="checklists-history">
        <div className="checklists-history-header">
          <div>
            <span className="checklists-panel-kicker">
              REGISTROS DE CAMPO
            </span>
            <h2>Histórico de Inspeções</h2>
            <p>
              Consulte resultados, responsáveis,
              setores e não conformidades
              identificadas.
            </p>
          </div>

          <div className="checklists-history-status">
            <span>
              <i className="status-dot status-green" />
              100% Conforme
            </span>
            <span>
              <i className="status-dot status-yellow" />
              75–99% Atenção
            </span>
            <span>
              <i className="status-dot status-red" />
              &lt;75% Crítico
            </span>
          </div>
        </div>

        <div className="checklists-filters">
          <div className="checklists-filters-top">
            <div className="checklists-filters-title">
              <SlidersHorizontal size={16} />
              Filtros de inspeções
            </div>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={limparFiltros}
                className="checklists-clear-filters"
              >
                <X size={13} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="checklists-filter-grid">
            <div className="checklists-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Pesquisar setor, responsável ou observação..."
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(
                  e.target.value as
                    | StatusChecklist
                    | ""
                )
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

          <div className="checklists-filter-result">
            Exibindo <strong>
              {checklistsFiltrados.length}
            </strong> de <strong>
              {checklists.length}
            </strong> inspeção(ões)
          </div>
        </div>

        {carregando ? (
          <div className="checklists-loading">
            <div className="checklists-loader" />
            <strong>
              Carregando inspeções...
            </strong>
            <span>
              Consultando os registros de
              segurança.
            </span>
          </div>
        ) : checklistsFiltrados.length === 0 ? (
          <EstadoVazio
            possuiRegistros={
              checklists.length > 0
            }
            onNovaInspecao={
              abrirNovaInspecao
            }
          />
        ) : mobile ? (
          <div className="checklists-mobile-list">
            {checklistsFiltrados.map(
              (checklist) => (
                <ChecklistMobileCard
                  key={checklist.id}
                  checklist={checklist}
                  onEditar={() =>
                    editarChecklist(checklist)
                  }
                  onExcluir={() =>
                    void excluirChecklist(
                      checklist.id
                    )
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="checklists-table-wrap">
            <table className="checklists-table">
              <thead>
                <tr>
                  <th>Inspeção</th>
                  <th>Responsável</th>
                  <th>Conformidade</th>
                  <th>Não conformidades</th>
                  <th>Resultado</th>
                  <th className="align-center">
                    Ações
                  </th>
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
                      obterStatus(checklist);
                    const naoConformes =
                      obterItensNaoConformes(
                        checklist
                      );

                    return (
                      <tr
                        key={checklist.id}
                        className={`checklists-row checklists-row-${normalizarStatus(
                          status
                        )}`}
                      >
                        <td>
                          <div className="checklists-inspection-cell">
                            <div className="checklists-cell-icon">
                              <Building2 size={16} />
                            </div>

                            <div>
                              <strong>
                                {checklist.setor}
                              </strong>
                              <span>
                                <CalendarDays size={13} />
                                {formatarData(
                                  checklist.data
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="checklists-user-cell">
                            <UserRound size={15} />
                            <span>
                              {checklist.responsavel}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="checklists-progress-cell">
                            <div>
                              <span>
                                {contarItensConformes(
                                  checklist
                                )}
                                /{itensChecklist.length}
                                itens
                              </span>
                              <strong
                                style={{
                                  color:
                                    corStatus(
                                      status
                                    ),
                                }}
                              >
                                {percentual}%
                              </strong>
                            </div>

                            <div className="checklists-progress-track">
                              <div
                                style={{
                                  width: `${percentual}%`,
                                  background:
                                    corStatus(
                                      status
                                    ),
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          {naoConformes.length === 0 ? (
                            <span className="checklists-none">
                              <CircleCheckBig size={14} />
                              Nenhuma
                            </span>
                          ) : (
                            <div className="checklists-nc-cell">
                              <strong>
                                {naoConformes.length}
                                {" "}
                                item(ns)
                              </strong>
                              <span>
                                {naoConformes
                                  .slice(0, 2)
                                  .map(
                                    (item) =>
                                      item.texto
                                  )
                                  .join(" • ")}
                                {naoConformes.length > 2
                                  ? ` +${
                                      naoConformes.length -
                                      2
                                    }`
                                  : ""}
                              </span>
                            </div>
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            status={status}
                          />
                        </td>

                        <td className="align-center">
                          <div className="checklists-actions">
                            <button
                              type="button"
                              title="Editar inspeção"
                              aria-label="Editar inspeção"
                              className="action-button action-edit"
                              onClick={() =>
                                editarChecklist(
                                  checklist
                                )
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Excluir inspeção"
                              aria-label="Excluir inspeção"
                              className="action-button action-delete"
                              onClick={() =>
                                void excluirChecklist(
                                  checklist.id
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawerAberto && (
        <div
          className="checklist-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="checklist-drawer">
            <header className="checklist-drawer-header">
              <div className="checklist-drawer-header-main">
                <div className="checklist-drawer-icon">
                  <ClipboardCheck size={22} />
                </div>

                <div className="checklist-drawer-title">
                  <span>
                    CHECKLIST OPERACIONAL
                  </span>
                  <h2>
                    {editando
                      ? "Editar inspeção"
                      : "Nova inspeção"}
                  </h2>
                  <p>
                    Registre as condições de
                    segurança observadas no setor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharDrawer}
                aria-label="Fechar formulário"
                className="checklist-close-button"
              >
                <X size={19} />
              </button>
            </header>

            <div className="checklist-drawer-summary">
              <div>
                <span>Resultado atual</span>
                <strong>
                  {percentualFormulario}%
                </strong>
              </div>

              <StatusBadge
                status={statusFormulario}
              />
            </div>

            <div className="checklist-drawer-content">
              <Secao
                numero="01"
                titulo="Identificação da inspeção"
                descricao="Informe quando, onde e por quem a inspeção foi realizada."
              >
                <div className="checklist-grid-2">
                  <Campo
                    label="Data"
                    obrigatorio
                    type="date"
                    value={formulario.data}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,
                        data: valor,
                      })
                    }
                  />

                  <Campo
                    label="Setor"
                    obrigatorio
                    placeholder="Ex.: Cozinha quente"
                    value={formulario.setor}
                    onChange={(valor) =>
                      setFormulario({
                        ...formulario,
                        setor: valor,
                      })
                    }
                  />
                </div>

                <Campo
                  label="Responsável pela inspeção"
                  obrigatorio
                  placeholder="Nome do responsável"
                  value={formulario.responsavel}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,
                      responsavel: valor,
                    })
                  }
                />
              </Secao>

              <Secao
                numero="02"
                titulo="Itens de verificação"
                descricao="Marque somente os itens que estiverem em conformidade no momento da inspeção."
              >
                <div className="checklist-rule-note">
                  <TriangleAlert size={16} />
                  <span>
                    Item desmarcado = condição não
                    conforme e deve ser acompanhada
                    nas observações ou em ação
                    corretiva.
                  </span>
                </div>

                <div className="checklist-itens">
                  {itensChecklist.map(
                    (item, indice) => {
                      const marcado =
                        formulario[item.campo];

                      return (
                        <label
                          key={item.campo}
                          className={
                            marcado
                              ? "checklist-item checklist-item-marcado"
                              : "checklist-item"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={(e) =>
                              setFormulario({
                                ...formulario,
                                [item.campo]:
                                  e.target.checked,
                              })
                            }
                          />

                          <div className="checklist-item-number">
                            {String(
                              indice + 1
                            ).padStart(2, "0")}
                          </div>

                          <div className="checklist-item-copy">
                            <strong>
                              {item.texto}
                            </strong>
                            <span>
                              {item.descricao}
                            </span>
                          </div>

                          <div
                            className={
                              marcado
                                ? "checklist-item-state checklist-item-state-ok"
                                : "checklist-item-state"
                            }
                          >
                            {marcado ? (
                              <CheckCircle2
                                size={17}
                              />
                            ) : (
                              <TriangleAlert
                                size={17}
                              />
                            )}
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>
              </Secao>

              <Secao
                numero="03"
                titulo="Resultado automático"
                descricao="O sistema calcula a conformidade com base nos oito pontos de verificação."
              >
                <div className="checklist-result-card">
                  <div className="checklist-result-top">
                    <div>
                      <span>Conformidade</span>
                      <strong>
                        {percentualFormulario}%
                      </strong>
                    </div>

                    <StatusBadge
                      status={statusFormulario}
                    />
                  </div>

                  <div className="checklist-result-progress">
                    <div
                      style={{
                        width: `${percentualFormulario}%`,
                        background:
                          corStatus(
                            statusFormulario
                          ),
                      }}
                    />
                  </div>

                  <div className="checklist-result-details">
                    <div>
                      <span>Conformes</span>
                      <strong>
                        {contarItensConformes(
                          formulario
                        )}
                        /{itensChecklist.length}
                      </strong>
                    </div>

                    <div>
                      <span>Não conformes</span>
                      <strong>
                        {
                          itensNaoConformesFormulario.length
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="checklist-rule-scale">
                    <div>
                      <span className="scale-green" />
                      <strong>100%</strong>
                      <small>Conforme</small>
                    </div>
                    <div>
                      <span className="scale-yellow" />
                      <strong>75–99%</strong>
                      <small>Atenção</small>
                    </div>
                    <div>
                      <span className="scale-red" />
                      <strong>&lt;75%</strong>
                      <small>Crítico</small>
                    </div>
                  </div>

                  {itensNaoConformesFormulario.length >
                    0 && (
                    <div className="checklist-result-alert">
                      <TriangleAlert
                        size={16}
                      />
                      <div>
                        <strong>
                          Pontos não conformes
                        </strong>
                        <span>
                          {itensNaoConformesFormulario
                            .map(
                              (item) =>
                                item.texto
                            )
                            .join(" • ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Secao>

              <Secao
                numero="04"
                titulo="Observações"
                descricao="Registre informações adicionais, causas percebidas e detalhes das não conformidades."
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
                  rows={5}
                  className="checklist-textarea"
                />
              </Secao>
            </div>

            <footer className="checklist-drawer-footer">
              <Button
                onClick={fecharDrawer}
                color="#64748B"
              >
                Cancelar
              </Button>

              <Button
                onClick={() =>
                  void salvarChecklist()
                }
              >
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Registrar inspeção"}
              </Button>
            </footer>
          </aside>
        </div>
      )}

      <style>{estilos}</style>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="checklists-metric-card">
      <div
        className="checklists-metric-accent"
        style={{ background: accent }}
      />

      <div className="checklists-metric-top">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>

        <div
          className="checklists-metric-icon"
          style={{
            color: accent,
            background: `${accent}12`,
          }}
        >
          {icon}
        </div>
      </div>

      <small>{detail}</small>
    </div>
  );
}

function PriorityRow({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  accent: string;
}) {
  return (
    <div className="checklists-priority-row">
      <span
        className="checklists-priority-marker"
        style={{ background: accent }}
      />

      <div className="checklists-priority-copy">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <strong
        className="checklists-priority-value"
        style={{ color: accent }}
      >
        {value}
      </strong>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusChecklist;
}) {
  return (
    <Badge
      color={
        status === "Conforme"
          ? "green"
          : status === "Atenção"
            ? "yellow"
            : "red"
      }
    >
      {status}
    </Badge>
  );
}

function ChecklistMobileCard({
  checklist,
  onEditar,
  onExcluir,
}: {
  checklist: Checklist;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const percentual =
    calcularPercentual(checklist);
  const status = obterStatus(checklist);
  const naoConformes =
    obterItensNaoConformes(checklist);

  return (
    <article
      className={`checklists-mobile-card checklists-mobile-card-${normalizarStatus(
        status
      )}`}
    >
      <div className="checklists-mobile-card-head">
        <div>
          <span className="checklists-mobile-date">
            <CalendarDays size={13} />
            {formatarData(checklist.data)}
          </span>
          <h3>{checklist.setor}</h3>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="checklists-mobile-meta">
        <div>
          <UserRound size={14} />
          <span>
            {checklist.responsavel}
          </span>
        </div>
        <div>
          <ListChecks size={14} />
          <span>
            {contarItensConformes(
              checklist
            )}
            /{itensChecklist.length} itens
          </span>
        </div>
      </div>

      <div className="checklists-mobile-progress-head">
        <span>Conformidade</span>
        <strong
          style={{ color: corStatus(status) }}
        >
          {percentual}%
        </strong>
      </div>

      <div className="checklists-progress-track">
        <div
          style={{
            width: `${percentual}%`,
            background: corStatus(status),
          }}
        />
      </div>

      <div className="checklists-mobile-nc">
        <span>Não conformidades</span>
        {naoConformes.length === 0 ? (
          <strong className="mobile-nc-ok">
            <CircleCheckBig size={14} />
            Nenhuma
          </strong>
        ) : (
          <div>
            {naoConformes.map((item) => (
              <span key={item.campo}>
                {item.texto}
              </span>
            ))}
          </div>
        )}
      </div>

      {checklist.observacoes && (
        <div className="checklists-mobile-observation">
          <span>Observações</span>
          <p>{checklist.observacoes}</p>
        </div>
      )}

      <div className="checklists-mobile-actions">
        <button
          type="button"
          onClick={onEditar}
          className="mobile-action-edit"
        >
          <Pencil size={15} />
          Editar
        </button>

        <button
          type="button"
          onClick={onExcluir}
          className="mobile-action-delete"
        >
          <Trash2 size={15} />
          Excluir
        </button>
      </div>
    </article>
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
    <section className="checklist-form-secao">
      <div className="checklist-form-secao-header">
        <span>{numero}</span>
        <div>
          <h3>{titulo}</h3>
          <p>{descricao}</p>
        </div>
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
  obrigatorio = false,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  type?: string;
  obrigatorio?: boolean;
}) {
  return (
    <div className="checklist-grupo-campo">
      <label>
        {label}
        {obrigatorio && (
          <span> *</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

function EstadoVazio({
  possuiRegistros,
  onNovaInspecao,
}: {
  possuiRegistros: boolean;
  onNovaInspecao: () => void;
}) {
  return (
    <div className="checklists-empty">
      <div className="checklists-empty-icon">
        <ClipboardCheck size={27} />
      </div>

      <strong>
        {possuiRegistros
          ? "Nenhuma inspeção corresponde aos filtros"
          : "Nenhuma inspeção registrada"}
      </strong>

      <p>
        {possuiRegistros
          ? "Ajuste a pesquisa ou o filtro de resultado para visualizar outros registros."
          : "Registre a primeira inspeção para iniciar o acompanhamento das condições de segurança."}
      </p>

      {!possuiRegistros && (
        <Button onClick={onNovaInspecao}>
          <span className="checklists-button-content">
            <Plus size={17} />
            Nova Inspeção
          </span>
        </Button>
      )}
    </div>
  );
}

function contarItensConformes(
  checklist: Checklist
) {
  return itensChecklist.reduce(
    (total, item) =>
      checklist[item.campo]
        ? total + 1
        : total,
    0
  );
}

function obterItensNaoConformes(
  checklist: Checklist
) {
  return itensChecklist.filter(
    (item) => !checklist[item.campo]
  );
}

function calcularPercentual(
  checklist: Checklist
) {
  const conformes =
    contarItensConformes(checklist);

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
    calcularPercentual(checklist);

  if (percentual === 100) {
    return "Conforme";
  }

  if (percentual >= 75) {
    return "Atenção";
  }

  return "Crítico";
}

function corStatus(
  status: StatusChecklist
) {
  if (status === "Conforme") {
    return "#16A34A";
  }

  if (status === "Atenção") {
    return "#F59E0B";
  }

  return "#DC2626";
}

function normalizarStatus(
  status: StatusChecklist
) {
  if (status === "Conforme") {
    return "conforme";
  }

  if (status === "Atenção") {
    return "atencao";
  }

  return "critico";
}

function formatarData(data: string) {
  if (!data) {
    return "Sem data";
  }

  const [ano, mes, dia] =
    data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function dataHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(
    agora.getMonth() + 1
  ).padStart(2, "0");
  const dia = String(
    agora.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

const estilos = `
  .checklists-page {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .checklists-button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .checklists-error {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
    padding: 13px 15px;
    box-sizing: border-box;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background: #fef2f2;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
  }

  .checklists-error-main {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }

  .checklists-error-main svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .checklists-error > button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    background: transparent;
    color: #b91c1c;
    cursor: pointer;
  }

  .checklists-hero {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(330px, .65fr);
    gap: 22px;
    margin-bottom: 20px;
    padding: 26px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    border: 1px solid #1e293b;
    border-radius: 18px;
    background:
      radial-gradient(circle at 90% -10%, rgba(37, 99, 235, .25), transparent 36%),
      linear-gradient(135deg, #0f172a 0%, #111c33 58%, #0f172a 100%);
    box-shadow: 0 16px 38px rgba(15, 23, 42, .12);
  }

  .checklists-hero-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .checklists-eyebrow {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 9px;
    border: 1px solid rgba(147, 197, 253, .22);
    border-radius: 8px;
    background: rgba(37, 99, 235, .12);
    color: #bfdbfe;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .65px;
  }

  .checklists-hero h2 {
    max-width: 720px;
    margin: 15px 0 0;
    color: #ffffff;
    font-size: clamp(22px, 2.2vw, 31px);
    line-height: 1.13;
    font-weight: 830;
    letter-spacing: -.45px;
  }

  .checklists-hero p {
    max-width: 680px;
    margin: 11px 0 0;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.65;
  }

  .checklists-hero-flow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 700;
  }

  .checklists-hero-flow > span:not(.checklists-flow-arrow) {
    padding: 7px 9px;
    border: 1px solid rgba(148, 163, 184, .18);
    border-radius: 8px;
    background: rgba(255, 255, 255, .04);
  }

  .checklists-flow-arrow {
    color: #60a5fa;
  }

  .checklists-hero-side {
    min-width: 0;
    padding: 17px;
    box-sizing: border-box;
    border: 1px solid rgba(148, 163, 184, .17);
    border-radius: 14px;
    background: rgba(255, 255, 255, .045);
    backdrop-filter: blur(4px);
  }

  .checklists-hero-side-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 13px;
    border-bottom: 1px solid rgba(148, 163, 184, .14);
  }

  .checklists-hero-side-top span {
    display: block;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .6px;
  }

  .checklists-hero-side-top strong {
    display: block;
    margin-top: 3px;
    color: #ffffff;
    font-size: 25px;
    font-weight: 850;
  }

  .checklists-hero-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 11px;
    background: rgba(37, 99, 235, .16);
    color: #93c5fd;
  }

  .checklists-mini-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    margin-top: 13px;
  }

  .checklists-mini-item {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    color: #cbd5e1;
    font-size: 9px;
    line-height: 1.35;
  }

  .checklists-mini-item svg {
    flex-shrink: 0;
    color: #60a5fa;
  }

  .checklists-metrics {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .checklists-metric-card {
    min-width: 0;
    position: relative;
    overflow: hidden;
    padding: 17px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 5px 18px rgba(15, 23, 42, .035);
  }

  .checklists-metric-accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }

  .checklists-metric-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .checklists-metric-top span {
    display: block;
    color: #64748b;
    font-size: 10px;
    font-weight: 750;
    line-height: 1.35;
  }

  .checklists-metric-top strong {
    display: block;
    margin-top: 5px;
    color: #0f172a;
    font-size: 25px;
    font-weight: 850;
    line-height: 1;
  }

  .checklists-metric-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
  }

  .checklists-metric-card > small {
    display: block;
    margin-top: 12px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.4;
  }

  .checklists-insights {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(340px, .8fr);
    gap: 18px;
    margin-bottom: 20px;
  }

  .checklists-panel {
    min-width: 0;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 5px 18px rgba(15, 23, 42, .035);
  }

  .checklists-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .checklists-panel-kicker {
    display: block;
    color: #94a3b8;
    font-size: 8px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .75px;
  }

  .checklists-panel-header h3,
  .checklists-history-header h2 {
    margin: 4px 0 0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 820;
    line-height: 1.3;
  }

  .checklists-panel-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #f8fafc;
  }

  .checklists-panel-icon-danger {
    color: #dc2626;
    background: #fef2f2;
  }

  .checklists-performance-row {
    display: flex;
    align-items: center;
    gap: 17px;
    margin-top: 20px;
  }

  .checklists-performance-row > strong {
    color: #0f172a;
    font-size: 38px;
    font-weight: 860;
    line-height: 1;
    letter-spacing: -1px;
  }

  .checklists-performance-copy span,
  .checklists-performance-copy small {
    display: block;
  }

  .checklists-performance-copy span {
    color: #334155;
    font-size: 11px;
    font-weight: 750;
  }

  .checklists-performance-copy small {
    margin-top: 4px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.45;
  }

  .checklists-performance-bar {
    width: 100%;
    height: 9px;
    margin-top: 17px;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .checklists-performance-bar > div {
    height: 100%;
    border-radius: inherit;
    transition: width .2s ease;
  }

  .checklists-performance-legend {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
  }

  .checklists-performance-legend > div {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 6px;
    padding: 9px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }

  .checklists-performance-legend strong {
    color: #0f172a;
    font-size: 12px;
  }

  .checklists-performance-legend small {
    color: #64748b;
    font-size: 9px;
  }

  .dot,
  .status-dot {
    width: 7px;
    height: 7px;
    display: inline-block;
    flex-shrink: 0;
    border-radius: 999px;
  }

  .dot-green,
  .status-green { background: #16a34a; }
  .dot-yellow,
  .status-yellow { background: #f59e0b; }
  .dot-red,
  .status-red { background: #dc2626; }

  .checklists-priority-list {
    display: flex;
    flex-direction: column;
    margin-top: 16px;
    border-top: 1px solid #e2e8f0;
  }

  .checklists-priority-row {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .checklists-priority-marker {
    width: 4px;
    height: 31px;
    flex-shrink: 0;
    border-radius: 999px;
  }

  .checklists-priority-copy {
    min-width: 0;
    flex: 1;
  }

  .checklists-priority-copy strong,
  .checklists-priority-copy span {
    display: block;
  }

  .checklists-priority-copy strong {
    color: #334155;
    font-size: 10px;
    font-weight: 750;
  }

  .checklists-priority-copy span {
    margin-top: 2px;
    color: #94a3b8;
    font-size: 9px;
  }

  .checklists-priority-value {
    flex-shrink: 0;
    font-size: 20px;
    font-weight: 850;
  }

  .checklists-history {
    width: 100%;
    min-width: 0;
    padding: 22px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 5px 18px rgba(15, 23, 42, .035);
  }

  .checklists-history-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }

  .checklists-history-header p {
    max-width: 620px;
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.5;
  }

  .checklists-history-status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .checklists-history-status > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    font-size: 8px;
    font-weight: 700;
    white-space: nowrap;
  }

  .checklists-filters {
    width: 100%;
    min-width: 0;
    margin-bottom: 18px;
    padding: 15px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
  }

  .checklists-filters-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 11px;
  }

  .checklists-filters-title {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #475569;
    font-size: 10px;
    font-weight: 800;
  }

  .checklists-clear-filters {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: none;
    background: transparent;
    color: #2563eb;
    font-family: inherit;
    font-size: 9px;
    font-weight: 750;
    cursor: pointer;
  }

  .checklists-filter-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(190px, 230px);
    gap: 10px;
  }

  .checklists-search {
    min-width: 0;
    height: 42px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    background: #ffffff;
    color: #94a3b8;
  }

  .checklists-search svg {
    flex-shrink: 0;
  }

  .checklists-search input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #0f172a;
    font-family: inherit;
    font-size: 10px;
  }

  .checklists-filter-grid select {
    width: 100%;
    min-width: 0;
    height: 42px;
    padding: 0 11px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    background: #ffffff;
    color: #475569;
    font-family: inherit;
    font-size: 10px;
    font-weight: 650;
    outline: none;
    cursor: pointer;
  }

  .checklists-filter-result {
    margin-top: 9px;
    color: #64748b;
    font-size: 9px;
  }

  .checklists-filter-result strong {
    color: #0f172a;
  }

  .checklists-loading {
    min-height: 210px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px;
    box-sizing: border-box;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    text-align: center;
  }

  .checklists-loader {
    width: 27px;
    height: 27px;
    margin-bottom: 10px;
    border: 3px solid #dbeafe;
    border-top-color: #2563eb;
    border-radius: 999px;
    animation: checklists-spin .75s linear infinite;
  }

  .checklists-loading strong {
    color: #334155;
    font-size: 11px;
  }

  .checklists-loading span {
    margin-top: 4px;
    color: #94a3b8;
    font-size: 9px;
  }

  @keyframes checklists-spin {
    to { transform: rotate(360deg); }
  }

  .checklists-table-wrap {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    -webkit-overflow-scrolling: touch;
  }

  .checklists-table {
    width: 100%;
    min-width: 960px;
    border-collapse: collapse;
  }

  .checklists-table th {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #64748b;
    font-size: 8px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .55px;
    white-space: nowrap;
  }

  .checklists-table td {
    padding: 14px;
    vertical-align: middle;
    color: #475569;
    font-size: 10px;
  }

  .checklists-row {
    position: relative;
    border-top: 1px solid #f1f5f9;
    transition: background .15s ease;
  }

  .checklists-row:hover {
    background: #f8fafc;
  }

  .checklists-row td:first-child {
    border-left: 3px solid transparent;
  }

  .checklists-row-conforme td:first-child {
    border-left-color: #16a34a;
  }

  .checklists-row-atencao td:first-child {
    border-left-color: #f59e0b;
  }

  .checklists-row-critico td:first-child {
    border-left-color: #dc2626;
  }

  .align-center {
    text-align: center !important;
  }

  .checklists-inspection-cell {
    min-width: 170px;
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }

  .checklists-cell-icon {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 9px;
    background: #eff6ff;
    color: #2563eb;
  }

  .checklists-inspection-cell strong {
    display: block;
    max-width: 160px;
    color: #0f172a;
    font-size: 11px;
    font-weight: 780;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .checklists-inspection-cell span {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    color: #94a3b8;
    font-size: 8px;
    white-space: nowrap;
  }

  .checklists-user-cell {
    width: 145px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  .checklists-user-cell svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #94a3b8;
  }

  .checklists-user-cell span {
    overflow-wrap: anywhere;
  }

  .checklists-progress-cell {
    width: 140px;
  }

  .checklists-progress-cell > div:first-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .checklists-progress-cell span {
    color: #64748b;
    font-size: 8px;
  }

  .checklists-progress-cell strong {
    font-size: 10px;
    font-weight: 800;
  }

  .checklists-progress-track {
    width: 100%;
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .checklists-progress-track > div {
    height: 100%;
    border-radius: inherit;
    transition: width .2s ease;
  }

  .checklists-none {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #15803d;
    font-size: 9px;
    font-weight: 750;
  }

  .checklists-nc-cell {
    width: 210px;
    max-width: 210px;
  }

  .checklists-nc-cell strong,
  .checklists-nc-cell span {
    display: block;
  }

  .checklists-nc-cell strong {
    color: #b45309;
    font-size: 9px;
    font-weight: 800;
  }

  .checklists-nc-cell span {
    margin-top: 3px;
    color: #94a3b8;
    font-size: 8px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .checklists-actions {
    min-width: 76px;
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .action-button {
    width: 33px;
    height: 33px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform .15s ease, filter .15s ease;
  }

  .action-button:hover {
    transform: translateY(-1px);
    filter: brightness(.97);
  }

  .action-edit {
    background: #eff6ff;
    color: #2563eb;
  }

  .action-delete {
    background: #fef2f2;
    color: #dc2626;
  }

  .checklists-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .checklists-mobile-card {
    position: relative;
    overflow: hidden;
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .checklists-mobile-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }

  .checklists-mobile-card-conforme::before { background: #16a34a; }
  .checklists-mobile-card-atencao::before { background: #f59e0b; }
  .checklists-mobile-card-critico::before { background: #dc2626; }

  .checklists-mobile-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .checklists-mobile-date {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #94a3b8;
    font-size: 8px;
    font-weight: 700;
  }

  .checklists-mobile-card h3 {
    margin: 5px 0 0;
    color: #0f172a;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
  }

  .checklists-mobile-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 13px;
  }

  .checklists-mobile-meta > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 9px;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    font-size: 9px;
  }

  .checklists-mobile-meta svg {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .checklists-mobile-progress-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 14px 0 6px;
    color: #64748b;
    font-size: 9px;
  }

  .checklists-mobile-progress-head strong {
    font-size: 11px;
  }

  .checklists-mobile-nc,
  .checklists-mobile-observation {
    margin-top: 13px;
    padding-top: 11px;
    border-top: 1px solid #f1f5f9;
  }

  .checklists-mobile-nc > span,
  .checklists-mobile-observation > span {
    color: #94a3b8;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .45px;
  }

  .checklists-mobile-nc > div {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 7px;
  }

  .checklists-mobile-nc > div > span {
    padding: 5px 7px;
    border-radius: 7px;
    background: #fff7ed;
    color: #9a3412;
    font-size: 8px;
    font-weight: 650;
  }

  .mobile-nc-ok {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    color: #15803d;
    font-size: 9px;
  }

  .checklists-mobile-observation p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 9px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .checklists-mobile-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 14px;
  }

  .checklists-mobile-actions button {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 9px;
    font-weight: 750;
    cursor: pointer;
  }

  .mobile-action-edit {
    background: #eff6ff;
    color: #2563eb;
  }

  .mobile-action-delete {
    background: #fef2f2;
    color: #dc2626;
  }

  .checklists-empty {
    min-height: 230px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px;
    box-sizing: border-box;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    text-align: center;
  }

  .checklists-empty-icon {
    width: 54px;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    border-radius: 14px;
    background: #eff6ff;
    color: #2563eb;
  }

  .checklists-empty > strong {
    color: #0f172a;
    font-size: 12px;
    font-weight: 800;
  }

  .checklists-empty > p {
    max-width: 390px;
    margin: 6px 0 15px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.55;
  }

  .checklist-drawer-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, .52);
    backdrop-filter: blur(3px);
    z-index: 2000;
  }

  .checklist-drawer {
    width: 660px;
    max-width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: -18px 0 48px rgba(15, 23, 42, .18);
  }

  .checklist-drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 21px 24px;
    flex-shrink: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #ffffff;
  }

  .checklist-drawer-header-main {
    min-width: 0;
    display: flex;
    gap: 11px;
  }

  .checklist-drawer-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 11px;
    background: #eff6ff;
    color: #2563eb;
  }

  .checklist-drawer-title {
    min-width: 0;
  }

  .checklist-drawer-title > span {
    display: block;
    margin-bottom: 3px;
    color: #2563eb;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .7px;
  }

  .checklist-drawer-title h2 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    font-weight: 830;
    line-height: 1.25;
  }

  .checklist-drawer-title p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 9px;
    line-height: 1.45;
  }

  .checklist-close-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    background: #ffffff;
    color: #64748b;
    cursor: pointer;
  }

  .checklist-drawer-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 11px 24px;
    flex-shrink: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .checklist-drawer-summary > div:first-child {
    display: flex;
    align-items: baseline;
    gap: 7px;
  }

  .checklist-drawer-summary span {
    color: #64748b;
    font-size: 8px;
    font-weight: 700;
  }

  .checklist-drawer-summary strong {
    color: #0f172a;
    font-size: 15px;
    font-weight: 850;
  }

  .checklist-drawer-content {
    flex: 1;
    min-height: 0;
    padding: 22px 24px 28px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .checklist-form-secao {
    width: 100%;
    min-width: 0;
    margin-bottom: 20px;
    padding: 17px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .checklist-form-secao:last-child {
    margin-bottom: 0;
  }

  .checklist-form-secao-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
  }

  .checklist-form-secao-header > span {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 8px;
    font-weight: 850;
  }

  .checklist-form-secao-header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 12px;
    font-weight: 800;
  }

  .checklist-form-secao-header p {
    margin: 3px 0 0;
    color: #94a3b8;
    font-size: 8px;
    line-height: 1.45;
  }

  .checklist-grid-2 {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px;
  }

  .checklist-grupo-campo {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .checklist-grupo-campo label {
    color: #334155;
    font-size: 10px;
    font-weight: 720;
  }

  .checklist-grupo-campo label span {
    color: #dc2626;
  }

  .checklist-grupo-campo input,
  .checklist-textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    background: #ffffff;
    color: #0f172a;
    font-family: inherit;
    font-size: 10px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
  }

  .checklist-grupo-campo input {
    height: 42px;
    padding: 0 11px;
  }

  .checklist-textarea {
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.5;
  }

  .checklist-grupo-campo input:focus,
  .checklist-textarea:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);
  }

  .checklist-rule-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    padding: 9px 10px;
    border: 1px solid #fde68a;
    border-radius: 9px;
    background: #fffbeb;
    color: #92400e;
    font-size: 8px;
    line-height: 1.45;
  }

  .checklist-rule-note svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .checklist-itens {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .checklist-item {
    min-width: 0;
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: flex-start;
    gap: 8px;
    padding: 11px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease, transform .15s ease;
  }

  .checklist-item:hover {
    transform: translateY(-1px);
    border-color: #cbd5e1;
  }

  .checklist-item-marcado {
    border-color: #86efac;
    background: #f0fdf4;
  }

  .checklist-item input {
    width: 16px;
    height: 16px;
    margin: 1px 0 0;
    flex-shrink: 0;
    cursor: pointer;
  }

  .checklist-item-number {
    width: 23px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 7px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 7px;
    font-weight: 850;
  }

  .checklist-item-copy {
    min-width: 0;
  }

  .checklist-item-copy strong,
  .checklist-item-copy span {
    display: block;
  }

  .checklist-item-copy strong {
    color: #0f172a;
    font-size: 9px;
    font-weight: 750;
    line-height: 1.35;
  }

  .checklist-item-copy span {
    margin-top: 2px;
    color: #94a3b8;
    font-size: 7px;
    line-height: 1.4;
  }

  .checklist-item-state {
    flex-shrink: 0;
    color: #f59e0b;
  }

  .checklist-item-state-ok {
    color: #16a34a;
  }

  .checklist-result-card {
    width: 100%;
    min-width: 0;
    padding: 15px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 11px;
    background: #f8fafc;
  }

  .checklist-result-top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 15px;
  }

  .checklist-result-top span,
  .checklist-result-top strong {
    display: block;
  }

  .checklist-result-top span {
    color: #64748b;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .45px;
  }

  .checklist-result-top strong {
    margin-top: 3px;
    color: #0f172a;
    font-size: 28px;
    font-weight: 860;
    line-height: 1;
  }

  .checklist-result-progress {
    width: 100%;
    height: 8px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .checklist-result-progress > div {
    height: 100%;
    border-radius: inherit;
    transition: width .2s ease;
  }

  .checklist-result-details {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .checklist-result-details > div {
    padding: 9px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    background: #ffffff;
  }

  .checklist-result-details span,
  .checklist-result-details strong {
    display: block;
  }

  .checklist-result-details span {
    color: #94a3b8;
    font-size: 7px;
    font-weight: 750;
  }

  .checklist-result-details strong {
    margin-top: 2px;
    color: #0f172a;
    font-size: 13px;
    font-weight: 820;
  }

  .checklist-rule-scale {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    margin-top: 12px;
  }

  .checklist-rule-scale > div {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 5px;
    padding: 7px 8px;
    border-radius: 8px;
    background: #ffffff;
  }

  .checklist-rule-scale > div > span {
    width: 6px;
    height: 6px;
    border-radius: 999px;
  }

  .scale-green { background: #16a34a; }
  .scale-yellow { background: #f59e0b; }
  .scale-red { background: #dc2626; }

  .checklist-rule-scale strong {
    color: #334155;
    font-size: 8px;
  }

  .checklist-rule-scale small {
    color: #94a3b8;
    font-size: 7px;
  }

  .checklist-result-alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    padding: 10px;
    border: 1px solid #fed7aa;
    border-radius: 9px;
    background: #fff7ed;
    color: #9a3412;
  }

  .checklist-result-alert svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .checklist-result-alert strong,
  .checklist-result-alert span {
    display: block;
  }

  .checklist-result-alert strong {
    font-size: 8px;
    font-weight: 800;
  }

  .checklist-result-alert span {
    margin-top: 2px;
    font-size: 7px;
    line-height: 1.45;
  }

  .checklist-drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
    padding: 15px 24px;
    padding-bottom: max(15px, env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
  }

  @media (max-width: 1180px) {
    .checklists-metrics {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .checklists-hero {
      grid-template-columns: minmax(0, 1fr) minmax(300px, .72fr);
    }
  }

  @media (max-width: 1020px) {
    .checklists-hero,
    .checklists-insights {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .checklists-history-header {
      flex-direction: column;
    }

    .checklists-history-status {
      justify-content: flex-start;
    }
  }

  @media (max-width: 680px) {
    .checklists-hero {
      gap: 16px;
      padding: 19px 16px;
      border-radius: 14px;
    }

    .checklists-hero h2 {
      font-size: 22px;
    }

    .checklists-mini-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }

    .checklists-metric-card {
      padding: 14px;
      border-radius: 12px;
    }

    .checklists-metric-top strong {
      font-size: 22px;
    }

    .checklists-insights {
      gap: 12px;
    }

    .checklists-panel,
    .checklists-history {
      padding: 16px;
      border-radius: 14px;
    }

    .checklists-performance-legend,
    .checklists-rule-scale {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-filter-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-filters-top {
      align-items: flex-start;
    }

    .checklists-history-status {
      gap: 5px;
    }

    .checklists-history-status > span {
      font-size: 7px;
    }

    .checklist-drawer {
      width: 100%;
      max-width: none;
    }

    .checklist-drawer-header {
      padding: 17px 15px;
      gap: 11px;
    }

    .checklist-drawer-summary {
      padding: 10px 15px;
    }

    .checklist-drawer-content {
      padding: 17px 15px 23px;
    }

    .checklist-grid-2,
    .checklist-itens {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklist-drawer-footer {
      padding: 13px 15px;
      padding-bottom: max(13px, env(safe-area-inset-bottom));
    }

    .checklist-drawer-footer > * {
      flex: 1 1 0;
    }
  }

  @media (max-width: 430px) {
    .checklists-metrics {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-hero-flow {
      gap: 6px;
    }

    .checklists-flow-arrow {
      display: none;
    }

    .checklists-performance-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 9px;
    }

    .checklists-performance-legend {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklists-mobile-meta,
    .checklists-mobile-actions,
    .checklist-result-details {
      grid-template-columns: minmax(0, 1fr);
    }

    .checklist-form-secao {
      padding: 14px;
    }

    .checklist-drawer-footer {
      flex-direction: column;
      align-items: stretch;
      padding: 11px 14px;
      padding-bottom: max(11px, env(safe-area-inset-bottom));
    }

    .checklist-drawer-footer > * {
      width: 100%;
    }
  }
`;
