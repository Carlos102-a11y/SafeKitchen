import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import type {
  AcidenteFuncionario,
  EpiEficaz,
  EpiResumo,
  ExposicaoPpp,
  ExposicaoPppEntrada,
  PeriodoProfissional,
  PeriodoProfissionalEntrada,
  PppCadastro,
  PppCadastroEntrada,
  RiscoPgrResumo,
  TipoAgente,
  TipoAvaliacao,
} from "../models/Ppp";

import type { ResultadoServico } from "./funcionariosService";

/* LINHAS DO BANCO */

interface CadastroRow {
  id: number;
  funcionario_id: number;
  cpf: string;
  nit: string;
  data_nascimento: string | null;
  observacoes: string;
}

interface PeriodoRow {
  id: number;
  funcionario_id: number;
  data_inicio: string;
  data_fim: string | null;
  setor: string;
  funcao: string;
  cbo: string;
  atividades: string;
  observacoes: string;
}

interface ExposicaoRow {
  id: number;
  funcionario_id: number;
  periodo_inicio: string;
  periodo_fim: string | null;
  setor: string;
  atividade: string;
  tipo_agente: TipoAgente;
  agente: string;
  tipo_avaliacao: TipoAvaliacao;
  resultado: string;
  unidade: string;
  metodologia: string;
  medidas_coletivas: string;
  epi_id: number | null;
  epi_eficaz: EpiEficaz;
  ltcat_revisao_id: number | null;
  pgr_id: number | null;
  fonte_descricao: string;
  responsavel_nome: string;
  responsavel_registro: string;
  observacoes: string;
}

interface RiscoRow {
  id: number;
  setor: string;
  atividade: string;
  perigo: string;
  categoria: string;
}

interface AcidenteRow {
  id: number;
  funcionario_id: number;
  data: string;
  tipo: string;
  gravidade: string;
  cat: string;
}

const CAMPOS_CADASTRO =
  "id, funcionario_id, cpf, nit, data_nascimento, observacoes";

const CAMPOS_PERIODO =
  "id, funcionario_id, data_inicio, data_fim, setor, funcao, cbo, atividades, observacoes";

const CAMPOS_EXPOSICAO =
  "id, funcionario_id, periodo_inicio, periodo_fim, setor, atividade, tipo_agente, agente, tipo_avaliacao, resultado, unidade, metodologia, medidas_coletivas, epi_id, epi_eficaz, ltcat_revisao_id, pgr_id, fonte_descricao, responsavel_nome, responsavel_registro, observacoes";

/* CONVERSORES */

function converterCadastro(linha: CadastroRow): PppCadastro {
  return {
    id: linha.id,
    funcionarioId: linha.funcionario_id,
    cpf: linha.cpf ?? "",
    nit: linha.nit ?? "",
    dataNascimento: linha.data_nascimento ?? "",
    observacoes: linha.observacoes ?? "",
  };
}

function converterPeriodo(linha: PeriodoRow): PeriodoProfissional {
  return {
    id: linha.id,
    funcionarioId: linha.funcionario_id,
    dataInicio: linha.data_inicio,
    dataFim: linha.data_fim ?? "",
    setor: linha.setor ?? "",
    funcao: linha.funcao ?? "",
    cbo: linha.cbo ?? "",
    atividades: linha.atividades ?? "",
    observacoes: linha.observacoes ?? "",
  };
}

function converterExposicao(linha: ExposicaoRow): ExposicaoPpp {
  return {
    id: linha.id,
    funcionarioId: linha.funcionario_id,
    periodoInicio: linha.periodo_inicio,
    periodoFim: linha.periodo_fim ?? "",
    setor: linha.setor ?? "",
    atividade: linha.atividade ?? "",
    tipoAgente: linha.tipo_agente,
    agente: linha.agente ?? "",
    tipoAvaliacao: linha.tipo_avaliacao,
    resultado: linha.resultado ?? "",
    unidade: linha.unidade ?? "",
    metodologia: linha.metodologia ?? "",
    medidasColetivas: linha.medidas_coletivas ?? "",
    epiId: linha.epi_id ?? null,
    epiEficaz: linha.epi_eficaz,
    ltcatRevisaoId: linha.ltcat_revisao_id ?? null,
    pgrId: linha.pgr_id ?? null,
    fonteDescricao: linha.fonte_descricao ?? "",
    responsavelNome: linha.responsavel_nome ?? "",
    responsavelRegistro: linha.responsavel_registro ?? "",
    observacoes: linha.observacoes ?? "",
  };
}

/* PAYLOADS */

function payloadCadastro(entrada: PppCadastroEntrada) {
  return {
    cpf: entrada.cpf,
    nit: entrada.nit,
    data_nascimento: entrada.dataNascimento || null,
    observacoes: entrada.observacoes.trim(),
  };
}

function payloadPeriodo(entrada: PeriodoProfissionalEntrada) {
  return {
    funcionario_id: entrada.funcionarioId,
    data_inicio: entrada.dataInicio,
    data_fim: entrada.dataFim || null,
    setor: entrada.setor.trim(),
    funcao: entrada.funcao.trim(),
    cbo: entrada.cbo.trim(),
    atividades: entrada.atividades.trim(),
    observacoes: entrada.observacoes.trim(),
  };
}

