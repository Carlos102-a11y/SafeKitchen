import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import type {
  AcidenteResumo,
  Afastamento,
  AfastamentoEntrada,
  CategoriaAfastamento,
  SituacaoAfastamento,
} from "../models/Afastamento";

import type { ResultadoServico } from "./funcionariosService";

interface AfastamentoRow {
  id: number;
  funcionario_id: number;
  acidente_id: number | null;
  categoria: CategoriaAfastamento;
  setor: string;
  atividade: string;
  data_inicio: string;
  previsao_retorno: string | null;
  data_retorno: string | null;
  situacao: SituacaoAfastamento;
  motivo_cancelamento: string;
  referencia_documental: string;
  observacoes: string;
}

interface AcidenteResumoRow {
  id: number;
  data: string;
  tipo: string;
  gravidade: string;
  funcionario: string;
  funcionario_id: number | null;
  setor: string;
}

const CAMPOS_AFASTAMENTO =
  "id, funcionario_id, acidente_id, categoria, setor, atividade, data_inicio, previsao_retorno, data_retorno, situacao, motivo_cancelamento, referencia_documental, observacoes";

const CAMPOS_ACIDENTE_RESUMO =
  "id, data, tipo, gravidade, funcionario, funcionario_id, setor";

function converter(linha: AfastamentoRow): Afastamento {
  return {
    id: linha.id,
    funcionarioId: linha.funcionario_id,
    acidenteId: linha.acidente_id ?? null,
    categoria: linha.categoria,
    setor: linha.setor ?? "",
    atividade: linha.atividade ?? "",
    dataInicio: linha.data_inicio,
    previsaoRetorno: linha.previsao_retorno ?? "",
    dataRetorno: linha.data_retorno ?? "",
    situacao: linha.situacao,
    motivoCancelamento: linha.motivo_cancelamento ?? "",
    referenciaDocumental: linha.referencia_documental ?? "",
    observacoes: linha.observacoes ?? "",
  };
}

function criarPayload(entrada: AfastamentoEntrada) {
  const encerrado = entrada.situacao === "encerrado";
  const cancelado = entrada.situacao === "cancelado";

  return {
    funcionario_id: entrada.funcionarioId,
    acidente_id:
      entrada.categoria === "relacionado_trabalho"
        ? entrada.acidenteId
        : null,
    categoria: entrada.categoria,
    setor: entrada.setor.trim(),
    atividade: entrada.atividade.trim(),
    data_inicio: entrada.dataInicio,
    previsao_retorno: entrada.previsaoRetorno || null,
    data_retorno: encerrado ? entrada.dataRetorno || null : null,
    situacao: entrada.situacao,
    motivo_cancelamento: cancelado ? entrada.motivoCancelamento.trim() : "",
    referencia_documental: entrada.referenciaDocumental.trim(),
    observacoes: entrada.observacoes.trim(),
  };
}

function registrarErro(operacao: string, error: PostgrestError) {
  console.error(`Afastamentos (${operacao}):`, error.code, error.message);
}

function traduzirErro(error: PostgrestError, mensagemPadrao: string) {
  if (error.code === "23514") {
    return "Os dados informados não atendem às regras de validação. Revise as datas, a situação e o motivo do cancelamento.";
  }

  if (error.code === "23503") {
    return "O funcionário ou o acidente selecionado não existe ou não pertence à sua conta.";
  }

  if (error.code === "42501") {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (/failed to fetch|network/i.test(error.message)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return mensagemPadrao;
}

export async function listarAfastamentos(): Promise<
  ResultadoServico<Afastamento[]>
> {
  const { data, error } = await supabase
    .from("afastamentos")
    .select(CAMPOS_AFASTAMENTO)
    .order("data_inicio", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    registrarErro("listar", error);

    return {
      data: null,
      erro: traduzirErro(error, "Não foi possível carregar os afastamentos."),
    };
  }

  return {
    data: ((data ?? []) as AfastamentoRow[]).map(converter),
    erro: null,
  };
}

export async function criarAfastamento(
  entrada: AfastamentoEntrada
): Promise<ResultadoServico<Afastamento>> {
  const { data, error } = await supabase
    .from("afastamentos")
    .insert(criarPayload(entrada))
    .select(CAMPOS_AFASTAMENTO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("criar", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível registrar o afastamento.")
        : "Não foi possível registrar o afastamento.",
    };
  }

  return { data: converter(data as AfastamentoRow), erro: null };
}

export async function atualizarAfastamento(
  id: number,
  entrada: AfastamentoEntrada
): Promise<ResultadoServico<Afastamento>> {
  const { data, error } = await supabase
    .from("afastamentos")
    .update(criarPayload(entrada))
    .eq("id", id)
    .select(CAMPOS_AFASTAMENTO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("atualizar", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível atualizar o afastamento.")
        : "Não foi possível atualizar o afastamento.",
    };
  }

  return { data: converter(data as AfastamentoRow), erro: null };
}

export async function excluirAfastamento(
  id: number
): Promise<{ erro: string | null }> {
  const { data, error } = await supabase
    .from("afastamentos")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    registrarErro("excluir", error);

    return {
      erro: traduzirErro(error, "Não foi possível excluir o afastamento."),
    };
  }

  if (!data || data.length === 0) {
    return { erro: "O afastamento não foi encontrado ou já foi excluído." };
  }

  return { erro: null };
}

export async function listarAcidentesParaVinculo(): Promise<
  ResultadoServico<AcidenteResumo[]>
> {
  const { data, error } = await supabase
    .from("acidentes")
    .select(CAMPOS_ACIDENTE_RESUMO)
    .neq("tipo", "Quase acidente")
    .order("data", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    registrarErro("listar acidentes", error);

    return {
      data: null,
      erro: traduzirErro(error, "Não foi possível carregar os acidentes."),
    };
  }

  return {
    data: ((data ?? []) as AcidenteResumoRow[]).map((linha) => ({
      id: linha.id,
      data: linha.data,
      tipo: linha.tipo,
      gravidade: linha.gravidade,
      funcionario: linha.funcionario,
      funcionarioId: linha.funcionario_id ?? null,
      setor: linha.setor,
    })),
    erro: null,
  };
}