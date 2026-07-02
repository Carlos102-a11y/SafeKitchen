export interface PgrRisco {
    id: number;
  
    setor: string;
  
    atividade: string;
  
    perigo: string;
  
    categoria: string;
  
    fonteGeradora: string;
  
    trabalhadoresExpostos: number;
  
    probabilidade: number;
  
    severidade: number;
  
    nivelRisco: number;
  
    medidaControle: string;
  
    responsavel: string;
  
    prazo: string;
  
    status:
      | "Pendente"
      | "Em andamento"
      | "Concluído";
  }