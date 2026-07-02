export interface PgrItem {
    id: number;
  
    setor: string;
  
    atividade: string;
  
    perigo: string;
  
    categoria:
      | "Físico"
      | "Químico"
      | "Biológico"
      | "Ergonômico"
      | "Acidente";
  
    probabilidade: 1 | 2 | 3 | 4 | 5;
  
    severidade: 1 | 2 | 3 | 4 | 5;
  
    nivel: number;
  
    classificacao:
      | "Baixo"
      | "Médio"
      | "Alto"
      | "Crítico";
  
    medidaControle: string;
  
    responsavel: string;
  
    prazo: string;
  
    status:
      | "Pendente"
      | "Em andamento"
      | "Concluído";
  }