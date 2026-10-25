export type TipoAgente =
  | "fisico"
  | "quimico"
  | "biologico"
  | "ergonomico"
  | "acidente"
  | "ausencia";

export type TipoAvaliacao = "nao_informada" | "qualitativa" | "quantitativa";

export type EpiEficaz = "nao_informado" | "sim" | "nao";

export interface PppCadastro {
  id: number;
  funcionarioId: number;
  cpf: string;
  nit: string;
  dataNascimento: string;
  observacoes: string;
}

export type PppCadastroEntrada = Omit<PppCadastro, "id">;

export interface PeriodoProfissional {
  id: number;
  funcionarioId: number;
  dataInicio: string;
  dataFim: string;
  setor: string;
  funcao: string;
  cbo: string;
  atividades: string;
  observacoes: string;
}

export type PeriodoProfissionalEntrada = Omit<PeriodoProfissional, "id">;

export interface ExposicaoPpp {
  id: number;
  funcionarioId: number;
  periodoInicio: string;
  periodoFim: string;
  setor: string;
  atividade: string;
  tipoAgente: TipoAgente;
  agente: string;
  tipoAvaliacao: TipoAvaliacao;
  resultado: string;
  unidade: string;
  metodologia: string;
  medidasColetivas: string;
  epiId: number | null;
  epiEficaz: EpiEficaz;
  ltcatRevisaoId: number | null;
  pgrId: number | null;
  fonteDescricao: string;
  responsavelNome: string;
  responsavelRegistro: string;
  observacoes: string;
}

export type ExposicaoPppEntrada = Omit<ExposicaoPpp, "id">;

export interface RiscoPgrResumo {
  id: number;
  setor: string;
  atividade: string;
  perigo: string;
  categoria: string;
}

export interface EpiResumo {
  id: number;
  nome: string;
  ca: string;
}

export interface AcidenteFuncionario {
  id: number;
  funcionarioId: number;
  data: string;
  tipo: string;
  gravidade: string;
  cat: string;
}

export const ROTULO_TIPO_AGENTE: Record<TipoAgente, string> = {
  fisico: "Físico",
  quimico: "Químico",
  biologico: "Biológico",
  ergonomico: "Ergonômico",
  acidente: "Acidente",
  ausencia: "Ausência de agente nocivo identificada",
};

export const ROTULO_TIPO_AVALIACAO: Record<TipoAvaliacao, string> = {
  nao_informada: "Não informada",
  qualitativa: "Qualitativa",
  quantitativa: "Quantitativa",
};

export const ROTULO_EPI_EFICAZ: Record<EpiEficaz, string> = {
  nao_informado: "Não informado",
  sim: "Sim, conforme o responsável técnico",
  nao: "Não",
};