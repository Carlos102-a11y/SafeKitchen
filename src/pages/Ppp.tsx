import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import type { ReactNode } from "react";
  
  import { useNavigate } from "react-router-dom";
  
  import {
    AlertCircle,
    CircleCheckBig,
    ClipboardList,
    Eye,
    FileText,
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
  
  import { listarAfastamentos } from "../services/afastamentosService";
  import { listarFuncionarios } from "../services/funcionariosService";
  import { listarDocumentos, listarRevisoes } from "../services/ltcatService";
  
  import {
    atualizarExposicao,
    atualizarPeriodo,
    criarExposicao,
    criarPeriodo,
    excluirExposicao,
    excluirPeriodo,
    listarAcidentesVinculados,
    listarCadastros,
    listarEpisResumo,
    listarExposicoes,
    listarPeriodos,
    listarRiscosPgr,
    salvarCadastro,
  } from "../services/pppService";
  
  import {
    ROTULO_CATEGORIA_CURTO,
    ROTULO_SITUACAO,
  } from "../models/Afastamento";
  
  import { ROTULO_SITUACAO_REVISAO } from "../models/Ltcat";
  
  import {
    ROTULO_EPI_EFICAZ,
    ROTULO_TIPO_AGENTE,
    ROTULO_TIPO_AVALIACAO,
  } from "../models/Ppp";
  
  import type { Afastamento } from "../models/Afastamento";
  import type { Funcionario } from "../models/Funcionario";
  import type { DocumentoLtcat, RevisaoLtcat } from "../models/Ltcat";
  import type {
    AcidenteFuncionario,
    EpiEficaz,
    EpiResumo,
    ExposicaoPpp,
    ExposicaoPppEntrada,
    PeriodoProfissional,
    PeriodoProfissionalEntrada,
    PppCadastro,
    RiscoPgrResumo,
    TipoAgente,
    TipoAvaliacao,
  } from "../models/Ppp";
  
  import { cpfValido, mascararCpf, mascararNit, somenteDigitos } from "../utils/cpf";
  import { formatarData, hojeISO } from "../utils/datas";
  import { gerarRelatorioPpp } from "../utils/pdfPpp";
  import {
    calcularPendencias,
    sobrepoe,
    textoIntervalo,
  } from "../utils/pppPendencias";
  
  import type { Pendencia } from "../utils/pppPendencias";
  
  import "../styles/modulos.css";
  
  type Aba = "cadastro" | "historico" | "exposicoes" | "conferencia";
  
  type FiltroSituacao = "" | "ativo" | "desligado";
  
  interface FormularioCadastro {
    cpf: string;
    nit: string;
    dataNascimento: string;
    observacoes: string;
  }
  
  type FormularioExposicao = Omit<ExposicaoPppEntrada, "tipoAgente"> & {
    tipoAgente: TipoAgente | "";
  };
  
  const cadastroInicial: FormularioCadastro = {
    cpf: "",
    nit: "",
    dataNascimento: "",
    observacoes: "",
  };
  
  function periodoInicial(funcionarioId: number): PeriodoProfissionalEntrada {
    return {
      funcionarioId,
      dataInicio: "",
      dataFim: "",
      setor: "",
      funcao: "",
      cbo: "",
      atividades: "",
      observacoes: "",
    };
  }
  
  function exposicaoInicial(funcionarioId: number): FormularioExposicao {
    return {
      funcionarioId,
      periodoInicio: "",
      periodoFim: "",
      setor: "",
      atividade: "",
      tipoAgente: "",
      agente: "",
      tipoAvaliacao: "nao_informada",
      resultado: "",
      unidade: "",
      metodologia: "",
      medidasColetivas: "",
      epiId: null,
      epiEficaz: "nao_informado",
      ltcatRevisaoId: null,
      pgrId: null,
      fonteDescricao: "",
      responsavelNome: "",
      responsavelRegistro: "",
      observacoes: "",
    };
  }
  
  function paraEntradaPeriodo(
    periodo: PeriodoProfissional
  ): PeriodoProfissionalEntrada {
    return {
      funcionarioId: periodo.funcionarioId,
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      setor: periodo.setor,
      funcao: periodo.funcao,
      cbo: periodo.cbo,
      atividades: periodo.atividades,
      observacoes: periodo.observacoes,
    };
  }
  
  function paraFormularioExposicao(exposicao: ExposicaoPpp): FormularioExposicao {
    return {
      funcionarioId: exposicao.funcionarioId,
      periodoInicio: exposicao.periodoInicio,
      periodoFim: exposicao.periodoFim,
      setor: exposicao.setor,
      atividade: exposicao.atividade,
      tipoAgente: exposicao.tipoAgente,
      agente: exposicao.agente,
      tipoAvaliacao: exposicao.tipoAvaliacao,
      resultado: exposicao.resultado,
      unidade: exposicao.unidade,
      metodologia: exposicao.metodologia,
      medidasColetivas: exposicao.medidasColetivas,
      epiId: exposicao.epiId,
      epiEficaz: exposicao.epiEficaz,
      ltcatRevisaoId: exposicao.ltcatRevisaoId,
      pgrId: exposicao.pgrId,
      fonteDescricao: exposicao.fonteDescricao,
      responsavelNome: exposicao.responsavelNome,
      responsavelRegistro: exposicao.responsavelRegistro,
      observacoes: exposicao.observacoes,
    };
  }
  
  function agrupar<T extends { funcionarioId: number }>(lista: T[]) {
    const mapa = new Map<number, T[]>();
  
    lista.forEach((item) => {
      const atual = mapa.get(item.funcionarioId) ?? [];
  
      atual.push(item);
  
      mapa.set(item.funcionarioId, atual);
    });
  
    return mapa;
  }
  
  function normalizar(texto: string) {
    return texto.trim().toLowerCase();
  }
  
  function validarCadastro(formulario: FormularioCadastro, hoje: string) {
    const cpf = somenteDigitos(formulario.cpf);
    const nit = somenteDigitos(formulario.nit);
  
    if (cpf && !cpfValido(cpf)) {
      return "O CPF informado é inválido. Confira os 11 números.";
    }
  
    if (nit && nit.length !== 11) {
      return "O NIT/PIS deve ter 11 números.";
    }
  
    if (
      formulario.dataNascimento &&
      (formulario.dataNascimento > hoje || formulario.dataNascimento < "1900-01-01")
    ) {
      return "A data de nascimento informada é inválida.";
    }
  
    return "";
  }
  
  function validarPeriodo(formulario: PeriodoProfissionalEntrada) {
    if (!formulario.dataInicio) {
      return "Informe a data de início do período.";
    }
  
    if (formulario.dataFim && formulario.dataFim < formulario.dataInicio) {
      return "O fim do período não pode ser anterior ao início.";
    }
  
    return "";
  }
  
  function validarExposicao(formulario: FormularioExposicao) {
    if (!formulario.periodoInicio) {
      return "Informe o início do período da condição ambiental.";
    }
  
    if (
      formulario.periodoFim &&
      formulario.periodoFim < formulario.periodoInicio
    ) {
      return "O fim do período não pode ser anterior ao início.";
    }
  
    if (!formulario.tipoAgente) {
      return "Selecione o tipo de agente.";
    }
  
    if (formulario.tipoAgente !== "ausencia" && !formulario.agente.trim()) {
      return "Informe o agente, conforme consta no documento-fonte.";
    }
  
    if (
      formulario.ltcatRevisaoId === null &&
      formulario.pgrId === null &&
      !formulario.fonteDescricao.trim()
    ) {
      return "Informe ao menos uma fonte documental: revisão de LTCAT, risco do PGR ou descrição de outra fonte.";
    }
  
    return "";
  }
  
  export default function Ppp() {
    const navigate = useNavigate();
  
    const largura = useViewportWidth();
  
    const mobile = largura <= 650;
    const tablet = largura <= 900;
    const telaMedia = largura <= 1180;
  
    const hoje = hojeISO();
  
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [cadastros, setCadastros] = useState<PppCadastro[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoProfissional[]>([]);
    const [exposicoes, setExposicoes] = useState<ExposicaoPpp[]>([]);
    const [documentos, setDocumentos] = useState<DocumentoLtcat[]>([]);
    const [revisoes, setRevisoes] = useState<RevisaoLtcat[]>([]);
    const [riscos, setRiscos] = useState<RiscoPgrResumo[]>([]);
    const [epis, setEpis] = useState<EpiResumo[]>([]);
    const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
    const [acidentes, setAcidentes] = useState<AcidenteFuncionario[]>([]);
  
    const [carregando, setCarregando] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [avisoDados, setAvisoDados] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tentativa, setTentativa] = useState(0);
  
    const [pesquisa, setPesquisa] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("");
  
    const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
    const [aba, setAba] = useState<Aba>("cadastro");
  
    const [formCadastro, setFormCadastro] =
      useState<FormularioCadastro>(cadastroInicial);
    const [salvandoCadastro, setSalvandoCadastro] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");
  
    const [periodoAberto, setPeriodoAberto] = useState(false);
    const [editandoPeriodo, setEditandoPeriodo] =
      useState<PeriodoProfissional | null>(null);
    const [formPeriodo, setFormPeriodo] = useState<PeriodoProfissionalEntrada>(
      periodoInicial(0)
    );
    const [salvandoPeriodo, setSalvandoPeriodo] = useState(false);
    const [erroPeriodo, setErroPeriodo] = useState("");
  
    const [exposicaoAberta, setExposicaoAberta] = useState(false);
    const [editandoExposicao, setEditandoExposicao] =
      useState<ExposicaoPpp | null>(null);
    const [formExposicao, setFormExposicao] = useState<FormularioExposicao>(
      exposicaoInicial(0)
    );
    const [salvandoExposicao, setSalvandoExposicao] = useState(false);
    const [erroExposicao, setErroExposicao] = useState("");
  
    /* CARREGAMENTO */
  
    useEffect(() => {
      let componenteAtivo = true;
  
      async function carregar() {
        const [
          resFuncionarios,
          resCadastros,
          resPeriodos,
          resExposicoes,
          resDocumentos,
          resRevisoes,
          resRiscos,
          resEpis,
          resAfastamentos,
          resAcidentes,
        ] = await Promise.all([
          listarFuncionarios(),
          listarCadastros(),
          listarPeriodos(),
          listarExposicoes(),
          listarDocumentos(),
          listarRevisoes(),
          listarRiscosPgr(),
          listarEpisResumo(),
          listarAfastamentos(),
          listarAcidentesVinculados(),
        ]);
  
        if (!componenteAtivo) {
          return;
        }
  
        const erroCritico =
          resFuncionarios.erro ??
          resCadastros.erro ??
          resPeriodos.erro ??
          resExposicoes.erro;
  
        if (
          erroCritico ||
          !resFuncionarios.data ||
          !resCadastros.data ||
          !resPeriodos.data ||
          !resExposicoes.data
        ) {
          setFuncionarios([]);
          setCadastros([]);
          setPeriodos([]);
          setExposicoes([]);
          setErroLista(erroCritico ?? "Não foi possível carregar os dados do PPP.");
          setCarregando(false);
          return;
        }
  
        setFuncionarios(resFuncionarios.data);
        setCadastros(resCadastros.data);
        setPeriodos(resPeriodos.data);
        setExposicoes(resExposicoes.data);
  
        setDocumentos(resDocumentos.data ?? []);
        setRevisoes(resRevisoes.data ?? []);
        setRiscos(resRiscos.data ?? []);
        setEpis(resEpis.data ?? []);
        setAfastamentos(resAfastamentos.data ?? []);
        setAcidentes(resAcidentes.data ?? []);
  
        const secundarios = [
          resDocumentos,
          resRevisoes,
          resRiscos,
          resEpis,
          resAfastamentos,
          resAcidentes,
        ];
  
        setAvisoDados(
          secundarios.some((resultado) => resultado.erro)
            ? "Alguns dados de apoio (LTCAT, PGR, EPIs, afastamentos ou acidentes) não foram carregados. Recarregue a página antes de gerar relatórios."
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
  
    const fecharPeriodo = useCallback(() => {
      setPeriodoAberto(false);
      setEditandoPeriodo(null);
      setErroPeriodo("");
    }, []);
  
    const fecharExposicao = useCallback(() => {
      setExposicaoAberta(false);
      setEditandoExposicao(null);
      setErroExposicao("");
    }, []);
  
    const algumDrawerAberto = periodoAberto || exposicaoAberta;
  
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
  
        if (exposicaoAberta) {
          fecharExposicao();
        } else {
          fecharPeriodo();
        }
      }
  
      window.addEventListener("keydown", fecharComEsc);
  
      return () => {
        document.body.style.overflow = overflowAnterior;
        window.removeEventListener("keydown", fecharComEsc);
      };
    }, [algumDrawerAberto, exposicaoAberta, fecharExposicao, fecharPeriodo]);
  
    /* MAPAS */
  
    const funcionarioPorId = useMemo(
      () =>
        new Map<number, Funcionario>(
          funcionarios.map(
            (funcionario) => [funcionario.id, funcionario] as [number, Funcionario]
          )
        ),
      [funcionarios]
    );
  
    const cadastroPorFuncionario = useMemo(
      () =>
        new Map<number, PppCadastro>(
          cadastros.map(
            (cadastro) => [cadastro.funcionarioId, cadastro] as [number, PppCadastro]
          )
        ),
      [cadastros]
    );
  
    const periodosPorFuncionario = useMemo(() => agrupar(periodos), [periodos]);
  
    const exposicoesPorFuncionario = useMemo(
      () => agrupar(exposicoes),
      [exposicoes]
    );
  
    const revisoesPorId = useMemo(
      () =>
        new Map<number, RevisaoLtcat>(
          revisoes.map((revisao) => [revisao.id, revisao] as [number, RevisaoLtcat])
        ),
      [revisoes]
    );
  
    const documentosPorId = useMemo(
      () =>
        new Map<number, DocumentoLtcat>(
          documentos.map(
            (documento) => [documento.id, documento] as [number, DocumentoLtcat]
          )
        ),
      [documentos]
    );
  
    const riscosPorId = useMemo(
      () =>
        new Map<number, RiscoPgrResumo>(
          riscos.map((risco) => [risco.id, risco] as [number, RiscoPgrResumo])
        ),
      [riscos]
    );
  
    const episPorId = useMemo(
      () => new Map<number, EpiResumo>(epis.map((epi) => [epi.id, epi] as [number, EpiResumo])),
      [epis]
    );
  
    const pendenciasPorFuncionario = useMemo(() => {
      const mapa = new Map<number, Pendencia[]>();
  
      funcionarios.forEach((funcionario) => {
        mapa.set(
          funcionario.id,
          calcularPendencias({
            funcionario,
            cadastro: cadastroPorFuncionario.get(funcionario.id) ?? null,
            periodos: periodosPorFuncionario.get(funcionario.id) ?? [],
            exposicoes: exposicoesPorFuncionario.get(funcionario.id) ?? [],
            revisoesPorId,
          })
        );
      });
  
      return mapa;
    }, [
      funcionarios,
      cadastroPorFuncionario,
      periodosPorFuncionario,
      exposicoesPorFuncionario,
      revisoesPorId,
    ]);
  
    /* INDICADORES (dados reais) */
  
    const semHistorico = funcionarios.filter(
      (funcionario) =>
        (periodosPorFuncionario.get(funcionario.id) ?? []).length === 0
    ).length;
  
    let totalPendencias = 0;
  
    pendenciasPorFuncionario.forEach((lista) => {
      totalPendencias += lista.filter((item) => item.tipo === "pendencia").length;
    });
  
    /* FILTROS */
  
    const funcionariosFiltrados = useMemo(() => {
      const termo = normalizar(pesquisa);
  
      return funcionarios.filter((funcionario) => {
        const correspondePesquisa =
          !termo ||
          funcionario.nome.toLowerCase().includes(termo) ||
          funcionario.matricula.toLowerCase().includes(termo) ||
          funcionario.setor.toLowerCase().includes(termo);
  
        const correspondeSituacao =
          !filtroSituacao || funcionario.situacao === filtroSituacao;
  
        return correspondePesquisa && correspondeSituacao;
      });
    }, [funcionarios, pesquisa, filtroSituacao]);
  
    const filtrosAtivos = pesquisa.trim() !== "" || filtroSituacao !== "";
  
    const funcionarioSel =
      selecionadoId !== null ? (funcionarioPorId.get(selecionadoId) ?? null) : null;
  
    /* AÇÕES: NAVEGAÇÃO */
  
    function abrirFuncionario(funcionario: Funcionario) {
      const cadastro = cadastroPorFuncionario.get(funcionario.id);
  
      setFormCadastro(
        cadastro
          ? {
              cpf: cadastro.cpf,
              nit: cadastro.nit,
              dataNascimento: cadastro.dataNascimento,
              observacoes: cadastro.observacoes,
            }
          : cadastroInicial
      );
  
      setErroCadastro("");
      setAba("cadastro");
      setSelecionadoId(funcionario.id);
    }
  
    function tentarNovamente() {
      setErroLista("");
      setCarregando(true);
      setTentativa((valor) => valor + 1);
    }
  
    /* AÇÕES: IDENTIFICAÇÃO */
  
    async function salvarIdentificacao(funcionario: Funcionario) {
      if (salvandoCadastro) {
        return;
      }
  
      const erro = validarCadastro(formCadastro, hoje);
  
      if (erro) {
        setErroCadastro(erro);
        return;
      }
  
      const existente = cadastroPorFuncionario.get(funcionario.id) ?? null;
  
      setSalvandoCadastro(true);
      setErroCadastro("");
  
      const resultado = await salvarCadastro(
        {
          funcionarioId: funcionario.id,
          cpf: somenteDigitos(formCadastro.cpf),
          nit: somenteDigitos(formCadastro.nit),
          dataNascimento: formCadastro.dataNascimento,
          observacoes: formCadastro.observacoes,
        },
        existente ? existente.id : null
      );
  
      setSalvandoCadastro(false);
  
      if (resultado.erro || !resultado.data) {
        setErroCadastro(
          resultado.erro ?? "Não foi possível salvar a identificação."
        );
        return;
      }
  
      const salvo = resultado.data;
  
      setCadastros((listaAtual) =>
        listaAtual.some((item) => item.id === salvo.id)
          ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
          : [...listaAtual, salvo]
      );
  
      setFormCadastro({
        cpf: salvo.cpf,
        nit: salvo.nit,
        dataNascimento: salvo.dataNascimento,
        observacoes: salvo.observacoes,
      });
  
      setMensagem("Identificação do trabalhador salva com sucesso.");
    }
  
    /* AÇÕES: PERÍODOS */
  
    function abrirNovoPeriodo(funcionario: Funcionario) {
      const lista = periodosPorFuncionario.get(funcionario.id) ?? [];
  
      const base = periodoInicial(funcionario.id);
  
      if (lista.length === 0) {
        base.dataInicio = funcionario.dataAdmissao;
        base.setor = funcionario.setor;
        base.funcao = funcionario.funcao;
      }
  
      setEditandoPeriodo(null);
      setErroPeriodo("");
      setFormPeriodo(base);
      setPeriodoAberto(true);
    }
  
    function abrirEdicaoPeriodo(periodo: PeriodoProfissional) {
      setEditandoPeriodo(periodo);
      setErroPeriodo("");
      setFormPeriodo(paraEntradaPeriodo(periodo));
      setPeriodoAberto(true);
    }
  
    async function salvarPeriodo() {
      if (salvandoPeriodo) {
        return;
      }
  
      const erro = validarPeriodo(formPeriodo);
  
      if (erro) {
        setErroPeriodo(erro);
        return;
      }
  
      setSalvandoPeriodo(true);
      setErroPeriodo("");
  
      const idEditando = editandoPeriodo?.id ?? null;
  
      const resultado =
        idEditando !== null
          ? await atualizarPeriodo(idEditando, formPeriodo)
          : await criarPeriodo(formPeriodo);
  
      setSalvandoPeriodo(false);
  
      if (resultado.erro || !resultado.data) {
        setErroPeriodo(resultado.erro ?? "Não foi possível salvar o período.");
        return;
      }
  
      const salvo = resultado.data;
  
      setPeriodos((listaAtual) =>
        idEditando !== null
          ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
          : [...listaAtual, salvo]
      );
  
      setMensagem(
        idEditando !== null
          ? "Período atualizado com sucesso."
          : "Período registrado com sucesso."
      );
  
      fecharPeriodo();
    }
  
    async function excluirPeriodoAtual(periodo: PeriodoProfissional) {
      const confirmar = window.confirm(
        `Deseja realmente excluir o período ${textoIntervalo(periodo.dataInicio, periodo.dataFim)}?`
      );
  
      if (!confirmar) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await excluirPeriodo(periodo.id);
  
      if (resultado.erro) {
        setErroAcao(resultado.erro);
        return;
      }
  
      setPeriodos((listaAtual) =>
        listaAtual.filter((item) => item.id !== periodo.id)
      );
  
      setMensagem("Período excluído com sucesso.");
    }
  
    /* AÇÕES: CONDIÇÕES AMBIENTAIS */
  
    function abrirNovaExposicao(funcionario: Funcionario) {
      const base = exposicaoInicial(funcionario.id);
  
      base.setor = funcionario.setor;
  
      setEditandoExposicao(null);
      setErroExposicao("");
      setFormExposicao(base);
      setExposicaoAberta(true);
    }
  
    function abrirEdicaoExposicao(exposicao: ExposicaoPpp) {
      setEditandoExposicao(exposicao);
      setErroExposicao("");
      setFormExposicao(paraFormularioExposicao(exposicao));
      setExposicaoAberta(true);
    }
  
    function selecionarRevisaoLtcat(valor: string) {
      const id = valor ? Number(valor) : null;
  
      const revisao = id !== null ? revisoesPorId.get(id) : undefined;
  
      setFormExposicao((atual) => ({
        ...atual,
        ltcatRevisaoId: id,
        responsavelNome: atual.responsavelNome.trim() || revisao?.responsavelNome || "",
        responsavelRegistro:
          atual.responsavelRegistro.trim() || revisao?.registroProfissional || "",
      }));
    }
  
    async function salvarExposicao() {
      if (salvandoExposicao) {
        return;
      }
  
      const erro = validarExposicao(formExposicao);
  
      if (erro) {
        setErroExposicao(erro);
        return;
      }
  
      const tipoAgente = formExposicao.tipoAgente;
  
      if (tipoAgente === "") {
        return;
      }
  
      const entrada: ExposicaoPppEntrada = { ...formExposicao, tipoAgente };
  
      setSalvandoExposicao(true);
      setErroExposicao("");
  
      const idEditando = editandoExposicao?.id ?? null;
  
      const resultado =
        idEditando !== null
          ? await atualizarExposicao(idEditando, entrada)
          : await criarExposicao(entrada);
  
      setSalvandoExposicao(false);
  
      if (resultado.erro || !resultado.data) {
        setErroExposicao(
          resultado.erro ?? "Não foi possível salvar a condição ambiental."
        );
        return;
      }
  
      const salvo = resultado.data;
  
      setExposicoes((listaAtual) =>
        idEditando !== null
          ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
          : [...listaAtual, salvo]
      );
  
      setMensagem(
        idEditando !== null
          ? "Condição ambiental atualizada com sucesso."
          : "Condição ambiental registrada com sucesso."
      );
  
      fecharExposicao();
    }
  
    async function excluirExposicaoAtual(exposicao: ExposicaoPpp) {
      const confirmar = window.confirm(
        `Deseja realmente excluir o registro de ${textoIntervalo(exposicao.periodoInicio, exposicao.periodoFim)}?`
      );
  
      if (!confirmar) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await excluirExposicao(exposicao.id);
  
      if (resultado.erro) {
        setErroAcao(resultado.erro);
        return;
      }
  
      setExposicoes((listaAtual) =>
        listaAtual.filter((item) => item.id !== exposicao.id)
      );
  
      setMensagem("Condição ambiental excluída com sucesso.");
    }
  
    /* RELATÓRIO */
  
    function gerarRelatorio(funcionario: Funcionario) {
      if (avisoDados) {
        setErroAcao(
          "Recarregue a página: alguns dados de apoio não foram carregados e o relatório ficaria incompleto."
        );
        return;
      }
  
      try {
        gerarRelatorioPpp({
          funcionario,
          cadastro: cadastroPorFuncionario.get(funcionario.id) ?? null,
          periodos: periodosPorFuncionario.get(funcionario.id) ?? [],
          exposicoes: exposicoesPorFuncionario.get(funcionario.id) ?? [],
          pendencias: pendenciasPorFuncionario.get(funcionario.id) ?? [],
          revisoesPorId,
          documentosPorId,
          riscosPorId,
          episPorId,
          afastamentos: afastamentos.filter(
            (item) => item.funcionarioId === funcionario.id
          ),
          acidentes: acidentes.filter(
            (item) => item.funcionarioId === funcionario.id
          ),
        });
      } catch (erro) {
        console.error(
          "PPP (relatório):",
          erro instanceof Error ? erro.message : "erro desconhecido"
        );
  
        setErroAcao("Não foi possível gerar o relatório.");
      }
    }
  
    /* TEXTOS DE APOIO */
  
    function textoFonte(exposicao: ExposicaoPpp) {
      const partes: string[] = [];
  
      if (exposicao.ltcatRevisaoId !== null) {
        const revisao = revisoesPorId.get(exposicao.ltcatRevisaoId);
  
        const documento = revisao
          ? documentosPorId.get(revisao.documentoId)
          : undefined;
  
        partes.push(
          revisao
            ? `LTCAT "${documento?.titulo ?? "documento"}", revisão ${revisao.numero} (${ROTULO_SITUACAO_REVISAO[revisao.situacao]})`
            : "LTCAT não encontrado"
        );
      }
  
      if (exposicao.pgrId !== null) {
        const risco = riscosPorId.get(exposicao.pgrId);
  
        partes.push(risco ? `PGR: ${risco.setor} - ${risco.perigo}` : "PGR não encontrado");
      }
  
      if (exposicao.fonteDescricao.trim()) {
        partes.push(exposicao.fonteDescricao.trim());
      }
  
      return partes.length > 0 ? partes.join("; ") : "Sem fonte vinculada";
    }
  
    /* LISTA DE FUNCIONÁRIOS */
  
    function renderizarResumoPendencias(funcionario: Funcionario) {
      const lista = pendenciasPorFuncionario.get(funcionario.id) ?? [];
  
      const pendentes = lista.filter((item) => item.tipo === "pendencia").length;
      const conferir = lista.length - pendentes;
  
      if (lista.length === 0) {
        return <Badge color="green">Nenhuma pendência apontada</Badge>;
      }
  
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          {pendentes > 0 && <Badge color="red">{pendentes} pendência(s)</Badge>}
          {conferir > 0 && <Badge color="yellow">{conferir} a conferir</Badge>}
        </div>
      );
    }
  
    function renderizarLista() {
      if (carregando) {
        return (
          <div className="mod-loading">
            <ClipboardList size={22} />
            Carregando dados do PPP...
          </div>
        );
      }
  
      if (erroLista) {
        return (
          <EstadoVazio
            titulo="Não foi possível carregar os dados"
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
            texto="Cadastre os funcionários na tela Funcionários para organizar os dados de apoio ao PPP."
            acao={
              <Button onClick={() => navigate("/funcionarios")}>
                Abrir Funcionários
              </Button>
            }
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
          <div className="mod-mobile-list">
            {funcionariosFiltrados.map((funcionario) => (
              <article key={funcionario.id} className="mod-mobile-card">
                <div className="mod-mobile-header">
                  <div className="mod-person">
                    <div className="mod-avatar">
                      <UserRound size={18} />
                    </div>
  
                    <div>
                      <strong>{funcionario.nome}</strong>
                      <span>
                        {[funcionario.setor, funcionario.funcao]
                          .filter(Boolean)
                          .join(" - ") || "Setor e função não informados"}
                      </span>
                    </div>
                  </div>
  
                  {renderizarResumoPendencias(funcionario)}
                </div>
  
                <div className="mod-mobile-data">
                  <div>
                    <span>Períodos</span>
                    <strong>
                      {(periodosPorFuncionario.get(funcionario.id) ?? []).length}
                    </strong>
                  </div>
  
                  <div>
                    <span>Condições ambientais</span>
                    <strong>
                      {(exposicoesPorFuncionario.get(funcionario.id) ?? []).length}
                    </strong>
                  </div>
                </div>
  
                <div className="mod-mobile-actions" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                  <button
                    type="button"
                    className="mod-btn-edit"
                    onClick={() => abrirFuncionario(funcionario)}
                  >
                    <Eye size={15} />
                    Abrir dados do PPP
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
                <th>Setor e função atuais</th>
                <th>Períodos</th>
                <th>Condições ambientais</th>
                <th>Conferência</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
  
            <tbody>
              {funcionariosFiltrados.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>
                    <div className="mod-person">
                      <div className="mod-avatar">
                        <UserRound size={19} />
                      </div>
  
                      <div>
                        <strong>{funcionario.nome}</strong>
                        <span>
                          {funcionario.matricula
                            ? `Matrícula ${funcionario.matricula}`
                            : "Sem matrícula"}
                          {funcionario.situacao === "desligado" ? " - desligado" : ""}
                        </span>
                      </div>
                    </div>
                  </td>
  
                  <td>
                    <div style={{ minWidth: 150 }}>
                      {funcionario.setor || funcionario.funcao ? (
                        <>
                          <strong style={{ color: "#0f172a" }}>
                            {funcionario.setor || "Setor não informado"}
                          </strong>
                          <div className="mod-sub">
                            {funcionario.funcao || "Função não informada"}
                          </div>
                        </>
                      ) : (
                        <span className="mod-muted">Não informados</span>
                      )}
                    </div>
                  </td>
  
                  <td>{(periodosPorFuncionario.get(funcionario.id) ?? []).length}</td>
  
                  <td>{(exposicoesPorFuncionario.get(funcionario.id) ?? []).length}</td>
  
                  <td>{renderizarResumoPendencias(funcionario)}</td>
  
                  <td>
                    <div className="mod-actions">
                      <button
                        type="button"
                        title="Abrir dados do PPP"
                        aria-label="Abrir dados do PPP"
                        className="mod-action mod-action-edit"
                        onClick={() => abrirFuncionario(funcionario)}
                      >
                        <Eye size={17} />
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
  
    /* ÁREA DE TRABALHO DO FUNCIONÁRIO */
  
    function renderizarAbas(funcionario: Funcionario) {
      const lista = pendenciasPorFuncionario.get(funcionario.id) ?? [];
  
      const periodosF = [...(periodosPorFuncionario.get(funcionario.id) ?? [])].sort(
        (a, b) => b.dataInicio.localeCompare(a.dataInicio)
      );
  
      const exposicoesF = [
        ...(exposicoesPorFuncionario.get(funcionario.id) ?? []),
      ].sort((a, b) => b.periodoInicio.localeCompare(a.periodoInicio));
  
      const cadastro = cadastroPorFuncionario.get(funcionario.id) ?? null;
  
      return (
        <>
          <div className="mod-tabs" role="tablist">
            {(
              [
                ["cadastro", "Identificação"],
                ["historico", `Histórico profissional (${periodosF.length})`],
                ["exposicoes", `Condições ambientais (${exposicoesF.length})`],
                ["conferencia", `Conferência (${lista.length})`],
              ] as [Aba, string][]
            ).map(([chave, rotulo]) => (
              <button
                key={chave}
                type="button"
                role="tab"
                aria-selected={aba === chave}
                className={`mod-tab ${aba === chave ? "mod-tab-ativa" : ""}`}
                onClick={() => setAba(chave)}
              >
                {rotulo}
              </button>
            ))}
          </div>
  
          {aba === "cadastro" && (
            <>
              <div className="mod-detail-grid">
                <Item titulo="Nome">{funcionario.nome}</Item>
                <Item titulo="Matrícula">{funcionario.matricula || "Não informada"}</Item>
                <Item titulo="Setor atual">{funcionario.setor || "Não informado"}</Item>
                <Item titulo="Função atual">{funcionario.funcao || "Não informada"}</Item>
                <Item titulo="Admissão">{formatarData(funcionario.dataAdmissao)}</Item>
                <Item titulo="Situação">
                  {funcionario.situacao === "ativo"
                    ? "Ativo"
                    : `Desligado${funcionario.dataDesligamento ? ` em ${formatarData(funcionario.dataDesligamento)}` : ""}`}
                </Item>
              </div>
  
              <p className="mod-sub" style={{ marginBottom: 16 }}>
                Estes dados vêm do cadastro de funcionários. Para alterá-los, use a
                tela{" "}
                <button
                  type="button"
                  className="mod-clear-filter"
                  style={{ display: "inline" }}
                  onClick={() => navigate("/funcionarios")}
                >
                  Funcionários
                </button>
                .
              </p>
  
              <section className="mod-form-section">
                <div className="mod-form-section-header">
                  <span>01</span>
  
                  <div>
                    <h3>Identificação para conferência</h3>
                    <p>
                      Dados pessoais, usados somente para conferir o PPP. Informe
                      apenas números; pontos e traços são ignorados.
                    </p>
                  </div>
                </div>
  
                {erroCadastro && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroCadastro}</span>
                  </div>
                )}
  
                <div className="mod-grid-2">
                  <Campo
                    id="ppp-cpf"
                    label="CPF"
                    maxLength={14}
                    value={formCadastro.cpf}
                    placeholder="Somente números"
                    dica={cadastro?.cpf ? `Atual: ${mascararCpf(cadastro.cpf)}` : undefined}
                    onChange={(valor) =>
                      setFormCadastro((atual) => ({ ...atual, cpf: valor }))
                    }
                  />
  
                  <Campo
                    id="ppp-nit"
                    label="NIT/PIS"
                    maxLength={14}
                    value={formCadastro.nit}
                    placeholder="Somente números"
                    dica={cadastro?.nit ? `Atual: ${mascararNit(cadastro.nit)}` : undefined}
                    onChange={(valor) =>
                      setFormCadastro((atual) => ({ ...atual, nit: valor }))
                    }
                  />
                </div>
  
                <Campo
                  id="ppp-nascimento"
                  label="Data de nascimento"
                  type="date"
                  value={formCadastro.dataNascimento}
                  onChange={(valor) =>
                    setFormCadastro((atual) => ({ ...atual, dataNascimento: valor }))
                  }
                />
  
                <AreaTexto
                  id="ppp-cad-obs"
                  label="Observações"
                  rows={3}
                  maxLength={500}
                  value={formCadastro.observacoes}
                  onChange={(valor) =>
                    setFormCadastro((atual) => ({ ...atual, observacoes: valor }))
                  }
                />
              </section>
  
              <Button
                onClick={() => {
                  void salvarIdentificacao(funcionario);
                }}
                disabled={salvandoCadastro}
              >
                {salvandoCadastro ? "Salvando..." : "Salvar identificação"}
              </Button>
            </>
          )}
  
          {aba === "historico" && (
            <>
              <div className="mod-subtitle" style={{ marginTop: 0 }}>
                <span>Períodos profissionais ({periodosF.length})</span>
  
                <button
                  type="button"
                  className="mod-small-btn mod-small-btn-primary"
                  onClick={() => abrirNovoPeriodo(funcionario)}
                >
                  <Plus size={14} />
                  Novo período
                </button>
              </div>
  
              {periodosF.length === 0 ? (
                <EstadoVazio
                  titulo="Nenhum período registrado"
                  texto="Registre os períodos de setor, função e atividades exercidas pelo funcionário."
                  mobile={mobile}
                />
              ) : (
                <div className="mod-rev-list">
                  {periodosF.map((periodo) => (
                    <div key={periodo.id} className="mod-rev">
                      <div className="mod-rev-header">
                        <strong>{textoIntervalo(periodo.dataInicio, periodo.dataFim)}</strong>
  
                        {!periodo.dataFim && <Badge color="blue">Período atual</Badge>}
                      </div>
  
                      <div className="mod-rev-data">
                        <div>
                          <span>Setor</span>
                          <strong>{periodo.setor || "Não informado"}</strong>
                        </div>
  
                        <div>
                          <span>Função</span>
                          <strong>{periodo.funcao || "Não informada"}</strong>
                        </div>
  
                        <div>
                          <span>CBO</span>
                          <strong>{periodo.cbo || "Não informado"}</strong>
                        </div>
  
                        <div>
                          <span>Atividades exercidas</span>
                          <strong>{periodo.atividades || "Não descritas"}</strong>
                        </div>
                      </div>
  
                      <div className="mod-rev-actions">
                        <button
                          type="button"
                          className="mod-small-btn"
                          onClick={() => abrirEdicaoPeriodo(periodo)}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
  
                        <button
                          type="button"
                          className="mod-small-btn mod-small-btn-danger"
                          onClick={() => void excluirPeriodoAtual(periodo)}
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
  
          {aba === "exposicoes" && (
            <>
              <div className="mod-subtitle" style={{ marginTop: 0 }}>
                <span>Condições ambientais registradas ({exposicoesF.length})</span>
  
                <button
                  type="button"
                  className="mod-small-btn mod-small-btn-primary"
                  onClick={() => abrirNovaExposicao(funcionario)}
                >
                  <Plus size={14} />
                  Nova condição ambiental
                </button>
              </div>
  
              <p className="mod-sub" style={{ marginBottom: 14 }}>
                Registre somente o que consta em documento técnico (LTCAT ou outra
                fonte). O nível de risco do PGR não comprova exposição
                previdenciária.
              </p>
  
              {exposicoesF.length === 0 ? (
                <EstadoVazio
                  titulo="Nenhuma condição ambiental registrada"
                  texto="Registre exposições a agentes nocivos ou a declaração de ausência de agente, sempre com fonte e responsável técnico."
                  mobile={mobile}
                />
              ) : (
                <div className="mod-rev-list">
                  {exposicoesF.map((exposicao) => (
                    <div key={exposicao.id} className="mod-rev">
                      <div className="mod-rev-header">
                        <strong>{textoIntervalo(exposicao.periodoInicio, exposicao.periodoFim)}</strong>
  
                        <Badge color={exposicao.tipoAgente === "ausencia" ? "gray" : "orange"}>
                          {ROTULO_TIPO_AGENTE[exposicao.tipoAgente]}
                        </Badge>
                      </div>
  
                      <div className="mod-rev-data">
                        <div>
                          <span>Agente</span>
                          <strong>
                            {exposicao.tipoAgente === "ausencia"
                              ? "Não se aplica"
                              : exposicao.agente}
                          </strong>
                        </div>
  
                        <div>
                          <span>Setor e atividade</span>
                          <strong>
                            {[exposicao.setor, exposicao.atividade]
                              .filter(Boolean)
                              .join(" - ") || "Não informados"}
                          </strong>
                        </div>
  
                        <div>
                          <span>Avaliação</span>
                          <strong>
                            {ROTULO_TIPO_AVALIACAO[exposicao.tipoAvaliacao]}
                            {exposicao.resultado
                              ? ` - ${exposicao.resultado} ${exposicao.unidade}`.trimEnd()
                              : ""}
                          </strong>
                        </div>
  
                        <div>
                          <span>Fonte documental</span>
                          <strong>{textoFonte(exposicao)}</strong>
                        </div>
  
                        <div>
                          <span>Responsável técnico</span>
                          <strong>
                            {[exposicao.responsavelNome, exposicao.responsavelRegistro]
                              .filter(Boolean)
                              .join(" - registro ") || "Não informado"}
                          </strong>
                        </div>
  
                        <div>
                          <span>EPI relacionado</span>
                          <strong>
                            {exposicao.epiId !== null
                              ? (() => {
                                  const epi = episPorId.get(exposicao.epiId);
  
                                  return epi
                                    ? `${epi.nome} (CA ${epi.ca}) - eficácia: ${ROTULO_EPI_EFICAZ[exposicao.epiEficaz]}`
                                    : "EPI não encontrado";
                                })()
                              : "Não informado"}
                          </strong>
                        </div>
                      </div>
  
                      <div className="mod-rev-actions">
                        <button
                          type="button"
                          className="mod-small-btn"
                          onClick={() => abrirEdicaoExposicao(exposicao)}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
  
                        <button
                          type="button"
                          className="mod-small-btn mod-small-btn-danger"
                          onClick={() => void excluirExposicaoAtual(exposicao)}
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
  
          {aba === "conferencia" && (
            <>
              <div className="mod-subtitle" style={{ marginTop: 0 }}>
                <span>Pendências e pontos de conferência</span>
  
                <button
                  type="button"
                  className="mod-small-btn mod-small-btn-primary"
                  onClick={() => gerarRelatorio(funcionario)}
                >
                  <FileText size={14} />
                  Gerar relatório de apoio (PDF)
                </button>
              </div>
  
              {lista.length === 0 ? (
                <div className="mod-pend mod-pend-ok">
                  <CircleCheckBig size={17} />
                  <span>
                    Nenhuma pendência apontada pelas regras do sistema. Isso não
                    dispensa a conferência técnica do conteúdo.
                  </span>
                </div>
              ) : (
                lista.map((pendencia, indice) => (
                  <div
                    key={`${indice}-${pendencia.texto}`}
                    className={`mod-pend ${pendencia.tipo === "pendencia" ? "mod-pend-pendencia" : "mod-pend-conferencia"}`}
                  >
                    {pendencia.tipo === "pendencia" ? (
                      <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <TriangleAlert size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
  
                    <span>
                      <strong>
                        {pendencia.tipo === "pendencia" ? "Pendente: " : "Conferir: "}
                      </strong>
                      {pendencia.texto}
                    </span>
                  </div>
                ))
              )}
  
              <div className="mod-subtitle">
                <span>Afastamentos registrados</span>
              </div>
  
              {(() => {
                const lista = afastamentos.filter(
                  (item) => item.funcionarioId === funcionario.id
                );
  
                return lista.length === 0 ? (
                  <p className="mod-sub">Nenhum afastamento registrado para este funcionário.</p>
                ) : (
                  <div className="mod-rev-list">
                    {lista.map((afastamento) => (
                      <div key={afastamento.id} className="mod-rev">
                        <div className="mod-rev-header">
                          <strong>
                            {formatarData(afastamento.dataInicio)} -{" "}
                            {ROTULO_CATEGORIA_CURTO[afastamento.categoria]}
                          </strong>
  
                          <Badge color={afastamento.situacao === "encerrado" ? "green" : afastamento.situacao === "cancelado" ? "gray" : "blue"}>
                            {ROTULO_SITUACAO[afastamento.situacao]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
  
              <div className="mod-subtitle">
                <span>Acidentes vinculados ao cadastro</span>
              </div>
  
              {(() => {
                const lista = acidentes.filter(
                  (item) => item.funcionarioId === funcionario.id
                );
  
                return lista.length === 0 ? (
                  <p className="mod-sub">
                    Nenhum acidente vinculado a este funcionário. Acidentes
                    registrados só com o nome em texto não são considerados.
                  </p>
                ) : (
                  <div className="mod-rev-list">
                    {lista.map((acidente) => (
                      <div key={acidente.id} className="mod-rev">
                        <div className="mod-rev-header">
                          <strong>
                            {formatarData(acidente.data)} - {acidente.tipo}
                          </strong>
  
                          <Badge color="gray">CAT: {acidente.cat}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}
        </>
      );
    }
  
    /* FORMULÁRIOS (drawers) */
  
    const periodoSobreposto =
      formPeriodo.dataInicio !== "" &&
      (periodosPorFuncionario.get(formPeriodo.funcionarioId) ?? []).some(
        (item) =>
          item.id !== (editandoPeriodo?.id ?? 0) &&
          sobrepoe(
            formPeriodo.dataInicio,
            formPeriodo.dataFim,
            item.dataInicio,
            item.dataFim
          )
      );
  
    const opcoesRevisoes = [...revisoes].sort((a, b) => {
      const tituloA = documentosPorId.get(a.documentoId)?.titulo ?? "";
      const tituloB = documentosPorId.get(b.documentoId)?.titulo ?? "";
  
      return tituloA === tituloB
        ? b.numero - a.numero
        : tituloA.localeCompare(tituloB, "pt-BR");
    });
  
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
          title="PPP: Apoio à Conferência"
          subtitle="Organização dos dados profissionais, ambientais e documentais usados para conferir o PPP."
          icon={ClipboardList}
        >
          {funcionarioSel && (
            <Button onClick={() => setSelecionadoId(null)} color="#64748B">
              Voltar à lista
            </Button>
          )}
        </PageHeader>
  
        <div className="mod-banner mod-banner-info" role="note">
          <div className="mod-banner-main">
            <ShieldCheck size={18} />
  
            <span>
              Módulo de apoio. O SafeKitchen não emite o PPP oficial (emitido em
              meio eletrônico, via eSocial), não transmite eventos e não substitui
              laudos assinados por profissional habilitado. Os dados e o relatório
              exigem conferência técnica.
            </span>
          </div>
        </div>
  
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
  
        {funcionarioSel ? (
          <section className="mod-panel">
            <div className="mod-workspace-header">
              <div className="mod-person">
                <div className="mod-avatar">
                  <UserRound size={19} />
                </div>
  
                <div>
                  <strong>{funcionarioSel.nome}</strong>
                  <span>
                    {funcionarioSel.matricula
                      ? `Matrícula ${funcionarioSel.matricula}`
                      : "Sem matrícula"}
                    {funcionarioSel.situacao === "desligado" ? " - desligado" : ""}
                  </span>
                </div>
              </div>
  
              <button
                type="button"
                className="mod-small-btn mod-small-btn-primary"
                onClick={() => gerarRelatorio(funcionarioSel)}
              >
                <FileText size={14} />
                Relatório de apoio (PDF)
              </button>
            </div>
  
            {renderizarAbas(funcionarioSel)}
          </section>
        ) : (
          <>
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
                title="Funcionários Cadastrados"
                value={funcionarios.length}
                icon={<UserRound size={22} />}
                color="#2563EB"
              />
  
              <StatCard
                title="Sem Histórico Profissional"
                value={semHistorico}
                icon={<ClipboardList size={22} />}
                color="#F59E0B"
              />
  
              <StatCard
                title="Condições Ambientais Registradas"
                value={exposicoes.length}
                icon={<FileText size={22} />}
                color="#16A34A"
              />
  
              <StatCard
                title="Pendências Apontadas"
                value={totalPendencias}
                icon={<TriangleAlert size={22} />}
                color="#DC2626"
              />
            </div>
  
            <section className="mod-panel">
              <div className="mod-panel-heading">
                <div>
                  <span className="mod-eyebrow">Saúde ocupacional</span>
                  <h2>Funcionários e situação dos dados</h2>
                  <p>
                    Abra um funcionário para cadastrar identificação, histórico
                    profissional e condições ambientais, e para gerar o relatório
                    de apoio. As pendências são apontadas só pelos dados
                    cadastrados.
                  </p>
                </div>
              </div>
  
              <div className="mod-filters">
                <div className="mod-filter-title-row">
                  <div className="mod-filter-title">
                    <SlidersHorizontal size={16} />
                    Filtros
                  </div>
  
                  {filtrosAtivos && (
                    <button
                      type="button"
                      className="mod-clear-filter"
                      onClick={() => {
                        setPesquisa("");
                        setFiltroSituacao("");
                      }}
                    >
                      <X size={13} />
                      Limpar filtros
                    </button>
                  )}
                </div>
  
                <div
                  className="mod-filter-grid"
                  style={
                    mobile || telaMedia
                      ? undefined
                      : { gridTemplateColumns: "minmax(240px, 2fr) minmax(190px, 1fr)" }
                  }
                >
                  <div className="mod-search">
                    <Search size={17} />
  
                    <input
                      type="text"
                      placeholder="Pesquisar nome, matrícula ou setor..."
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
                    <option value="ativo">Ativos</option>
                    <option value="desligado">Desligados</option>
                  </select>
                </div>
  
                <div className="mod-result-count">
                  Exibindo <strong>{funcionariosFiltrados.length}</strong> de{" "}
                  <strong>{funcionarios.length}</strong> funcionário(s)
                </div>
              </div>
  
              {renderizarLista()}
            </section>
          </>
        )}
  
        {periodoAberto && (
          <div
            className="mod-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharPeriodo();
              }
            }}
          >
            <aside
              className="mod-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ppp-periodo-titulo"
            >
              <header className="mod-drawer-header">
                <div className="mod-drawer-header-main">
                  <div className="mod-drawer-icon">
                    <ClipboardList size={22} />
                  </div>
  
                  <div className="mod-drawer-title">
                    <span className="mod-drawer-eyebrow">
                      {funcionarioPorId.get(formPeriodo.funcionarioId)?.nome ?? "PPP"}
                    </span>
  
                    <h2 id="ppp-periodo-titulo">
                      {editandoPeriodo ? "Editar período" : "Novo período profissional"}
                    </h2>
  
                    <p>Setor, função e atividades exercidas no período.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mod-drawer-close"
                  onClick={fecharPeriodo}
                  aria-label="Fechar formulário"
                >
                  <X size={19} />
                </button>
              </header>
  
              <div className="mod-drawer-content">
                {erroPeriodo && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroPeriodo}</span>
                  </div>
                )}
  
                {!editandoPeriodo && formPeriodo.dataInicio !== "" && (
                  <div className="mod-form-aviso" style={{ margin: "0 0 14px" }}>
                    Campos pré-preenchidos com o cadastro do funcionário, quando
                    este é o primeiro período. Confira antes de salvar.
                  </div>
                )}
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>01</span>
  
                    <div>
                      <h3>Período e vínculo</h3>
                      <p>Deixe o fim em branco se o período está em curso.</p>
                    </div>
                  </div>
  
                  <div className="mod-grid-2">
                    <Campo
                      id="per-inicio"
                      label="Início"
                      type="date"
                      obrigatorio
                      value={formPeriodo.dataInicio}
                      onChange={(valor) =>
                        setFormPeriodo((atual) => ({ ...atual, dataInicio: valor }))
                      }
                    />
  
                    <Campo
                      id="per-fim"
                      label="Fim"
                      type="date"
                      value={formPeriodo.dataFim}
                      onChange={(valor) =>
                        setFormPeriodo((atual) => ({ ...atual, dataFim: valor }))
                      }
                    />
                  </div>
  
                  {periodoSobreposto && (
                    <div className="mod-form-aviso">
                      Este período se sobrepõe a outro já registrado. Confira as
                      datas.
                    </div>
                  )}
  
                  <div className="mod-grid-2">
                    <Campo
                      id="per-setor"
                      label="Setor"
                      maxLength={80}
                      value={formPeriodo.setor}
                      onChange={(valor) =>
                        setFormPeriodo((atual) => ({ ...atual, setor: valor }))
                      }
                    />
  
                    <Campo
                      id="per-funcao"
                      label="Função"
                      maxLength={80}
                      value={formPeriodo.funcao}
                      onChange={(valor) =>
                        setFormPeriodo((atual) => ({ ...atual, funcao: valor }))
                      }
                    />
                  </div>
  
                  <Campo
                    id="per-cbo"
                    label="CBO"
                    maxLength={20}
                    placeholder="Opcional"
                    value={formPeriodo.cbo}
                    onChange={(valor) =>
                      setFormPeriodo((atual) => ({ ...atual, cbo: valor }))
                    }
                  />
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>02</span>
  
                    <div>
                      <h3>Atividades</h3>
                      <p>Descreva as atividades realmente exercidas no período.</p>
                    </div>
                  </div>
  
                  <AreaTexto
                    id="per-atividades"
                    label="Atividades exercidas"
                    rows={4}
                    maxLength={800}
                    value={formPeriodo.atividades}
                    onChange={(valor) =>
                      setFormPeriodo((atual) => ({ ...atual, atividades: valor }))
                    }
                  />
  
                  <AreaTexto
                    id="per-obs"
                    label="Observações"
                    rows={3}
                    maxLength={500}
                    value={formPeriodo.observacoes}
                    onChange={(valor) =>
                      setFormPeriodo((atual) => ({ ...atual, observacoes: valor }))
                    }
                  />
                </section>
              </div>
  
              <footer className="mod-drawer-footer">
                <Button onClick={fecharPeriodo} color="#64748B" disabled={salvandoPeriodo}>
                  Cancelar
                </Button>
  
                <Button
                  onClick={() => {
                    void salvarPeriodo();
                  }}
                  disabled={salvandoPeriodo}
                >
                  {salvandoPeriodo
                    ? "Salvando..."
                    : editandoPeriodo
                      ? "Salvar alterações"
                      : "Registrar período"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
  
        {exposicaoAberta && (
          <div
            className="mod-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharExposicao();
              }
            }}
          >
            <aside
              className="mod-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ppp-expo-titulo"
            >
              <header className="mod-drawer-header">
                <div className="mod-drawer-header-main">
                  <div className="mod-drawer-icon">
                    <FileText size={22} />
                  </div>
  
                  <div className="mod-drawer-title">
                    <span className="mod-drawer-eyebrow">
                      {funcionarioPorId.get(formExposicao.funcionarioId)?.nome ?? "PPP"}
                    </span>
  
                    <h2 id="ppp-expo-titulo">
                      {editandoExposicao
                        ? "Editar condição ambiental"
                        : "Nova condição ambiental"}
                    </h2>
  
                    <p>Transcreva do documento técnico, com fonte e responsável.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mod-drawer-close"
                  onClick={fecharExposicao}
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
                    <strong>Não registre conclusões próprias</strong>
                    <span>
                      Informe apenas o que consta no laudo ou documento técnico. O
                      nível de risco do PGR não comprova exposição previdenciária.
                    </span>
                  </div>
                </div>
  
                {erroExposicao && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroExposicao}</span>
                  </div>
                )}
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>01</span>
  
                    <div>
                      <h3>Período e local</h3>
                      <p>Fim em branco indica condição ainda em curso.</p>
                    </div>
                  </div>
  
                  <div className="mod-grid-2">
                    <Campo
                      id="exp-inicio"
                      label="Início"
                      type="date"
                      obrigatorio
                      value={formExposicao.periodoInicio}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, periodoInicio: valor }))
                      }
                    />
  
                    <Campo
                      id="exp-fim"
                      label="Fim"
                      type="date"
                      value={formExposicao.periodoFim}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, periodoFim: valor }))
                      }
                    />
                  </div>
  
                  <div className="mod-grid-2">
                    <Campo
                      id="exp-setor"
                      label="Setor"
                      maxLength={80}
                      value={formExposicao.setor}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, setor: valor }))
                      }
                    />
  
                    <Campo
                      id="exp-atividade"
                      label="Atividade"
                      maxLength={120}
                      value={formExposicao.atividade}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, atividade: valor }))
                      }
                    />
                  </div>
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>02</span>
  
                    <div>
                      <h3>Agente e avaliação</h3>
                      <p>Conforme o documento-fonte.</p>
                    </div>
                  </div>
  
                  <Selecao
                    id="exp-tipo"
                    label="Tipo de agente"
                    obrigatorio
                    value={formExposicao.tipoAgente}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({
                        ...atual,
                        tipoAgente: valor as TipoAgente | "",
                      }))
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="fisico">{ROTULO_TIPO_AGENTE.fisico}</option>
                    <option value="quimico">{ROTULO_TIPO_AGENTE.quimico}</option>
                    <option value="biologico">{ROTULO_TIPO_AGENTE.biologico}</option>
                    <option value="ergonomico">{ROTULO_TIPO_AGENTE.ergonomico}</option>
                    <option value="acidente">{ROTULO_TIPO_AGENTE.acidente}</option>
                    <option value="ausencia">{ROTULO_TIPO_AGENTE.ausencia}</option>
                  </Selecao>
  
                  {formExposicao.tipoAgente !== "ausencia" && (
                    <Campo
                      id="exp-agente"
                      label="Agente"
                      obrigatorio
                      maxLength={150}
                      placeholder="Ex.: calor, ruído, produto químico"
                      value={formExposicao.agente}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, agente: valor }))
                      }
                    />
                  )}
  
                  <Selecao
                    id="exp-avaliacao"
                    label="Tipo de avaliação"
                    value={formExposicao.tipoAvaliacao}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({
                        ...atual,
                        tipoAvaliacao: valor as TipoAvaliacao,
                      }))
                    }
                  >
                    <option value="nao_informada">{ROTULO_TIPO_AVALIACAO.nao_informada}</option>
                    <option value="qualitativa">{ROTULO_TIPO_AVALIACAO.qualitativa}</option>
                    <option value="quantitativa">{ROTULO_TIPO_AVALIACAO.quantitativa}</option>
                  </Selecao>
  
                  {formExposicao.tipoAvaliacao === "quantitativa" && (
                    <>
                      <div className="mod-grid-2">
                        <Campo
                          id="exp-resultado"
                          label="Resultado"
                          maxLength={60}
                          value={formExposicao.resultado}
                          onChange={(valor) =>
                            setFormExposicao((atual) => ({ ...atual, resultado: valor }))
                          }
                        />
  
                        <Campo
                          id="exp-unidade"
                          label="Unidade"
                          maxLength={30}
                          value={formExposicao.unidade}
                          onChange={(valor) =>
                            setFormExposicao((atual) => ({ ...atual, unidade: valor }))
                          }
                        />
                      </div>
  
                      <Campo
                        id="exp-metodologia"
                        label="Metodologia"
                        maxLength={200}
                        value={formExposicao.metodologia}
                        onChange={(valor) =>
                          setFormExposicao((atual) => ({ ...atual, metodologia: valor }))
                        }
                      />
                    </>
                  )}
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>03</span>
  
                    <div>
                      <h3>Proteção</h3>
                      <p>Medidas coletivas e EPI relacionados.</p>
                    </div>
                  </div>
  
                  <AreaTexto
                    id="exp-coletivas"
                    label="Medidas de proteção coletiva"
                    rows={3}
                    maxLength={500}
                    value={formExposicao.medidasColetivas}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({ ...atual, medidasColetivas: valor }))
                    }
                  />
  
                  <Selecao
                    id="exp-epi"
                    label="EPI relacionado"
                    value={formExposicao.epiId === null ? "" : String(formExposicao.epiId)}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({
                        ...atual,
                        epiId: valor ? Number(valor) : null,
                      }))
                    }
                  >
                    <option value="">Nenhum</option>
  
                    {epis.map((epi) => (
                      <option key={epi.id} value={epi.id}>
                        {epi.nome} (CA {epi.ca})
                      </option>
                    ))}
                  </Selecao>
  
                  <Selecao
                    id="exp-eficaz"
                    label="Eficácia do EPI (conforme o responsável técnico)"
                    value={formExposicao.epiEficaz}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({
                        ...atual,
                        epiEficaz: valor as EpiEficaz,
                      }))
                    }
                  >
                    <option value="nao_informado">{ROTULO_EPI_EFICAZ.nao_informado}</option>
                    <option value="sim">{ROTULO_EPI_EFICAZ.sim}</option>
                    <option value="nao">{ROTULO_EPI_EFICAZ.nao}</option>
                  </Selecao>
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>04</span>
  
                    <div>
                      <h3>Fonte e responsável técnico</h3>
                      <p>Ao menos uma fonte documental é obrigatória.</p>
                    </div>
                  </div>
  
                  <Selecao
                    id="exp-ltcat"
                    label="Revisão de LTCAT (fonte)"
                    value={
                      formExposicao.ltcatRevisaoId === null
                        ? ""
                        : String(formExposicao.ltcatRevisaoId)
                    }
                    onChange={selecionarRevisaoLtcat}
                    dica="Ao escolher uma revisão, o responsável e o registro são preenchidos se estiverem vazios."
                  >
                    <option value="">Nenhuma</option>
  
                    {opcoesRevisoes.map((revisao) => (
                      <option key={revisao.id} value={revisao.id}>
                        {documentosPorId.get(revisao.documentoId)?.titulo ?? "Documento"}{" "}
                        - revisão {revisao.numero} ({ROTULO_SITUACAO_REVISAO[revisao.situacao]})
                      </option>
                    ))}
                  </Selecao>
  
                  <Selecao
                    id="exp-pgr"
                    label="Referência ao PGR (opcional)"
                    value={formExposicao.pgrId === null ? "" : String(formExposicao.pgrId)}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({
                        ...atual,
                        pgrId: valor ? Number(valor) : null,
                      }))
                    }
                  >
                    <option value="">Nenhuma</option>
  
                    {riscos.map((risco) => (
                      <option key={risco.id} value={risco.id}>
                        {risco.setor} - {risco.atividade} - {risco.perigo}
                      </option>
                    ))}
                  </Selecao>
  
                  <Campo
                    id="exp-fonte"
                    label="Outra fonte documental"
                    maxLength={200}
                    placeholder="Ex.: laudo de empresa terceirizada, data e número"
                    value={formExposicao.fonteDescricao}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({ ...atual, fonteDescricao: valor }))
                    }
                  />
  
                  <div className="mod-grid-2">
                    <Campo
                      id="exp-resp"
                      label="Responsável técnico"
                      maxLength={150}
                      value={formExposicao.responsavelNome}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({ ...atual, responsavelNome: valor }))
                      }
                    />
  
                    <Campo
                      id="exp-registro"
                      label="Registro profissional"
                      maxLength={60}
                      value={formExposicao.responsavelRegistro}
                      onChange={(valor) =>
                        setFormExposicao((atual) => ({
                          ...atual,
                          responsavelRegistro: valor,
                        }))
                      }
                    />
                  </div>
  
                  <AreaTexto
                    id="exp-obs"
                    label="Observações"
                    rows={3}
                    maxLength={500}
                    value={formExposicao.observacoes}
                    onChange={(valor) =>
                      setFormExposicao((atual) => ({ ...atual, observacoes: valor }))
                    }
                  />
                </section>
              </div>
  
              <footer className="mod-drawer-footer">
                <Button onClick={fecharExposicao} color="#64748B" disabled={salvandoExposicao}>
                  Cancelar
                </Button>
  
                <Button
                  onClick={() => {
                    void salvarExposicao();
                  }}
                  disabled={salvandoExposicao}
                >
                  {salvandoExposicao
                    ? "Salvando..."
                    : editandoExposicao
                      ? "Salvar alterações"
                      : "Registrar condição ambiental"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
      </main>
    );
  }
  
  /* COMPONENTES AUXILIARES */
  
  function Item({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
      <div className="mod-detail-item">
        <span>{titulo}</span>
        <div>{children}</div>
      </div>
    );
  }
  
  function Campo({
    id,
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    maxLength,
    obrigatorio = false,
    dica,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (valor: string) => void;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    obrigatorio?: boolean;
    dica?: string;
  }) {
    return (
      <div className="mod-field">
        <label htmlFor={id}>
          {label}
          {obrigatorio && <span>*</span>}
        </label>
  
        <input
          id={id}
          className="mod-input"
          type={type}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
  
        {dica && <small>{dica}</small>}
      </div>
    );
  }
  
  function Selecao({
    id,
    label,
    value,
    onChange,
    children,
    obrigatorio = false,
    dica,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (valor: string) => void;
    children: ReactNode;
    obrigatorio?: boolean;
    dica?: string;
  }) {
    return (
      <div className="mod-field">
        <label htmlFor={id}>
          {label}
          {obrigatorio && <span>*</span>}
        </label>
  
        <select
          id={id}
          className="mod-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
  
        {dica && <small>{dica}</small>}
      </div>
    );
  }
  
  function AreaTexto({
    id,
    label,
    value,
    onChange,
    rows = 3,
    maxLength,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (valor: string) => void;
    rows?: number;
    maxLength?: number;
  }) {
    return (
      <div className="mod-field">
        <label htmlFor={id}>{label}</label>
  
        <textarea
          id={id}
          className="mod-input mod-textarea"
          rows={rows}
          maxLength={maxLength}
          value={value}
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
      <div className="mod-empty" style={{ minHeight: mobile ? 210 : 230 }}>
        <div className="mod-empty-icon">
          <ClipboardList size={25} />
        </div>
  
        <strong>{titulo}</strong>
  
        <span>{texto}</span>
  
        {acao}
      </div>
    );
  }