import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import type {
  Funcionario,
  FuncionarioEntrada,
  SituacaoFuncionario,
} from "../models/Funcionario";

export interface ResultadoServico<T> {
  data: T | null;
  erro: string | null;
}

interface FuncionarioRow {
  id: number;
  nome: string;
  matricula: string;
  setor: string;
  funcao: string;
  data_admissao: string | null;
  data_desligamento: string | null;
  situacao: SituacaoFuncionario;
  observacoes: string;
}

const CAMPOS_FUNCIONARIO =
  "id, nome, matricula, setor, funcao, data_admissao, data_desligamento, situacao, observacoes";

function converter(linha: FuncionarioRow): Funcionario {
  return {
    id: linha.id,
    nome: linha.nome,
    matricula: linha.matricula ?? "",
    setor: linha.setor ?? "",
    funcao: linha.funcao ?? "",
    dataAdmissao: linha.data_admissao ?? "",
    dataDesligamento: linha.data_desligamento ?? "",
    situacao: linha.situacao,
    observacoes: linha.observacoes ?? "",
  };
}

function criarPayload(entrada: FuncionarioEntrada) {
  const desligado = entrada.situacao === "desligado";

  return {
    nome: entrada.nome.trim(),
    matricula: entrada.matricula.trim(),
    setor: entrada.setor.trim(),
    funcao: entrada.funcao.trim(),
    data_admissao: entrada.dataAdmissao || null,
    data_desligamento: desligado ? entrada.dataDesligamento || null : null,
    situacao: entrada.situacao,
    observacoes: entrada.observacoes.trim(),
  };
}

function registrarErro(operacao: string, error: PostgrestError) {
  console.error(`Funcionários (${operacao}):`, error.code, error.message);
}

function traduzirErro(error: PostgrestError, mensagemPadrao: string) {
  if (error.code === "23505") {
    return "Já existe um funcionário com esta matrícula.";
  }

  if (error.code === "23514") {
    return "Os dados informados não atendem às regras de validação. Revise as datas e a situação.";
  }

  if (error.code === "23503") {
    return "Este funcionário possui registros vinculados e não pode ser excluído. Altere a situação para desligado.";
  }

  if (error.code === "42501") {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (/failed to fetch|network/i.test(error.message)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return mensagemPadrao;
}

export async function listarFuncionarios(): Promise<
  ResultadoServico<Funcionario[]>
> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select(CAMPOS_FUNCIONARIO)
    .order("nome", { ascending: true });

  if (error) {
    registrarErro("listar", error);

    return {
      data: null,
      erro: traduzirErro(error, "Não foi possível carregar os funcionários."),
    };
  }

  return {
    data: ((data ?? []) as FuncionarioRow[]).map(converter),
    erro: null,
  };
}

export async function criarFuncionario(
  entrada: FuncionarioEntrada
): Promise<ResultadoServico<Funcionario>> {
  const { data, error } = await supabase
    .from("funcionarios")
    .insert(criarPayload(entrada))
    .select(CAMPOS_FUNCIONARIO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("criar", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível cadastrar o funcionário.")
        : "Não foi possível cadastrar o funcionário.",
    };
  }

  return { data: converter(data as FuncionarioRow), erro: null };
}

export async function atualizarFuncionario(
  id: number,
  entrada: FuncionarioEntrada
): Promise<ResultadoServico<Funcionario>> {
  const { data, error } = await supabase
    .from("funcionarios")
    .update(criarPayload(entrada))
    .eq("id", id)
    .select(CAMPOS_FUNCIONARIO)
    .single();

  if (error || !data) {
    if (error) {
      registrarErro("atualizar", error);
    }

    return {
      data: null,
      erro: error
        ? traduzirErro(error, "Não foi possível atualizar o funcionário.")
        : "Não foi possível atualizar o funcionário.",
    };
  }

  return { data: converter(data as FuncionarioRow), erro: null };
}

export async function excluirFuncionario(
  id: number
): Promise<{ erro: string | null }> {
  const { data, error } = await supabase
    .from("funcionarios")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    registrarErro("excluir", error);

    return {
      erro: traduzirErro(error, "Não foi possível excluir o funcionário."),
    };
  }

  if (!data || data.length === 0) {
    return { erro: "O funcionário não foi encontrado ou já foi excluído." };
  }

  return { erro: null };
}