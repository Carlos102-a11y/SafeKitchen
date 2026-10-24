export type SituacaoFuncionario = "ativo" | "desligado";

export interface Funcionario {
  id: number;
  nome: string;
  matricula: string;
  setor: string;
  funcao: string;
  dataAdmissao: string;
  dataDesligamento: string;
  situacao: SituacaoFuncionario;
  observacoes: string;
}

export type FuncionarioEntrada = Omit<Funcionario, "id">;