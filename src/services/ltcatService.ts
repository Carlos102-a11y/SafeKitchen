import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import type {
  DocumentoLtcat,
  DocumentoLtcatEntrada,
  ProfissaoResponsavel,
  RevisaoLtcat,
  RevisaoLtcatEntrada,
  SituacaoRevisao,
} from "../models/Ltcat";

import type { ResultadoServico } from "./funcionariosService";

const BUCKET = "ltcat-documentos";

export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024;

/* Duração da URL assinada de abertura do arquivo. */
const SEGUNDOS_URL = 60;

interface DocumentoRow {
  id: number;
  titulo: string;
  estabelecimento: string;
  abrangencia: string;
  observacoes: string;
}

interface RevisaoRow {
  id: number;
  documento_id: number;
  numero: number;
  situacao: SituacaoRevisao;
  data_elaboracao: string | null;
  data_revisao: string | null;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  responsavel_nome: string;
  responsavel_profissao: ProfissaoResponsavel;
  registro_profissional: string;
  vigencia_validada_em: string | null;
  vigencia_validada_por: string;
  arquivo_path: string | null;
  arquivo_nome: string;
  arquivo_tamanho: number | null;
  observacoes: string;
}

const CAMPOS_DOCUMENTO = "id, titulo, estabelecimento, abrangencia, observacoes";

const CAMPOS_REVISAO =
  "id, documento_id, numero, situacao, data_elaboracao, data_revisao, periodo_inicio, periodo_fim, responsavel_nome, responsavel_profissao, registro_profissional, vigencia_validada_em, vigencia_validada_por, arquivo_path, arquivo_nome, arquivo_tamanho, observacoes";

function converterDocumento(linha: DocumentoRow): DocumentoLtcat {
  return {
    id: linha.id,
    titulo: linha.titulo,
    estabelecimento: linha.estabelecimento ?? "",
    abrangencia: linha.abrangencia ?? "",
    observacoes: linha.observacoes ?? "",
  };
}

function converterRevisao(linha: RevisaoRow): RevisaoLtcat {
  return {
    id: linha.id,
    documentoId: linha.documento_id,
    numero: linha.numero,
    situacao: linha.situacao,
    dataElaboracao: linha.data_elaboracao ?? "",
    dataRevisao: linha.data_revisao ?? "",
    periodoInicio: linha.periodo_inicio ?? "",
    periodoFim: linha.periodo_fim ?? "",
    responsavelNome: linha.responsavel_nome ?? "",
    responsavelProfissao: linha.responsavel_profissao ?? "",
    registroProfissional: linha.registro_profissional ?? "",
    vigenciaValidadaEm: linha.vigencia_validada_em ?? "",
    vigenciaValidadaPor: linha.vigencia_validada_por ?? "",
    arquivoPath: linha.arquivo_path ?? "",
    arquivoNome: linha.arquivo_nome ?? "",
    arquivoTamanho: linha.arquivo_tamanho ?? null,
    observacoes: linha.observacoes ?? "",
  };
}

function payloadDocumento(entrada: DocumentoLtcatEntrada) {
  return {
    titulo: entrada.titulo.trim(),
    estabelecimento: entrada.estabelecimento.trim(),
    abrangencia: entrada.abrangencia.trim(),
    observacoes: entrada.observacoes.trim(),
  };
}

function payloadRevisao(entrada: RevisaoLtcatEntrada) {
  return {
    situacao: entrada.situacao,
    data_elaboracao: entrada.dataElaboracao || null,
    data_revisao: entrada.dataRevisao || null,
    periodo_inicio: entrada.periodoInicio || null,
    periodo_fim: entrada.periodoFim || null,
    responsavel_nome: entrada.responsavelNome.trim(),
    responsavel_profissao: entrada.responsavelProfissao,
    registro_profissional: entrada.registroProfissional.trim(),
    observacoes: entrada.observacoes.trim(),
  };
}

