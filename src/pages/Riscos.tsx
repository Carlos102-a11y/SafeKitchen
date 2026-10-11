import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  Layers3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import { supabase } from "../lib/supabase";

import type { ReactNode } from "react";
import type { PgrItem } from "../models/Pgr";

type FiltroCategoria = "" | PgrItem["categoria"];
type FiltroClassificacao = "" | PgrItem["classificacao"];
type FiltroStatus = "" | PgrItem["status"];

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

function converterPgr(item: PgrRow): PgrItem {
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
    medidaControle: item.medida_controle,
    responsavel: item.responsavel,
    prazo: item.prazo ?? "",
    status: item.status,
  };
}

function useViewportWidth() {
  const [largura, setLargura] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );

  useEffect(() => {
    function atualizar() {
      setLargura(window.innerWidth);
    }

    window.addEventListener("resize", atualizar);
    atualizar();

    return () => {
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return largura;
}

export default function Riscos() {
  const navigate = useNavigate();
  const largura = useViewportWidth();

  const mobile = largura <= 650;
  const tablet = largura <= 900;
  const telaMedia = largura <= 1200;

  const [riscos, setRiscos] = useState<PgrItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroBanco, setErroBanco] = useState<string | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [filtroCategoria, setFiltroCategoria] =
    useState<FiltroCategoria>("");
  const [filtroClassificacao, setFiltroClassificacao] =
    useState<FiltroClassificacao>("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("");

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarRiscos() {
      setCarregando(true);
      setErroBanco(null);

      const { data, error } = await supabase
        .from("pgr")
        .select(CAMPOS_PGR)
        .order("id", { ascending: true });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error("Erro ao carregar riscos:", error);
        setRiscos([]);
        setErroBanco("Não foi possível carregar os riscos do PGR.");
        setCarregando(false);
        return;
      }

      const registros = (data ?? []).map((item) =>
        converterPgr(item as PgrRow)
      );

      setRiscos(registros);
      setCarregando(false);
    }

    void carregarRiscos();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  const riscosCriticos = riscos.filter(
    (risco) => risco.classificacao === "Crítico"
  ).length;

  const riscosAltos = riscos.filter(
    (risco) => risco.classificacao === "Alto"
  ).length;

  const riscosMedios = riscos.filter(
    (risco) => risco.classificacao === "Médio"
  ).length;

  const riscosBaixos = riscos.filter(
    (risco) => risco.classificacao === "Baixo"
  ).length;

  const riscosConcluidos = riscos.filter(
    (risco) => risco.status === "Concluído"
  ).length;

  const riscosAndamento = riscos.filter(
    (risco) => risco.status === "Em andamento"
  ).length;

  const riscosPendentes = riscos.filter(
    (risco) => risco.status === "Pendente"
  ).length;

  const prazosVencidos = riscos.filter((risco) => prazoVencido(risco)).length;

  const semMedidaControle = riscos.filter(
    (risco) => !risco.medidaControle.trim()
  ).length;

  const semResponsavel = riscos.filter(
    (risco) => !risco.responsavel.trim()
  ).length;

  const taxaControlesConcluidos = riscos.length
    ? Math.round((riscosConcluidos / riscos.length) * 100)
    : 0;

  const riscosPrioritarios = riscos.filter(
    (risco) =>
      risco.classificacao === "Crítico" ||
      risco.classificacao === "Alto" ||
      prazoVencido(risco)
  ).length;

  const riscosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return riscos.filter((risco) => {
      const correspondePesquisa =
        !termo ||
        risco.perigo.toLowerCase().includes(termo) ||
        risco.setor.toLowerCase().includes(termo) ||
        risco.atividade.toLowerCase().includes(termo) ||
        risco.responsavel.toLowerCase().includes(termo) ||
        risco.medidaControle.toLowerCase().includes(termo);

      const correspondeCategoria =
        !filtroCategoria || risco.categoria === filtroCategoria;

      const correspondeClassificacao =
        !filtroClassificacao ||
        risco.classificacao === filtroClassificacao;

      const correspondeStatus =
        !filtroStatus || risco.status === filtroStatus;

      return (
        correspondePesquisa &&
        correspondeCategoria &&
        correspondeClassificacao &&
        correspondeStatus
      );
    });
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
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <PageHeader
        title="Gestão de Riscos"
        subtitle="Visão gerencial dos riscos, controles e prioridades registrados no PGR."
        icon={TriangleAlert}
      >
        <Button onClick={() => navigate("/pgr")}>
          <span className="riscos-button-content">
            <ShieldCheck size={18} />
            Acessar PGR
          </span>
        </Button>
      </PageHeader>

      <section className="riscos-source-banner">
        <div className="riscos-source-icon">
          <Layers3 size={22} />
        </div>

        <div className="riscos-source-copy">
          <div className="riscos-eyebrow">FONTE ÚNICA DE DADOS</div>
          <strong>Monitoramento conectado diretamente ao inventário do PGR</strong>
          <span>
            Esta tela consolida os mesmos riscos cadastrados no PGR. Alterações no
            inventário refletem automaticamente nesta visão gerencial.
          </span>
        </div>

        <div className="riscos-source-status">
          <span className="riscos-source-dot" />
          Sincronizado
        </div>
      </section>

      <div
        style={{
          width: "100%",
          minWidth: 0,
          display: "grid",
          gridTemplateColumns: mobile
            ? "minmax(0, 1fr)"
            : telaMedia
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(5, minmax(0, 1fr))",
          gap: mobile ? 12 : 18,
          marginBottom: mobile ? 16 : 22,
        }}
      >
        <StatCard
          title="Riscos Monitorados"
          value={riscos.length}
          icon={<Target size={22} />}
          color="#2563EB"
        />

        <StatCard
          title="Críticos"
          value={riscosCriticos}
          icon={<TriangleAlert size={22} />}
          color="#DC2626"
        />

        <StatCard
          title="Altos"
          value={riscosAltos}
          icon={<AlertCircle size={22} />}
          color="#F97316"
        />

        <StatCard
          title="Prazos Vencidos"
          value={prazosVencidos}
          icon={<Clock3 size={22} />}
          color="#F59E0B"
        />

        <StatCard
          title="Controles Concluídos"
          value={riscosConcluidos}
          icon={<CircleCheckBig size={22} />}
          color="#16A34A"
        />
      </div>

      <div className="riscos-insights-grid">
        <PainelGerencial
          titulo="Perfil de Exposição"
          subtitulo="Distribuição dos riscos por classificação."
          icon={<BarChart3 size={18} />}
        >
          <BarraDistribuicao
            titulo="Crítico"
            valor={riscosCriticos}
            total={riscos.length}
            cor="#DC2626"
          />
          <BarraDistribuicao
            titulo="Alto"
            valor={riscosAltos}
            total={riscos.length}
            cor="#F97316"
          />
          <BarraDistribuicao
            titulo="Médio"
            valor={riscosMedios}
            total={riscos.length}
            cor="#F59E0B"
          />
          <BarraDistribuicao
            titulo="Baixo"
            valor={riscosBaixos}
            total={riscos.length}
            cor="#16A34A"
          />
        </PainelGerencial>

        <PainelGerencial
          titulo="Evolução dos Controles"
          subtitulo="Situação das medidas registradas no plano do PGR."
          icon={<CheckCircle2 size={18} />}
        >
          <div className="riscos-control-header">
            <div>
              <span>Taxa de conclusão</span>
              <strong>{taxaControlesConcluidos}%</strong>
            </div>
            <div className="riscos-control-ring">
              {riscosConcluidos}/{riscos.length}
            </div>
          </div>

          <div className="riscos-progress-track">
            <div
              className="riscos-progress-fill"
              style={{ width: `${taxaControlesConcluidos}%` }}
            />
          </div>

          <div className="riscos-control-grid">
            <ResumoCompacto
              titulo="Concluídos"
              valor={riscosConcluidos}
              cor="#16A34A"
            />
            <ResumoCompacto
              titulo="Em andamento"
              valor={riscosAndamento}
              cor="#F59E0B"
            />
            <ResumoCompacto
              titulo="Pendentes"
              valor={riscosPendentes}
              cor="#64748B"
            />
          </div>
        </PainelGerencial>

        <PainelGerencial
          titulo="Prioridades da Gestão"
          subtitulo="Pontos que merecem acompanhamento imediato."
          icon={<TriangleAlert size={18} />}
        >
          <PrioridadeLinha
            titulo="Riscos altos ou críticos"
            valor={riscosAltos + riscosCriticos}
            destaque={(riscosAltos + riscosCriticos) > 0}
          />
          <PrioridadeLinha
            titulo="Prazos vencidos"
            valor={prazosVencidos}
            destaque={prazosVencidos > 0}
          />
          <PrioridadeLinha
            titulo="Sem medida de controle"
            valor={semMedidaControle}
            destaque={semMedidaControle > 0}
          />
          <PrioridadeLinha
            titulo="Sem responsável definido"
            valor={semResponsavel}
            destaque={semResponsavel > 0}
          />

          <div className="riscos-priority-footer">
            <strong>{riscosPrioritarios}</strong>
            <span>registro(s) em condição prioritária</span>
          </div>
        </PainelGerencial>
      </div>

      <section className="riscos-monitor-panel">
        <div className="riscos-monitor-header">
          <div>
            <div className="riscos-eyebrow">MONITORAMENTO OPERACIONAL</div>
            <h2>Mapa de Riscos e Controles</h2>
            <p>
              Acompanhe classificação, medida de controle, responsável, prazo e
              status dos riscos cadastrados no PGR.
            </p>
          </div>

          <div className="riscos-monitor-count">
            <strong>{riscosFiltrados.length}</strong>
            <span>visível(is)</span>
          </div>
        </div>

        <div className="riscos-filter-box">
          <div className="riscos-filter-head">
            <div>
              <SlidersHorizontal size={16} />
              <span>Filtros de monitoramento</span>
            </div>

            {filtrosAtivos && (
              <button type="button" onClick={limparFiltros}>
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>

          <div
            style={{
              width: "100%",
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: mobile
                ? "minmax(0, 1fr)"
                : tablet
                  ? "repeat(2, minmax(0, 1fr))"
                  : "minmax(280px, 2fr) repeat(3, minmax(160px, 1fr))",
              gap: mobile ? 10 : 12,
            }}
          >
            <div className="riscos-search-field">
              <Search size={17} />
              <input
                type="text"
                value={pesquisa}
                placeholder={
                  mobile
                    ? "Pesquisar riscos..."
                    : "Pesquisar risco, setor, responsável ou controle..."
                }
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) =>
                setFiltroCategoria(e.target.value as FiltroCategoria)
              }
              style={estiloSelect}
            >
              <option value="">Todas as categorias</option>
              <option value="Físico">Físico</option>
              <option value="Químico">Químico</option>
              <option value="Biológico">Biológico</option>
              <option value="Ergonômico">Ergonômico</option>
              <option value="Acidente">Acidente</option>
            </select>

            <select
              value={filtroClassificacao}
              onChange={(e) =>
                setFiltroClassificacao(
                  e.target.value as FiltroClassificacao
                )
              }
              style={estiloSelect}
            >
              <option value="">Todas as classificações</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value as FiltroStatus)
              }
              style={estiloSelect}
            >
              <option value="">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          <div className="riscos-filter-result">
            Exibindo <strong>{riscosFiltrados.length}</strong> de{" "}
            <strong>{riscos.length}</strong> risco(s)
          </div>
        </div>

        {carregando ? (
          <EstadoCarregando mobile={mobile} />
        ) : erroBanco ? (
          <EstadoErro mensagem={erroBanco} mobile={mobile} />
        ) : riscosFiltrados.length === 0 ? (
          <EstadoVazio
            possuiRiscos={riscos.length > 0}
            onAbrirPgr={() => navigate("/pgr")}
            mobile={mobile}
          />
        ) : mobile ? (
          <div className="riscos-mobile-list">
            {riscosFiltrados.map((risco) => (
              <CardRiscoMobile
                key={risco.id}
                risco={risco}
                onAbrirPgr={() => navigate("/pgr")}
              />
            ))}
          </div>
        ) : (
          <TabelaRiscos
            riscos={riscosFiltrados}
            onAbrirPgr={() => navigate("/pgr")}
          />
        )}
      </section>

      <style>{estilosPagina}</style>
    </main>
  );
}

