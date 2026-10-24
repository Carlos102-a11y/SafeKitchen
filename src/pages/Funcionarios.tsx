import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import type { ReactNode } from "react";
  
  import {
    AlertCircle,
    CalendarDays,
    CircleCheckBig,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
    UserRound,
    Users,
    X,
  } from "lucide-react";
  
  import PageHeader from "../components/ui/PageHeader";
  import StatCard from "../components/ui/StatCard";
  import Button from "../components/ui/Button";
  import Badge from "../components/ui/Badge";
  
  import { useViewportWidth } from "../hooks/useViewportWidth";
  
  import {
    atualizarFuncionario,
    criarFuncionario,
    excluirFuncionario,
    listarFuncionarios,
  } from "../services/funcionariosService";
  
  import type {
    Funcionario,
    FuncionarioEntrada,
    SituacaoFuncionario,
  } from "../models/Funcionario";
  
  type FiltroSituacao = "" | SituacaoFuncionario;
  
  const formularioInicial: FuncionarioEntrada = {
    nome: "",
    matricula: "",
    setor: "",
    funcao: "",
    dataAdmissao: "",
    dataDesligamento: "",
    situacao: "ativo",
    observacoes: "",
  };
  
  function paraEntrada(funcionario: Funcionario): FuncionarioEntrada {
    return {
      nome: funcionario.nome,
      matricula: funcionario.matricula,
      setor: funcionario.setor,
      funcao: funcionario.funcao,
      dataAdmissao: funcionario.dataAdmissao,
      dataDesligamento: funcionario.dataDesligamento,
      situacao: funcionario.situacao,
      observacoes: funcionario.observacoes,
    };
  }
  
  function normalizar(texto: string) {
    return texto.trim().toLowerCase();
  }
  
  function validarFormulario(formulario: FuncionarioEntrada) {
    if (!formulario.nome.trim()) {
      return "Informe o nome do funcionário.";
    }
  
    if (
      formulario.situacao === "desligado" &&
      formulario.dataAdmissao &&
      formulario.dataDesligamento &&
      formulario.dataDesligamento < formulario.dataAdmissao
    ) {
      return "A data de desligamento não pode ser anterior à data de admissão.";
    }
  
    return "";
  }
  
  function formatarData(data: string, vazio = "Não informada") {
    if (!data) {
      return vazio;
    }
  
    const [ano, mes, dia] = data.split("-");
  
    if (!ano || !mes || !dia) {
      return data;
    }
  
    return `${dia}/${mes}/${ano}`;
  }
  
  export default function Funcionarios() {
    const largura = useViewportWidth();
  
    const mobile = largura <= 650;
    const tablet = largura <= 900;
    const telaMedia = largura <= 1180;
  
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tentativa, setTentativa] = useState(0);
  
    const [pesquisa, setPesquisa] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("");
    const [filtroSetor, setFiltroSetor] = useState("");
  
    const [drawerAberto, setDrawerAberto] = useState(false);
    const [editando, setEditando] = useState<Funcionario | null>(null);
    const [formulario, setFormulario] =
      useState<FuncionarioEntrada>(formularioInicial);
    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
  
    /* CARREGAMENTO */
  
    useEffect(() => {
      let componenteAtivo = true;
  
      async function carregar() {
        const resultado = await listarFuncionarios();
  
        if (!componenteAtivo) {
          return;
        }
  
        if (resultado.erro || !resultado.data) {
          setFuncionarios([]);
          setErroLista(
            resultado.erro ?? "Não foi possível carregar os funcionários."
          );
        } else {
          setFuncionarios(resultado.data);
        }
  
        setCarregando(false);
      }
  
      void carregar();
  
      return () => {
        componenteAtivo = false;
      };
    }, [tentativa]);
  
    /* MENSAGEM DE SUCESSO TEMPORÁRIA */
  
    useEffect(() => {
      if (!mensagem) {
        return;
      }
  
      const temporizador = window.setTimeout(() => {
        setMensagem("");
      }, 5000);
  
      return () => {
        window.clearTimeout(temporizador);
      };
    }, [mensagem]);
  
    /* DRAWER */
  
    const fecharDrawer = useCallback(() => {
      setDrawerAberto(false);
      setEditando(null);
      setErroFormulario("");
      setFormulario(formularioInicial);
    }, []);
  
    useEffect(() => {
      if (!drawerAberto) {
        return;
      }
  
      const overflowAnterior = document.body.style.overflow;
  
      document.body.style.overflow = "hidden";
  
      function fecharComEsc(evento: KeyboardEvent) {
        if (evento.key === "Escape") {
          fecharDrawer();
        }
      }
  
      window.addEventListener("keydown", fecharComEsc);
  
      return () => {
        document.body.style.overflow = overflowAnterior;
        window.removeEventListener("keydown", fecharComEsc);
      };
    }, [drawerAberto, fecharDrawer]);
  
    /* INDICADORES (dados reais) */
  
    const totalAtivos = funcionarios.filter(
      (funcionario) => funcionario.situacao === "ativo"
    ).length;
  
    const totalDesligados = funcionarios.length - totalAtivos;
  
    const totalIncompletos = funcionarios.filter(
      (funcionario) =>
        funcionario.situacao === "ativo" &&
        (!funcionario.setor || !funcionario.funcao)
    ).length;
  
    const setores = useMemo(
      () =>
        Array.from(
          new Set(
            funcionarios
              .map((funcionario) => funcionario.setor)
              .filter((setor) => setor !== "")
          )
        ).sort((a, b) => a.localeCompare(b, "pt-BR")),
      [funcionarios]
    );
  
    /* FILTROS */
  
    const funcionariosFiltrados = useMemo(() => {
      const termo = normalizar(pesquisa);
  
      return funcionarios.filter((funcionario) => {
        const correspondePesquisa =
          !termo ||
          funcionario.nome.toLowerCase().includes(termo) ||
          funcionario.matricula.toLowerCase().includes(termo) ||
          funcionario.setor.toLowerCase().includes(termo) ||
          funcionario.funcao.toLowerCase().includes(termo);
  
        const correspondeSituacao =
          !filtroSituacao || funcionario.situacao === filtroSituacao;
  
        const correspondeSetor =
          !filtroSetor || funcionario.setor === filtroSetor;
  
        return correspondePesquisa && correspondeSituacao && correspondeSetor;
      });
    }, [funcionarios, pesquisa, filtroSituacao, filtroSetor]);
  
    const filtrosAtivos =
      pesquisa.trim() !== "" || filtroSituacao !== "" || filtroSetor !== "";
  
    /* AVISO DE NOME REPETIDO (não bloqueia homônimos) */
  
    const nomeRepetido = useMemo(() => {
      const nome = normalizar(formulario.nome);
  
      if (!nome) {
        return false;
      }
  
      return funcionarios.some(
        (funcionario) =>
          funcionario.id !== (editando?.id ?? 0) &&
          normalizar(funcionario.nome) === nome
      );
    }, [formulario.nome, funcionarios, editando]);
  
    /* AÇÕES */
  
    function abrirNovo() {
      setEditando(null);
      setErroFormulario("");
      setFormulario(formularioInicial);
      setDrawerAberto(true);
    }
  
    function abrirEdicao(funcionario: Funcionario) {
      setEditando(funcionario);
      setErroFormulario("");
      setFormulario(paraEntrada(funcionario));
      setDrawerAberto(true);
    }
  
    function limparFiltros() {
      setPesquisa("");
      setFiltroSituacao("");
      setFiltroSetor("");
    }
  
    function tentarNovamente() {
      setErroLista("");
      setCarregando(true);
      setTentativa((valor) => valor + 1);
    }
  
    async function salvar() {
      if (salvando) {
        return;
      }
  
      const erroValidacao = validarFormulario(formulario);
  
      if (erroValidacao) {
        setErroFormulario(erroValidacao);
        return;
      }
  
      setSalvando(true);
      setErroFormulario("");
  
      const idEditando = editando?.id ?? null;
  
      const resultado =
        idEditando !== null
          ? await atualizarFuncionario(idEditando, formulario)
          : await criarFuncionario(formulario);
  
      setSalvando(false);
  
      if (resultado.erro || !resultado.data) {
        setErroFormulario(
          resultado.erro ?? "Não foi possível salvar o funcionário."
        );
        return;
      }
  
      const salvo = resultado.data;
  
      setFuncionarios((listaAtual) =>
        idEditando !== null
          ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
          : [...listaAtual, salvo].sort((a, b) =>
              a.nome.localeCompare(b.nome, "pt-BR")
            )
      );
  
      setMensagem(
        idEditando !== null
          ? "Funcionário atualizado com sucesso."
          : "Funcionário cadastrado com sucesso."
      );
  
      fecharDrawer();
    }
  
    async function excluir(funcionario: Funcionario) {
      const confirmar = window.confirm(
        `Deseja realmente excluir "${funcionario.nome}"? Os acidentes já registrados manterão o nome informado, sem o vínculo com o cadastro.`
      );
  
      if (!confirmar) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await excluirFuncionario(funcionario.id);
  
      if (resultado.erro) {
        setErroAcao(resultado.erro);
        return;
      }
  
      setFuncionarios((listaAtual) =>
        listaAtual.filter((item) => item.id !== funcionario.id)
      );
  
      setMensagem("Funcionário excluído com sucesso.");
    }
  
    /* CONTEÚDO DA LISTA */
  
    function renderizarConteudo() {
      if (carregando) {
        return (
          <div className="func-loading">
            <Users size={22} />
            Carregando funcionários...
          </div>
        );
      }
  
      if (erroLista) {
        return (
          <EstadoVazio
            titulo="Não foi possível carregar os funcionários"
            texto={erroLista}
            acao={<Button onClick={tentarNovamente}>Tentar novamente</Button>}
            mobile={mobile}
          />
        );
      }
  
      if (funcionarios.length === 0) {
        return (
          <EstadoVazio
            titulo="Nenhum funcionário cadastrado"
            texto="Cadastre os funcionários para vinculá-los a acidentes, afastamentos e documentos de SST."
            acao={<Button onClick={abrirNovo}>Cadastrar primeiro funcionário</Button>}
            mobile={mobile}
          />
        );
      }
  
      if (funcionariosFiltrados.length === 0) {
        return (
          <EstadoVazio
            titulo="Nenhum funcionário corresponde aos filtros"
            texto="Altere a pesquisa ou os filtros para visualizar outros registros."
            mobile={mobile}
          />
        );
      }
  
      if (mobile) {
        return (
          <div className="func-mobile-list">
            {funcionariosFiltrados.map((funcionario) => (
              <article
                key={funcionario.id}
                className={`func-mobile-card ${
                  funcionario.situacao === "desligado"
                    ? "func-mobile-card-off"
                    : ""
                }`}
              >
                <div className="func-mobile-header">
                  <div className="func-person">
                    <div className="func-avatar">
                      <UserRound size={18} />
                    </div>
  
                    <div>
                      <strong>{funcionario.nome}</strong>
                      <span>
                        {funcionario.matricula
                          ? `Matrícula ${funcionario.matricula}`
                          : "Sem matrícula"}
                      </span>
                    </div>
                  </div>
  
                  <SituacaoBadge situacao={funcionario.situacao} />
                </div>
  
                <div className="func-mobile-data">
                  <div>
                    <span>Setor</span>
                    <strong>{funcionario.setor || "Não informado"}</strong>
                  </div>
  
                  <div>
                    <span>Função</span>
                    <strong>{funcionario.funcao || "Não informada"}</strong>
                  </div>
  
                  <div>
                    <span>Admissão</span>
                    <strong>{formatarData(funcionario.dataAdmissao)}</strong>
                  </div>
  
                  {funcionario.situacao === "desligado" && (
                    <div>
                      <span>Desligamento</span>
                      <strong>
                        {formatarData(funcionario.dataDesligamento)}
                      </strong>
                    </div>
                  )}
                </div>
  
                <div className="func-mobile-actions">
                  <button
                    type="button"
                    className="func-mobile-edit"
                    onClick={() => abrirEdicao(funcionario)}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>
  
                  <button
                    type="button"
                    className="func-mobile-delete"
                    onClick={() => void excluir(funcionario)}
                  >
                    <Trash2 size={15} />
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        );
      }
  
      return (
        <div className="func-table-container">
          <table className="func-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Setor e função</th>
                <th>Admissão</th>
                <th>Situação</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
  
            <tbody>
              {funcionariosFiltrados.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>
                    <div className="func-person">
                      <div className="func-avatar">
                        <UserRound size={19} />
                      </div>
  
                      <div>
                        <strong>{funcionario.nome}</strong>
                        <span>
                          {funcionario.matricula
                            ? `Matrícula ${funcionario.matricula}`
                            : "Sem matrícula"}
                        </span>
                      </div>
                    </div>
                  </td>
  
                  <td>
                    <div className="func-role">
                      <strong
                        className={funcionario.setor ? "" : "func-muted"}
                      >
                        {funcionario.setor || "Setor não informado"}
                      </strong>
  
                      <span
                        className={funcionario.funcao ? "" : "func-muted"}
                      >
                        {funcionario.funcao || "Função não informada"}
                      </span>
                    </div>
                  </td>
  
                  <td>
                    <div className="func-date">
                      <CalendarDays size={15} />
                      {formatarData(funcionario.dataAdmissao)}
                    </div>
                  </td>
  
                  <td>
                    <SituacaoBadge situacao={funcionario.situacao} />
  
                    {funcionario.situacao === "desligado" &&
                      funcionario.dataDesligamento && (
                        <div className="func-sub">
                          em {formatarData(funcionario.dataDesligamento)}
                        </div>
                      )}
                  </td>
  
                  <td>
                    <div className="func-actions">
                      <button
                        type="button"
                        title="Editar funcionário"
                        aria-label="Editar funcionário"
                        className="func-action func-action-edit"
                        onClick={() => abrirEdicao(funcionario)}
                      >
                        <Pencil size={17} />
                      </button>
  
                      <button
                        type="button"
                        title="Excluir funcionário"
                        aria-label="Excluir funcionário"
                        className="func-action func-action-delete"
                        onClick={() => void excluir(funcionario)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  
    return (
      <main
        className="func-page"
        style={{
          padding: mobile
            ? "18px 14px 28px"
            : tablet
              ? "24px 20px 32px"
              : "32px",
        }}
      >
        <PageHeader
          title="Funcionários"
          subtitle="Cadastro central usado para vincular acidentes, afastamentos e documentos de SST."
          icon={Users}
        >
          <Button onClick={abrirNovo}>
            <span className="func-button-content">
              <Plus size={18} />
              Novo Funcionário
            </span>
          </Button>
        </PageHeader>
  
        {mensagem && (
          <div className="func-banner func-banner-ok" role="status">
            <div className="func-banner-main">
              <CircleCheckBig size={18} />
              <span>{mensagem}</span>
            </div>
  
            <button
              type="button"
              onClick={() => setMensagem("")}
              aria-label="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}
  
        {erroAcao && (
          <div className="func-banner func-banner-erro" role="alert">
            <div className="func-banner-main">
              <AlertCircle size={18} />
              <span>{erroAcao}</span>
            </div>
  
            <button
              type="button"
              onClick={() => setErroAcao("")}
              aria-label="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}
  
        <div
          className="func-stats"
          style={{
            gridTemplateColumns: mobile
              ? "minmax(0, 1fr)"
              : telaMedia
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
          }}
        >
          <StatCard
            title="Funcionários Cadastrados"
            value={funcionarios.length}
            icon={<Users size={22} />}
            color="#2563EB"
          />
  
          <StatCard
            title="Ativos"
            value={totalAtivos}
            icon={<CircleCheckBig size={22} />}
            color="#16A34A"
          />
  
          <StatCard
            title="Desligados"
            value={totalDesligados}
            icon={<UserRound size={22} />}
            color="#64748B"
          />
  
          <StatCard
            title="Cadastros Incompletos"
            value={totalIncompletos}
            icon={<AlertCircle size={22} />}
            color="#F59E0B"
          />
        </div>
  
        <section className="func-panel">
          <div className="func-panel-heading">
            <div>
              <span className="func-eyebrow">Cadastro central</span>
              <h2>Equipe cadastrada</h2>
              <p>
                Cadastros incompletos são funcionários ativos sem setor ou função
                informados.
              </p>
            </div>
  
            <div className="func-chip">
              <Users size={14} />
              {funcionarios.length} cadastro(s)
            </div>
          </div>
  
          <div className="func-filters">
            <div className="func-filter-title-row">
              <div className="func-filter-title">
                <SlidersHorizontal size={16} />
                Filtros de funcionários
              </div>
  
              {filtrosAtivos && (
                <button
                  type="button"
                  className="func-clear-filter"
                  onClick={limparFiltros}
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              )}
            </div>
  
            <div className="func-filter-grid">
              <div className="func-search">
                <Search size={17} />
  
                <input
                  type="text"
                  placeholder="Pesquisar nome, matrícula, setor ou função..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>
  
              <select
                className="func-select"
                value={filtroSituacao}
                onChange={(e) =>
                  setFiltroSituacao(e.target.value as FiltroSituacao)
                }
              >
                <option value="">Todas as situações</option>
                <option value="ativo">Ativos</option>
                <option value="desligado">Desligados</option>
              </select>
  
              <select
                className="func-select"
                value={filtroSetor}
                onChange={(e) => setFiltroSetor(e.target.value)}
              >
                <option value="">Todos os setores</option>
  
                {setores.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="func-result-count">
              Exibindo <strong>{funcionariosFiltrados.length}</strong> de{" "}
              <strong>{funcionarios.length}</strong> funcionário(s)
            </div>
          </div>
  
          {renderizarConteudo()}
        </section>
  
        {drawerAberto && (
          <div
            className="func-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharDrawer();
              }
            }}
          >
            <aside
              className="func-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="func-drawer-titulo"
            >
              <header className="func-drawer-header">
                <div className="func-drawer-header-main">
                  <div className="func-drawer-icon">
                    <UserRound size={22} />
                  </div>
  
                  <div className="func-drawer-title">
                    <span className="func-drawer-eyebrow">Cadastro central</span>
  
                    <h2 id="func-drawer-titulo">
                      {editando ? "Editar funcionário" : "Novo funcionário"}
                    </h2>
  
                    <p>Identificação e vínculo profissional.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="func-drawer-close"
                  onClick={fecharDrawer}
                  aria-label="Fechar formulário"
                >
                  <X size={19} />
                </button>
              </header>
  
              <div className="func-drawer-content">
                <div className="func-drawer-summary">
                  <div className="func-drawer-summary-icon">
                    <ShieldCheck size={18} />
                  </div>
  
                  <div>
                    <strong>Somente dados necessários</strong>
                    <span>
                      Este cadastro guarda apenas identificação e vínculo
                      profissional. Documentos pessoais e informações de saúde não
                      são coletados aqui.
                    </span>
                  </div>
                </div>
  
                {erroFormulario && (
                  <div className="func-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroFormulario}</span>
                  </div>
                )}
  
                <Secao
                  numero="01"
                  titulo="Identificação"
                  descricao="Nome e matrícula, quando houver."
                >
                  <Campo
                    label="Nome completo"
                    obrigatorio
                    maxLength={150}
                    placeholder="Ex.: Maria da Silva"
                    value={formulario.nome}
                    onChange={(valor) =>
                      setFormulario((atual) => ({ ...atual, nome: valor }))
                    }
                  />
  
                  {nomeRepetido && (
                    <div className="func-form-aviso">
                      Já existe um funcionário com este nome. Se for outra pessoa,
                      informe a matrícula para diferenciar.
                    </div>
                  )}
  
                  <Campo
                    label="Matrícula"
                    maxLength={40}
                    placeholder="Opcional"
                    value={formulario.matricula}
                    onChange={(valor) =>
                      setFormulario((atual) => ({ ...atual, matricula: valor }))
                    }
                  />
                </Secao>
  
                <Secao
                  numero="02"
                  titulo="Vínculo profissional"
                  descricao="Setor, função e data de admissão atuais."
                >
                  <Campo
                    label="Setor"
                    maxLength={80}
                    placeholder="Ex.: Cozinha quente"
                    value={formulario.setor}
                    onChange={(valor) =>
                      setFormulario((atual) => ({ ...atual, setor: valor }))
                    }
                  />
  
                  <Campo
                    label="Função"
                    maxLength={80}
                    placeholder="Ex.: Cozinheiro"
                    value={formulario.funcao}
                    onChange={(valor) =>
                      setFormulario((atual) => ({ ...atual, funcao: valor }))
                    }
                  />
  
                  <Campo
                    label="Data de admissão"
                    type="date"
                    value={formulario.dataAdmissao}
                    onChange={(valor) =>
                      setFormulario((atual) => ({
                        ...atual,
                        dataAdmissao: valor,
                      }))
                    }
                  />
                </Secao>
  
                <Secao
                  numero="03"
                  titulo="Situação"
                  descricao="Funcionários desligados permanecem no histórico."
                >
                  <div className="func-field">
                    <label>Situação</label>
  
                    <select
                      className="func-input"
                      value={formulario.situacao}
                      onChange={(e) => {
                        const valor = e.target.value as SituacaoFuncionario;
  
                        setFormulario((atual) => ({
                          ...atual,
                          situacao: valor,
                          dataDesligamento:
                            valor === "ativo" ? "" : atual.dataDesligamento,
                        }));
                      }}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="desligado">Desligado</option>
                    </select>
                  </div>
  
                  {formulario.situacao === "desligado" && (
                    <Campo
                      label="Data de desligamento"
                      type="date"
                      value={formulario.dataDesligamento}
                      onChange={(valor) =>
                        setFormulario((atual) => ({
                          ...atual,
                          dataDesligamento: valor,
                        }))
                      }
                    />
                  )}
                </Secao>
  
                <Secao
                  numero="04"
                  titulo="Observações"
                  descricao="Informações administrativas, se necessário."
                >
                  <div className="func-field">
                    <label>Observações</label>
  
                    <textarea
                      className="func-input func-textarea"
                      rows={4}
                      maxLength={500}
                      placeholder="Opcional"
                      value={formulario.observacoes}
                      onChange={(e) =>
                        setFormulario((atual) => ({
                          ...atual,
                          observacoes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </Secao>
              </div>
  
              <footer className="func-drawer-footer">
                <Button
                  onClick={fecharDrawer}
                  color="#64748B"
                  disabled={salvando}
                >
                  Cancelar
                </Button>
  
                <Button
                  onClick={() => {
                    void salvar();
                  }}
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : editando
                      ? "Salvar alterações"
                      : "Cadastrar funcionário"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
  
        <style>{estilos}</style>
      </main>
    );
  }
  
  function SituacaoBadge({ situacao }: { situacao: SituacaoFuncionario }) {
    return situacao === "ativo" ? (
      <Badge color="green">Ativo</Badge>
    ) : (
      <Badge color="gray">Desligado</Badge>
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
      <section className="func-form-section">
        <div className="func-form-section-header">
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
    maxLength,
  }: {
    label: string;
    value: string;
    onChange: (valor: string) => void;
    placeholder?: string;
    type?: string;
    obrigatorio?: boolean;
    maxLength?: number;
  }) {
    return (
      <div className="func-field">
        <label>
          {label}
          {obrigatorio && <span>*</span>}
        </label>
  
        <input
          className="func-input"
          type={type}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  
  function EstadoVazio({
    titulo,
    texto,
    acao,
    mobile = false,
  }: {
    titulo: string;
    texto: string;
    acao?: ReactNode;
    mobile?: boolean;
  }) {
    return (
      <div
        className="func-empty"
        style={{ minHeight: mobile ? 210 : 250 }}
      >
        <div className="func-empty-icon">
          <Users size={25} />
        </div>
  
        <strong>{titulo}</strong>
  
        <span>{texto}</span>
  
        {acao}
      </div>
    );
  }
  
  const estilos = `
    .func-page {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      overflow-x: hidden;
    }
  
    .func-button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  
    .func-banner {
      width: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
      padding: 13px 15px;
      box-sizing: border-box;
      border: 1px solid;
      border-radius: 12px;
      font-size: calc(12px * var(--sk-text-scale, 1));
      font-weight: 650;
      line-height: 1.5;
    }
  
    .func-banner-main {
      display: flex;
      align-items: flex-start;
      gap: 9px;
    }
  
    .func-banner-main svg {
      flex-shrink: 0;
      margin-top: 1px;
    }
  
    .func-banner-ok {
      border-color: #bbf7d0;
      background: #f0fdf4;
      color: #166534;
    }
  
    .func-banner-erro {
      border-color: #fecaca;
      background: #fef2f2;
      color: #b91c1c;
    }
  
    .func-banner button {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 2px;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
  
    .func-stats {
      width: 100%;
      min-width: 0;
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }
  
    .func-panel {
      width: 100%;
      min-width: 0;
      padding: 24px;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      background: #ffffff;
      box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
    }
  
    .func-panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }
  
    .func-eyebrow {
      display: block;
      color: #2563eb;
      font-size: calc(10px * var(--sk-text-scale, 1));
      font-weight: 850;
      letter-spacing: .7px;
      text-transform: uppercase;
    }
  
    .func-panel-heading h2 {
      margin: 6px 0 0;
      color: #0f172a;
      font-size: calc(19px * var(--sk-text-scale, 1));
      font-weight: 850;
      line-height: 1.3;
    }
  
    .func-panel-heading p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: calc(12px * var(--sk-text-scale, 1));
      line-height: 1.6;
    }
  
    .func-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      flex-shrink: 0;
      padding: 8px 11px;
      border: 1px solid #dbeafe;
      border-radius: 9px;
      background: #eff6ff;
      color: #2563eb;
      font-size: calc(10px * var(--sk-text-scale, 1));
      font-weight: 750;
      white-space: nowrap;
    }
  
    .func-filters {
      width: 100%;
      min-width: 0;
      margin-bottom: 20px;
      padding: 16px;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      border-radius: 13px;
      background: #f8fafc;
    }
  
    .func-filter-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 13px;
    }
  
    .func-filter-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #475569;
      font-size: calc(12px * var(--sk-text-scale, 1));
      font-weight: 750;
    }
  
    .func-clear-filter {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0;
      border: none;
      background: transparent;
      color: #2563eb;
      font-family: inherit;
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 750;
      cursor: pointer;
    }
  
    .func-filter-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(190px, 230px) minmax(190px, 230px);
      gap: 12px;
    }
  
    .func-search {
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
  
    .func-search svg {
      flex-shrink: 0;
    }
  
    .func-search input {
      width: 100%;
      min-width: 0;
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      color: #0f172a;
      font: inherit;
      font-size: calc(12px * var(--sk-text-scale, 1));
    }
  
    .func-select {
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
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 650;
      outline: none;
      cursor: pointer;
    }
  
    .func-result-count {
      margin-top: 10px;
      color: #64748b;
      font-size: calc(10px * var(--sk-text-scale, 1));
      line-height: 1.5;
    }
  
    .func-result-count strong {
      color: #0f172a;
    }
  
    .func-loading {
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
      font-size: calc(12px * var(--sk-text-scale, 1));
      font-weight: 650;
    }
  
    .func-table-container {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      -webkit-overflow-scrolling: touch;
    }
  
    .func-table {
      width: 100%;
      min-width: 860px;
      border-collapse: collapse;
    }
  
    .func-table thead tr {
      background: #f8fafc;
    }
  
    .func-table th {
      padding: 14px 16px;
      color: #64748b;
      font-size: calc(10px * var(--sk-text-scale, 1));
      font-weight: 800;
      letter-spacing: .5px;
      text-align: left;
      text-transform: uppercase;
      white-space: nowrap;
    }
  
    .func-table td {
      padding: 16px;
      vertical-align: middle;
      color: #475569;
      font-size: calc(12px * var(--sk-text-scale, 1));
    }
  
    .func-table tbody tr {
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      transition: background .15s ease;
    }
  
    .func-table tbody tr:hover {
      background: #fbfdff;
    }
  
    .func-person {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 200px;
    }
  
    .func-avatar {
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
  
    .func-person > div:last-child {
      min-width: 0;
    }
  
    .func-person strong {
      display: block;
      color: #0f172a;
      font-size: calc(13px * var(--sk-text-scale, 1));
      font-weight: 750;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
  
    .func-person span {
      display: block;
      margin-top: 3px;
      color: #94a3b8;
      font-size: calc(10px * var(--sk-text-scale, 1));
    }
  
    .func-role {
      min-width: 170px;
    }
  
    .func-role strong {
      display: block;
      color: #0f172a;
      font-size: calc(12px * var(--sk-text-scale, 1));
      font-weight: 700;
      overflow-wrap: anywhere;
    }
  
    .func-role span {
      display: block;
      margin-top: 3px;
      color: #64748b;
      font-size: calc(11px * var(--sk-text-scale, 1));
      overflow-wrap: anywhere;
    }
  
    .func-role .func-muted {
      color: #94a3b8;
      font-weight: 500;
    }
  
    .func-date {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 115px;
      color: #475569;
      white-space: nowrap;
    }
  
    .func-date svg {
      flex-shrink: 0;
      color: #94a3b8;
    }
  
    .func-sub {
      margin-top: 5px;
      color: #94a3b8;
      font-size: calc(10px * var(--sk-text-scale, 1));
    }
  
    .func-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-width: 80px;
    }
  
    .func-action {
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
  
    .func-action:hover {
      transform: translateY(-1px);
    }
  
    .func-action-edit {
      background: #eff6ff;
      color: #2563eb;
    }
  
    .func-action-delete {
      background: #fef2f2;
      color: #dc2626;
    }
  
    .func-empty {
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
  
    .func-empty-icon {
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
  
    .func-empty > strong {
      color: #0f172a;
      font-size: calc(14px * var(--sk-text-scale, 1));
    }
  
    .func-empty > span {
      max-width: 420px;
      margin: 6px 0 16px;
      color: #94a3b8;
      font-size: calc(12px * var(--sk-text-scale, 1));
      line-height: 1.5;
    }
  
    .func-mobile-list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 11px;
    }
  
    .func-mobile-card {
      position: relative;
      overflow: hidden;
      padding: 15px;
      border: 1px solid #e2e8f0;
      border-radius: 13px;
      background: #ffffff;
    }
  
    .func-mobile-card::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #16a34a;
    }
  
    .func-mobile-card-off::before {
      background: #94a3b8;
    }
  
    .func-mobile-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
  
    .func-mobile-header .func-person {
      min-width: 0;
      flex: 1;
    }
  
    .func-mobile-data {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 14px;
    }
  
    .func-mobile-data > div {
      min-width: 0;
      padding: 10px;
      border-radius: 9px;
      background: #f8fafc;
    }
  
    .func-mobile-data > div > span {
      display: block;
      margin-bottom: 5px;
      color: #94a3b8;
      font-size: calc(9px * var(--sk-text-scale, 1));
      font-weight: 700;
      text-transform: uppercase;
    }
  
    .func-mobile-data > div > strong {
      color: #334155;
      font-size: calc(11px * var(--sk-text-scale, 1));
      overflow-wrap: anywhere;
    }
  
    .func-mobile-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
  
    .func-mobile-actions button {
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border: none;
      border-radius: 9px;
      font: inherit;
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 750;
      cursor: pointer;
    }
  
    .func-mobile-edit {
      background: #eff6ff;
      color: #2563eb;
    }
  
    .func-mobile-delete {
      background: #fef2f2;
      color: #dc2626;
    }
  
    .func-drawer-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: flex-end;
      background: rgba(15, 23, 42, .50);
      backdrop-filter: blur(4px);
      z-index: 2000;
    }
  
    .func-drawer {
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
      animation: funcDrawerIn .2s ease-out;
    }
  
    .func-drawer-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding: 23px 25px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
  
    .func-drawer-header-main {
      display: flex;
      gap: 12px;
      min-width: 0;
    }
  
    .func-drawer-icon {
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
  
    .func-drawer-title {
      min-width: 0;
    }
  
    .func-drawer-eyebrow {
      display: block;
      margin-bottom: 3px;
      color: #2563eb;
      font-size: calc(9px * var(--sk-text-scale, 1));
      font-weight: 850;
      letter-spacing: .6px;
      text-transform: uppercase;
    }
  
    .func-drawer-title h2 {
      margin: 0;
      color: #0f172a;
      font-size: calc(20px * var(--sk-text-scale, 1));
      font-weight: 850;
    }
  
    .func-drawer-title p {
      margin: 5px 0 0;
      color: #64748b;
      font-size: calc(11px * var(--sk-text-scale, 1));
      line-height: 1.5;
    }
  
    .func-drawer-close {
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
  
    .func-drawer-content {
      flex: 1;
      min-height: 0;
      padding: 20px 25px 28px;
      box-sizing: border-box;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
  
    .func-drawer-summary {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 17px;
      padding: 13px;
      border: 1px solid #dbeafe;
      border-radius: 11px;
      background: #f8fbff;
    }
  
    .func-drawer-summary-icon {
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
  
    .func-drawer-summary strong {
      display: block;
      color: #1e3a8a;
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 800;
    }
  
    .func-drawer-summary span {
      display: block;
      margin-top: 3px;
      color: #64748b;
      font-size: calc(10px * var(--sk-text-scale, 1));
      line-height: 1.45;
    }
  
    .func-form-erro {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      margin-bottom: 17px;
      padding: 12px 13px;
      border: 1px solid #fecaca;
      border-radius: 10px;
      background: #fef2f2;
      color: #b91c1c;
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 650;
      line-height: 1.5;
    }
  
    .func-form-erro svg {
      flex-shrink: 0;
      margin-top: 1px;
    }
  
    .func-form-aviso {
      margin: -4px 0 13px;
      padding: 10px 12px;
      border: 1px solid #fde68a;
      border-radius: 9px;
      background: #fffbeb;
      color: #92400e;
      font-size: calc(10px * var(--sk-text-scale, 1));
      line-height: 1.5;
    }
  
    .func-form-section {
      width: 100%;
      min-width: 0;
      margin-bottom: 17px;
      padding: 17px;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      border-radius: 13px;
      background: #ffffff;
    }
  
    .func-form-section-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 15px;
    }
  
    .func-form-section-header > span {
      width: 27px;
      height: 27px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 8px;
      background: #f1f5f9;
      color: #64748b;
      font-size: calc(9px * var(--sk-text-scale, 1));
      font-weight: 850;
    }
  
    .func-form-section-header h3 {
      margin: 0;
      color: #0f172a;
      font-size: calc(13px * var(--sk-text-scale, 1));
      font-weight: 850;
    }
  
    .func-form-section-header p {
      margin: 3px 0 0;
      color: #94a3b8;
      font-size: calc(10px * var(--sk-text-scale, 1));
      line-height: 1.45;
    }
  
    .func-field {
      width: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 13px;
    }
  
    .func-field:last-child {
      margin-bottom: 0;
    }
  
    .func-field label {
      color: #334155;
      font-size: calc(11px * var(--sk-text-scale, 1));
      font-weight: 750;
    }
  
    .func-field label span {
      margin-left: 3px;
      color: #dc2626;
    }
  
    .func-input {
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
      font-size: calc(12px * var(--sk-text-scale, 1));
      outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
  
    .func-input:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);
    }
  
    .func-textarea {
      height: auto;
      min-height: 96px;
      padding: 11px 12px;
      line-height: 1.5;
      resize: vertical;
    }
  
    .func-drawer-footer {
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
  
    @keyframes funcDrawerIn {
      from {
        transform: translateX(24px);
        opacity: .7;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  
    @media (max-width: 900px) {
      .func-filter-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
  
      .func-search {
        grid-column: 1 / -1;
      }
    }
  
    @media (max-width: 650px) {
      .func-panel {
        padding: 16px;
        border-radius: 14px;
      }
  
      .func-panel-heading {
        flex-direction: column;
        gap: 11px;
      }
  
      .func-panel-heading h2 {
        font-size: calc(16px * var(--sk-text-scale, 1));
      }
  
      .func-filter-grid {
        grid-template-columns: minmax(0, 1fr);
      }
  
      .func-drawer {
        width: 100%;
        max-width: none;
      }
  
      .func-drawer-header {
        padding: 18px 16px 16px;
        gap: 12px;
      }
  
      .func-drawer-content {
        padding: 16px 16px 24px;
      }
  
      .func-drawer-footer {
        padding: 14px 16px;
        padding-bottom: max(14px, env(safe-area-inset-bottom));
      }
  
      .func-drawer-footer > * {
        flex: 1 1 0;
      }
    }
  
    @media (max-width: 430px) {
      .func-filter-title-row {
        align-items: flex-start;
        flex-direction: column;
      }
  
      .func-mobile-data {
        grid-template-columns: minmax(0, 1fr);
      }
  
      .func-mobile-header {
        flex-direction: column;
      }
  
      .func-form-section {
        padding: 14px;
      }
  
      .func-drawer-footer {
        flex-direction: column;
        align-items: stretch;
      }
  
      .func-drawer-footer > * {
        width: 100%;
      }
    }
  `;