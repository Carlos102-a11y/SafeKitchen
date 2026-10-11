import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  AlertCircle,
  Boxes,
  CalendarClock,
  FileBadge,
  HardHat,
  Package,
  PackageX,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  X,
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

const CAMPOS_EPI =
  "id, nome, ca, quantidade, validade";

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

export default function Epis() {
  const largura = useViewportWidth();

  const mobile = largura <= 650;
  const tablet = largura <= 900;
  const telaMedia = largura <= 1180;

  const [epis, setEpis] =
    useState<Epi[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erroBanco, setErroBanco] =
    useState("");

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    filtroSituacao,
    setFiltroSituacao,
  ] = useState<FiltroSituacao>("");

  const [
    drawerAberto,
    setDrawerAberto,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Epi | null>(null);

  const [formulario, setFormulario] =
    useState<Epi>(epiInicial);

  /* CARREGAMENTO */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarEpis() {
      setCarregando(true);
      setErroBanco("");

      const { data, error } =
        await supabase
          .from("epis")
          .select(CAMPOS_EPI)
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
        setErroBanco(
          "Não foi possível carregar os EPIs."
        );
        setCarregando(false);
        return;
      }

      setEpis((data ?? []) as Epi[]);
      setCarregando(false);
    }

    void carregarEpis();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  /* DRAWER */

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

  /* INDICADORES */

  const quantidadeTotal = epis.reduce(
    (total, epi) =>
      total + epi.quantidade,
    0
  );

  const estoqueBaixo = epis.filter(
    (epi) =>
      epi.quantidade > 0 &&
      epi.quantidade < 5
  ).length;

  const semEstoque = epis.filter(
    (epi) => epi.quantidade === 0
  ).length;

  const vencidos = epis.filter((epi) =>
    validadeVencida(epi.validade)
  ).length;

  const proximosVencimento = epis.filter(
    (epi) =>
      proximoDoVencimento(epi.validade)
  ).length;

  const itensDisponiveis = epis.filter(
    (epi) =>
      epi.quantidade >= 5 &&
      !validadeVencida(epi.validade)
  ).length;

  const itensAtencao = epis.filter(
    (epi) =>
      epi.quantidade < 5 ||
      validadeVencida(epi.validade) ||
      proximoDoVencimento(epi.validade)
  ).length;

  const coberturaRegular =
    epis.length === 0
      ? 0
      : Math.round(
          (itensDisponiveis /
            epis.length) *
            100
        );

  const unidadesCriticas = epis.reduce(
    (total, epi) =>
      total +
      (epi.quantidade < 5
        ? epi.quantidade
        : 0),
    0
  );

  /* FILTROS */

  const episFiltrados = useMemo(() => {
    const termo = pesquisa
      .trim()
      .toLowerCase();

    return epis.filter((epi) => {
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
    });
  }, [epis, pesquisa, filtroSituacao]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    filtroSituacao !== "";

  /* CRUD */

  function abrirNovoEpi() {
    setEditando(null);
    setErroBanco("");
    setFormulario({ ...epiInicial });
    setDrawerAberto(true);
  }

  function editarEpi(epi: Epi) {
    setEditando(epi);
    setErroBanco("");
    setFormulario({ ...epi });
    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
    setEditando(null);
    setFormulario({ ...epiInicial });
  }

  async function salvarEpi() {
    if (!formulario.nome.trim()) {
      window.alert(
        "Informe o nome do EPI."
      );
      return;
    }

    if (!formulario.ca.trim()) {
      window.alert(
        "Informe o número do CA."
      );
      return;
    }

    if (!formulario.validade) {
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

    setErroBanco("");

    if (editando) {
      const { data, error } =
        await supabase
          .from("epis")
          .update(payload)
          .eq("id", editando.id)
          .select(CAMPOS_EPI)
          .single();

      if (error || !data) {
        console.error(
          "Erro ao atualizar EPI:",
          error
        );
        setErroBanco(
          "Não foi possível atualizar o EPI."
        );
        return;
      }

      const epiAtualizado = data as Epi;

      setEpis((listaAtual) =>
        listaAtual.map((epi) =>
          epi.id === epiAtualizado.id
            ? epiAtualizado
            : epi
        )
      );
    } else {
      const { data, error } =
        await supabase
          .from("epis")
          .insert(payload)
          .select(CAMPOS_EPI)
          .single();

      if (error || !data) {
        console.error(
          "Erro ao cadastrar EPI:",
          error
        );
        setErroBanco(
          "Não foi possível cadastrar o EPI."
        );
        return;
      }

      const novoEpi = data as Epi;

      setEpis((listaAtual) => [
        ...listaAtual,
        novoEpi,
      ]);
    }

    fecharDrawer();
  }

  async function excluirEpi(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este EPI?"
    );

    if (!confirmar) {
      return;
    }

    setErroBanco("");

    const { error } = await supabase
      .from("epis")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao excluir EPI:",
        error
      );
      setErroBanco(
        "Não foi possível excluir o EPI."
      );
      return;
    }

    setEpis((listaAtual) =>
      listaAtual.filter(
        (epi) => epi.id !== id
      )
    );
  }

  function limparFiltros() {
    setPesquisa("");
    setFiltroSituacao("");
  }

  return (
    <main
      className="epis-page"
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
        title="Gestão de EPIs"
        subtitle="Controle de equipamentos de proteção individual, estoque, CA e validade."
        icon={HardHat}
      >
        <Button onClick={abrirNovoEpi}>
          <span className="epi-button-content">
            <Plus size={18} />
            Novo EPI
          </span>
        </Button>
      </PageHeader>

      {erroBanco && (
        <div
          className="epi-error"
          role="alert"
        >
          <div className="epi-error-main">
            <AlertCircle size={18} />
            <span>{erroBanco}</span>
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

      <section className="epi-hero">
        <div className="epi-hero-main">
          <div className="epi-hero-icon">
            <ShieldCheck size={22} />
          </div>

          <div className="epi-hero-copy">
            <span className="epi-eyebrow">
              Controle operacional de proteção
            </span>

            <h2>
              Estoque, validade e CA em uma
              única visão
            </h2>

            <p>
              Acompanhe disponibilidade dos
              equipamentos e identifique itens
              que exigem reposição ou atenção de
              validade.
            </p>
          </div>
        </div>

        <div className="epi-hero-metrics">
          <MetricBox
            label="Cobertura regular"
            value={`${coberturaRegular}%`}
            hint={`${itensDisponiveis} de ${epis.length} itens`}
          />

          <MetricBox
            label="Itens em atenção"
            value={String(itensAtencao)}
            hint="Estoque ou validade"
          />

          <MetricBox
            label="Unidades em estoque crítico"
            value={String(unidadesCriticas)}
            hint="Itens com menos de 5 un."
          />
        </div>
      </section>

      <div
        className="epi-stats-grid"
        style={{
          gridTemplateColumns: mobile
            ? "minmax(0, 1fr)"
            : telaMedia
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
        }}
      >
        <StatCard
          title="EPIs Cadastrados"
          value={epis.length}
          icon={<HardHat size={22} />}
          color="#2563EB"
        />

        <StatCard
          title="Quantidade em Estoque"
          value={quantidadeTotal}
          icon={<Boxes size={22} />}
          color="#16A34A"
        />

        <StatCard
          title="Estoque Baixo"
          value={estoqueBaixo}
          icon={
            <TriangleAlert size={22} />
          }
          color="#F59E0B"
        />

        <StatCard
          title="Sem Estoque"
          value={semEstoque}
          icon={<PackageX size={22} />}
          color="#DC2626"
        />
      </div>

      <div
        className="epi-secondary-grid"
        style={{
          gridTemplateColumns: mobile
            ? "minmax(0, 1fr)"
            : tablet
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(3, minmax(0, 1fr))",
        }}
      >
        <IndicadorSecundario
          titulo="Validades vencidas"
          valor={vencidos}
          texto="Retirar ou regularizar"
          icon={<CalendarClock size={19} />}
          cor="#DC2626"
        />

        <IndicadorSecundario
          titulo="Próximos do vencimento"
          valor={proximosVencimento}
          texto="Janela de até 30 dias"
          icon={
            <TriangleAlert size={19} />
          }
          cor="#D97706"
        />

        <IndicadorSecundario
          titulo="Itens disponíveis"
          valor={itensDisponiveis}
          texto="Estoque ≥ 5 e não vencido"
          icon={<ShieldCheck size={19} />}
          cor="#16A34A"
        />
      </div>

      <section className="epi-priorities">
        <div className="epi-panel-heading">
          <div>
            <span className="epi-eyebrow">
              Prioridades operacionais
            </span>
            <h2>Atenções do controle de EPI</h2>
            <p>
              Pontos que merecem ação antes de
              afetar a disponibilidade dos
              equipamentos.
            </p>
          </div>
        </div>

        <div className="epi-priority-grid">
          <PriorityCard
            title="Sem estoque"
            value={semEstoque}
            text="Itens indisponíveis para uso imediato."
            icon={<PackageX size={18} />}
            tone="danger"
          />

          <PriorityCard
            title="Estoque baixo"
            value={estoqueBaixo}
            text="Itens com apenas 1 a 4 unidades."
            icon={
              <TriangleAlert size={18} />
            }
            tone="warning"
          />

          <PriorityCard
            title="Validade vencida"
            value={vencidos}
            text="Equipamentos fora da validade cadastrada."
            icon={
              <CalendarClock size={18} />
            }
            tone="danger"
          />

          <PriorityCard
            title="Vence em até 30 dias"
            value={proximosVencimento}
            text="Antecipe substituição ou renovação."
            icon={<CalendarClock size={18} />}
            tone="warning"
          />
        </div>
      </section>

      <section className="epi-main-panel">
        <div className="epi-panel-heading epi-panel-heading-row">
          <div>
            <span className="epi-eyebrow">
              Inventário operacional
            </span>
            <h2>Controle de Equipamentos</h2>
            <p>
              Consulte estoque, certificado de
              aprovação e validade dos EPIs.
            </p>
          </div>

          <div className="epi-panel-chip">
            <Package size={14} />
            {epis.length} item(ns) cadastrado(s)
          </div>
        </div>

        <div className="epi-filters">
          <div className="epi-filter-title-row">
            <div className="epi-filter-title">
              <SlidersHorizontal size={16} />
              Filtros de EPIs
            </div>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={limparFiltros}
                className="epi-clear-filter"
              >
                <X size={13} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="epi-filter-grid">
            <div className="epi-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Pesquisar EPI ou CA..."
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />
            </div>

            <select
              value={filtroSituacao}
              onChange={(e) =>
                setFiltroSituacao(
                  e.target
                    .value as FiltroSituacao
                )
              }
              className="epi-select"
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

          <div className="epi-result-count">
            Exibindo <strong>
              {episFiltrados.length}
            </strong>{" "}
            de <strong>{epis.length}</strong>{" "}
            EPI(s)
          </div>
        </div>

        {carregando ? (
          <div className="epi-loading">
            <Package size={22} />
            Carregando equipamentos...
          </div>
        ) : episFiltrados.length === 0 ? (
          <EstadoVazio
            mobile={mobile}
            possuiEpis={epis.length > 0}
            onNovoEpi={abrirNovoEpi}
          />
        ) : mobile ? (
          <div className="epi-mobile-list">
            {episFiltrados.map((epi) => (
              <EpiMobileCard
                key={epi.id}
                epi={epi}
                onEditar={editarEpi}
                onExcluir={excluirEpi}
              />
            ))}
          </div>
        ) : (
          <div className="epi-table-container">
            <table className="epi-table">
              <thead>
                <tr>
                  <Th>EPI</Th>
                  <Th>CA</Th>
                  <Th>Quantidade</Th>
                  <Th>Estoque</Th>
                  <Th>Validade</Th>
                  <Th>Situação</Th>
                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {episFiltrados.map((epi) => (
                  <tr key={epi.id}>
                    <Td>
                      <div className="epi-name-cell">
                        <div className="epi-item-icon">
                          <HardHat size={19} />
                        </div>
                        <div>
                          <strong>{epi.nome}</strong>
                          <span>
                            Equipamento de proteção
                          </span>
                        </div>
                      </div>
                    </Td>

                    <Td>
                      <div className="epi-ca-cell">
                        <FileBadge size={15} />
                        <span>
                          {epi.ca ||
                            "Não informado"}
                        </span>
                      </div>
                    </Td>

                    <Td>
                      <div className="epi-quantity">
                        {epi.quantidade}
                        <span>un.</span>
                      </div>
                    </Td>

                    <Td>
                      <EstoqueBadge epi={epi} />
                    </Td>

                    <Td>
                      <div
                        className={
                          validadeVencida(
                            epi.validade
                          )
                            ? "epi-date epi-date-danger"
                            : "epi-date"
                        }
                      >
                        <CalendarClock size={15} />
                        {formatarData(
                          epi.validade
                        )}
                      </div>
                    </Td>

                    <Td>
                      <ValidadeBadge epi={epi} />
                    </Td>

                    <Td align="center">
                      <div className="epi-actions">
                        <button
                          type="button"
                          title="Editar EPI"
                          aria-label="Editar EPI"
                          onClick={() =>
                            editarEpi(epi)
                          }
                          className="epi-action epi-action-edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title="Excluir EPI"
                          aria-label="Excluir EPI"
                          onClick={() =>
                            void excluirEpi(
                              epi.id
                            )
                          }
                          className="epi-action epi-action-delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawerAberto && (
        <div
          className="epi-drawer-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="epi-drawer">
            <header className="epi-drawer-header">
              <div className="epi-drawer-header-main">
                <div className="epi-drawer-icon">
                  <HardHat size={22} />
                </div>

                <div className="epi-drawer-title">
                  <span className="epi-drawer-eyebrow">
                    Cadastro operacional
                  </span>
                  <h2>
                    {editando
                      ? "Editar EPI"
                      : "Novo EPI"}
                  </h2>
                  <p>
                    Controle de estoque, CA e
                    validade do equipamento.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharDrawer}
                aria-label="Fechar formulário"
                className="epi-drawer-close"
              >
                <X size={19} />
              </button>
            </header>

            <div className="epi-drawer-summary">
              <div className="epi-drawer-summary-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>
                  Controle de disponibilidade
                </strong>
                <span>
                  Estoque e validade são avaliados
                  automaticamente conforme os
                  dados informados.
                </span>
              </div>
            </div>

            <div className="epi-drawer-content">
              <Secao
                numero="01"
                titulo="Identificação"
                descricao="Informe o equipamento e seu Certificado de Aprovação."
              >
                <Campo
                  label="Nome do EPI"
                  obrigatorio
                  placeholder="Ex.: Luva térmica"
                  value={formulario.nome}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,
                      nome: valor,
                    })
                  }
                />

                <Campo
                  label="Número do CA"
                  obrigatorio
                  placeholder="Ex.: 12345"
                  value={formulario.ca}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,
                      ca: valor,
                    })
                  }
                />
              </Secao>

              <Secao
                numero="02"
                titulo="Controle de estoque"
                descricao="Informe a quantidade disponível atualmente."
              >
                <Campo
                  label="Quantidade"
                  obrigatorio
                  type="number"
                  value={String(
                    formulario.quantidade
                  )}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,
                      quantidade: Math.max(
                        0,
                        Number(valor)
                      ),
                    })
                  }
                />

                <div className="epi-stock-summary">
                  <div>
                    <span>Situação do estoque</span>
                    <strong>
                      {formulario.quantidade}{" "}
                      <small>un.</small>
                    </strong>
                  </div>
                  <EstoqueBadge
                    epi={formulario}
                  />
                </div>

                <div className="epi-rule-note">
                  <span>0</span> sem estoque
                  <span>1–4</span> estoque baixo
                  <span>5+</span> disponível
                </div>
              </Secao>

              <Secao
                numero="03"
                titulo="Validade"
                descricao="Registre a data limite de utilização do equipamento."
              >
                <Campo
                  label="Data de validade"
                  obrigatorio
                  type="date"
                  value={formulario.validade}
                  onChange={(valor) =>
                    setFormulario({
                      ...formulario,
                      validade: valor,
                    })
                  }
                />

                {formulario.validade && (
                  <ValidadePreview
                    validade={
                      formulario.validade
                    }
                  />
                )}
              </Secao>
            </div>

            <footer className="epi-drawer-footer">
              <Button
                onClick={fecharDrawer}
                color="#64748B"
              >
                Cancelar
              </Button>

              <Button onClick={salvarEpi}>
                {editando
                  ? "Salvar alterações"
                  : "Cadastrar EPI"}
              </Button>
            </footer>
          </aside>
        </div>
      )}

      <style>{estilos}</style>
    </main>
  );
}

function MetricBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="epi-metric-box">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function IndicadorSecundario({
  titulo,
  valor,
  texto,
  icon,
  cor,
}: {
  titulo: string;
  valor: number;
  texto: string;
  icon: ReactNode;
  cor: string;
}) {
  return (
    <div className="epi-secondary-card">
      <div
        className="epi-secondary-icon"
        style={{
          background: `${cor}12`,
          color: cor,
        }}
      >
        {icon}
      </div>

      <div className="epi-secondary-copy">
        <span>{titulo}</span>
        <strong>{valor}</strong>
        <small>{texto}</small>
      </div>
    </div>
  );
}

function PriorityCard({
  title,
  value,
  text,
  icon,
  tone,
}: {
  title: string;
  value: number;
  text: string;
  icon: ReactNode;
  tone: "danger" | "warning";
}) {
  return (
    <div
      className={`epi-priority-card epi-priority-${tone}`}
    >
      <div className="epi-priority-top">
        <div className="epi-priority-icon">
          {icon}
        </div>
        <strong>{value}</strong>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function EpiMobileCard({
  epi,
  onEditar,
  onExcluir,
}: {
  epi: Epi;
  onEditar: (epi: Epi) => void;
  onExcluir: (id: number) => void;
}) {
  return (
    <article
      className={`epi-mobile-card ${
        validadeVencida(epi.validade) ||
        epi.quantidade === 0
          ? "epi-mobile-card-danger"
          : proximoDoVencimento(
                epi.validade
              ) || epi.quantidade < 5
            ? "epi-mobile-card-warning"
            : ""
      }`}
    >
      <div className="epi-mobile-header">
        <div className="epi-name-cell">
          <div className="epi-item-icon">
            <HardHat size={18} />
          </div>
          <div>
            <strong>{epi.nome}</strong>
            <span>CA {epi.ca}</span>
          </div>
        </div>

        <ValidadeBadge epi={epi} />
      </div>

      <div className="epi-mobile-data-grid">
        <div>
          <span>Quantidade</span>
          <strong>
            {epi.quantidade} un.
          </strong>
        </div>
        <div>
          <span>Estoque</span>
          <EstoqueBadge epi={epi} />
        </div>
        <div>
          <span>Validade</span>
          <strong>
            {formatarData(epi.validade)}
          </strong>
        </div>
      </div>

      <div className="epi-mobile-actions">
        <button
          type="button"
          onClick={() => onEditar(epi)}
          className="epi-mobile-edit"
        >
          <Pencil size={15} />
          Editar
        </button>

        <button
          type="button"
          onClick={() =>
            void onExcluir(epi.id)
          }
          className="epi-mobile-delete"
        >
          <Trash2 size={15} />
          Excluir
        </button>
      </div>
    </article>
  );
}

function EstoqueBadge({ epi }: { epi: Epi }) {
  if (epi.quantidade === 0) {
    return <Badge color="red">Sem estoque</Badge>;
  }

  if (epi.quantidade < 5) {
    return (
      <Badge color="yellow">
        Estoque baixo
      </Badge>
    );
  }

  return <Badge color="green">Normal</Badge>;
}

function ValidadeBadge({ epi }: { epi: Epi }) {
  if (validadeVencida(epi.validade)) {
    return <Badge color="red">Vencido</Badge>;
  }

  if (proximoDoVencimento(epi.validade)) {
    return (
      <Badge color="yellow">
        Próximo do vencimento
      </Badge>
    );
  }

  return <Badge color="green">Regular</Badge>;
}

function ValidadePreview({
  validade,
}: {
  validade: string;
}) {
  if (validadeVencida(validade)) {
    return (
      <Aviso
        titulo="Validade vencida"
        texto="Este equipamento já ultrapassou a data de validade cadastrada."
        cor="#DC2626"
      />
    );
  }

  if (proximoDoVencimento(validade)) {
    return (
      <Aviso
        titulo="Validade próxima"
        texto="Este equipamento vence nos próximos 30 dias."
        cor="#D97706"
      />
    );
  }

  return (
    <Aviso
      titulo="Validade regular"
      texto="A validade cadastrada está dentro do período regular."
      cor="#16A34A"
    />
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
    <section className="epi-form-section">
      <div className="epi-form-section-header">
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
    <div className="epi-field">
      <label>
        {label}
        {obrigatorio && <span>*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        onChange={(e) =>
          onChange(e.target.value)
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
      className="epi-validity-notice"
      style={{
        borderColor: `${cor}35`,
        background: `${cor}09`,
      }}
    >
      <div style={{ color: cor }}>
        {titulo}
      </div>
      <span>{texto}</span>
    </div>
  );
}

function EstadoVazio({
  mobile = false,
  possuiEpis,
  onNovoEpi,
}: {
  mobile?: boolean;
  possuiEpis: boolean;
  onNovoEpi: () => void;
}) {
  return (
    <div
      className="epi-empty"
      style={{
        minHeight: mobile ? 210 : 250,
      }}
    >
      <div className="epi-empty-icon">
        <Package size={25} />
      </div>

      <strong>
        {possuiEpis
          ? "Nenhum EPI corresponde aos filtros"
          : "Nenhum EPI cadastrado"}
      </strong>

      <span>
        {possuiEpis
          ? "Altere os filtros para visualizar outros equipamentos."
          : "Cadastre o primeiro equipamento para iniciar o controle de estoque e validade."}
      </span>

      {!possuiEpis && (
        <Button onClick={onNovoEpi}>
          Cadastrar primeiro EPI
        </Button>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th style={{ textAlign: align }}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <td style={{ textAlign: align }}>
      {children}
    </td>
  );
}

function verificarSituacao(
  epi: Epi,
  filtro: FiltroSituacao
) {
  if (filtro === "sem-estoque") {
    return epi.quantidade === 0;
  }

  if (filtro === "baixo") {
    return (
      epi.quantidade > 0 &&
      epi.quantidade < 5
    );
  }

  if (filtro === "vencido") {
    return validadeVencida(epi.validade);
  }

  if (filtro === "proximo-vencimento") {
    return proximoDoVencimento(
      epi.validade
    );
  }

  if (filtro === "normal") {
    return (
      epi.quantidade >= 5 &&
      !validadeVencida(epi.validade)
    );
  }

  return true;
}

function validadeVencida(validade: string) {
  if (!validade) {
    return false;
  }

  const data = new Date(
    `${validade}T23:59:59`
  );

  return (
    data.getTime() < new Date().getTime()
  );
}

function proximoDoVencimento(
  validade: string
) {
  if (!validade) {
    return false;
  }

  const hoje = new Date();
  const dataValidade = new Date(
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
    (1000 * 60 * 60 * 24);

  return dias <= 30;
}

function formatarData(data: string) {
  if (!data) {
    return "Não informada";
  }

  const [ano, mes, dia] =
    data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

const estilos = `
  .epis-page {
    --epi-border: #e2e8f0;
    --epi-text: #334155;
    --epi-muted: #64748b;
    --epi-title: #0f172a;
    --epi-blue: #2563eb;
  }

  .epi-button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .epi-error {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 20px;
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

  .epi-error-main {
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }

  .epi-error-main svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .epi-error button {
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

  .epi-hero {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(420px, 1fr);
    gap: 22px;
    margin-bottom: 24px;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid #dbeafe;
    border-radius: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 60%, #eff6ff 100%);
    box-shadow: 0 10px 30px rgba(15, 23, 42, .05);
  }

  .epi-hero-main {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    min-width: 0;
  }

  .epi-hero-icon {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 13px;
    background: #dbeafe;
    color: #1d4ed8;
  }

  .epi-hero-copy {
    min-width: 0;
  }

  .epi-eyebrow {
    display: block;
    color: #2563eb;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .7px;
    text-transform: uppercase;
  }

  .epi-hero-copy h2,
  .epi-panel-heading h2 {
    margin: 6px 0 0;
    color: var(--epi-title);
    font-size: 19px;
    font-weight: 850;
    line-height: 1.3;
  }

  .epi-hero-copy p,
  .epi-panel-heading p {
    margin: 7px 0 0;
    max-width: 660px;
    color: var(--epi-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .epi-hero-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    min-width: 0;
  }

  .epi-metric-box {
    min-width: 0;
    padding: 14px;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background: rgba(255,255,255,.78);
  }

  .epi-metric-box span {
    display: block;
    min-height: 29px;
    color: #64748b;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.4;
  }

  .epi-metric-box strong {
    display: block;
    margin-top: 4px;
    color: #0f172a;
    font-size: 22px;
    font-weight: 850;
  }

  .epi-metric-box small {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.35;
  }

  .epi-stats-grid,
  .epi-secondary-grid {
    width: 100%;
    min-width: 0;
    display: grid;
    gap: 16px;
  }

  .epi-stats-grid {
    margin-bottom: 16px;
  }

  .epi-secondary-grid {
    margin-bottom: 24px;
  }

  .epi-secondary-card {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 15px 17px;
    box-sizing: border-box;
    border: 1px solid var(--epi-border);
    border-radius: 13px;
    background: #ffffff;
  }

  .epi-secondary-icon {
    width: 39px;
    height: 39px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
  }

  .epi-secondary-copy {
    min-width: 0;
  }

  .epi-secondary-copy > span {
    display: block;
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
  }

  .epi-secondary-copy strong {
    display: block;
    margin-top: 2px;
    color: #0f172a;
    font-size: 20px;
    font-weight: 850;
  }

  .epi-secondary-copy small {
    display: block;
    margin-top: 2px;
    color: #94a3b8;
    font-size: 9px;
  }

  .epi-priorities,
  .epi-main-panel {
    width: 100%;
    min-width: 0;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid var(--epi-border);
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
  }

  .epi-priorities {
    margin-bottom: 22px;
  }

  .epi-panel-heading {
    min-width: 0;
    margin-bottom: 18px;
  }

  .epi-panel-heading-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .epi-panel-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    padding: 8px 11px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
  }

  .epi-priority-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .epi-priority-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .epi-priority-danger {
    border-color: #fecaca;
    background: #fffafa;
  }

  .epi-priority-warning {
    border-color: #fde68a;
    background: #fffdf7;
  }

  .epi-priority-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .epi-priority-icon {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: #f8fafc;
    color: #64748b;
  }

  .epi-priority-danger .epi-priority-icon {
    background: #fef2f2;
    color: #dc2626;
  }

  .epi-priority-warning .epi-priority-icon {
    background: #fffbeb;
    color: #d97706;
  }

  .epi-priority-top strong {
    color: #0f172a;
    font-size: 24px;
    font-weight: 850;
  }

  .epi-priority-card h3 {
    margin: 12px 0 0;
    color: #0f172a;
    font-size: 12px;
    font-weight: 800;
  }

  .epi-priority-card p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 10px;
    line-height: 1.5;
  }

  .epi-filters {
    width: 100%;
    min-width: 0;
    margin-bottom: 20px;
    padding: 16px;
    box-sizing: border-box;
    border: 1px solid var(--epi-border);
    border-radius: 13px;
    background: #f8fafc;
  }

  .epi-filter-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 13px;
  }

  .epi-filter-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #475569;
    font-size: 12px;
    font-weight: 750;
  }

  .epi-clear-filter {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: none;
    background: transparent;
    color: #2563eb;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .epi-filter-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(210px, 250px);
    gap: 12px;
  }

  .epi-search {
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

  .epi-search svg {
    flex-shrink: 0;
  }

  .epi-search input {
    width: 100%;
    min-width: 0;
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
  }

  .epi-select {
    width: 100%;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    color: #475569;
    font: inherit;
    font-size: 11px;
    font-weight: 650;
    outline: none;
    cursor: pointer;
  }

  .epi-result-count {
    margin-top: 10px;
    color: #64748b;
    font-size: 10px;
    line-height: 1.5;
  }

  .epi-result-count strong {
    color: #0f172a;
  }

  .epi-loading {
    width: 100%;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 650;
  }

  .epi-table-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border: 1px solid var(--epi-border);
    border-radius: 14px;
    -webkit-overflow-scrolling: touch;
  }

  .epi-table {
    width: 100%;
    min-width: 960px;
    border-collapse: collapse;
  }

  .epi-table thead tr {
    background: #f8fafc;
  }

  .epi-table th {
    padding: 14px 16px;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .5px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .epi-table td {
    padding: 16px;
    vertical-align: middle;
    color: #475569;
    font-size: 12px;
  }

  .epi-table tbody tr {
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
    transition: background .15s ease;
  }

  .epi-table tbody tr:hover {
    background: #fbfdff;
  }

  .epi-name-cell {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 200px;
  }

  .epi-item-icon {
    width: 39px;
    height: 39px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
  }

  .epi-name-cell > div:last-child {
    min-width: 0;
  }

  .epi-name-cell strong {
    display: block;
    color: #0f172a;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .epi-name-cell span {
    display: block;
    margin-top: 3px;
    color: #94a3b8;
    font-size: 10px;
  }

  .epi-ca-cell,
  .epi-date {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 110px;
    color: #475569;
  }

  .epi-ca-cell svg,
  .epi-date svg {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .epi-date {
    min-width: 120px;
    white-space: nowrap;
  }

  .epi-date-danger {
    color: #dc2626;
    font-weight: 700;
  }

  .epi-date-danger svg {
    color: #dc2626;
  }

  .epi-quantity {
    min-width: 85px;
    color: #0f172a;
    font-size: 17px;
    font-weight: 850;
  }

  .epi-quantity span {
    margin-left: 4px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 650;
  }

  .epi-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-width: 80px;
  }

  .epi-action {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    transition: transform .15s ease;
  }

  .epi-action:hover {
    transform: translateY(-1px);
  }

  .epi-action-edit {
    background: #eff6ff;
    color: #2563eb;
  }

  .epi-action-delete {
    background: #fef2f2;
    color: #dc2626;
  }

  .epi-empty {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    box-sizing: border-box;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    text-align: center;
  }

  .epi-empty-icon {
    width: 53px;
    height: 53px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 13px;
    border-radius: 14px;
    background: #eff6ff;
    color: #2563eb;
  }

  .epi-empty > strong {
    color: #0f172a;
    font-size: 14px;
  }

  .epi-empty > span {
    max-width: 390px;
    margin: 6px 0 16px;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.5;
  }

  .epi-mobile-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 11px;
  }

  .epi-mobile-card {
    position: relative;
    overflow: hidden;
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .epi-mobile-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #16a34a;
  }

  .epi-mobile-card-warning::before {
    background: #f59e0b;
  }

  .epi-mobile-card-danger::before {
    background: #dc2626;
  }

  .epi-mobile-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .epi-mobile-header .epi-name-cell {
    min-width: 0;
    flex: 1;
  }

  .epi-mobile-data-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .epi-mobile-data-grid > div {
    min-width: 0;
    padding: 10px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .epi-mobile-data-grid > div > span {
    display: block;
    margin-bottom: 5px;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .epi-mobile-data-grid > div > strong {
    color: #334155;
    font-size: 11px;
  }

  .epi-mobile-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }

  .epi-mobile-actions button {
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: none;
    border-radius: 9px;
    font: inherit;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .epi-mobile-edit {
    background: #eff6ff;
    color: #2563eb;
  }

  .epi-mobile-delete {
    background: #fef2f2;
    color: #dc2626;
  }

  .epi-drawer-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, .50);
    backdrop-filter: blur(4px);
    z-index: 2000;
  }

  .epi-drawer {
    width: 540px;
    max-width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: -18px 0 50px rgba(15, 23, 42, .18);
    overflow: hidden;
    animation: epiDrawerIn .2s ease-out;
  }

  .epi-drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 23px 25px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .epi-drawer-header-main {
    display: flex;
    gap: 12px;
    min-width: 0;
  }

  .epi-drawer-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 12px;
    background: #eff6ff;
    color: #2563eb;
  }

  .epi-drawer-title {
    min-width: 0;
  }

  .epi-drawer-eyebrow {
    display: block;
    margin-bottom: 3px;
    color: #2563eb;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .6px;
    text-transform: uppercase;
  }

  .epi-drawer-title h2 {
    margin: 0;
    color: #0f172a;
    font-size: 20px;
    font-weight: 850;
  }

  .epi-drawer-title p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
  }

  .epi-drawer-close {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    color: #64748b;
    cursor: pointer;
  }

  .epi-drawer-summary {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 18px 25px 0;
    padding: 13px;
    border: 1px solid #dbeafe;
    border-radius: 11px;
    background: #f8fbff;
  }

  .epi-drawer-summary-icon {
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

  .epi-drawer-summary strong {
    display: block;
    color: #1e3a8a;
    font-size: 11px;
    font-weight: 800;
  }

  .epi-drawer-summary span {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 10px;
    line-height: 1.45;
  }

  .epi-drawer-content {
    flex: 1;
    min-height: 0;
    padding: 20px 25px 28px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .epi-form-section {
    width: 100%;
    min-width: 0;
    margin-bottom: 17px;
    padding: 17px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .epi-form-section-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
  }

  .epi-form-section-header > span {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 9px;
    font-weight: 850;
  }

  .epi-form-section-header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 13px;
    font-weight: 850;
  }

  .epi-form-section-header p {
    margin: 3px 0 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.45;
  }

  .epi-field {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 13px;
  }

  .epi-field:last-child {
    margin-bottom: 0;
  }

  .epi-field label {
    color: #334155;
    font-size: 11px;
    font-weight: 750;
  }

  .epi-field label span {
    margin-left: 3px;
    color: #dc2626;
  }

  .epi-field input {
    width: 100%;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
  }

  .epi-field input:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);
  }

  .epi-stock-summary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 11px;
    background: #f8fafc;
  }

  .epi-stock-summary > div > span {
    display: block;
    color: #64748b;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .epi-stock-summary > div > strong {
    display: block;
    margin-top: 3px;
    color: #0f172a;
    font-size: 22px;
    font-weight: 850;
  }

  .epi-stock-summary small {
    color: #64748b;
    font-size: 10px;
  }

  .epi-rule-note {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    color: #94a3b8;
    font-size: 9px;
    line-height: 1.4;
  }

  .epi-rule-note span {
    padding: 3px 6px;
    border-radius: 6px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 800;
  }

  .epi-validity-notice {
    width: 100%;
    min-width: 0;
    padding: 13px;
    box-sizing: border-box;
    border: 1px solid;
    border-radius: 10px;
  }

  .epi-validity-notice > div {
    font-size: 11px;
    font-weight: 800;
  }

  .epi-validity-notice span {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 10px;
    line-height: 1.45;
  }

  .epi-drawer-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
    padding: 16px 25px;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
  }

  @keyframes epiDrawerIn {
    from {
      transform: translateX(24px);
      opacity: .7;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 1180px) {
    .epi-hero {
      grid-template-columns: minmax(0, 1fr);
    }

    .epi-priority-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .epi-hero-metrics {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 650px) {
    .epi-hero,
    .epi-priorities,
    .epi-main-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .epi-hero-main {
      gap: 11px;
    }

    .epi-hero-icon {
      width: 40px;
      height: 40px;
      border-radius: 11px;
    }

    .epi-hero-copy h2,
    .epi-panel-heading h2 {
      font-size: 16px;
    }

    .epi-hero-metrics {
      grid-template-columns: minmax(0, 1fr);
    }

    .epi-metric-box span {
      min-height: auto;
    }

    .epi-priority-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .epi-panel-heading-row {
      flex-direction: column;
      gap: 11px;
    }

    .epi-filter-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .epi-drawer {
      width: 100%;
      max-width: none;
    }

    .epi-drawer-header {
      padding: 18px 16px 16px;
      gap: 12px;
    }

    .epi-drawer-summary {
      margin: 14px 16px 0;
    }

    .epi-drawer-content {
      padding: 16px 16px 24px;
    }

    .epi-drawer-footer {
      padding: 14px 16px;
      padding-bottom: max(14px, env(safe-area-inset-bottom));
    }

    .epi-drawer-footer > * {
      flex: 1 1 0;
    }
  }

  @media (max-width: 430px) {
    .epi-filter-title-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .epi-mobile-data-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .epi-mobile-header {
      flex-direction: column;
    }

    .epi-drawer-header {
      padding: 16px 14px 14px;
    }

    .epi-drawer-summary {
      margin: 12px 14px 0;
    }

    .epi-drawer-content {
      padding: 14px 14px 22px;
    }

    .epi-form-section {
      padding: 14px;
    }

    .epi-stock-summary {
      align-items: flex-start;
      flex-direction: column;
    }

    .epi-drawer-footer {
      flex-direction: column;
      align-items: stretch;
      padding: 12px 14px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
    }

    .epi-drawer-footer > * {
      width: 100%;
    }
  }
`;