function PainelGerencial({
  titulo,
  subtitulo,
  icon,
  children,
}: {
  titulo: string;
  subtitulo: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="riscos-insight-card">
      <div className="riscos-insight-head">
        <div className="riscos-insight-icon">{icon}</div>
        <div>
          <h3>{titulo}</h3>
          <p>{subtitulo}</p>
        </div>
      </div>
      <div className="riscos-insight-body">{children}</div>
    </section>
  );
}

function BarraDistribuicao({
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
  const percentual = total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div className="riscos-distribution-row">
      <div className="riscos-distribution-label">
        <span className="riscos-dot" style={{ background: cor }} />
        <span>{titulo}</span>
        <strong>{valor}</strong>
      </div>
      <div className="riscos-distribution-track">
        <div
          className="riscos-distribution-fill"
          style={{ width: `${percentual}%`, background: cor }}
        />
      </div>
      <span className="riscos-distribution-percent">{percentual}%</span>
    </div>
  );
}

function ResumoCompacto({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: number;
  cor: string;
}) {
  return (
    <div className="riscos-control-item">
      <span className="riscos-dot" style={{ background: cor }} />
      <div>
        <strong>{valor}</strong>
        <span>{titulo}</span>
      </div>
    </div>
  );
}

function PrioridadeLinha({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: number;
  destaque: boolean;
}) {
  return (
    <div className="riscos-priority-row">
      <div>
        <span
          className="riscos-priority-indicator"
          style={{ background: destaque ? "#DC2626" : "#16A34A" }}
        />
        <span>{titulo}</span>
      </div>
      <strong style={{ color: destaque ? "#B91C1C" : "#166534" }}>
        {valor}
      </strong>
    </div>
  );
}

