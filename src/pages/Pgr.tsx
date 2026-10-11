import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import PgrTable from "../components/pgr/PgrTable";
import PgrDrawer from "../components/pgr/PgrDrawer";

import type { PgrItem } from "../models/Pgr";

import { supabase } from "../lib/supabase";
import { colors } from "../styles/theme";

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
    setor: linha.setor,
    atividade: linha.atividade,
    perigo: linha.perigo,
    categoria: linha.categoria,
    probabilidade:
      linha.probabilidade,
    severidade:
      linha.severidade,
    nivel: linha.nivel,
    classificacao:
      linha.classificacao,
    medidaControle:
      linha.medida_controle,
    responsavel:
      linha.responsavel,
    prazo:
      linha.prazo ?? "",
    status: linha.status,
  };
}

function criarPayloadPgr(
  risco: PgrItem
) {
  return {
    setor: risco.setor,
    atividade:
      risco.atividade,
    perigo: risco.perigo,
    categoria:
      risco.categoria,
    probabilidade:
      risco.probabilidade,
    severidade:
      risco.severidade,
    nivel: risco.nivel,
    classificacao:
      risco.classificacao,
    medida_controle:
      risco.medidaControle,
    responsavel:
      risco.responsavel,
    prazo:
      risco.prazo || null,
    status: risco.status,
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

export default function Pgr() {
  const largura =
    useViewportWidth();

  const mobile =
    largura <= 650;

  const tablet =
    largura <= 900;

  const [riscos, setRiscos] =
    useState<PgrItem[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erroBanco,
    setErroBanco,
  ] = useState("");

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    filtroCategoria,
    setFiltroCategoria,
  ] = useState<FiltroCategoria>(
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
  ] = useState<FiltroStatus>(
    ""
  );

  const [
    drawerAberto,
    setDrawerAberto,
  ] = useState(false);

  const [
    editando,
    setEditando,
  ] = useState<PgrItem | null>(
    null
  );

  useEffect(() => {
    let componenteAtivo = true;

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
          .order("id", {
            ascending: true,
          });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao carregar PGR:",
          error
        );

        setRiscos([]);
        setErroBanco(
          "Não foi possível carregar o inventário de riscos."
        );
        setCarregando(false);

        return;
      }

      const linhas =
        (data ?? []) as PgrRow[];

      setRiscos(
        linhas.map(
          converterLinhaPgr
        )
      );

      setCarregando(false);
    }

    void carregarPgr();

    return () => {
      componenteAtivo = false;
    };
  }, []);

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

  const totalPendentes =
    riscos.filter(
      (risco) =>
        risco.status ===
        "Pendente"
    ).length;

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroCategoria !== "" ||
    filtroClassificacao !== "" ||
    filtroStatus !== "";

  function abrirNovoRisco() {
    setEditando(null);
    setErroBanco("");
    setDrawerAberto(true);
  }

  function editarRisco(
    item: PgrItem
  ) {
    setEditando(item);
    setErroBanco("");
    setDrawerAberto(true);
  }

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
        .eq("id", id);

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
      (listaAtual) =>
        listaAtual.filter(
          (risco) =>
            risco.id !== id
        )
    );
  }

  async function salvarRisco(
    risco: PgrItem
  ) {
    setErroBanco("");

    const payload =
      criarPayloadPgr(risco);

    if (editando) {
      const {
        data,
        error,
      } =
        await supabase
          .from("pgr")
          .update(payload)
          .eq("id", risco.id)
          .select(
            CAMPOS_PGR
          )
          .single();

      if (error || !data) {
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
        (listaAtual) =>
          listaAtual.map(
            (item) =>
              item.id ===
              riscoAtualizado.id
                ? riscoAtualizado
                : item
          )
      );

      setDrawerAberto(false);
      setEditando(null);

      return;
    }

    const {
      data,
      error,
    } =
      await supabase
        .from("pgr")
        .insert(payload)
        .select(
          CAMPOS_PGR
        )
        .single();

    if (error || !data) {
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
      (listaAtual) => [
        ...listaAtual,
        novoRisco,
      ]
    );

    setDrawerAberto(false);
    setEditando(null);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
    setEditando(null);
  }

  function limparFiltros() {
    setPesquisa("");
    setFiltroCategoria("");
    setFiltroClassificacao("");
    setFiltroStatus("");
  }

  return (
    <main
      className="pgr-page"
      style={{
        padding: mobile
          ? "18px 14px 28px"
          : tablet
            ? "24px 20px 32px"
            : "32px",
      }}
    >
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
          <span className="pgr-button-content">
            <Plus size={18} />
            Novo Risco
          </span>
        </Button>
      </PageHeader>

      {erroBanco && (
        <div
          className="pgr-alert-error"
          role="alert"
        >
          <div className="pgr-alert-error-content">
            <TriangleAlert
              size={18}
            />

            <div>
              <strong>
                Falha ao processar o inventário
              </strong>

              <span>
                {erroBanco}
              </span>
            </div>
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

      <section className="pgr-context-banner">
        <div className="pgr-context-icon">
          <Target size={24} />
        </div>

        <div className="pgr-context-copy">
          <span>
            INVENTÁRIO CENTRAL DE RISCOS
          </span>

          <h2>
            Avaliação estruturada com matriz de risco 5 × 5
          </h2>

          <p>
            Os registros deste módulo alimentam a Gestão de Riscos,
            indicadores do Dashboard, vínculos de ocorrências e o relatório
            consolidado do SafeKitchen.
          </p>
        </div>

        <div className="pgr-context-tags">
          <span>
            Probabilidade 1–5
          </span>
          <ChevronRight size={14} />
          <span>
            Severidade 1–5
          </span>
          <ChevronRight size={14} />
          <strong>
            Nível 1–25
          </strong>
        </div>
      </section>

      <section className="pgr-metrics-grid">
        <MetricCard
          label="Inventário"
          value={riscos.length}
          detail="riscos cadastrados"
          icon={ShieldCheck}
          tone="blue"
        />

        <MetricCard
          label="Riscos críticos"
          value={totalCriticos}
          detail="prioridade máxima"
          icon={AlertTriangle}
          tone="red"
        />

        <MetricCard
          label="Em andamento"
          value={totalAndamento}
          detail="controles em execução"
          icon={ClipboardList}
          tone="amber"
        />

        <MetricCard
          label="Concluídos"
          value={totalConcluidos}
          detail={`${totalPendentes} pendente(s)`}
          icon={CheckCircle2}
          tone="green"
        />
      </section>

      <section className="pgr-classification-strip">
        <div className="pgr-classification-title">
          <CircleDot size={16} />

          <div>
            <strong>
              Faixas de classificação
            </strong>

            <span>
              Resultado de Probabilidade × Severidade
            </span>
          </div>
        </div>

        <div className="pgr-classification-items">
          <ClassificationItem
            label="Baixo"
            range="1–4"
            tone="green"
          />
          <ClassificationItem
            label="Médio"
            range="5–9"
            tone="yellow"
          />
          <ClassificationItem
            label="Alto"
            range="10–16"
            tone="orange"
          />
          <ClassificationItem
            label="Crítico"
            range="17–25"
            tone="red"
          />
        </div>
      </section>

      <section className="pgr-inventory-card">
        <div className="pgr-section-header">
          <div>
            <span className="pgr-section-eyebrow">
              GESTÃO PREVENTIVA
            </span>

            <h2>
              Inventário de Riscos
            </h2>

            <p>
              Pesquise, filtre e acompanhe os registros do PGR.
            </p>
          </div>

          <div className="pgr-section-count">
            <strong>
              {riscosFiltrados.length}
            </strong>

            <span>
              de {riscos.length} registro(s)
            </span>
          </div>
        </div>

        <div className="pgr-filter-panel">
          <div className="pgr-filter-heading">
            <div>
              <SlidersHorizontal
                size={17}
              />

              <span>
                Filtros do inventário
              </span>
            </div>

            {filtrosAtivos && (
              <button
                type="button"
                className="pgr-clear-filters"
                onClick={
                  limparFiltros
                }
              >
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="pgr-filter-grid">
            <label className="pgr-search-field">
              <Search size={17} />

              <input
                type="text"
                placeholder="Pesquisar risco, setor, atividade ou responsável..."
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(
                    event.target.value
                  )
                }
              />
            </label>

            <select
              value={
                filtroCategoria
              }
              onChange={(event) =>
                setFiltroCategoria(
                  event.target
                    .value as FiltroCategoria
                )
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

            <select
              value={
                filtroClassificacao
              }
              onChange={(event) =>
                setFiltroClassificacao(
                  event.target
                    .value as FiltroClassificacao
                )
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

            <select
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(
                  event.target
                    .value as FiltroStatus
                )
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

          <div className="pgr-filter-footer">
            <div className="pgr-filter-summary">
              <Filter size={14} />

              <span>
                {filtrosAtivos
                  ? "Filtros aplicados"
                  : "Exibindo todo o inventário"}
              </span>
            </div>

            <span>
              {riscosFiltrados.length} resultado(s)
            </span>
          </div>
        </div>

        <div className="pgr-table-area">
          {carregando ? (
            <div className="pgr-loading-state">
              <div className="pgr-loading-icon">
                <ShieldCheck
                  size={22}
                />
              </div>

              <strong>
                Carregando inventário
              </strong>

              <span>
                Consultando os registros do PGR no Supabase...
              </span>
            </div>
          ) : (
            <div className="pgr-table-scroll">
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
        </div>
      </section>

      <PgrDrawer
        open={drawerAberto}
        editingItem={editando}
        onClose={fecharDrawer}
        onSave={salvarRisco}
      />

      <style>
        {pgrStyles}
      </style>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof ShieldCheck;
  tone:
    | "blue"
    | "red"
    | "amber"
    | "green";
}) {
  return (
    <article
      className={`pgr-metric pgr-metric-${tone}`}
    >
      <div className="pgr-metric-icon">
        <Icon size={20} />
      </div>

      <div className="pgr-metric-copy">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>
      </div>
    </article>
  );
}

function ClassificationItem({
  label,
  range,
  tone,
}: {
  label: string;
  range: string;
  tone:
    | "green"
    | "yellow"
    | "orange"
    | "red";
}) {
  return (
    <div className="pgr-classification-item">
      <span
        className={`pgr-risk-dot pgr-risk-dot-${tone}`}
      />

      <div>
        <strong>
          {label}
        </strong>

        <span>
          {range}
        </span>
      </div>
    </div>
  );
}

const pgrStyles = `
  .pgr-page {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    background: ${colors.background};
  }

  .pgr-button-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pgr-alert-error {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    padding: 14px 15px;
    box-sizing: border-box;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .pgr-alert-error-content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .pgr-alert-error-content svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .pgr-alert-error-content strong,
  .pgr-alert-error-content span {
    display: block;
  }

  .pgr-alert-error-content strong {
    font-size: 11px;
    font-weight: 800;
  }

  .pgr-alert-error-content span {
    margin-top: 3px;
    font-size: 10px;
    line-height: 1.5;
  }

  .pgr-alert-error > button {
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

  .pgr-context-banner {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 18px;
    margin-bottom: 22px;
    padding: 22px;
    overflow: hidden;
    border: 1px solid #1E293B;
    border-radius: 18px;
    background:
      linear-gradient(
        135deg,
        #0F172A 0%,
        #111F38 55%,
        #172554 100%
      );
    box-shadow:
      0 14px 35px rgba(15, 23, 42, .12);
  }

  .pgr-context-banner::after {
    content: "";
    position: absolute;
    width: 240px;
    height: 240px;
    right: -105px;
    top: -130px;
    border-radius: 50%;
    background:
      rgba(37, 99, 235, .18);
    pointer-events: none;
  }

  .pgr-context-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(96, 165, 250, .22);
    border-radius: 15px;
    background: rgba(37, 99, 235, .16);
    color: #60A5FA;
  }

  .pgr-context-copy {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .pgr-context-copy > span {
    color: #93C5FD;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .9px;
  }

  .pgr-context-copy h2 {
    margin: 6px 0 0;
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 820;
    letter-spacing: -.3px;
    line-height: 1.3;
  }

  .pgr-context-copy p {
    max-width: 740px;
    margin: 7px 0 0;
    color: #94A3B8;
    font-size: 10px;
    line-height: 1.6;
  }

  .pgr-context-tags {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
    color: #94A3B8;
    font-size: 9px;
    white-space: nowrap;
  }

  .pgr-context-tags span,
  .pgr-context-tags strong {
    padding: 7px 9px;
    border: 1px solid rgba(148, 163, 184, .16);
    border-radius: 8px;
    background: rgba(15, 23, 42, .30);
  }

  .pgr-context-tags strong {
    color: #BFDBFE;
    font-weight: 800;
  }

  .pgr-metrics-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .pgr-metric {
    position: relative;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px;
    border: 1px solid ${colors.border};
    border-radius: 15px;
    background: #FFFFFF;
    box-shadow:
      0 8px 24px rgba(15, 23, 42, .045);
  }

  .pgr-metric::before {
    content: "";
    position: absolute;
    left: 0;
    top: 16px;
    bottom: 16px;
    width: 3px;
    border-radius: 0 4px 4px 0;
  }

  .pgr-metric-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 11px;
  }

  .pgr-metric-copy {
    min-width: 0;
  }

  .pgr-metric-copy > span {
    display: block;
    color: ${colors.textLight};
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .4px;
    text-transform: uppercase;
  }

  .pgr-metric-copy strong {
    display: block;
    margin-top: 2px;
    color: ${colors.title};
    font-size: 21px;
    font-weight: 850;
    line-height: 1.15;
  }

  .pgr-metric-copy small {
    display: block;
    margin-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    line-height: 1.4;
  }

  .pgr-metric-blue::before {
    background: #2563EB;
  }

  .pgr-metric-blue .pgr-metric-icon {
    background: #EFF6FF;
    color: #2563EB;
  }

  .pgr-metric-red::before {
    background: #DC2626;
  }

  .pgr-metric-red .pgr-metric-icon {
    background: #FEF2F2;
    color: #DC2626;
  }

  .pgr-metric-amber::before {
    background: #F59E0B;
  }

  .pgr-metric-amber .pgr-metric-icon {
    background: #FFFBEB;
    color: #D97706;
  }

  .pgr-metric-green::before {
    background: #16A34A;
  }

  .pgr-metric-green .pgr-metric-icon {
    background: #F0FDF4;
    color: #16A34A;
  }

  .pgr-classification-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
    padding: 14px 16px;
    border: 1px solid ${colors.border};
    border-radius: 14px;
    background: #FFFFFF;
  }

  .pgr-classification-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: ${colors.primary};
  }

  .pgr-classification-title strong,
  .pgr-classification-title span {
    display: block;
  }

  .pgr-classification-title strong {
    color: ${colors.text};
    font-size: 10px;
    font-weight: 800;
  }

  .pgr-classification-title span {
    margin-top: 2px;
    color: #94A3B8;
    font-size: 8px;
  }

  .pgr-classification-items {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .pgr-classification-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pgr-risk-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  .pgr-risk-dot-green {
    background: #16A34A;
  }

  .pgr-risk-dot-yellow {
    background: #F59E0B;
  }

  .pgr-risk-dot-orange {
    background: #F97316;
  }

  .pgr-risk-dot-red {
    background: #DC2626;
  }

  .pgr-classification-item strong,
  .pgr-classification-item span {
    display: block;
  }

  .pgr-classification-item strong {
    color: ${colors.text};
    font-size: 9px;
    font-weight: 800;
  }

  .pgr-classification-item span {
    margin-top: 1px;
    color: #94A3B8;
    font-size: 8px;
  }

  .pgr-inventory-card {
    width: 100%;
    min-width: 0;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid ${colors.border};
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow:
      0 10px 30px rgba(15, 23, 42, .05);
  }

  .pgr-section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .pgr-section-eyebrow {
    color: ${colors.primary};
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .8px;
  }

  .pgr-section-header h2 {
    margin: 5px 0 0;
    color: ${colors.title};
    font-size: 18px;
    font-weight: 850;
    letter-spacing: -.35px;
  }

  .pgr-section-header p {
    margin: 5px 0 0;
    color: ${colors.textLight};
    font-size: 10px;
    line-height: 1.5;
  }

  .pgr-section-count {
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex-shrink: 0;
    padding: 9px 11px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #F8FAFC;
  }

  .pgr-section-count strong {
    color: ${colors.title};
    font-size: 14px;
    font-weight: 850;
  }

  .pgr-section-count span {
    color: ${colors.textLight};
    font-size: 8px;
  }

  .pgr-filter-panel {
    margin-bottom: 18px;
    padding: 16px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #F8FAFC;
  }

  .pgr-filter-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 13px;
  }

  .pgr-filter-heading > div {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${colors.text};
    font-size: 10px;
    font-weight: 800;
  }

  .pgr-filter-heading svg {
    color: #64748B;
  }

  .pgr-clear-filters {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: none;
    background: transparent;
    color: ${colors.primary};
    font-family: inherit;
    font-size: 9px;
    font-weight: 800;
    cursor: pointer;
  }

  .pgr-filter-grid {
    display: grid;
    grid-template-columns:
      minmax(260px, 2fr)
      repeat(3, minmax(155px, 1fr));
    gap: 10px;
  }

  .pgr-search-field,
  .pgr-filter-grid select {
    width: 100%;
    min-width: 0;
    height: 43px;
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 10px;
    background: #FFFFFF;
    transition:
      border-color .15s ease,
      box-shadow .15s ease;
  }

  .pgr-search-field {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    color: #94A3B8;
  }

  .pgr-search-field:focus-within,
  .pgr-filter-grid select:focus {
    border-color: ${colors.primary};
    box-shadow:
      0 0 0 3px rgba(37, 99, 235, .08);
  }

  .pgr-search-field input {
    width: 100%;
    min-width: 0;
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: ${colors.title};
    font-family: inherit;
    font-size: 11px;
  }

  .pgr-search-field input::placeholder {
    color: #94A3B8;
  }

  .pgr-filter-grid select {
    padding: 0 11px;
    outline: none;
    color: ${colors.text};
    font-family: inherit;
    font-size: 10px;
    font-weight: 650;
    cursor: pointer;
  }

  .pgr-filter-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 11px;
    color: #94A3B8;
    font-size: 8px;
  }

  .pgr-filter-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${colors.textLight};
    font-weight: 700;
  }

  .pgr-table-area {
    min-width: 0;
  }

  .pgr-table-scroll {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .pgr-loading-state {
    min-height: 210px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px;
    box-sizing: border-box;
    border: 1px dashed #CBD5E1;
    border-radius: 13px;
    background: #F8FAFC;
    text-align: center;
  }

  .pgr-loading-icon {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    background: #EFF6FF;
    color: ${colors.primary};
  }

  .pgr-loading-state strong {
    margin-top: 12px;
    color: ${colors.title};
    font-size: 11px;
    font-weight: 800;
  }

  .pgr-loading-state span {
    max-width: 380px;
    margin-top: 4px;
    color: ${colors.textLight};
    font-size: 9px;
    line-height: 1.5;
  }

  @media (max-width: 1180px) {
    .pgr-context-banner {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .pgr-context-tags {
      grid-column: 1 / -1;
      justify-content: flex-start;
      padding-left: 70px;
    }

    .pgr-metrics-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .pgr-filter-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .pgr-classification-strip {
      align-items: flex-start;
      flex-direction: column;
    }

    .pgr-classification-items {
      width: 100%;
      justify-content: flex-start;
    }
  }

  @media (max-width: 650px) {
    .pgr-context-banner {
      grid-template-columns: 1fr;
      gap: 13px;
      padding: 18px;
    }

    .pgr-context-icon {
      width: 45px;
      height: 45px;
      border-radius: 13px;
    }

    .pgr-context-copy h2 {
      font-size: 16px;
    }

    .pgr-context-tags {
      grid-column: auto;
      padding-left: 0;
      gap: 5px;
    }

    .pgr-context-tags svg {
      display: none;
    }

    .pgr-metrics-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .pgr-classification-items {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .pgr-inventory-card {
      padding: 17px;
      border-radius: 15px;
    }

    .pgr-section-header {
      flex-direction: column;
      gap: 12px;
    }

    .pgr-section-count {
      width: 100%;
      box-sizing: border-box;
      justify-content: center;
    }

    .pgr-filter-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .pgr-filter-grid {
      grid-template-columns: 1fr;
    }

    .pgr-filter-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }
  }

  @media (max-width: 430px) {
    .pgr-context-tags span,
    .pgr-context-tags strong {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
    }

    .pgr-classification-strip {
      padding: 13px;
    }

    .pgr-classification-items {
      grid-template-columns: 1fr;
    }
  }
`;