function registrarErro(operacao: string, error: PostgrestError) {
  console.error(`LTCAT (${operacao}):`, error.code, error.message);
}

function traduzirErro(
  error: PostgrestError,
  mensagemPadrao: string,
  mensagemReferencia = "O documento selecionado não existe ou não pertence à sua conta."
) {
  if (error.code === "23505") {
    return "Já existe uma revisão com este número neste documento ou outra revisão já vigente. Recarregue a página e tente novamente.";
  }

  if (error.code === "23514") {
    return "Os dados não atendem às regras de validação. Para validar a vigência são necessários: responsável com registro profissional, data de elaboração e arquivo do laudo anexado.";
  }

  if (error.code === "23503") {
    return mensagemReferencia;
  }

  if (error.code === "42501") {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (/failed to fetch|network/i.test(error.message)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return mensagemPadrao;
}

/* ARQUIVO: validação local antes do envio */

export function validarArquivoPdf(arquivo: File) {
  const ehPdf =
    arquivo.type === "application/pdf" ||
    arquivo.name.toLowerCase().endsWith(".pdf");

  if (!ehPdf) {
    return "Selecione um arquivo no formato PDF.";
  }

  if (arquivo.size === 0) {
    return "O arquivo selecionado está vazio.";
  }

  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
    return "O arquivo excede o limite de 10 MB.";
  }

  return "";
}

/* DOCUMENTOS */

export async function listarDocumentos(): Promise<
  ResultadoServico<DocumentoLtcat[]>
> {
  const { data, error } = await supabase
    .from("ltcat_documentos")
    .select(CAMPOS_DOCUMENTO)
    .order("titulo", { ascending: true });

  if (error) {
    registrarErro("listar documentos", error);

    return {
      data: null,
      erro: traduzirErro(error, "Não foi possível carregar os documentos."),
    };
  }

  return {
    data: ((data ?? []) as DocumentoRow[]).map(converterDocumento),
    erro: null,
  };
}

export async function criarDocumento(
  entrada: DocumentoLtcatEntrada
): Promise<ResultadoServico<DocumentoLtcat>> {
  const { data, error } = await supabase
    .from("ltcat_documentos")
    .insert(payloadDocumento(entrada))
    .select(CAMPOS_DOCUMENTO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("criar documento", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível cadastrar o documento.")
        : "Não foi possível cadastrar o documento.",
    };
  }

  return { data: converterDocumento(data as DocumentoRow), erro: null };
}

export async function atualizarDocumento(
  id: number,
  entrada: DocumentoLtcatEntrada
): Promise<ResultadoServico<DocumentoLtcat>> {
  const { data, error } = await supabase
    .from("ltcat_documentos")
    .update(payloadDocumento(entrada))
    .eq("id", id)
    .select(CAMPOS_DOCUMENTO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("atualizar documento", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível atualizar o documento.")
        : "Não foi possível atualizar o documento.",
    };
  }

  return { data: converterDocumento(data as DocumentoRow), erro: null };
}

export async function excluirDocumento(
  id: number
): Promise<{ erro: string | null }> {
  const { data, error } = await supabase
    .from("ltcat_documentos")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    registrarErro("excluir documento", error);

    return {
      erro: traduzirErro(
        error,
        "Não foi possível excluir o documento.",
        "Este documento possui revisões e não pode ser excluído. Arquive as revisões em vez de excluir."
      ),
    };
  }

  if (!data || data.length === 0) {
    return { erro: "O documento não foi encontrado ou já foi excluído." };
  }

  return { erro: null };
}

/* REVISÕES */

export async function listarRevisoes(): Promise<
  ResultadoServico<RevisaoLtcat[]>
> {
  const { data, error } = await supabase
    .from("ltcat_revisoes")
    .select(CAMPOS_REVISAO)
    .order("documento_id", { ascending: true })
    .order("numero", { ascending: false });

  if (error) {
    registrarErro("listar revisões", error);

    return {
      data: null,
      erro: traduzirErro(error, "Não foi possível carregar as revisões."),
    };
  }

  return {
    data: ((data ?? []) as RevisaoRow[]).map(converterRevisao),
    erro: null,
  };
}

