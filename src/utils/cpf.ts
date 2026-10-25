export function somenteDigitos(texto: string) {
    return texto.replace(/\D/g, "");
  }
  
  export function cpfValido(cpf: string) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
  
    function calcular(base: string, pesoInicial: number) {
      let soma = 0;
  
      for (let i = 0; i < base.length; i++) {
        soma += Number(base[i]) * (pesoInicial - i);
      }
  
      const resto = (soma * 10) % 11;
  
      return resto === 10 ? 0 : resto;
    }
  
    return (
      calcular(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
      calcular(cpf.slice(0, 10), 11) === Number(cpf[10])
    );
  }
  
  export function mascararCpf(cpf: string) {
    if (cpf.length !== 11) {
      return "Não informado";
    }
  
    return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
  }
  
  export function mascararNit(nit: string) {
    if (nit.length !== 11) {
      return "Não informado";
    }
  
    return `*******${nit.slice(7)}`;
  }