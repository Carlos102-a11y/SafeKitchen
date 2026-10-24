import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import type { ReactNode } from "react";
  
  import {
    useNavigate,
    useSearchParams,
  } from "react-router-dom";
  
  import {
    AlertCircle,
    CalendarClock,
    CalendarDays,
    CircleCheckBig,
    Clock3,
    Eye,
    Link2,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
    TriangleAlert,
    UserRound,
    X,
  } from "lucide-react";
  
  import PageHeader from "../components/ui/PageHeader";
  import StatCard from "../components/ui/StatCard";
  import Button from "../components/ui/Button";
  import Badge from "../components/ui/Badge";
  
  import { useViewportWidth } from "../hooks/useViewportWidth";
  
  import {
    atualizarAfastamento,
    criarAfastamento,
    excluirAfastamento,
    listarAcidentesParaVinculo,
    listarAfastamentos,
  } from "../services/afastamentosService";
  
  import { listarFuncionarios } from "../services/funcionariosService";
  
  import {
    ROTULO_CATEGORIA,
    ROTULO_CATEGORIA_CURTO,
    ROTULO_SITUACAO,
  } from "../models/Afastamento";
  
  import type {
    AcidenteResumo,
    Afastamento,
    AfastamentoEntrada,
    CategoriaAfastamento,
    SituacaoAfastamento,
  } from "../models/Afastamento";
  
  import type { Funcionario } from "../models/Funcionario";
  
  import "../styles/modulos.css";
  
  type FiltroSituacao = "" | SituacaoAfastamento;
  
  type FormularioAfastamento = Omit<AfastamentoEntrada, "categoria"> & {
    categoria: CategoriaAfastamento | "";
  };
  
  const formularioInicial: FormularioAfastamento = {
    funcionarioId: 0,
    acidenteId: null,
    categoria: "",
    setor: "",
    atividade: "",
    dataInicio: "",
    previsaoRetorno: "",
    dataRetorno: "",
    situacao: "em_andamento",
    motivoCancelamento: "",
    referenciaDocumental: "",
    observacoes: "",
  };
  
  function paraFormulario(afastamento: Afastamento): FormularioAfastamento {
    return {
      funcionarioId: afastamento.funcionarioId,
      acidenteId: afastamento.acidenteId,
      categoria: afastamento.categoria,
      setor: afastamento.setor,
      atividade: afastamento.atividade,
      dataInicio: afastamento.dataInicio,
      previsaoRetorno: afastamento.previsaoRetorno,
      dataRetorno: afastamento.dataRetorno,
      situacao: afastamento.situacao,
      motivoCancelamento: afastamento.motivoCancelamento,
      referenciaDocumental: afastamento.referenciaDocumental,
      observacoes: afastamento.observacoes,
    };
  }
  
  /* DATAS */
  
  function paraISO(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
  
    return `${ano}-${mes}-${dia}`;
  }
  
  function hojeISO() {
    return paraISO(new Date());
  }
  
  function somarDias(iso: string, dias: number) {
    const [ano, mes, dia] = iso.split("-").map(Number);
  
    return paraISO(new Date(ano, mes - 1, dia + dias));
  }
  
  function diasEntre(inicio: string, fim: string) {
    const [anoI, mesI, diaI] = inicio.split("-").map(Number);
    const [anoF, mesF, diaF] = fim.split("-").map(Number);
  
    const tempoInicio = Date.UTC(anoI, mesI - 1, diaI);
    const tempoFim = Date.UTC(anoF, mesF - 1, diaF);
  
    return Math.round((tempoFim - tempoInicio) / 86400000);
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
  
  /* REGRAS */
  
  function previsaoVencida(afastamento: Afastamento, hoje: string) {
    return (
      afastamento.situacao === "em_andamento" &&
      afastamento.previsaoRetorno !== "" &&
      afastamento.previsaoRetorno < hoje
    );
  }
  
  function retornoProximo(
    afastamento: Afastamento,
    hoje: string,
    limite: string
  ) {
    return (
      afastamento.situacao === "em_andamento" &&
      afastamento.previsaoRetorno !== "" &&
      afastamento.previsaoRetorno >= hoje &&
      afastamento.previsaoRetorno <= limite
    );
  }
  
  function duracaoDias(afastamento: Afastamento, hoje: string) {
    if (afastamento.situacao === "cancelado") {
      return null;
    }
  
    const fim =
      afastamento.situacao === "encerrado" ? afastamento.dataRetorno : hoje;
  
    if (!fim || afastamento.dataInicio > fim) {
      return 0;
    }
  
    return diasEntre(afastamento.dataInicio, fim) + 1;
  }
  
  function validarFormulario(formulario: FormularioAfastamento, hoje: string) {
    if (!formulario.funcionarioId) {
      return "Selecione o funcionário.";
    }
  
    if (!formulario.categoria) {
      return "Selecione a categoria do afastamento.";
    }
  
    if (!formulario.dataInicio) {
      return "Informe a data de início do afastamento.";
    }
  
    if (
      formulario.previsaoRetorno &&
      formulario.previsaoRetorno < formulario.dataInicio
    ) {
      return "A previsão de retorno não pode ser anterior ao início.";
    }
  
    if (formulario.situacao === "encerrado") {
      if (!formulario.dataRetorno) {
        return "Para encerrar, informe a data efetiva de retorno.";
      }
  
      if (formulario.dataRetorno < formulario.dataInicio) {
        return "A data de retorno não pode ser anterior ao início.";
      }
  
      if (formulario.dataRetorno > hoje) {
        return "A data efetiva de retorno não pode ser futura.";
      }
    }
  
    if (
      formulario.situacao === "cancelado" &&
      !formulario.motivoCancelamento.trim()
    ) {
      return "Informe o motivo do cancelamento.";
    }
  
    return "";
  }
  
  function normalizar(texto: string) {
    return texto.trim().toLowerCase();
  }
  
  export default function Afastamentos() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
  
    const largura = useViewportWidth();
  
    const mobile = largura <= 650;
    const tablet = largura <= 900;
    const telaMedia = largura <= 1180;
  
    const hoje = hojeISO();
    const limiteRetorno = somarDias(hoje, 30);
  
    const parametroAcidente = Number(searchParams.get("acidente") ?? "");
  
    const acidenteFiltroId =
      Number.isInteger(parametroAcidente) && parametroAcidente > 0
        ? parametroAcidente
        : null;
  
    const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [acidentes, setAcidentes] = useState<AcidenteResumo[]>([]);
  
    const [carregando, setCarregando] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [avisoDados, setAvisoDados] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tentativa, setTentativa] = useState(0);
  
    const [pesquisa, setPesquisa] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("");
    const [filtroSetor, setFiltroSetor] = useState("");
    const [periodoDe, setPeriodoDe] = useState("");
    const [periodoAte, setPeriodoAte] = useState("");
  
    const [formAberto, setFormAberto] = useState(false);
    const [editando, setEditando] = useState<Afastamento | null>(null);
    const [formulario, setFormulario] =
      useState<FormularioAfastamento>(formularioInicial);
    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
  
    const [detalhe, setDetalhe] = useState<Afastamento | null>(null);
  
    /* CARREGAMENTO */
  
    useEffect(() => {
      let componenteAtivo = true;
  
      async function carregar() {
        const [resAfastamentos, resFuncionarios, resAcidentes] =
          await Promise.all([
            listarAfastamentos(),
            listarFuncionarios(),
            listarAcidentesParaVinculo(),
          ]);
  
        if (!componenteAtivo) {
          return;
        }
  
        const erro = resAfastamentos.erro ?? resFuncionarios.erro;
  
        if (erro || !resAfastamentos.data || !resFuncionarios.data) {
          setAfastamentos([]);
          setFuncionarios([]);
          setAcidentes([]);
          setErroLista(erro ?? "Não foi possível carregar os afastamentos.");
          setCarregando(false);
          return;
        }
  
        setAfastamentos(resAfastamentos.data);
        setFuncionarios(resFuncionarios.data);
        setAcidentes(resAcidentes.data ?? []);
  
        setAvisoDados(
          resAcidentes.erro
            ? "Não foi possível carregar os acidentes. O vínculo com acidentes ficará indisponível até recarregar a página."
            : ""
        );
  
        setErroLista("");
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
  
    /* DRAWERS */
  
    const fecharFormulario = useCallback(() => {
      setFormAberto(false);
      setEditando(null);
      setErroFormulario("");
      setFormulario(formularioInicial);
    }, []);
  
    const algumDrawerAberto = formAberto || detalhe !== null;
  
    useEffect(() => {
      if (!algumDrawerAberto) {
        return;
      }
  
      const overflowAnterior = document.body.style.overflow;
  
      document.body.style.overflow = "hidden";
  
      function fecharComEsc(evento: KeyboardEvent) {
        if (evento.key !== "Escape") {
          return;
        }
  
        if (formAberto) {
          fecharFormulario();
        } else {
          setDetalhe(null);
        }
      }
  
      window.addEventListener("keydown", fecharComEsc);
  
      return () => {
        document.body.style.overflow = overflowAnterior;
        window.removeEventListener("keydown", fecharComEsc);
      };
    }, [algumDrawerAberto, formAberto, fecharFormulario]);
  
    /* MAPAS E APOIO */
  
    const funcionarioPorId = useMemo(
      () =>
        new Map<number, Funcionario>(
          funcionarios.map(
            (funcionario) => [funcionario.id, funcionario] as [number, Funcionario]
          )
        ),
      [funcionarios]
    );
  
    const acidentePorId = useMemo(
      () =>
        new Map<number, AcidenteResumo>(
          acidentes.map(
            (acidente) => [acidente.id, acidente] as [number, AcidenteResumo]
          )
        ),
      [acidentes]
    );
  
    const acidenteFiltro =
      acidenteFiltroId !== null
        ? (acidentePorId.get(acidenteFiltroId) ?? null)
        : null;
  
    function nomeFuncionario(afastamento: Afastamento) {
      return (
        funcionarioPorId.get(afastamento.funcionarioId)?.nome ??
        "Funcionário não encontrado"
      );
    }
  
    function setorDoRegistro(afastamento: Afastamento) {
      return (
        afastamento.setor ||
        funcionarioPorId.get(afastamento.funcionarioId)?.setor ||
        ""
      );
    }
  
    /* INDICADORES (dados reais) */
  
    const totalEmAndamento = afastamentos.filter(
      (afastamento) => afastamento.situacao === "em_andamento"
    ).length;
  
    const totalRetornosPrevistos = afastamentos.filter((afastamento) =>
      retornoProximo(afastamento, hoje, limiteRetorno)
    ).length;
  
    const totalPrevisaoVencida = afastamentos.filter((afastamento) =>
      previsaoVencida(afastamento, hoje)
    ).length;
  
    const totalEncerrados = afastamentos.filter(
      (afastamento) => afastamento.situacao === "encerrado"
    ).length;
  
    /* FILTROS */
  
    const setores = useMemo(
      () =>
        Array.from(
          new Set(
            afastamentos
              .map(
                (afastamento) =>
                  afastamento.setor ||
                  funcionarioPorId.get(afastamento.funcionarioId)?.setor ||
                  ""
              )
              .filter((setor) => setor !== "")
          )
        ).sort((a, b) => a.localeCompare(b, "pt-BR")),
      [afastamentos, funcionarioPorId]
    );
  
    const afastamentosFiltrados = useMemo(() => {
      const termo = normalizar(pesquisa);
  
      return afastamentos.filter((afastamento) => {
        const funcionario = funcionarioPorId.get(afastamento.funcionarioId);
  
        const setor = afastamento.setor || funcionario?.setor || "";
  
        const correspondePesquisa =
          !termo ||
          (funcionario?.nome.toLowerCase().includes(termo) ?? false) ||
          (funcionario?.matricula.toLowerCase().includes(termo) ?? false);
  
        const correspondeSituacao =
          !filtroSituacao || afastamento.situacao === filtroSituacao;
  
        const correspondeSetor = !filtroSetor || setor === filtroSetor;
  
        const fim =
          afastamento.situacao === "em_andamento"
            ? "9999-12-31"
            : afastamento.dataRetorno ||
              afastamento.previsaoRetorno ||
              afastamento.dataInicio;
  
        const correspondePeriodo =
          (!periodoDe || fim >= periodoDe) &&
          (!periodoAte || afastamento.dataInicio <= periodoAte);
  
        const correspondeAcidente =
          acidenteFiltroId === null ||
          afastamento.acidenteId === acidenteFiltroId;
  
        return (
          correspondePesquisa &&
          correspondeSituacao &&
          correspondeSetor &&
          correspondePeriodo &&
          correspondeAcidente
        );
      });
    }, [
      afastamentos,
      funcionarioPorId,
      pesquisa,
      filtroSituacao,
      filtroSetor,
      periodoDe,
      periodoAte,
      acidenteFiltroId,
    ]);
  
    const filtrosAtivos =
      pesquisa.trim() !== "" ||
      filtroSituacao !== "" ||
      filtroSetor !== "" ||
      periodoDe !== "" ||
      periodoAte !== "";
  
    /* APOIO AO FORMULÁRIO */
  
    const opcoesFuncionarios = useMemo(
      () =>
        funcionarios.filter(
          (funcionario) =>
            funcionario.situacao === "ativo" ||
            funcionario.id === formulario.funcionarioId
        ),
      [funcionarios, formulario.funcionarioId]
    );
  
    const conflitoEmAndamento = useMemo(() => {
      if (
        !formulario.funcionarioId ||
        formulario.situacao !== "em_andamento"
      ) {
        return false;
      }
  
      return afastamentos.some(
        (afastamento) =>
          afastamento.id !== (editando?.id ?? 0) &&
          afastamento.funcionarioId === formulario.funcionarioId &&
          afastamento.situacao === "em_andamento"
      );
    }, [afastamentos, formulario.funcionarioId, formulario.situacao, editando]);
  
    /* AÇÕES */
  
    function abrirNovo() {
      setEditando(null);
      setErroFormulario("");
      setFormulario(formularioInicial);
      setFormAberto(true);
    }
  
    function abrirNovoDoAcidente() {
      if (!acidenteFiltro) {
        return;
      }
  
      setEditando(null);
      setErroFormulario("");
  
      setFormulario({
        ...formularioInicial,
        categoria: "relacionado_trabalho",
        acidenteId: acidenteFiltro.id,
        funcionarioId: acidenteFiltro.funcionarioId ?? 0,
        setor: acidenteFiltro.setor,
        dataInicio: acidenteFiltro.data,
      });
  
      setFormAberto(true);
    }
  
    function abrirEdicao(afastamento: Afastamento) {
      setDetalhe(null);
      setEditando(afastamento);
      setErroFormulario("");
      setFormulario(paraFormulario(afastamento));
      setFormAberto(true);
    }
  
    function limparFiltros() {
      setPesquisa("");
      setFiltroSituacao("");
      setFiltroSetor("");
      setPeriodoDe("");
      setPeriodoAte("");
    }
  
    function tentarNovamente() {
      setErroLista("");
      setCarregando(true);
      setTentativa((valor) => valor + 1);
    }
  
    function abrirAcidente(acidenteId: number) {
      navigate(`/acidentes?ocorrencia=${acidenteId}`);
    }
  
    function selecionarFuncionario(valor: string) {
      const id = Number(valor);
  
      const funcionario = funcionarioPorId.get(id);
  
      setFormulario((atual) => ({
        ...atual,
        funcionarioId: Number.isInteger(id) ? id : 0,
        setor: atual.setor.trim() || funcionario?.setor || "",
      }));
    }
  
    async function salvar() {
      if (salvando) {
        return;
      }
  
      const erroValidacao = validarFormulario(formulario, hoje);
  
      if (erroValidacao) {
        setErroFormulario(erroValidacao);
        return;
      }
  
      const categoria = formulario.categoria;
  
      if (categoria === "") {
        return;
      }
  
      const entrada: AfastamentoEntrada = { ...formulario, categoria };
  
      setSalvando(true);
      setErroFormulario("");
  
      const idEditando = editando?.id ?? null;
  
      const resultado =
        idEditando !== null
          ? await atualizarAfastamento(idEditando, entrada)
          : await criarAfastamento(entrada);
  
      setSalvando(false);
  
      if (resultado.erro || !resultado.data) {
        setErroFormulario(
          resultado.erro ?? "Não foi possível salvar o afastamento."
        );
        return;
      }
  
      const salvo = resultado.data;
  
      setAfastamentos((listaAtual) => {
        const novaLista =
          idEditando !== null
            ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
            : [...listaAtual, salvo];
  
        return novaLista.sort((a, b) =>
          a.dataInicio === b.dataInicio
            ? b.id - a.id
            : b.dataInicio.localeCompare(a.dataInicio)
        );
      });
  
      setMensagem(
        idEditando !== null
          ? "Afastamento atualizado com sucesso."
          : "Afastamento registrado com sucesso."
      );
  
      fecharFormulario();
    }
  
    async function excluir(afastamento: Afastamento) {
      const confirmar = window.confirm(
        `Deseja realmente excluir o afastamento de "${nomeFuncionario(afastamento)}"? Esta ação apaga o registro. Se o afastamento não deveria valer, prefira alterar a situação para Cancelado e informar o motivo, preservando o histórico.`
      );
  
      if (!confirmar) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await excluirAfastamento(afastamento.id);
  
      if (resultado.erro) {
        setErroAcao(resultado.erro);
        return;
      }
  
      setAfastamentos((listaAtual) =>
        listaAtual.filter((item) => item.id !== afastamento.id)
      );
  
      setDetalhe(null);
      setMensagem("Afastamento excluído com sucesso.");
    }
  
    /* CONTEÚDO DA LISTA */
  
    function renderizarSinalizadores(afastamento: Afastamento) {
      return (
        <>
          {previsaoVencida(afastamento, hoje) && (
            <div className="mod-flag">
              <Badge color="red">Previsão vencida</Badge>
            </div>
          )}
  
          {retornoProximo(afastamento, hoje, limiteRetorno) && (
            <div className="mod-flag">
              <Badge color="yellow">Retorno em até 30 dias</Badge>
            </div>
          )}
        </>
      );
    }
  
    function renderizarConteudo() {
      if (carregando) {
        return (
          <div className="mod-loading">
            <CalendarClock size={22} />
            Carregando afastamentos...
          </div>
        );
      }
  
      if (erroLista) {
        return (
          <EstadoVazio
            titulo="Não foi possível carregar os afastamentos"
            texto={erroLista}
            acao={<Button onClick={tentarNovamente}>Tentar novamente</Button>}
            mobile={mobile}
          />
        );
      }
  
      if (afastamentos.length === 0) {
        return (
          <EstadoVazio
            titulo="Nenhum afastamento registrado"
            texto={
              funcionarios.length === 0
                ? "Cadastre primeiro os funcionários na tela Funcionários e depois registre os afastamentos."
                : "Registre os afastamentos para acompanhar períodos, retornos previstos e vínculos com acidentes."
            }
            acao={
              funcionarios.length > 0 ? (
                <Button onClick={abrirNovo}>Registrar primeiro afastamento</Button>
              ) : (
                <Button onClick={() => navigate("/funcionarios")}>
                  Abrir Funcionários
                </Button>
              )
            }
            mobile={mobile}
          />
        );
      }
  
      if (afastamentosFiltrados.length === 0) {
        return (
          <EstadoVazio
            titulo={
              acidenteFiltroId !== null && !filtrosAtivos
                ? "Nenhum afastamento registrado para este acidente"
                : "Nenhum afastamento corresponde aos filtros"
            }
            texto={
              acidenteFiltroId !== null && !filtrosAtivos
                ? "Use o botão acima para registrar um afastamento vinculado a este acidente."
                : "Altere a pesquisa ou os filtros para visualizar outros registros."
            }
            mobile={mobile}
          />
        );
      }
  
      if (mobile) {
        return (
          <div className="mod-mobile-list">
            {afastamentosFiltrados.map((afastamento) => (
              <article
                key={afastamento.id}
                className={`mod-mobile-card ${
                  previsaoVencida(afastamento, hoje)
                    ? "mod-mobile-card-alert"
                    : afastamento.situacao === "encerrado"
                      ? "mod-mobile-card-ok"
                      : afastamento.situacao === "cancelado"
                        ? "mod-mobile-card-off"
                        : ""
                }`}
              >
                <div className="mod-mobile-header">
                  <div className="mod-person">
                    <div className="mod-avatar">
                      <UserRound size={18} />
                    </div>
  
                    <div>
                      <strong>{nomeFuncionario(afastamento)}</strong>
                      <span>
                        {setorDoRegistro(afastamento) || "Setor não informado"}
                      </span>
                    </div>
                  </div>
  
                  <SituacaoBadge situacao={afastamento.situacao} />
                </div>
  
                {renderizarSinalizadores(afastamento)}
  
                <div className="mod-mobile-data">
                  <div>
                    <span>Categoria</span>
                    <strong>{ROTULO_CATEGORIA_CURTO[afastamento.categoria]}</strong>
                  </div>
  
                  <div>
                    <span>Início</span>
                    <strong>{formatarData(afastamento.dataInicio)}</strong>
                  </div>
  
                  <div>
                    <span>Previsão</span>
                    <strong>
                      {formatarData(afastamento.previsaoRetorno, "Não informada")}
                    </strong>
                  </div>
  
                  <div>
                    <span>Retorno efetivo</span>
                    <strong>
                      {afastamento.situacao === "encerrado"
                        ? formatarData(afastamento.dataRetorno)
                        : "Não registrado"}
                    </strong>
                  </div>
                </div>
  
                <div className="mod-mobile-actions">
                  <button
                    type="button"
                    className="mod-btn-view"
                    onClick={() => setDetalhe(afastamento)}
                  >
                    <Eye size={15} />
                    Detalhes
                  </button>
  
                  <button
                    type="button"
                    className="mod-btn-edit"
                    onClick={() => abrirEdicao(afastamento)}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>
  
                  <button
                    type="button"
                    className="mod-btn-delete"
                    onClick={() => void excluir(afastamento)}
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
        <div className="mod-table-container">
          <table className="mod-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Categoria</th>
                <th>Período</th>
                <th>Situação</th>
                <th>Acidente</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
  
            <tbody>
              {afastamentosFiltrados.map((afastamento) => (
                <tr key={afastamento.id}>
                  <td>
                    <div className="mod-person">
                      <div className="mod-avatar">
                        <UserRound size={19} />
                      </div>
  
                      <div>
                        <strong>{nomeFuncionario(afastamento)}</strong>
                        <span>
                          {setorDoRegistro(afastamento) || "Setor não informado"}
                        </span>
                      </div>
                    </div>
                  </td>
  
                  <td>
                    <Badge
                      color={
                        afastamento.categoria === "relacionado_trabalho"
                          ? "orange"
                          : afastamento.categoria === "administrativo"
                            ? "blue"
                            : "gray"
                      }
                    >
                      {ROTULO_CATEGORIA_CURTO[afastamento.categoria]}
                    </Badge>
                  </td>
  
                  <td>
                    <div className="mod-period">
                      <div className="mod-line">
                        <CalendarDays size={15} />
                        {formatarData(afastamento.dataInicio)}
                      </div>
  
                      <div className="mod-sub">
                        {afastamento.situacao === "encerrado"
                          ? `Retorno em ${formatarData(afastamento.dataRetorno)}`
                          : afastamento.previsaoRetorno
                            ? `Previsão: ${formatarData(afastamento.previsaoRetorno)}`
                            : "Sem previsão de retorno"}
                      </div>
                    </div>
                  </td>
  
                  <td>
                    <SituacaoBadge situacao={afastamento.situacao} />
                    {renderizarSinalizadores(afastamento)}
                  </td>
  
                  <td>
                    {afastamento.acidenteId !== null ? (
                      <button
                        type="button"
                        className="mod-link-btn"
                        onClick={() =>
                          abrirAcidente(afastamento.acidenteId as number)
                        }
                      >
                        <Link2 size={14} />
                        Ver acidente
                      </button>
                    ) : (
                      <span className="mod-muted">Sem vínculo</span>
                    )}
                  </td>
  
                  <td>
                    <div className="mod-actions">
                      <button
                        type="button"
                        title="Ver detalhes"
                        aria-label="Ver detalhes"
                        className="mod-action mod-action-view"
                        onClick={() => setDetalhe(afastamento)}
                      >
                        <Eye size={17} />
                      </button>
  
                      <button
                        type="button"
                        title="Editar afastamento"
                        aria-label="Editar afastamento"
                        className="mod-action mod-action-edit"
                        onClick={() => abrirEdicao(afastamento)}
                      >
                        <Pencil size={17} />
                      </button>
  
                      <button
                        type="button"
                        title="Excluir afastamento"
                        aria-label="Excluir afastamento"
                        className="mod-action mod-action-delete"
                        onClick={() => void excluir(afastamento)}
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
  
    /* DETALHE */
  
    function renderizarDetalhe(afastamento: Afastamento) {
      const duracao = duracaoDias(afastamento, hoje);
  
      const acidente =
        afastamento.acidenteId !== null
          ? acidentePorId.get(afastamento.acidenteId)
          : undefined;
  
      return (
        <div
          className="mod-drawer-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDetalhe(null);
            }
          }}
        >
          <aside
            className="mod-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="afast-detalhe-titulo"
          >
            <header className="mod-drawer-header">
              <div className="mod-drawer-header-main">
                <div className="mod-drawer-icon">
                  <CalendarClock size={22} />
                </div>
  
                <div className="mod-drawer-title">
                  <span className="mod-drawer-eyebrow">
                    Detalhes do afastamento
                  </span>
  
                  <h2 id="afast-detalhe-titulo">{nomeFuncionario(afastamento)}</h2>
  
                  <p>{ROTULO_CATEGORIA[afastamento.categoria]}</p>
                </div>
              </div>
  
              <button
                type="button"
                className="mod-drawer-close"
                onClick={() => setDetalhe(null)}
                aria-label="Fechar detalhes"
              >
                <X size={19} />
              </button>
            </header>
  
            <div className="mod-drawer-content">
              <div className="mod-detail-grid">
                <Item titulo="Situação">
                  <SituacaoBadge situacao={afastamento.situacao} />
                  {renderizarSinalizadores(afastamento)}
                </Item>
  
                <Item titulo="Setor">
                  {setorDoRegistro(afastamento) || "Não informado"}
                </Item>
  
                <Item titulo="Atividade">
                  {afastamento.atividade || "Não informada"}
                </Item>
  
                <Item titulo="Início">{formatarData(afastamento.dataInicio)}</Item>
  
                <Item titulo="Previsão de retorno">
                  {formatarData(afastamento.previsaoRetorno, "Não informada")}
                </Item>
  
                <Item titulo="Retorno efetivo">
                  {afastamento.situacao === "encerrado"
                    ? formatarData(afastamento.dataRetorno)
                    : afastamento.situacao === "em_andamento"
                      ? "Ainda não registrado"
                      : "Não se aplica"}
                </Item>
  
                <Item titulo="Duração">
                  {duracao === null
                    ? "Não se aplica"
                    : `${duracao} dia(s) corrido(s)${
                        afastamento.situacao === "em_andamento"
                          ? " até hoje"
                          : ""
                      }`}
                </Item>
              </div>
  
              {afastamento.acidenteId !== null && (
                <div className="mod-detail-block">
                  <span>Acidente vinculado</span>
  
                  <p>
                    {acidente
                      ? `${formatarData(acidente.data)} - ${acidente.tipo} - gravidade ${acidente.gravidade.toLowerCase()}`
                      : `Acidente nº ${afastamento.acidenteId}`}
                  </p>
  
                  <button
                    type="button"
                    className="mod-link-btn"
                    onClick={() =>
                      abrirAcidente(afastamento.acidenteId as number)
                    }
                  >
                    <Link2 size={14} />
                    Abrir acidente
                  </button>
                </div>
              )}
  
              {afastamento.situacao === "cancelado" && (
                <div className="mod-detail-block">
                  <span>Motivo do cancelamento</span>
                  <p>{afastamento.motivoCancelamento}</p>
                </div>
              )}
  
              <div className="mod-detail-block">
                <span>Referência documental</span>
                <p>{afastamento.referenciaDocumental || "Não informada"}</p>
              </div>
  
              <div className="mod-detail-block">
                <span>Observações administrativas</span>
                <p>{afastamento.observacoes || "Nenhuma observação"}</p>
              </div>
            </div>
  
            <footer className="mod-drawer-footer">
              <Button onClick={() => setDetalhe(null)} color="#64748B">
                Fechar
              </Button>
  
              <Button onClick={() => abrirEdicao(afastamento)}>Editar</Button>
            </footer>
          </aside>
        </div>
      );
    }
  
    return (
      <main
        className="mod-page"
        style={{
          padding: mobile
            ? "18px 14px 28px"
            : tablet
              ? "24px 20px 32px"
              : "32px",
        }}
      >
        <PageHeader
          title="Afastamentos"
          subtitle="Controle dos afastamentos dos funcionários, retornos previstos e vínculo com acidentes."
          icon={CalendarClock}
        >
          <Button onClick={abrirNovo} disabled={funcionarios.length === 0}>
            <span className="mod-button-content">
              <Plus size={18} />
              Novo Afastamento
            </span>
          </Button>
        </PageHeader>
  
        {mensagem && (
          <div className="mod-banner mod-banner-ok" role="status">
            <div className="mod-banner-main">
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
          <div className="mod-banner mod-banner-erro" role="alert">
            <div className="mod-banner-main">
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
  
        {avisoDados && (
          <div className="mod-banner mod-banner-aviso" role="status">
            <div className="mod-banner-main">
              <AlertCircle size={18} />
              <span>{avisoDados}</span>
            </div>
  
            <button
              type="button"
              onClick={() => setAvisoDados("")}
              aria-label="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}
  
        {acidenteFiltroId !== null && (
          <div className="mod-banner mod-banner-info" role="status">
            <div className="mod-banner-main">
              <Link2 size={18} />
  
              <span>
                {acidenteFiltro
                  ? `Exibindo afastamentos vinculados ao acidente de ${formatarData(acidenteFiltro.data)} (${acidenteFiltro.funcionario}).`
                  : `Exibindo afastamentos vinculados ao acidente nº ${acidenteFiltroId}.`}
              </span>
            </div>
  
            <div className="mod-banner-actions">
              {acidenteFiltro && (
                <button
                  type="button"
                  className="mod-banner-btn"
                  onClick={abrirNovoDoAcidente}
                >
                  Registrar afastamento deste acidente
                </button>
              )}
  
              <button
                type="button"
                className="mod-banner-btn"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Ver todos
              </button>
            </div>
          </div>
        )}
  
        <div
          className="mod-stats"
          style={{
            gridTemplateColumns: mobile
              ? "minmax(0, 1fr)"
              : telaMedia
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
          }}
        >
          <StatCard
            title="Em Andamento"
            value={totalEmAndamento}
            icon={<Clock3 size={22} />}
            color="#2563EB"
          />
  
          <StatCard
            title="Retornos Previstos (30 dias)"
            value={totalRetornosPrevistos}
            icon={<CalendarClock size={22} />}
            color="#F59E0B"
          />
  
          <StatCard
            title="Previsão de Retorno Vencida"
            value={totalPrevisaoVencida}
            icon={<TriangleAlert size={22} />}
            color="#DC2626"
          />
  
          <StatCard
            title="Encerrados"
            value={totalEncerrados}
            icon={<CircleCheckBig size={22} />}
            color="#16A34A"
          />
        </div>
  
        <section className="mod-panel">
          <div className="mod-panel-heading">
            <div>
              <span className="mod-eyebrow">Saúde ocupacional</span>
              <h2>Registro de afastamentos</h2>
              <p>
                Previsão vencida indica afastamento em andamento cuja data
                prevista já passou sem retorno registrado.
              </p>
            </div>
  
            <div className="mod-chip">
              <CalendarClock size={14} />
              {afastamentos.length} registro(s)
            </div>
          </div>
  
          <div className="mod-filters">
            <div className="mod-filter-title-row">
              <div className="mod-filter-title">
                <SlidersHorizontal size={16} />
                Filtros de afastamentos
              </div>
  
              {filtrosAtivos && (
                <button
                  type="button"
                  className="mod-clear-filter"
                  onClick={limparFiltros}
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              )}
            </div>
  
            <div className="mod-filter-grid">
              <div className="mod-search">
                <Search size={17} />
  
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou matrícula..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>
  
              <select
                className="mod-select"
                value={filtroSituacao}
                onChange={(e) =>
                  setFiltroSituacao(e.target.value as FiltroSituacao)
                }
              >
                <option value="">Todas as situações</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrado">Encerrado</option>
                <option value="cancelado">Cancelado</option>
              </select>
  
              <select
                className="mod-select"
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
  
              <div className="mod-filter-field">
                <label htmlFor="afast-periodo-de">Período a partir de</label>
  
                <input
                  id="afast-periodo-de"
                  type="date"
                  className="mod-select"
                  value={periodoDe}
                  onChange={(e) => setPeriodoDe(e.target.value)}
                />
              </div>
  
              <div className="mod-filter-field">
                <label htmlFor="afast-periodo-ate">Período até</label>
  
                <input
                  id="afast-periodo-ate"
                  type="date"
                  className="mod-select"
                  value={periodoAte}
                  onChange={(e) => setPeriodoAte(e.target.value)}
                />
              </div>
            </div>
  
            <div className="mod-result-count">
              Exibindo <strong>{afastamentosFiltrados.length}</strong> de{" "}
              <strong>{afastamentos.length}</strong> afastamento(s). O período
              considera afastamentos que se sobrepõem ao intervalo informado.
            </div>
          </div>
  
          {renderizarConteudo()}
        </section>
  
        {detalhe && renderizarDetalhe(detalhe)}
  
        {formAberto && (
          <div
            className="mod-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharFormulario();
              }
            }}
          >
            <aside
              className="mod-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="afast-form-titulo"
            >
              <header className="mod-drawer-header">
                <div className="mod-drawer-header-main">
                  <div className="mod-drawer-icon">
                    <CalendarClock size={22} />
                  </div>
  
                  <div className="mod-drawer-title">
                    <span className="mod-drawer-eyebrow">Saúde ocupacional</span>
  
                    <h2 id="afast-form-titulo">
                      {editando ? "Editar afastamento" : "Novo afastamento"}
                    </h2>
  
                    <p>Período, categoria e vínculos do afastamento.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mod-drawer-close"
                  onClick={fecharFormulario}
                  aria-label="Fechar formulário"
                >
                  <X size={19} />
                </button>
              </header>
  
              <div className="mod-drawer-content">
                <div className="mod-note">
                  <div className="mod-note-icon">
                    <ShieldCheck size={18} />
                  </div>
  
                  <div>
                    <strong>Não registre dados de saúde</strong>
                    <span>
                      Não informe diagnóstico, CID nem descrição médica. Use a
                      categoria e a referência de onde o documento está
                      arquivado.
                    </span>
                  </div>
                </div>
  
                {erroFormulario && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroFormulario}</span>
                  </div>
                )}
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>01</span>
  
                    <div>
                      <h3>Funcionário e categoria</h3>
                      <p>Quem se afastou e qual a natureza do afastamento.</p>
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="afast-funcionario">
                      Funcionário<span>*</span>
                    </label>
  
                    <select
                      id="afast-funcionario"
                      className="mod-input"
                      value={formulario.funcionarioId || ""}
                      onChange={(e) => selecionarFuncionario(e.target.value)}
                    >
                      <option value="">Selecione o funcionário</option>
  
                      {opcoesFuncionarios.map((funcionario) => (
                        <option key={funcionario.id} value={funcionario.id}>
                          {funcionario.nome}
                          {funcionario.matricula
                            ? ` (${funcionario.matricula})`
                            : ""}
                          {funcionario.situacao === "desligado"
                            ? " - desligado"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="afast-categoria">
                      Categoria<span>*</span>
                    </label>
  
                    <select
                      id="afast-categoria"
                      className="mod-input"
                      value={formulario.categoria}
                      onChange={(e) => {
                        const valor = e.target.value as
                          | CategoriaAfastamento
                          | "";
  
                        setFormulario((atual) => ({
                          ...atual,
                          categoria: valor,
                          acidenteId:
                            valor === "relacionado_trabalho"
                              ? atual.acidenteId
                              : null,
                        }));
                      }}
                    >
                      <option value="">Selecione a categoria</option>
  
                      <option value="relacionado_trabalho">
                        {ROTULO_CATEGORIA.relacionado_trabalho}
                      </option>
  
                      <option value="nao_relacionado_trabalho">
                        {ROTULO_CATEGORIA.nao_relacionado_trabalho}
                      </option>
  
                      <option value="administrativo">
                        {ROTULO_CATEGORIA.administrativo}
                      </option>
                    </select>
                  </div>
  
                  {formulario.categoria === "relacionado_trabalho" && (
                    <div className="mod-field">
                      <label htmlFor="afast-acidente">
                        Acidente registrado (opcional)
                      </label>
  
                      <select
                        id="afast-acidente"
                        className="mod-input"
                        value={formulario.acidenteId ?? ""}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            acidenteId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Sem vínculo com acidente</option>
  
                        {acidentes.map((acidente) => (
                          <option key={acidente.id} value={acidente.id}>
                            {formatarData(acidente.data)} - {acidente.tipo} -{" "}
                            {acidente.funcionario}
                          </option>
                        ))}
                      </select>
  
                      <small>
                        Nem todo afastamento relacionado ao trabalho precisa de
                        um acidente registrado.
                      </small>
                    </div>
                  )}
  
                  <div className="mod-grid-2">
                    <div className="mod-field">
                      <label htmlFor="afast-setor">Setor</label>
  
                      <input
                        id="afast-setor"
                        className="mod-input"
                        type="text"
                        maxLength={80}
                        placeholder="Setor no período"
                        value={formulario.setor}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            setor: e.target.value,
                          }))
                        }
                      />
                    </div>
  
                    <div className="mod-field">
                      <label htmlFor="afast-atividade">Atividade</label>
  
                      <input
                        id="afast-atividade"
                        className="mod-input"
                        type="text"
                        maxLength={120}
                        placeholder="Opcional"
                        value={formulario.atividade}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            atividade: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>02</span>
  
                    <div>
                      <h3>Período e situação</h3>
                      <p>
                        A previsão de retorno não é a data real. O retorno efetivo
                        só é informado ao encerrar.
                      </p>
                    </div>
                  </div>
  
                  <div className="mod-grid-2">
                    <div className="mod-field">
                      <label htmlFor="afast-inicio">
                        Data de início<span>*</span>
                      </label>
  
                      <input
                        id="afast-inicio"
                        className="mod-input"
                        type="date"
                        value={formulario.dataInicio}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            dataInicio: e.target.value,
                          }))
                        }
                      />
                    </div>
  
                    <div className="mod-field">
                      <label htmlFor="afast-previsao">Previsão de retorno</label>
  
                      <input
                        id="afast-previsao"
                        className="mod-input"
                        type="date"
                        value={formulario.previsaoRetorno}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            previsaoRetorno: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="afast-situacao">Situação</label>
  
                    <select
                      id="afast-situacao"
                      className="mod-input"
                      value={formulario.situacao}
                      onChange={(e) =>
                        setFormulario((atual) => ({
                          ...atual,
                          situacao: e.target.value as SituacaoAfastamento,
                        }))
                      }
                    >
                      <option value="em_andamento">
                        {ROTULO_SITUACAO.em_andamento}
                      </option>
                      <option value="encerrado">
                        {ROTULO_SITUACAO.encerrado}
                      </option>
                      <option value="cancelado">
                        {ROTULO_SITUACAO.cancelado}
                      </option>
                    </select>
                  </div>
  
                  {conflitoEmAndamento && (
                    <div className="mod-form-aviso">
                      Este funcionário já possui outro afastamento em andamento.
                      Confira se não é um registro duplicado.
                    </div>
                  )}
  
                  {formulario.situacao === "encerrado" && (
                    <div className="mod-field">
                      <label htmlFor="afast-retorno">
                        Data efetiva de retorno<span>*</span>
                      </label>
  
                      <input
                        id="afast-retorno"
                        className="mod-input"
                        type="date"
                        max={hoje}
                        value={formulario.dataRetorno}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            dataRetorno: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
  
                  {formulario.situacao === "cancelado" && (
                    <div className="mod-field">
                      <label htmlFor="afast-motivo">
                        Motivo do cancelamento<span>*</span>
                      </label>
  
                      <textarea
                        id="afast-motivo"
                        className="mod-input mod-textarea"
                        rows={3}
                        maxLength={300}
                        placeholder="Ex.: registro lançado por engano"
                        value={formulario.motivoCancelamento}
                        onChange={(e) =>
                          setFormulario((atual) => ({
                            ...atual,
                            motivoCancelamento: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>03</span>
  
                    <div>
                      <h3>Documentação e observações</h3>
                      <p>Somente informações administrativas.</p>
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="afast-referencia">
                      Referência documental
                    </label>
  
                    <input
                      id="afast-referencia"
                      className="mod-input"
                      type="text"
                      maxLength={200}
                      placeholder="Ex.: documento arquivado no prontuário do funcionário"
                      value={formulario.referenciaDocumental}
                      onChange={(e) =>
                        setFormulario((atual) => ({
                          ...atual,
                          referenciaDocumental: e.target.value,
                        }))
                      }
                    />
  
                    <small>
                      Indique apenas onde o documento está guardado. Não anexe
                      nem descreva o conteúdo médico.
                    </small>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="afast-observacoes">
                      Observações administrativas
                    </label>
  
                    <textarea
                      id="afast-observacoes"
                      className="mod-input mod-textarea"
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
                </section>
              </div>
  
              <footer className="mod-drawer-footer">
                <Button
                  onClick={fecharFormulario}
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
                      : "Registrar afastamento"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
      </main>
    );
  }
  
  function SituacaoBadge({ situacao }: { situacao: SituacaoAfastamento }) {
    return (
      <Badge
        color={
          situacao === "em_andamento"
            ? "blue"
            : situacao === "encerrado"
              ? "green"
              : "gray"
        }
      >
        {ROTULO_SITUACAO[situacao]}
      </Badge>
    );
  }
  
  function Item({
    titulo,
    children,
  }: {
    titulo: string;
    children: ReactNode;
  }) {
    return (
      <div className="mod-detail-item">
        <span>{titulo}</span>
        <div>{children}</div>
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
      <div className="mod-empty" style={{ minHeight: mobile ? 210 : 250 }}>
        <div className="mod-empty-icon">
          <CalendarClock size={25} />
        </div>
  
        <strong>{titulo}</strong>
  
        <span>{texto}</span>
  
        {acao}
      </div>
    );
  }