export function calcularRisco(
    probabilidade: number,
    severidade: number
  ) {
    const nivel =
      probabilidade * severidade;
  
    let classificacao = "Baixo";
  
    if (nivel <= 4)
      classificacao = "Baixo";
  
    else if (nivel <= 9)
      classificacao = "Médio";
  
    else if (nivel <= 16)
      classificacao = "Alto";
  
    else classificacao = "Crítico";
  
    return {
      nivel,
      classificacao,
    };
  }