function TabelaRiscos({
  riscos,
  onAbrirPgr,
}: {
  riscos: PgrItem[];
  onAbrirPgr: () => void;
}) {
  return (
    <div className="riscos-table-wrap">
      <table className="riscos-table">
        <thead>
          <tr>
            <th>Risco</th>
            <th>Avaliação</th>
            <th>Medida de Controle</th>
            <th>Responsável</th>
            <th>Prazo</th>
            <th>Status</th>
            <th className="riscos-table-action-head">PGR</th>
          </tr>
        </thead>

        <tbody>
          {riscos.map((risco) => (
            <tr key={risco.id}>
              <td>
                <div className="riscos-risk-cell">
                  <span
                    className="riscos-risk-accent"
                    style={{ background: corClassificacao(risco.classificacao) }}
                  />
                  <div className="riscos-risk-icon">
                    <Building2 size={17} />
                  </div>
                  <div className="riscos-risk-copy">
                    <strong>{risco.perigo}</strong>
                    <span>{risco.setor}</span>
                    <small>{risco.atividade}</small>
                    <div>
                      <Badge color="blue">{risco.categoria}</Badge>
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <div className="riscos-assessment-cell">
                  <Badge color={corBadgeClassificacao(risco.classificacao)}>
                    {risco.classificacao}
                  </Badge>
                  <strong>Nível {risco.nivel}</strong>
                  <span>
                    P{risco.probabilidade} × S{risco.severidade}
                  </span>
                </div>
              </td>

              <td>
                <div className="riscos-control-text">
                  {risco.medidaControle || "Nenhuma medida cadastrada"}
                </div>
              </td>

              <td>
                <div className="riscos-person-cell">
                  <UserRound size={15} />
                  <span>{risco.responsavel || "Não definido"}</span>
                </div>
              </td>

              <td>
                <div
                  className={
                    prazoVencido(risco)
                      ? "riscos-deadline riscos-deadline-overdue"
                      : "riscos-deadline"
                  }
                >
                  <CalendarDays size={15} />
                  <span>{formatarData(risco.prazo)}</span>
                </div>
                {prazoVencido(risco) && (
                  <small className="riscos-overdue-label">Vencido</small>
                )}
              </td>

              <td>
                <div className="riscos-status-cell">
                  <Badge color={corBadgeStatus(risco.status)}>
                    {risco.status}
                  </Badge>
                  <small>{descricaoStatus(risco.status)}</small>
                </div>
              </td>

              <td className="riscos-table-action-cell">
                <button
                  type="button"
                  title="Abrir PGR"
                  aria-label="Abrir PGR"
                  onClick={onAbrirPgr}
                  className="riscos-open-button"
                >
                  <ArrowRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardRiscoMobile({
  risco,
  onAbrirPgr,
}: {
  risco: PgrItem;
  onAbrirPgr: () => void;
}) {
  return (
    <article className="riscos-mobile-card">
      <div
        className="riscos-mobile-card-accent"
        style={{ background: corClassificacao(risco.classificacao) }}
      />

      <div className="riscos-mobile-card-head">
        <div>
          <div className="riscos-mobile-card-title">{risco.perigo}</div>
          <div className="riscos-mobile-card-location">
            <Building2 size={14} />
            {risco.setor} · {risco.atividade}
          </div>
        </div>
        <Badge color={corBadgeClassificacao(risco.classificacao)}>
          {risco.classificacao}
        </Badge>
      </div>

      <div className="riscos-mobile-meta-grid">
        <div>
          <span>Avaliação</span>
          <strong>
            Nível {risco.nivel} · P{risco.probabilidade} × S{risco.severidade}
          </strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{risco.status}</strong>
        </div>
        <div>
          <span>Responsável</span>
          <strong>{risco.responsavel || "Não definido"}</strong>
        </div>
        <div>
          <span>Prazo</span>
          <strong className={prazoVencido(risco) ? "riscos-mobile-overdue" : ""}>
            {formatarData(risco.prazo)}
          </strong>
        </div>
      </div>

      <div className="riscos-mobile-control">
        <span>Medida de controle</span>
        <p>{risco.medidaControle || "Nenhuma medida cadastrada"}</p>
      </div>

      <div className="riscos-mobile-card-footer">
        <Badge color="blue">{risco.categoria}</Badge>
        <button type="button" onClick={onAbrirPgr}>
          Abrir PGR
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function EstadoCarregando({ mobile }: { mobile: boolean }) {
  return (
    <div className="riscos-state-box" style={{ minHeight: mobile ? 220 : 260 }}>
      <div className="riscos-loading-ring" />
      <strong>Carregando riscos do PGR</strong>
      <span>Atualizando a visão gerencial com os registros mais recentes.</span>
    </div>
  );
}

function EstadoErro({
  mensagem,
  mobile,
}: {
  mensagem: string;
  mobile: boolean;
}) {
  return (
    <div
      className="riscos-state-box riscos-state-error"
      style={{ minHeight: mobile ? 220 : 260 }}
    >
      <TriangleAlert size={28} />
      <strong>Erro ao carregar os riscos</strong>
      <span>{mensagem}</span>
    </div>
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
    <div className="riscos-state-box" style={{ minHeight: mobile ? 220 : 260 }}>
      <div className="riscos-empty-icon">
        <ShieldCheck size={25} />
      </div>

      <strong>
        {possuiRiscos
          ? "Nenhum risco corresponde aos filtros"
          : "Nenhum risco cadastrado"}
      </strong>

      <span>
        {possuiRiscos
          ? "Altere os filtros para visualizar outros riscos."
          : "Os riscos são cadastrados e avaliados diretamente no módulo PGR."}
      </span>

      {!possuiRiscos && <Button onClick={onAbrirPgr}>Acessar PGR</Button>}
    </div>
  );
}

function prazoVencido(risco: PgrItem) {
  if (!risco.prazo || risco.status === "Concluído") {
    return false;
  }

  const prazo = new Date(`${risco.prazo}T23:59:59`);
  return prazo.getTime() < new Date().getTime();
}

function formatarData(data: string) {
  if (!data) {
    return "Sem prazo";
  }

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function corClassificacao(classificacao: PgrItem["classificacao"]) {
  if (classificacao === "Crítico") return "#DC2626";
  if (classificacao === "Alto") return "#F97316";
  if (classificacao === "Médio") return "#F59E0B";
  return "#16A34A";
}

function corBadgeClassificacao(classificacao: PgrItem["classificacao"]) {
  if (classificacao === "Crítico") return "red" as const;
  if (classificacao === "Alto") return "orange" as const;
  if (classificacao === "Médio") return "yellow" as const;
  return "green" as const;
}

function corBadgeStatus(status: PgrItem["status"]) {
  if (status === "Concluído") return "green" as const;
  if (status === "Em andamento") return "yellow" as const;
  return "gray" as const;
}

function descricaoStatus(status: PgrItem["status"]) {
  if (status === "Concluído") return "Controle finalizado";
  if (status === "Em andamento") return "Ação em execução";
  return "Aguardando ação";
}

const estiloSelect = {
  width: "100%",
  minWidth: 0,
  height: 44,
  padding: "0 12px",
  boxSizing: "border-box" as const,
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  background: "#FFFFFF",
  color: "#475569",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const estilosPagina = `
  .riscos-button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .riscos-source-banner {
    width: 100%;
    min-width: 0;
    margin-bottom: 22px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-sizing: border-box;
    border: 1px solid #dbeafe;
    border-radius: 16px;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 72%);
  }

  .riscos-source-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 12px;
    background: #dbeafe;
    color: #2563eb;
  }

  .riscos-source-copy {
    min-width: 0;
    flex: 1;
  }

  .riscos-eyebrow {
    color: #2563eb;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .8px;
  }

  .riscos-source-copy strong {
    display: block;
    margin-top: 4px;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.35;
  }

  .riscos-source-copy span {
    display: block;
    margin-top: 4px;
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
  }

  .riscos-source-status {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    padding: 7px 10px;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    background: #f0fdf4;
    color: #166534;
    font-size: 10px;
    font-weight: 800;
  }

  .riscos-source-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #16a34a;
  }

  .riscos-insights-grid {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 22px;
  }

  .riscos-insight-card {
    width: 100%;
    min-width: 0;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .035);
  }

  .riscos-insight-head {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .riscos-insight-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
  }

  .riscos-insight-head h3 {
    margin: 0;
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
  }

  .riscos-insight-head p {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.45;
  }

  .riscos-insight-body {
    padding-top: 16px;
  }

  .riscos-distribution-row {
    display: grid;
    grid-template-columns: 90px minmax(0, 1fr) 34px;
    align-items: center;
    gap: 9px;
    margin-bottom: 13px;
  }

  .riscos-distribution-row:last-child {
    margin-bottom: 0;
  }

  .riscos-distribution-label {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: #475569;
    font-size: 10px;
  }

  .riscos-distribution-label strong {
    margin-left: auto;
    color: #0f172a;
    font-size: 10px;
  }

  .riscos-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  .riscos-distribution-track,
  .riscos-progress-track {
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .riscos-distribution-fill,
  .riscos-progress-fill {
    height: 100%;
    border-radius: inherit;
  }

  .riscos-distribution-percent {
    color: #64748b;
    font-size: 9px;
    font-weight: 700;
    text-align: right;
  }

  .riscos-control-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .riscos-control-header > div:first-child span {
    display: block;
    color: #64748b;
    font-size: 10px;
  }

  .riscos-control-header > div:first-child strong {
    display: block;
    margin-top: 2px;
    color: #0f172a;
    font-size: 26px;
    line-height: 1;
  }

  .riscos-control-ring {
    padding: 7px 9px;
    border-radius: 9px;
    background: #f8fafc;
    color: #64748b;
    font-size: 10px;
    font-weight: 750;
  }

  .riscos-progress-fill {
    background: #16a34a;
  }

  .riscos-control-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .riscos-control-item {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    min-width: 0;
    padding: 9px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .riscos-control-item .riscos-dot {
    margin-top: 4px;
  }

  .riscos-control-item strong,
  .riscos-control-item span {
    display: block;
  }

  .riscos-control-item strong {
    color: #0f172a;
    font-size: 14px;
  }

  .riscos-control-item span {
    margin-top: 2px;
    color: #64748b;
    font-size: 8px;
    line-height: 1.3;
  }

  .riscos-priority-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .riscos-priority-row > div {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    color: #475569;
    font-size: 10px;
  }

  .riscos-priority-row strong {
    flex-shrink: 0;
    font-size: 11px;
  }

  .riscos-priority-indicator {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  .riscos-priority-footer {
    display: flex;
    align-items: baseline;
    gap: 7px;
    margin-top: 13px;
    padding: 10px 11px;
    border-radius: 10px;
    background: #fff7ed;
  }

  .riscos-priority-footer strong {
    color: #c2410c;
    font-size: 18px;
  }

  .riscos-priority-footer span {
    color: #9a3412;
    font-size: 9px;
    line-height: 1.4;
  }

  .riscos-monitor-panel {
    width: 100%;
    min-width: 0;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
  }

  .riscos-monitor-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .riscos-monitor-header h2 {
    margin: 4px 0 0;
    color: #0f172a;
    font-size: 18px;
    font-weight: 820;
  }

  .riscos-monitor-header p {
    max-width: 700px;
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 11px;
    line-height: 1.5;
  }

  .riscos-monitor-count {
    min-width: 74px;
    padding: 9px 12px;
    border: 1px solid #dbeafe;
    border-radius: 11px;
    background: #eff6ff;
    text-align: center;
  }

  .riscos-monitor-count strong,
  .riscos-monitor-count span {
    display: block;
  }

  .riscos-monitor-count strong {
    color: #1d4ed8;
    font-size: 16px;
  }

  .riscos-monitor-count span {
    margin-top: 1px;
    color: #3b82f6;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: .4px;
  }

  .riscos-filter-box {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #f8fafc;
  }

  .riscos-filter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 13px;
  }

  .riscos-filter-head > div,
  .riscos-filter-head button {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .riscos-filter-head > div {
    color: #475569;
    font-size: 11px;
    font-weight: 750;
  }

  .riscos-filter-head button {
    padding: 0;
    border: none;
    background: transparent;
    color: #2563eb;
    font-family: inherit;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }

  .riscos-search-field {
    width: 100%;
    min-width: 0;
    height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 13px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    color: #94a3b8;
  }

  .riscos-search-field input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #0f172a;
    font-family: inherit;
    font-size: 12px;
  }

  .riscos-filter-result {
    margin-top: 10px;
    color: #64748b;
    font-size: 10px;
  }

  .riscos-filter-result strong {
    color: #0f172a;
  }

  .riscos-table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    -webkit-overflow-scrolling: touch;
  }

  .riscos-table {
    width: 100%;
    min-width: 1120px;
    border-collapse: collapse;
  }

  .riscos-table thead tr {
    background: #f8fafc;
  }

  .riscos-table th {
    padding: 14px 16px;
    color: #64748b;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .55px;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .riscos-table td {
    padding: 16px;
    border-top: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  .riscos-table tbody tr {
    background: #ffffff;
    transition: background .15s ease;
  }

  .riscos-table tbody tr:hover {
    background: #fbfdff;
  }

  .riscos-risk-cell {
    position: relative;
    width: 230px;
    min-width: 230px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding-left: 6px;
  }

  .riscos-risk-accent {
    position: absolute;
    left: -16px;
    top: -16px;
    bottom: -16px;
    width: 3px;
  }

  .riscos-risk-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #f1f5f9;
    color: #64748b;
  }

  .riscos-risk-copy {
    min-width: 0;
  }

  .riscos-risk-copy strong,
  .riscos-risk-copy span,
  .riscos-risk-copy small {
    display: block;
    overflow-wrap: anywhere;
  }

  .riscos-risk-copy strong {
    color: #0f172a;
    font-size: 12px;
    line-height: 1.35;
  }

  .riscos-risk-copy span {
    margin-top: 4px;
    color: #64748b;
    font-size: 10px;
  }

  .riscos-risk-copy small {
    margin-top: 2px;
    color: #94a3b8;
    font-size: 9px;
  }

  .riscos-risk-copy > div {
    margin-top: 7px;
  }

  .riscos-assessment-cell {
    min-width: 118px;
  }

  .riscos-assessment-cell strong,
  .riscos-assessment-cell span,
  .riscos-status-cell small {
    display: block;
  }

  .riscos-assessment-cell strong {
    margin-top: 7px;
    color: #334155;
    font-size: 10px;
  }

  .riscos-assessment-cell span,
  .riscos-status-cell small {
    margin-top: 3px;
    color: #94a3b8;
    font-size: 8px;
  }

  .riscos-control-text {
    width: 220px;
    max-width: 220px;
    color: #475569;
    font-size: 11px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .riscos-person-cell,
  .riscos-deadline {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #475569;
    font-size: 10px;
  }

  .riscos-person-cell {
    width: 135px;
    min-width: 135px;
  }

  .riscos-person-cell svg,
  .riscos-deadline svg {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .riscos-person-cell span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .riscos-deadline {
    min-width: 116px;
    white-space: nowrap;
  }

  .riscos-deadline-overdue,
  .riscos-deadline-overdue svg {
    color: #dc2626;
    font-weight: 750;
  }

  .riscos-overdue-label {
    display: block;
    margin-top: 4px;
    color: #dc2626;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .4px;
    text-transform: uppercase;
  }

  .riscos-status-cell {
    min-width: 105px;
  }

  .riscos-table-action-head,
  .riscos-table-action-cell {
    text-align: center !important;
  }

  .riscos-open-button {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #eff6ff;
    color: #2563eb;
    cursor: pointer;
    transition: transform .15s ease, background .15s ease;
  }

  .riscos-open-button:hover {
    transform: translateY(-1px);
    background: #dbeafe;
  }

  .riscos-state-box {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 30px;
    box-sizing: border-box;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    color: #64748b;
    text-align: center;
  }

  .riscos-state-box strong {
    color: #0f172a;
    font-size: 13px;
  }

  .riscos-state-box span {
    max-width: 410px;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.5;
  }

  .riscos-state-error {
    border-color: #fca5a5;
    background: #fef2f2;
    color: #dc2626;
  }

  .riscos-state-error strong {
    color: #991b1b;
  }

  .riscos-state-error span {
    color: #b91c1c;
  }

  .riscos-empty-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    border-radius: 13px;
    background: #eff6ff;
    color: #2563eb;
  }

  .riscos-loading-ring {
    width: 28px;
    height: 28px;
    margin-bottom: 4px;
    border: 3px solid #dbeafe;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: riscosSpin .8s linear infinite;
  }

  @keyframes riscosSpin {
    to { transform: rotate(360deg); }
  }

  .riscos-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .riscos-mobile-card {
    position: relative;
    overflow: hidden;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
  }

  .riscos-mobile-card-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .riscos-mobile-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .riscos-mobile-card-title {
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.4;
  }

  .riscos-mobile-card-location {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    color: #64748b;
    font-size: 9px;
    line-height: 1.4;
  }

  .riscos-mobile-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
    margin-top: 14px;
  }

  .riscos-mobile-meta-grid > div {
    min-width: 0;
    padding: 10px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .riscos-mobile-meta-grid span,
  .riscos-mobile-meta-grid strong {
    display: block;
  }

  .riscos-mobile-meta-grid span,
  .riscos-mobile-control > span {
    color: #94a3b8;
    font-size: 8px;
    font-weight: 750;
    letter-spacing: .3px;
    text-transform: uppercase;
  }

  .riscos-mobile-meta-grid strong {
    margin-top: 3px;
    color: #334155;
    font-size: 9px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .riscos-mobile-overdue {
    color: #dc2626 !important;
  }

  .riscos-mobile-control {
    margin-top: 12px;
    padding: 11px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .riscos-mobile-control p {
    margin: 5px 0 0;
    color: #475569;
    font-size: 10px;
    line-height: 1.5;
  }

  .riscos-mobile-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 12px;
  }

  .riscos-mobile-card-footer button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 9px;
    border: none;
    border-radius: 8px;
    background: #eff6ff;
    color: #2563eb;
    font-family: inherit;
    font-size: 9px;
    font-weight: 750;
    cursor: pointer;
  }

  @media (max-width: 1200px) {
    .riscos-insights-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .riscos-insight-card:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 900px) {
    .riscos-source-banner {
      align-items: flex-start;
    }

    .riscos-insights-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .riscos-insight-card:last-child {
      grid-column: auto;
    }
  }

  @media (max-width: 650px) {
    .riscos-source-banner {
      margin-bottom: 16px;
      padding: 15px;
      border-radius: 13px;
    }

    .riscos-source-icon {
      width: 39px;
      height: 39px;
    }

    .riscos-source-status {
      display: none;
    }

    .riscos-source-copy strong {
      font-size: 12px;
    }

    .riscos-source-copy span {
      font-size: 9px;
    }

    .riscos-insights-grid {
      gap: 12px;
      margin-bottom: 14px;
    }

    .riscos-insight-card {
      padding: 16px;
      border-radius: 14px;
    }

    .riscos-monitor-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .riscos-monitor-header {
      margin-bottom: 16px;
    }

    .riscos-monitor-header h2 {
      font-size: 15px;
    }

    .riscos-monitor-count {
      display: none;
    }

    .riscos-filter-box {
      padding: 13px;
      border-radius: 12px;
    }
  }

  @media (max-width: 430px) {
    .riscos-source-banner {
      gap: 10px;
    }

    .riscos-source-icon {
      width: 36px;
      height: 36px;
    }

    .riscos-control-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .riscos-filter-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .riscos-mobile-meta-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .riscos-mobile-card-head {
      flex-direction: column;
    }
  }
`;
