export type CategoriaAfastamento =
  | "relacionado_trabalho"
  | "nao_relacionado_trabalho"
  | "administrativo";

export type SituacaoAfastamento =
  | "em_andamento"
  | "encerrado"
  | "cancelado";

export interface Afastamento {
  id: number;
  funcionarioId: number;
  acidenteId: number | null;
  categoria: CategoriaAfastamento;
  setor: string;
  atividade: string;
  dataInicio: string;
  previsaoRetorno: string;
  dataRetorno: string;
  situacao: SituacaoAfastamento;
  motivoCancelamento: string;
  referenciaDocumental: string;
  observacoes: string;
}

export type AfastamentoEntrada = Omit<Afastamento, "id">;

export interface AcidenteResumo {
  id: number;
  data: string;
  tipo: string;
  gravidade: string;
  funcionario: string;
  funcionarioId: number | null;
  setor: string;
}

export const ROTULO_CATEGORIA: Record<CategoriaAfastamento, string> = {
  relacionado_trabalho: "Relacionado ao trabalho",
  nao_relacionado_trabalho: "Não relacionado ao trabalho",
  administrativo: "Licença ou outro afastamento administrativo",
};

export const ROTULO_CATEGORIA_CURTO: Record<CategoriaAfastamento, string> = {
  relacionado_trabalho: "Relacionado ao trabalho",
  nao_relacionado_trabalho: "Não relacionado",
  administrativo: "Administrativo",
};

export const ROTULO_SITUACAO: Record<SituacaoAfastamento, string> = {
  em_andamento: "Em andamento",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};