export type SituacaoRevisao =
  | "em_elaboracao"
  | "vigente"
  | "pendente_revisao"
  | "substituido"
  | "arquivado";

export type ProfissaoResponsavel =
  | ""
  | "engenheiro_seguranca"
  | "medico_trabalho"
  | "outro";

export interface DocumentoLtcat {
  id: number;
  titulo: string;
  estabelecimento: string;
  abrangencia: string;
  observacoes: string;
}

export type DocumentoLtcatEntrada = Omit<DocumentoLtcat, "id">;

export interface RevisaoLtcat {
  id: number;
  documentoId: number;
  numero: number;
  situacao: SituacaoRevisao;
  dataElaboracao: string;
  dataRevisao: string;
  periodoInicio: string;
  periodoFim: string;
  responsavelNome: string;
  responsavelProfissao: ProfissaoResponsavel;
  registroProfissional: string;
  vigenciaValidadaEm: string;
  vigenciaValidadaPor: string;
  arquivoPath: string;
  arquivoNome: string;
  arquivoTamanho: number | null;
  observacoes: string;
}

/* Dados editáveis no formulário. Arquivo e validação de vigência
   são gravados por operações próprias. */
export type RevisaoLtcatEntrada = Pick<
  RevisaoLtcat,
  | "documentoId"
  | "numero"
  | "situacao"
  | "dataElaboracao"
  | "dataRevisao"
  | "periodoInicio"
  | "periodoFim"
  | "responsavelNome"
  | "responsavelProfissao"
  | "registroProfissional"
  | "observacoes"
>;

export const ROTULO_SITUACAO_REVISAO: Record<SituacaoRevisao, string> = {
  em_elaboracao: "Em elaboração",
  vigente: "Vigente (validada)",
  pendente_revisao: "Pendente de revisão",
  substituido: "Substituído",
  arquivado: "Arquivado",
};

export const ROTULO_PROFISSAO: Record<ProfissaoResponsavel, string> = {
  "": "Não informada",
  engenheiro_seguranca: "Engenheiro de segurança do trabalho",
  medico_trabalho: "Médico do trabalho",
  outro: "Outro profissional",
};