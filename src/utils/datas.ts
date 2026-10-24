export function paraISO(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
  
    return `${ano}-${mes}-${dia}`;
  }
  
  export function hojeISO() {
    return paraISO(new Date());
  }
  
  export function somarDias(iso: string, dias: number) {
    const [ano, mes, dia] = iso.split("-").map(Number);
  
    return paraISO(new Date(ano, mes - 1, dia + dias));
  }
  
  export function diasEntre(inicio: string, fim: string) {
    const [anoI, mesI, diaI] = inicio.split("-").map(Number);
    const [anoF, mesF, diaF] = fim.split("-").map(Number);
  
    const tempoInicio = Date.UTC(anoI, mesI - 1, diaI);
    const tempoFim = Date.UTC(anoF, mesF - 1, diaF);
  
    return Math.round((tempoFim - tempoInicio) / 86400000);
  }
  
  export function formatarData(data: string, vazio = "Não informada") {
    if (!data) {
      return vazio;
    }
  
    const [ano, mes, dia] = data.split("-");
  
    if (!ano || !mes || !dia) {
      return data;
    }
  
    return `${dia}/${mes}/${ano}`;
  }