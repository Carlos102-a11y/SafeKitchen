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
    Clock3,
    ExternalLink,
    Eye,
    FileBadge,
    FileText,
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
  
  import { useAuth } from "../contexts/AuthContext";
  import { useViewportWidth } from "../hooks/useViewportWidth";
  
  import {
    anexarArquivo,
    atualizarDocumento,
    atualizarRevisao,
    criarDocumento,
    criarRevisao,
    excluirDocumento,
    listarDocumentos,
    listarRevisoes,
    obterUrlArquivo,
    tornarRevisaoVigente,
    validarArquivoPdf,
  } from "../services/ltcatService";
  
  import {
    ROTULO_PROFISSAO,
    ROTULO_SITUACAO_REVISAO,
  } from "../models/Ltcat";
  
  import type {
    DocumentoLtcat,
    DocumentoLtcatEntrada,
    ProfissaoResponsavel,
    RevisaoLtcat,
    RevisaoLtcatEntrada,
    SituacaoRevisao,
  } from "../models/Ltcat";
  
  import { formatarData, hojeISO } from "../utils/datas";
  
  import "../styles/modulos.css";
  
  type FiltroSituacao = "" | "sem_revisao" | SituacaoRevisao;
  
  const COR_SITUACAO: Record<SituacaoRevisao, string> = {
    em_elaboracao: "blue",
    vigente: "green",
    pendente_revisao: "orange",
    substituido: "gray",
    arquivado: "gray",
  };
  
  const documentoInicial: DocumentoLtcatEntrada = {
    titulo: "",
    estabelecimento: "",
    abrangencia: "",
    observacoes: "",
  };
  
  function revisaoInicial(
    documentoId: number,
    numero: number
  ): RevisaoLtcatEntrada {
    return {
      documentoId,
      numero,
      situacao: "em_elaboracao",
      dataElaboracao: "",
      dataRevisao: "",
      periodoInicio: "",
      periodoFim: "",
      responsavelNome: "",
      responsavelProfissao: "",
      registroProfissional: "",
      observacoes: "",
    };
  }
  
  function paraEntradaRevisao(revisao: RevisaoLtcat): RevisaoLtcatEntrada {
    return {
      documentoId: revisao.documentoId,
      numero: revisao.numero,
      situacao: revisao.situacao,
      dataElaboracao: revisao.dataElaboracao,
      dataRevisao: revisao.dataRevisao,
      periodoInicio: revisao.periodoInicio,
      periodoFim: revisao.periodoFim,
      responsavelNome: revisao.responsavelNome,
      responsavelProfissao: revisao.responsavelProfissao,
      registroProfissional: revisao.registroProfissional,
      observacoes: revisao.observacoes,
    };
  }
  
  function normalizar(texto: string) {
    return texto.trim().toLowerCase();
  }
  
  function textoPeriodo(revisao: RevisaoLtcat) {
    if (revisao.periodoInicio && revisao.periodoFim) {
      return `${formatarData(revisao.periodoInicio)} a ${formatarData(revisao.periodoFim)}`;
    }
  
    if (revisao.periodoInicio) {
      return `Desde ${formatarData(revisao.periodoInicio)}`;
    }
  
    if (revisao.periodoFim) {
      return `Até ${formatarData(revisao.periodoFim)}`;
    }
  
    return "Não informado";
  }
  
  function formatarTamanho(bytes: number | null) {
    if (bytes === null) {
      return "";
    }
  
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
  
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }
  
  function revisaoAtual(lista: RevisaoLtcat[] | undefined) {
    if (!lista || lista.length === 0) {
      return null;
    }
  
    return lista.find((item) => item.situacao === "vigente") ?? lista[0];
  }
  
  function validarRevisao(
    formulario: RevisaoLtcatEntrada,
    arquivo: File | null,
    vigencia: { ativa: boolean; por: string; em: string; temArquivo: boolean },
    hoje: string
  ) {
    if (
      formulario.dataElaboracao &&
      formulario.dataRevisao &&
      formulario.dataRevisao < formulario.dataElaboracao
    ) {
      return "A data da revisão não pode ser anterior à data de elaboração.";
    }
  
    if (
      formulario.periodoInicio &&
      formulario.periodoFim &&
      formulario.periodoFim < formulario.periodoInicio
    ) {
      return "O fim do período avaliado não pode ser anterior ao início.";
    }
  
    if (arquivo) {
      const erroArquivo = validarArquivoPdf(arquivo);
  
      if (erroArquivo) {
        return erroArquivo;
      }
    }
  
    if (vigencia.ativa) {
      if (
        formulario.responsavelProfissao !== "engenheiro_seguranca" &&
        formulario.responsavelProfissao !== "medico_trabalho"
      ) {
        return "Para validar a vigência, o responsável deve ser engenheiro de segurança do trabalho ou médico do trabalho.";
      }
  
      if (!formulario.responsavelNome.trim()) {
        return "Informe o nome do responsável técnico para validar a vigência.";
      }
  
      if (!formulario.registroProfissional.trim()) {
        return "Informe o registro profissional do responsável para validar a vigência.";
      }
  
      if (!formulario.dataElaboracao) {
        return "Informe a data de elaboração para validar a vigência.";
      }
  
      if (!vigencia.temArquivo) {
        return "Anexe o arquivo do laudo antes de validar a vigência.";
      }
  
      if (!vigencia.por.trim()) {
        return "Informe quem está validando a vigência.";
      }
  
      if (!vigencia.em) {
        return "Informe a data da validação.";
      }
  
      if (vigencia.em > hoje) {
        return "A data da validação não pode ser futura.";
      }
    }
  
    return "";
  }
  
  export default function Ltcat() {
    const { user } = useAuth();
  
    const largura = useViewportWidth();
  
    const mobile = largura <= 650;
    const tablet = largura <= 900;
    const telaMedia = largura <= 1180;
  
    const hoje = hojeISO();
  
    const [documentos, setDocumentos] = useState<DocumentoLtcat[]>([]);
    const [revisoes, setRevisoes] = useState<RevisaoLtcat[]>([]);
  
    const [carregando, setCarregando] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [avisoAcao, setAvisoAcao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tentativa, setTentativa] = useState(0);
  
    const [pesquisa, setPesquisa] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("");
    const [filtroEstabelecimento, setFiltroEstabelecimento] = useState("");
  
    const [detalheId, setDetalheId] = useState<number | null>(null);
  
    const [docAberto, setDocAberto] = useState(false);
    const [editandoDoc, setEditandoDoc] = useState<DocumentoLtcat | null>(null);
    const [formDoc, setFormDoc] =
      useState<DocumentoLtcatEntrada>(documentoInicial);
    const [salvandoDoc, setSalvandoDoc] = useState(false);
    const [erroFormDoc, setErroFormDoc] = useState("");
  
    const [revAberto, setRevAberto] = useState(false);
    const [editandoRev, setEditandoRev] = useState<RevisaoLtcat | null>(null);
    const [formRev, setFormRev] = useState<RevisaoLtcatEntrada>(
      revisaoInicial(0, 1)
    );
    const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
      null
    );
    const [tornarVigente, setTornarVigente] = useState(false);
    const [validadoPor, setValidadoPor] = useState("");
    const [validadoEm, setValidadoEm] = useState("");
    const [salvandoRev, setSalvandoRev] = useState(false);
    const [erroFormRev, setErroFormRev] = useState("");
  
    /* CARREGAMENTO */
  
    useEffect(() => {
      let componenteAtivo = true;
  
      async function carregar() {
        const [resDocumentos, resRevisoes] = await Promise.all([
          listarDocumentos(),
          listarRevisoes(),
        ]);
  
        if (!componenteAtivo) {
          return;
        }
  
        const erro = resDocumentos.erro ?? resRevisoes.erro;
  
        if (erro || !resDocumentos.data || !resRevisoes.data) {
          setDocumentos([]);
          setRevisoes([]);
          setErroLista(erro ?? "Não foi possível carregar os documentos.");
        } else {
          setDocumentos(resDocumentos.data);
          setRevisoes(resRevisoes.data);
          setErroLista("");
        }
  
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
  
    const fecharDocumento = useCallback(() => {
      setDocAberto(false);
      setEditandoDoc(null);
      setErroFormDoc("");
      setFormDoc(documentoInicial);
    }, []);
  
    const fecharRevisao = useCallback(() => {
      setRevAberto(false);
      setEditandoRev(null);
      setErroFormRev("");
      setArquivoSelecionado(null);
      setTornarVigente(false);
      setValidadoPor("");
      setValidadoEm("");
    }, []);
  
    const algumDrawerAberto = revAberto || docAberto || detalheId !== null;
  
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
  
        if (revAberto) {
          fecharRevisao();
        } else if (docAberto) {
          fecharDocumento();
        } else {
          setDetalheId(null);
        }
      }
  
      window.addEventListener("keydown", fecharComEsc);
  
      return () => {
        document.body.style.overflow = overflowAnterior;
        window.removeEventListener("keydown", fecharComEsc);
      };
    }, [
      algumDrawerAberto,
      revAberto,
      docAberto,
      fecharRevisao,
      fecharDocumento,
    ]);
  
    /* APOIO */
  
    const revisoesPorDocumento = useMemo(() => {
      const mapa = new Map<number, RevisaoLtcat[]>();
  
      revisoes.forEach((revisao) => {
        const lista = mapa.get(revisao.documentoId) ?? [];
  
        lista.push(revisao);
  
        mapa.set(revisao.documentoId, lista);
      });
  
      mapa.forEach((lista) => {
        lista.sort((a, b) => b.numero - a.numero);
      });
  
      return mapa;
    }, [revisoes]);
  
    const estabelecimentos = useMemo(
      () =>
        Array.from(
          new Set(
            documentos
              .map((documento) => documento.estabelecimento)
              .filter((valor) => valor !== "")
          )
        ).sort((a, b) => a.localeCompare(b, "pt-BR")),
      [documentos]
    );
  
    /* INDICADORES (dados reais) */
  
    const totalVigentes = revisoes.filter(
      (revisao) => revisao.situacao === "vigente"
    ).length;
  
    const totalPendentes = revisoes.filter(
      (revisao) => revisao.situacao === "pendente_revisao"
    ).length;
  
    const totalSemArquivo = documentos.filter((documento) => {
      const atual = revisaoAtual(revisoesPorDocumento.get(documento.id));
  
      return !atual || !atual.arquivoPath;
    }).length;
  
    /* FILTROS */
  
    const documentosFiltrados = useMemo(() => {
      const termo = normalizar(pesquisa);
  
      return documentos.filter((documento) => {
        const atual = revisaoAtual(revisoesPorDocumento.get(documento.id));
  
        const correspondePesquisa =
          !termo ||
          documento.titulo.toLowerCase().includes(termo) ||
          documento.estabelecimento.toLowerCase().includes(termo) ||
          documento.abrangencia.toLowerCase().includes(termo) ||
          (atual?.responsavelNome.toLowerCase().includes(termo) ?? false);
  
        const correspondeSituacao =
          !filtroSituacao ||
          (filtroSituacao === "sem_revisao"
            ? atual === null
            : atual?.situacao === filtroSituacao);
  
        const correspondeEstabelecimento =
          !filtroEstabelecimento ||
          documento.estabelecimento === filtroEstabelecimento;
  
        return (
          correspondePesquisa &&
          correspondeSituacao &&
          correspondeEstabelecimento
        );
      });
    }, [
      documentos,
      revisoesPorDocumento,
      pesquisa,
      filtroSituacao,
      filtroEstabelecimento,
    ]);
  
    const filtrosAtivos =
      pesquisa.trim() !== "" ||
      filtroSituacao !== "" ||
      filtroEstabelecimento !== "";
  
    const documentoDetalhe =
      detalheId !== null
        ? (documentos.find((documento) => documento.id === detalheId) ?? null)
        : null;
  
    /* AÇÕES: DOCUMENTO */
  
    function abrirNovoDocumento() {
      setEditandoDoc(null);
      setErroFormDoc("");
      setFormDoc(documentoInicial);
      setDocAberto(true);
    }
  
    function abrirEdicaoDocumento(documento: DocumentoLtcat) {
      setEditandoDoc(documento);
      setErroFormDoc("");
  
      setFormDoc({
        titulo: documento.titulo,
        estabelecimento: documento.estabelecimento,
        abrangencia: documento.abrangencia,
        observacoes: documento.observacoes,
      });
  
      setDocAberto(true);
    }
  
    async function salvarDocumento() {
      if (salvandoDoc) {
        return;
      }
  
      if (!formDoc.titulo.trim()) {
        setErroFormDoc("Informe o título ou a identificação do documento.");
        return;
      }
  
      setSalvandoDoc(true);
      setErroFormDoc("");
  
      const idEditando = editandoDoc?.id ?? null;
  
      const resultado =
        idEditando !== null
          ? await atualizarDocumento(idEditando, formDoc)
          : await criarDocumento(formDoc);
  
      setSalvandoDoc(false);
  
      if (resultado.erro || !resultado.data) {
        setErroFormDoc(resultado.erro ?? "Não foi possível salvar o documento.");
        return;
      }
  
      const salvo = resultado.data;
  
      setDocumentos((listaAtual) =>
        (idEditando !== null
          ? listaAtual.map((item) => (item.id === salvo.id ? salvo : item))
          : [...listaAtual, salvo]
        ).sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"))
      );
  
      fecharDocumento();
  
      if (idEditando !== null) {
        setMensagem("Documento atualizado com sucesso.");
        return;
      }
  
      setMensagem(
        "Documento cadastrado. Registre agora a primeira revisão (revisão 1)."
      );
  
      abrirNovaRevisao(salvo);
    }
  
    async function excluirDoc(documento: DocumentoLtcat) {
      const confirmar = window.confirm(
        `Deseja realmente excluir o documento "${documento.titulo}"? Só é possível excluir documentos sem revisões.`
      );
  
      if (!confirmar) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await excluirDocumento(documento.id);
  
      if (resultado.erro) {
        setErroAcao(resultado.erro);
        return;
      }
  
      setDocumentos((listaAtual) =>
        listaAtual.filter((item) => item.id !== documento.id)
      );
  
      setDetalheId(null);
      setMensagem("Documento excluído com sucesso.");
    }
  
    /* AÇÕES: REVISÃO */
  
    function abrirNovaRevisao(documento: DocumentoLtcat) {
      const lista = revisoesPorDocumento.get(documento.id) ?? [];
  
      const proximoNumero =
        lista.reduce((maior, item) => Math.max(maior, item.numero), 0) + 1;
  
      setEditandoRev(null);
      setErroFormRev("");
      setArquivoSelecionado(null);
      setTornarVigente(false);
      setValidadoPor("");
      setValidadoEm(hoje);
      setFormRev(revisaoInicial(documento.id, proximoNumero));
      setRevAberto(true);
    }
  
    function abrirEdicaoRevisao(revisao: RevisaoLtcat) {
      setEditandoRev(revisao);
      setErroFormRev("");
      setArquivoSelecionado(null);
      setTornarVigente(false);
      setValidadoPor("");
      setValidadoEm(hoje);
      setFormRev(paraEntradaRevisao(revisao));
      setRevAberto(true);
    }
  
    async function salvarRevisao() {
      if (salvandoRev) {
        return;
      }
  
      const temArquivo =
        Boolean(editandoRev?.arquivoPath) || arquivoSelecionado !== null;
  
      const erroValidacao = validarRevisao(
        formRev,
        arquivoSelecionado,
        {
          ativa: tornarVigente,
          por: validadoPor,
          em: validadoEm,
          temArquivo,
        },
        hoje
      );
  
      if (erroValidacao) {
        setErroFormRev(erroValidacao);
        return;
      }
  
      if (arquivoSelecionado && !user) {
        setErroFormRev(
          "Sessão não identificada. Entre novamente para enviar arquivos."
        );
        return;
      }
  
      setSalvandoRev(true);
      setErroFormRev("");
  
      const resultado = editandoRev
        ? await atualizarRevisao(editandoRev.id, formRev)
        : await criarRevisao(formRev);
  
      if (resultado.erro || !resultado.data) {
        setSalvandoRev(false);
        setErroFormRev(resultado.erro ?? "Não foi possível salvar a revisão.");
        return;
      }
  
      let atual = resultado.data;
      let aviso = "";
  
      if (arquivoSelecionado && user) {
        const anexo = await anexarArquivo(user.id, atual, arquivoSelecionado);
  
        if (anexo.erro || !anexo.data) {
          aviso = `A revisão foi salva, mas o arquivo não foi enviado: ${anexo.erro ?? "erro desconhecido"} Edite a revisão para tentar novamente.`;
        } else {
          atual = anexo.data;
        }
      }
  
      if (tornarVigente && aviso === "") {
        const vigencia = await tornarRevisaoVigente(
          atual.id,
          validadoPor,
          validadoEm
        );
  
        if (vigencia.erro) {
          aviso = `A revisão foi salva, mas não foi possível validar a vigência: ${vigencia.erro}`;
        }
      }
  
      const revisaoFinal = atual;
      const recarga = await listarRevisoes();
  
      if (recarga.data) {
        setRevisoes(recarga.data);
      } else {
        setRevisoes((listaAtual) =>
          listaAtual.some((item) => item.id === revisaoFinal.id)
            ? listaAtual.map((item) =>
                item.id === revisaoFinal.id ? revisaoFinal : item
              )
            : [revisaoFinal, ...listaAtual]
        );
      }
  
      const eraEdicao = editandoRev !== null;
  
      setSalvandoRev(false);
      fecharRevisao();
  
      if (aviso) {
        setAvisoAcao(aviso);
      } else {
        setMensagem(
          eraEdicao
            ? "Revisão atualizada com sucesso."
            : "Revisão registrada com sucesso."
        );
      }
    }
  
    async function abrirArquivo(revisao: RevisaoLtcat) {
      if (!revisao.arquivoPath) {
        return;
      }
  
      setErroAcao("");
  
      const resultado = await obterUrlArquivo(revisao.arquivoPath);
  
      if (resultado.erro || !resultado.data) {
        setErroAcao(resultado.erro ?? "Não foi possível abrir o arquivo.");
        return;
      }
  
      window.open(resultado.data, "_blank", "noopener,noreferrer");
    }
  
    function limparFiltros() {
      setPesquisa("");
      setFiltroSituacao("");
      setFiltroEstabelecimento("");
    }
  
    function tentarNovamente() {
      setErroLista("");
      setCarregando(true);
      setTentativa((valor) => valor + 1);
    }
  
    /* CONTEÚDO */
  
    function renderizarArquivoBadge(atual: RevisaoLtcat | null) {
      if (!atual) {
        return <span className="mod-muted">Sem revisões</span>;
      }
  
      return atual.arquivoPath ? (
        <Badge color="green">Anexado</Badge>
      ) : (
        <Badge color="yellow">Sem arquivo</Badge>
      );
    }
  
    function renderizarConteudo() {
      if (carregando) {
        return (
          <div className="mod-loading">
            <FileText size={22} />
            Carregando documentos...
          </div>
        );
      }
  
      if (erroLista) {
        return (
          <EstadoVazio
            titulo="Não foi possível carregar os documentos"
            texto={erroLista}
            acao={<Button onClick={tentarNovamente}>Tentar novamente</Button>}
            mobile={mobile}
          />
        );
      }
  
      if (documentos.length === 0) {
        return (
          <EstadoVazio
            titulo="Nenhum LTCAT cadastrado"
            texto="Cadastre os laudos existentes para organizar revisões, responsáveis e arquivos em um só lugar."
            acao={
              <Button onClick={abrirNovoDocumento}>
                Cadastrar primeiro documento
              </Button>
            }
            mobile={mobile}
          />
        );
      }
  
      if (documentosFiltrados.length === 0) {
        return (
          <EstadoVazio
            titulo="Nenhum documento corresponde aos filtros"
            texto="Altere a pesquisa ou os filtros para visualizar outros registros."
            mobile={mobile}
          />
        );
      }
  
      if (mobile) {
        return (
          <div className="mod-mobile-list">
            {documentosFiltrados.map((documento) => {
              const atual = revisaoAtual(revisoesPorDocumento.get(documento.id));
  
              return (
                <article
                  key={documento.id}
                  className={`mod-mobile-card ${
                    atual?.situacao === "vigente"
                      ? "mod-mobile-card-ok"
                      : atual?.situacao === "pendente_revisao"
                        ? "mod-mobile-card-alert"
                        : ""
                  }`}
                >
                  <div className="mod-mobile-header">
                    <div className="mod-person">
                      <div className="mod-avatar">
                        <FileText size={18} />
                      </div>
  
                      <div>
                        <strong>{documento.titulo}</strong>
                        <span>
                          {documento.estabelecimento || "Estabelecimento não informado"}
                        </span>
                      </div>
                    </div>
  
                    {atual && (
                      <Badge color={COR_SITUACAO[atual.situacao]}>
                        {ROTULO_SITUACAO_REVISAO[atual.situacao]}
                      </Badge>
                    )}
                  </div>
  
                  <div className="mod-mobile-data">
                    <div>
                      <span>Revisão atual</span>
                      <strong>{atual ? `Revisão ${atual.numero}` : "Nenhuma"}</strong>
                    </div>
  
                    <div>
                      <span>Arquivo</span>
                      <strong>{renderizarArquivoBadge(atual)}</strong>
                    </div>
  
                    <div>
                      <span>Responsável</span>
                      <strong>{atual?.responsavelNome || "Não informado"}</strong>
                    </div>
  
                    <div>
                      <span>Período avaliado</span>
                      <strong>{atual ? textoPeriodo(atual) : "Não informado"}</strong>
                    </div>
                  </div>
  
                  <div className="mod-mobile-actions">
                    <button
                      type="button"
                      className="mod-btn-view"
                      onClick={() => setDetalheId(documento.id)}
                    >
                      <Eye size={15} />
                      Detalhes
                    </button>
  
                    <button
                      type="button"
                      className="mod-btn-edit"
                      onClick={() => abrirNovaRevisao(documento)}
                    >
                      <Plus size={15} />
                      Revisão
                    </button>
  
                    <button
                      type="button"
                      className="mod-btn-edit"
                      onClick={() => abrirEdicaoDocumento(documento)}
                    >
                      <Pencil size={15} />
                      Editar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        );
      }
  
      return (
        <div className="mod-table-container">
          <table className="mod-table mod-table-ltcat">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Abrangência</th>
                <th>Revisão atual</th>
                <th>Responsável</th>
                <th>Período avaliado</th>
                <th>Arquivo</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
  
            <tbody>
              {documentosFiltrados.map((documento) => {
                const atual = revisaoAtual(
                  revisoesPorDocumento.get(documento.id)
                );
  
                return (
                  <tr key={documento.id}>
                    <td>
                      <div className="mod-person">
                        <div className="mod-avatar">
                          <FileText size={19} />
                        </div>
  
                        <div>
                          <strong>{documento.titulo}</strong>
                          <span>
                            {documento.estabelecimento ||
                              "Estabelecimento não informado"}
                          </span>
                        </div>
                      </div>
                    </td>
  
                    <td>
                      <div style={{ minWidth: 150, maxWidth: 220 }}>
                        {documento.abrangencia || (
                          <span className="mod-muted">Não informada</span>
                        )}
                      </div>
                    </td>
  
                    <td>
                      {atual ? (
                        <div>
                          <Badge color={COR_SITUACAO[atual.situacao]}>
                            {ROTULO_SITUACAO_REVISAO[atual.situacao]}
                          </Badge>
  
                          <div className="mod-sub">Revisão {atual.numero}</div>
                        </div>
                      ) : (
                        <span className="mod-muted">Sem revisões</span>
                      )}
                    </td>
  
                    <td>
                      {atual && atual.responsavelNome ? (
                        <div style={{ minWidth: 140 }}>
                          <strong style={{ color: "#0f172a" }}>
                            {atual.responsavelNome}
                          </strong>
  
                          <div className="mod-sub">
                            {atual.registroProfissional || "Registro não informado"}
                          </div>
                        </div>
                      ) : (
                        <span className="mod-muted">Não informado</span>
                      )}
                    </td>
  
                    <td>
                      <div className="mod-period">
                        <div className="mod-line">
                          <CalendarDays size={15} />
                          {atual ? textoPeriodo(atual) : "Não informado"}
                        </div>
                      </div>
                    </td>
  
                    <td>
                      {renderizarArquivoBadge(atual)}
  
                      {atual && atual.arquivoPath && (
                        <div className="mod-flag">
                          <button
                            type="button"
                            className="mod-link-btn"
                            onClick={() => void abrirArquivo(atual)}
                          >
                            <ExternalLink size={14} />
                            Abrir
                          </button>
                        </div>
                      )}
                    </td>
  
                    <td>
                      <div className="mod-actions">
                        <button
                          type="button"
                          title="Ver detalhes e histórico"
                          aria-label="Ver detalhes e histórico"
                          className="mod-action mod-action-view"
                          onClick={() => setDetalheId(documento.id)}
                        >
                          <Eye size={17} />
                        </button>
  
                        <button
                          type="button"
                          title="Nova revisão"
                          aria-label="Nova revisão"
                          className="mod-action mod-action-edit"
                          onClick={() => abrirNovaRevisao(documento)}
                        >
                          <Plus size={17} />
                        </button>
  
                        <button
                          type="button"
                          title="Editar documento"
                          aria-label="Editar documento"
                          className="mod-action mod-action-edit"
                          onClick={() => abrirEdicaoDocumento(documento)}
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  
    /* DETALHE DO DOCUMENTO */
  
    function renderizarDetalhe(documento: DocumentoLtcat) {
      const lista = revisoesPorDocumento.get(documento.id) ?? [];
  
      return (
        <div
          className="mod-drawer-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDetalheId(null);
            }
          }}
        >
          <aside
            className="mod-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ltcat-detalhe-titulo"
          >
            <header className="mod-drawer-header">
              <div className="mod-drawer-header-main">
                <div className="mod-drawer-icon">
                  <FileText size={22} />
                </div>
  
                <div className="mod-drawer-title">
                  <span className="mod-drawer-eyebrow">Detalhes do LTCAT</span>
  
                  <h2 id="ltcat-detalhe-titulo">{documento.titulo}</h2>
  
                  <p>{documento.estabelecimento || "Estabelecimento não informado"}</p>
                </div>
              </div>
  
              <button
                type="button"
                className="mod-drawer-close"
                onClick={() => setDetalheId(null)}
                aria-label="Fechar detalhes"
              >
                <X size={19} />
              </button>
            </header>
  
            <div className="mod-drawer-content">
              <div className="mod-detail-block">
                <span>Setores ou ambientes avaliados</span>
                <p>{documento.abrangencia || "Não informado"}</p>
              </div>
  
              <div className="mod-detail-block">
                <span>Observações</span>
                <p>{documento.observacoes || "Nenhuma observação"}</p>
              </div>
  
              <div className="mod-subtitle">
                <span>Histórico de revisões ({lista.length})</span>
  
                <button
                  type="button"
                  className="mod-small-btn mod-small-btn-primary"
                  onClick={() => abrirNovaRevisao(documento)}
                >
                  <Plus size={14} />
                  Nova revisão
                </button>
              </div>
  
              {lista.length === 0 ? (
                <div className="mod-detail-block">
                  <p>Nenhuma revisão registrada para este documento.</p>
                </div>
              ) : (
                <div className="mod-rev-list">
                  {lista.map((revisao) => (
                    <div
                      key={revisao.id}
                      className={`mod-rev ${
                        revisao.situacao === "vigente" ? "mod-rev-vigente" : ""
                      }`}
                    >
                      <div className="mod-rev-header">
                        <strong>Revisão {revisao.numero}</strong>
  
                        <Badge color={COR_SITUACAO[revisao.situacao]}>
                          {ROTULO_SITUACAO_REVISAO[revisao.situacao]}
                        </Badge>
                      </div>
  
                      <div className="mod-rev-data">
                        <div>
                          <span>Elaboração</span>
                          <strong>{formatarData(revisao.dataElaboracao)}</strong>
                        </div>
  
                        <div>
                          <span>Data da revisão</span>
                          <strong>
                            {formatarData(revisao.dataRevisao, "Não se aplica")}
                          </strong>
                        </div>
  
                        <div>
                          <span>Período avaliado</span>
                          <strong>{textoPeriodo(revisao)}</strong>
                        </div>
  
                        <div>
                          <span>Responsável</span>
                          <strong>
                            {revisao.responsavelNome || "Não informado"}
                            {revisao.responsavelProfissao
                              ? ` (${ROTULO_PROFISSAO[revisao.responsavelProfissao]})`
                              : ""}
                          </strong>
                        </div>
  
                        <div>
                          <span>Registro profissional</span>
                          <strong>
                            {revisao.registroProfissional || "Não informado"}
                          </strong>
                        </div>
  
                        <div>
                          <span>Arquivo</span>
                          <strong>
                            {revisao.arquivoPath
                              ? `${revisao.arquivoNome} (${formatarTamanho(revisao.arquivoTamanho)})`
                              : "Sem arquivo anexado"}
                          </strong>
                        </div>
  
                        {revisao.vigenciaValidadaEm && (
                          <div>
                            <span>Vigência validada</span>
                            <strong>
                              {formatarData(revisao.vigenciaValidadaEm)} por{" "}
                              {revisao.vigenciaValidadaPor}
                            </strong>
                          </div>
                        )}
  
                        {revisao.observacoes && (
                          <div>
                            <span>Observações</span>
                            <strong>{revisao.observacoes}</strong>
                          </div>
                        )}
                      </div>
  
                      <div className="mod-rev-actions">
                        {revisao.arquivoPath && (
                          <button
                            type="button"
                            className="mod-small-btn"
                            onClick={() => void abrirArquivo(revisao)}
                          >
                            <ExternalLink size={14} />
                            Abrir arquivo
                          </button>
                        )}
  
                        <button
                          type="button"
                          className="mod-small-btn"
                          onClick={() => {
                            setDetalheId(null);
                            abrirEdicaoRevisao(revisao);
                          }}
                        >
                          <Pencil size={14} />
                          Editar revisão
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            <footer className="mod-drawer-footer">
              {lista.length === 0 && (
                <button
                  type="button"
                  className="mod-small-btn mod-small-btn-danger"
                  onClick={() => void excluirDoc(documento)}
                >
                  <Trash2 size={14} />
                  Excluir documento
                </button>
              )}
  
              <Button onClick={() => abrirEdicaoDocumento(documento)} color="#64748B">
                Editar documento
              </Button>
  
              <Button onClick={() => setDetalheId(null)}>Fechar</Button>
            </footer>
          </aside>
        </div>
      );
    }
  
    /* FORMULÁRIO DE REVISÃO */
  
    const documentoDaRevisao = documentos.find(
      (documento) => documento.id === formRev.documentoId
    );
  
    const opcoesSituacao: SituacaoRevisao[] = [
      "em_elaboracao",
      "pendente_revisao",
      "arquivado",
    ];
  
    if (
      editandoRev &&
      (editandoRev.situacao === "vigente" ||
        editandoRev.situacao === "substituido")
    ) {
      opcoesSituacao.push(editandoRev.situacao);
    }
  
    const arquivoBloqueado =
      editandoRev !== null &&
      editandoRev.arquivoPath !== "" &&
      (editandoRev.situacao === "vigente" ||
        editandoRev.situacao === "substituido");
  
    const podeValidarVigencia =
      editandoRev !== null &&
      (editandoRev.situacao === "em_elaboracao" ||
        editandoRev.situacao === "pendente_revisao") &&
      formRev.situacao !== "arquivado";
  
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
          title="LTCAT"
          subtitle="Controle documental dos Laudos Técnicos das Condições Ambientais do Trabalho: revisões, responsáveis e arquivos."
          icon={FileText}
        >
          <Button onClick={abrirNovoDocumento}>
            <span className="mod-button-content">
              <Plus size={18} />
              Novo Documento
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
  
        {avisoAcao && (
          <div className="mod-banner mod-banner-aviso" role="alert">
            <div className="mod-banner-main">
              <AlertCircle size={18} />
              <span>{avisoAcao}</span>
            </div>
  
            <button
              type="button"
              onClick={() => setAvisoAcao("")}
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
            title="Documentos Cadastrados"
            value={documentos.length}
            icon={<FileBadge size={22} />}
            color="#2563EB"
          />
  
          <StatCard
            title="Revisões Vigentes (validadas)"
            value={totalVigentes}
            icon={<CircleCheckBig size={22} />}
            color="#16A34A"
          />
  
          <StatCard
            title="Pendentes de Revisão"
            value={totalPendentes}
            icon={<Clock3 size={22} />}
            color="#F59E0B"
          />
  
          <StatCard
            title="Revisão Atual sem Arquivo"
            value={totalSemArquivo}
            icon={<TriangleAlert size={22} />}
            color="#DC2626"
          />
        </div>
  
        <section className="mod-panel">
          <div className="mod-panel-heading">
            <div>
              <span className="mod-eyebrow">Saúde ocupacional</span>
              <h2>Documentos e revisões</h2>
              <p>
                O sistema organiza o controle e a rastreabilidade. O conteúdo
                técnico e a conclusão do laudo estão no arquivo original,
                elaborado pelo profissional habilitado. A vigência só é marcada
                quando uma pessoa a valida.
              </p>
            </div>
  
            <div className="mod-chip">
              <FileText size={14} />
              {revisoes.length} revisão(ões)
            </div>
          </div>
  
          <div className="mod-filters">
            <div className="mod-filter-title-row">
              <div className="mod-filter-title">
                <SlidersHorizontal size={16} />
                Filtros de documentos
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
  
            <div
              className="mod-filter-grid"
              style={
                mobile || telaMedia
                  ? undefined
                  : {
                      gridTemplateColumns:
                        "minmax(240px, 2fr) repeat(2, minmax(190px, 1fr))",
                    }
              }
            >
              <div className="mod-search">
                <Search size={17} />
  
                <input
                  type="text"
                  placeholder="Pesquisar título, estabelecimento ou responsável..."
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
                <option value="em_elaboracao">Em elaboração</option>
                <option value="vigente">Vigente (validada)</option>
                <option value="pendente_revisao">Pendente de revisão</option>
                <option value="substituido">Substituído</option>
                <option value="arquivado">Arquivado</option>
                <option value="sem_revisao">Sem revisões</option>
              </select>
  
              <select
                className="mod-select"
                value={filtroEstabelecimento}
                onChange={(e) => setFiltroEstabelecimento(e.target.value)}
              >
                <option value="">Todos os estabelecimentos</option>
  
                {estabelecimentos.map((estabelecimento) => (
                  <option key={estabelecimento} value={estabelecimento}>
                    {estabelecimento}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="mod-result-count">
              Exibindo <strong>{documentosFiltrados.length}</strong> de{" "}
              <strong>{documentos.length}</strong> documento(s). A situação
              considerada é a da revisão atual (a vigente ou, na falta dela, a
              mais recente).
            </div>
          </div>
  
          {renderizarConteudo()}
        </section>
  
        {documentoDetalhe && renderizarDetalhe(documentoDetalhe)}
  
        {docAberto && (
          <div
            className="mod-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharDocumento();
              }
            }}
          >
            <aside
              className="mod-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ltcat-doc-titulo"
            >
              <header className="mod-drawer-header">
                <div className="mod-drawer-header-main">
                  <div className="mod-drawer-icon">
                    <FileText size={22} />
                  </div>
  
                  <div className="mod-drawer-title">
                    <span className="mod-drawer-eyebrow">LTCAT</span>
  
                    <h2 id="ltcat-doc-titulo">
                      {editandoDoc ? "Editar documento" : "Novo documento"}
                    </h2>
  
                    <p>Identificação do laudo e abrangência.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mod-drawer-close"
                  onClick={fecharDocumento}
                  aria-label="Fechar formulário"
                >
                  <X size={19} />
                </button>
              </header>
  
              <div className="mod-drawer-content">
                {erroFormDoc && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroFormDoc}</span>
                  </div>
                )}
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>01</span>
  
                    <div>
                      <h3>Identificação</h3>
                      <p>
                        Um documento reúne todas as revisões de um mesmo laudo.
                      </p>
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="ltcat-titulo">
                      Título ou identificação<span>*</span>
                    </label>
  
                    <input
                      id="ltcat-titulo"
                      className="mod-input"
                      type="text"
                      maxLength={150}
                      placeholder="Ex.: LTCAT da cozinha industrial"
                      value={formDoc.titulo}
                      onChange={(e) =>
                        setFormDoc((atual) => ({
                          ...atual,
                          titulo: e.target.value,
                        }))
                      }
                    />
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="ltcat-estabelecimento">Estabelecimento</label>
  
                    <input
                      id="ltcat-estabelecimento"
                      className="mod-input"
                      type="text"
                      maxLength={150}
                      placeholder="Nome ou unidade avaliada"
                      value={formDoc.estabelecimento}
                      onChange={(e) =>
                        setFormDoc((atual) => ({
                          ...atual,
                          estabelecimento: e.target.value,
                        }))
                      }
                    />
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="ltcat-abrangencia">
                      Setores ou ambientes avaliados
                    </label>
  
                    <textarea
                      id="ltcat-abrangencia"
                      className="mod-input mod-textarea"
                      rows={3}
                      maxLength={400}
                      placeholder="Ex.: cozinha quente, câmara fria, estoque seco"
                      value={formDoc.abrangencia}
                      onChange={(e) =>
                        setFormDoc((atual) => ({
                          ...atual,
                          abrangencia: e.target.value,
                        }))
                      }
                    />
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="ltcat-obs-doc">Observações</label>
  
                    <textarea
                      id="ltcat-obs-doc"
                      className="mod-input mod-textarea"
                      rows={3}
                      maxLength={500}
                      placeholder="Opcional"
                      value={formDoc.observacoes}
                      onChange={(e) =>
                        setFormDoc((atual) => ({
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
                  onClick={fecharDocumento}
                  color="#64748B"
                  disabled={salvandoDoc}
                >
                  Cancelar
                </Button>
  
                <Button
                  onClick={() => {
                    void salvarDocumento();
                  }}
                  disabled={salvandoDoc}
                >
                  {salvandoDoc
                    ? "Salvando..."
                    : editandoDoc
                      ? "Salvar alterações"
                      : "Cadastrar documento"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
  
        {revAberto && (
          <div
            className="mod-drawer-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharRevisao();
              }
            }}
          >
            <aside
              className="mod-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ltcat-rev-titulo"
            >
              <header className="mod-drawer-header">
                <div className="mod-drawer-header-main">
                  <div className="mod-drawer-icon">
                    <FileBadge size={22} />
                  </div>
  
                  <div className="mod-drawer-title">
                    <span className="mod-drawer-eyebrow">
                      {documentoDaRevisao?.titulo ?? "LTCAT"}
                    </span>
  
                    <h2 id="ltcat-rev-titulo">
                      {editandoRev
                        ? `Editar revisão ${formRev.numero}`
                        : `Nova revisão ${formRev.numero}`}
                    </h2>
  
                    <p>Dados administrativos e arquivo do laudo.</p>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="mod-drawer-close"
                  onClick={fecharRevisao}
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
                    <strong>Revisões anteriores são preservadas</strong>
                    <span>
                      Cada revisão é um registro próprio e nenhuma é excluída.
                      Quando a conteúdo técnico do laudo mudar, registre uma nova
                      revisão em vez de alterar a existente.
                    </span>
                  </div>
                </div>
  
                {editandoRev?.situacao === "vigente" && (
                  <div className="mod-form-aviso" style={{ margin: "0 0 17px" }}>
                    Esta revisão está vigente e validada. Use esta edição apenas
                    para corrigir dados administrativos.
                  </div>
                )}
  
                {erroFormRev && (
                  <div className="mod-form-erro" role="alert">
                    <AlertCircle size={17} />
                    <span>{erroFormRev}</span>
                  </div>
                )}
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>01</span>
  
                    <div>
                      <h3>Situação e datas</h3>
                      <p>Informe apenas as datas que constam no documento.</p>
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="rev-situacao">Situação</label>
  
                    <select
                      id="rev-situacao"
                      className="mod-input"
                      value={formRev.situacao}
                      onChange={(e) =>
                        setFormRev((atual) => ({
                          ...atual,
                          situacao: e.target.value as SituacaoRevisao,
                        }))
                      }
                    >
                      {opcoesSituacao.map((situacao) => (
                        <option
                          key={situacao}
                          value={situacao}
                          disabled={
                            situacao === "vigente" || situacao === "substituido"
                          }
                        >
                          {ROTULO_SITUACAO_REVISAO[situacao]}
                        </option>
                      ))}
                    </select>
  
                    <small>
                      A situação "Vigente" só é atribuída pela validação de
                      vigência (seção 05) e "Substituído" é aplicada
                      automaticamente quando outra revisão é validada.
                    </small>
                  </div>
  
                  <div className="mod-grid-2">
                    <div className="mod-field">
                      <label htmlFor="rev-elaboracao">Data de elaboração</label>
  
                      <input
                        id="rev-elaboracao"
                        className="mod-input"
                        type="date"
                        value={formRev.dataElaboracao}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            dataElaboracao: e.target.value,
                          }))
                        }
                      />
                    </div>
  
                    <div className="mod-field">
                      <label htmlFor="rev-data-revisao">Data da revisão</label>
  
                      <input
                        id="rev-data-revisao"
                        className="mod-input"
                        type="date"
                        value={formRev.dataRevisao}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            dataRevisao: e.target.value,
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
                      <h3>Período e responsável técnico</h3>
                      <p>
                        Conforme consta no laudo. O LTCAT é assinado por engenheiro
                        de segurança do trabalho ou médico do trabalho.
                      </p>
                    </div>
                  </div>
  
                  <div className="mod-grid-2">
                    <div className="mod-field">
                      <label htmlFor="rev-periodo-inicio">Período avaliado: início</label>
  
                      <input
                        id="rev-periodo-inicio"
                        className="mod-input"
                        type="date"
                        value={formRev.periodoInicio}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            periodoInicio: e.target.value,
                          }))
                        }
                      />
                    </div>
  
                    <div className="mod-field">
                      <label htmlFor="rev-periodo-fim">Período avaliado: fim</label>
  
                      <input
                        id="rev-periodo-fim"
                        className="mod-input"
                        type="date"
                        value={formRev.periodoFim}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            periodoFim: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <label htmlFor="rev-responsavel">Responsável técnico</label>
  
                    <input
                      id="rev-responsavel"
                      className="mod-input"
                      type="text"
                      maxLength={150}
                      placeholder="Nome do profissional que assina o laudo"
                      value={formRev.responsavelNome}
                      onChange={(e) =>
                        setFormRev((atual) => ({
                          ...atual,
                          responsavelNome: e.target.value,
                        }))
                      }
                    />
                  </div>
  
                  <div className="mod-grid-2">
                    <div className="mod-field">
                      <label htmlFor="rev-profissao">Profissão</label>
  
                      <select
                        id="rev-profissao"
                        className="mod-input"
                        value={formRev.responsavelProfissao}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            responsavelProfissao: e.target
                              .value as ProfissaoResponsavel,
                          }))
                        }
                      >
                        <option value="">Não informada</option>
                        <option value="engenheiro_seguranca">
                          {ROTULO_PROFISSAO.engenheiro_seguranca}
                        </option>
                        <option value="medico_trabalho">
                          {ROTULO_PROFISSAO.medico_trabalho}
                        </option>
                        <option value="outro">{ROTULO_PROFISSAO.outro}</option>
                      </select>
                    </div>
  
                    <div className="mod-field">
                      <label htmlFor="rev-registro">Registro profissional</label>
  
                      <input
                        id="rev-registro"
                        className="mod-input"
                        type="text"
                        maxLength={60}
                        placeholder="Ex.: CREA ou CRM"
                        value={formRev.registroProfissional}
                        onChange={(e) =>
                          setFormRev((atual) => ({
                            ...atual,
                            registroProfissional: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>03</span>
  
                    <div>
                      <h3>Arquivo do laudo</h3>
                      <p>
                        PDF de até 10 MB, em armazenamento privado. O acesso usa
                        um link temporário de 60 segundos.
                      </p>
                    </div>
                  </div>
  
                  {editandoRev?.arquivoPath && (
                    <div className="mod-file-info">
                      <span>
                        Arquivo atual: {editandoRev.arquivoNome} (
                        {formatarTamanho(editandoRev.arquivoTamanho)})
                      </span>
  
                      <button
                        type="button"
                        className="mod-small-btn"
                        onClick={() => void abrirArquivo(editandoRev)}
                      >
                        <ExternalLink size={14} />
                        Abrir
                      </button>
                    </div>
                  )}
  
                  {arquivoBloqueado ? (
                    <div className="mod-form-aviso" style={{ margin: 0 }}>
                      O arquivo desta revisão não pode ser substituído porque ela
                      já foi validada. Para alterar o laudo, registre uma nova
                      revisão.
                    </div>
                  ) : (
                    <div className="mod-field">
                      <label htmlFor="rev-arquivo">
                        {editandoRev?.arquivoPath
                          ? "Substituir arquivo (o anterior será removido)"
                          : "Anexar arquivo PDF"}
                      </label>
  
                      <input
                        id="rev-arquivo"
                        className="mod-input mod-file"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) =>
                          setArquivoSelecionado(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                  )}
                </section>
  
                <section className="mod-form-section">
                  <div className="mod-form-section-header">
                    <span>04</span>
  
                    <div>
                      <h3>Observações</h3>
                      <p>Somente informações administrativas.</p>
                    </div>
                  </div>
  
                  <div className="mod-field">
                    <textarea
                      id="rev-observacoes"
                      className="mod-input mod-textarea"
                      rows={3}
                      maxLength={500}
                      placeholder="Opcional"
                      aria-label="Observações da revisão"
                      value={formRev.observacoes}
                      onChange={(e) =>
                        setFormRev((atual) => ({
                          ...atual,
                          observacoes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </section>
  
                {editandoRev && (
                  <section className="mod-form-section">
                    <div className="mod-form-section-header">
                      <span>05</span>
  
                      <div>
                        <h3>Validação de vigência</h3>
                        <p>
                          A vigência não é calculada por data. Ela é registrada
                          por uma pessoa responsável.
                        </p>
                      </div>
                    </div>
  
                    {editandoRev.situacao === "vigente" ? (
                      <div className="mod-file-info">
                        <span>
                          Vigência validada em{" "}
                          {formatarData(editandoRev.vigenciaValidadaEm)} por{" "}
                          {editandoRev.vigenciaValidadaPor}.
                        </span>
                      </div>
                    ) : podeValidarVigencia ? (
                      <>
                        <label className="mod-checkbox">
                          <input
                            type="checkbox"
                            checked={tornarVigente}
                            onChange={(e) => setTornarVigente(e.target.checked)}
                          />
  
                          <span>
                            Validar a vigência e tornar esta revisão a vigente. A
                            revisão vigente anterior deste documento passa a
                            "Substituído".
                          </span>
                        </label>
  
                        {tornarVigente && (
                          <div className="mod-grid-2">
                            <div className="mod-field">
                              <label htmlFor="rev-validado-por">
                                Validado por<span>*</span>
                              </label>
  
                              <input
                                id="rev-validado-por"
                                className="mod-input"
                                type="text"
                                maxLength={150}
                                placeholder="Nome de quem validou"
                                value={validadoPor}
                                onChange={(e) => setValidadoPor(e.target.value)}
                              />
                            </div>
  
                            <div className="mod-field">
                              <label htmlFor="rev-validado-em">
                                Data da validação<span>*</span>
                              </label>
  
                              <input
                                id="rev-validado-em"
                                className="mod-input"
                                type="date"
                                max={hoje}
                                value={validadoEm}
                                onChange={(e) => setValidadoEm(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mod-form-aviso" style={{ margin: 0 }}>
                        Revisões substituídas ou arquivadas não podem ser
                        validadas como vigentes.
                      </div>
                    )}
                  </section>
                )}
              </div>
  
              <footer className="mod-drawer-footer">
                <Button
                  onClick={fecharRevisao}
                  color="#64748B"
                  disabled={salvandoRev}
                >
                  Cancelar
                </Button>
  
                <Button
                  onClick={() => {
                    void salvarRevisao();
                  }}
                  disabled={salvandoRev}
                >
                  {salvandoRev
                    ? "Salvando..."
                    : editandoRev
                      ? "Salvar alterações"
                      : "Registrar revisão"}
                </Button>
              </footer>
            </aside>
          </div>
        )}
      </main>
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
          <FileText size={25} />
        </div>
  
        <strong>{titulo}</strong>
  
        <span>{texto}</span>
  
        {acao}
      </div>
    );
  }