export async function criarRevisao(
  entrada: RevisaoLtcatEntrada
): Promise<ResultadoServico<RevisaoLtcat>> {
  const { data, error } = await supabase
    .from("ltcat_revisoes")
    .insert({
      documento_id: entrada.documentoId,
      numero: entrada.numero,
      ...payloadRevisao(entrada),
    })
    .select(CAMPOS_REVISAO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("criar revisão", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível registrar a revisão.")
        : "Não foi possível registrar a revisão.",
    };
  }

  return { data: converterRevisao(data as RevisaoRow), erro: null };
}

export async function atualizarRevisao(
  id: number,
  entrada: RevisaoLtcatEntrada
): Promise<ResultadoServico<RevisaoLtcat>> {
  const { data, error } = await supabase
    .from("ltcat_revisoes")
    .update(payloadRevisao(entrada))
    .eq("id", id)
    .select(CAMPOS_REVISAO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("atualizar revisão", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível atualizar a revisão.")
        : "Não foi possível atualizar a revisão.",
    };
  }

  return { data: converterRevisao(data as RevisaoRow), erro: null };
}

export async function tornarRevisaoVigente(
  id: number,
  validadaPor: string,
  validadaEm: string
): Promise<{ erro: string | null }> {
  const { error } = await supabase.rpc("ltcat_tornar_vigente", {
    p_revisao_id: id,
    p_validada_por: validadaPor.trim(),
    p_validada_em: validadaEm,
  });

  if (error) {
    registrarErro("validar vigência", error);

    return {
      erro: traduzirErro(error, "Não foi possível validar a vigência."),
    };
  }

  return { erro: null };
}

/* ARQUIVOS (bucket privado) */

export async function anexarArquivo(
  userId: string,
  revisao: RevisaoLtcat,
  arquivo: File
): Promise<ResultadoServico<RevisaoLtcat>> {
  const erroArquivo = validarArquivoPdf(arquivo);

  if (erroArquivo) {
    return { data: null, erro: erroArquivo };
  }

  const caminho = `${userId}/${revisao.documentoId}/${revisao.id}-${Date.now()}.pdf`;

  const envio = await supabase.storage
    .from(BUCKET)
    .upload(caminho, arquivo, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (envio.error) {
    console.error("LTCAT (enviar arquivo):", envio.error.message);

    return {
      data: null,
      erro: "Não foi possível enviar o arquivo. Verifique o formato PDF, o limite de 10 MB e a conexão.",
    };
  }

  const { data, error } = await supabase
    .from("ltcat_revisoes")
    .update({
      arquivo_path: caminho,
      arquivo_nome: arquivo.name.slice(0, 200),
      arquivo_tamanho: arquivo.size,
    })
    .eq("id", revisao.id)
    .select(CAMPOS_REVISAO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("registrar arquivo", error);
    }

    /* Evita arquivo órfão no armazenamento. */
    await supabase.storage.from(BUCKET).remove([caminho]);

    return {
      data: null,
      erro: "O arquivo foi enviado, mas não foi possível registrá-lo na revisão.",
    };
  }

  if (revisao.arquivoPath) {
    const remocao = await supabase.storage
      .from(BUCKET)
      .remove([revisao.arquivoPath]);

    if (remocao.error) {
      console.error("LTCAT (remover arquivo anterior):", remocao.error.message);
    }
  }

  return { data: converterRevisao(data as RevisaoRow), erro: null };
}

export async function obterUrlArquivo(
  caminho: string
): Promise<ResultadoServico<string>> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, SEGUNDOS_URL);

  if (error || !data) {
    if (error) {
      console.error("LTCAT (URL do arquivo):", error.message);
    }

    return { data: null, erro: "Não foi possível abrir o arquivo." };
  }

  return { data: data.signedUrl, erro: null };
}