function payloadExposicao(entrada: ExposicaoPppEntrada) {
  return {
    funcionario_id: entrada.funcionarioId,
    periodo_inicio: entrada.periodoInicio,
    periodo_fim: entrada.periodoFim || null,
    setor: entrada.setor.trim(),
    atividade: entrada.atividade.trim(),
    tipo_agente: entrada.tipoAgente,
    agente: entrada.agente.trim(),
    tipo_avaliacao: entrada.tipoAvaliacao,
    resultado: entrada.resultado.trim(),
    unidade: entrada.unidade.trim(),
    metodologia: entrada.metodologia.trim(),
    medidas_coletivas: entrada.medidasColetivas.trim(),
    epi_id: entrada.epiId,
    epi_eficaz: entrada.epiEficaz,
    ltcat_revisao_id: entrada.ltcatRevisaoId,
    pgr_id: entrada.pgrId,
    fonte_descricao: entrada.fonteDescricao.trim(),
    responsavel_nome: entrada.responsavelNome.trim(),
    responsavel_registro: entrada.responsavelRegistro.trim(),
    observacoes: entrada.observacoes.trim(),
  };
}

/* ERROS (sem dados pessoais nos logs) */

function traduzirErro(error: PostgrestError, mensagemPadrao: string) {
  if (error.code === "23505") {
    return "Já existe um cadastro de identificação para este funcionário.";
  }

  if (error.code === "23514") {
    return "Os dados informados não atendem às regras de validação. Revise datas, CPF e NIT (somente números).";
  }

  if (error.code === "23503") {
    return "Algum item vinculado (funcionário, LTCAT, PGR ou EPI) não existe ou não pertence à sua conta.";
  }

  if (error.code === "42501") {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (/failed to fetch|network/i.test(error.message)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return mensagemPadrao;
}

function falhar<T>(
  operacao: string,
  error: PostgrestError,
  mensagemPadrao: string
): ResultadoServico<T> {
  console.error(`PPP (${operacao}):`, error.code, error.message);

  return { data: null, erro: traduzirErro(error, mensagemPadrao) };
}

async function excluirPorId(
  tabela: string,
  id: number,
  mensagemPadrao: string
): Promise<{ erro: string | null }> {
  const { data, error } = await supabase
    .from(tabela)
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error(`PPP (excluir ${tabela}):`, error.code, error.message);

    return { erro: traduzirErro(error, mensagemPadrao) };
  }

  if (!data || data.length === 0) {
    return { erro: "O registro não foi encontrado ou já foi excluído." };
  }

  return { erro: null };
}

/* CADASTROS */

export async function listarCadastros(): Promise<
  ResultadoServico<PppCadastro[]>
> {
  const { data, error } = await supabase
    .from("ppp_cadastros")
    .select(CAMPOS_CADASTRO);

  if (error) {
    return falhar(
      "listar cadastros",
      error,
      "Não foi possível carregar os cadastros de identificação."
    );
  }

  return {
    data: ((data ?? []) as CadastroRow[]).map(converterCadastro),
    erro: null,
  };
}

export async function salvarCadastro(
  entrada: PppCadastroEntrada,
  idExistente: number | null
): Promise<ResultadoServico<PppCadastro>> {
  const mensagem = "Não foi possível salvar a identificação do trabalhador.";

  if (idExistente !== null) {
    const { data, error } = await supabase
      .from("ppp_cadastros")
      .update(payloadCadastro(entrada))
      .eq("id", idExistente)
      .select(CAMPOS_CADASTRO)
      .single();

    if (error || !data) {
      return error
        ? falhar("atualizar cadastro", error, mensagem)
        : { data: null, erro: mensagem };
    }

    return { data: converterCadastro(data as CadastroRow), erro: null };
  }

  const { data, error } = await supabase
    .from("ppp_cadastros")
    .insert({
      funcionario_id: entrada.funcionarioId,
      ...payloadCadastro(entrada),
    })
    .select(CAMPOS_CADASTRO)
    .single();

  if (error || !data) {
    return error
      ? falhar("criar cadastro", error, mensagem)
      : { data: null, erro: mensagem };
  }

  return { data: converterCadastro(data as CadastroRow), erro: null };
}

/* HISTÓRICO PROFISSIONAL */

export async function listarPeriodos(): Promise<
  ResultadoServico<PeriodoProfissional[]>
> {
  const { data, error } = await supabase
    .from("funcionario_historico")
    .select(CAMPOS_PERIODO)
    .order("data_inicio", { ascending: false });

  if (error) {
    return falhar(
      "listar períodos",
      error,
      "Não foi possível carregar o histórico profissional."
    );
  }

  return {
    data: ((data ?? []) as PeriodoRow[]).map(converterPeriodo),
    erro: null,
  };
}

export async function criarPeriodo(
  entrada: PeriodoProfissionalEntrada
): Promise<ResultadoServico<PeriodoProfissional>> {
  const mensagem = "Não foi possível registrar o período profissional.";

  const { data, error } = await supabase
    .from("funcionario_historico")
    .insert(payloadPeriodo(entrada))
    .select(CAMPOS_PERIODO)
    .single();

  if (error || !data) {
    return error
      ? falhar("criar período", error, mensagem)
      : { data: null, erro: mensagem };
  }

  return { data: converterPeriodo(data as PeriodoRow), erro: null };
}

export async function atualizarPeriodo(
  id: number,
  entrada: PeriodoProfissionalEntrada
): Promise<ResultadoServico<PeriodoProfissional>> {
  const mensagem = "Não foi possível atualizar o período profissional.";

  const { data, error } = await supabase
    .from("funcionario_historico")
    .update(payloadPeriodo(entrada))
    .eq("id", id)
    .select(CAMPOS_PERIODO)
    .single();

  if (error || !data) {
    return error
      ? falhar("atualizar período", error, mensagem)
      : { data: null, erro: mensagem };
  }

  return { data: converterPeriodo(data as PeriodoRow), erro: null };
}

export function excluirPeriodo(id: number) {
  return excluirPorId(
    "funcionario_historico",
    id,
    "Não foi possível excluir o período profissional."
  );
}

/* EXPOSIÇÕES */

export async function listarExposicoes(): Promise<
  ResultadoServico<ExposicaoPpp[]>
> {
  const { data, error } = await supabase
    .from("ppp_exposicoes")
    .select(CAMPOS_EXPOSICAO)
    .order("periodo_inicio", { ascending: false });

  if (error) {
    return falhar(
      "listar exposições",
      error,
      "Não foi possível carregar as condições ambientais."
    );
  }

  return {
    data: ((data ?? []) as ExposicaoRow[]).map(converterExposicao),
    erro: null,
  };
}

export async function criarExposicao(
  entrada: ExposicaoPppEntrada
): Promise<ResultadoServico<ExposicaoPpp>> {
  const mensagem = "Não foi possível registrar a condição ambiental.";

  const { data, error } = await supabase
    .from("ppp_exposicoes")
    .insert(payloadExposicao(entrada))
    .select(CAMPOS_EXPOSICAO)
    .single();

  if (error || !data) {
    return error
      ? falhar("criar exposição", error, mensagem)
      : { data: null, erro: mensagem };
  }

  return { data: converterExposicao(data as ExposicaoRow), erro: null };
}

export async function atualizarExposicao(
  id: number,
  entrada: ExposicaoPppEntrada
): Promise<ResultadoServico<ExposicaoPpp>> {
  const mensagem = "Não foi possível atualizar a condição ambiental.";

  const { data, error } = await supabase
    .from("ppp_exposicoes")
    .update(payloadExposicao(entrada))
    .eq("id", id)
    .select(CAMPOS_EXPOSICAO)
    .single();

  if (error || !data) {
    return error
      ? falhar("atualizar exposição", error, mensagem)
      : { data: null, erro: mensagem };
  }

  return { data: converterExposicao(data as ExposicaoRow), erro: null };
}

export function excluirExposicao(id: number) {
  return excluirPorId(
    "ppp_exposicoes",
    id,
    "Não foi possível excluir a condição ambiental."
  );
}

/* APOIO: PGR, EPIs E ACIDENTES (somente leitura) */

export async function listarRiscosPgr(): Promise<
  ResultadoServico<RiscoPgrResumo[]>
> {
  const { data, error } = await supabase
    .from("pgr")
    .select("id, setor, atividade, perigo, categoria")
    .order("setor", { ascending: true });

  if (error) {
    return falhar("listar PGR", error, "Não foi possível carregar o PGR.");
  }

  return {
    data: ((data ?? []) as RiscoRow[]).map((linha) => ({
      id: linha.id,
      setor: linha.setor,
      atividade: linha.atividade,
      perigo: linha.perigo,
      categoria: linha.categoria,
    })),
    erro: null,
  };
}

export async function listarEpisResumo(): Promise<
  ResultadoServico<EpiResumo[]>
> {
  const { data, error } = await supabase
    .from("epis")
    .select("id, nome, ca")
    .order("nome", { ascending: true });

  if (error) {
    return falhar("listar EPIs", error, "Não foi possível carregar os EPIs.");
  }

  return {
    data: ((data ?? []) as EpiResumo[]).map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      ca: linha.ca,
    })),
    erro: null,
  };
}

export async function listarAcidentesVinculados(): Promise<
  ResultadoServico<AcidenteFuncionario[]>
> {
  const { data, error } = await supabase
    .from("acidentes")
    .select("id, funcionario_id, data, tipo, gravidade, cat")
    .not("funcionario_id", "is", null)
    .order("data", { ascending: false });

  if (error) {
    return falhar(
      "listar acidentes",
      error,
      "Não foi possível carregar os acidentes."
    );
  }

  return {
    data: ((data ?? []) as AcidenteRow[]).map((linha) => ({
      id: linha.id,
      funcionarioId: linha.funcionario_id,
      data: linha.data,
      tipo: linha.tipo,
      gravidade: linha.gravidade,
      cat: linha.cat,
    })),
    erro: null,
  };
}