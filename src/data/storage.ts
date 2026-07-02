export function getRiscos() {
    return JSON.parse(localStorage.getItem("riscos") || "[]");
  }
  
  export function getEpis() {
    return JSON.parse(localStorage.getItem("epis") || "[]");
  }
  
  export function getChecklists() {
    return JSON.parse(localStorage.getItem("checklists") || "[]");
  }
  
  export function getDDS() {
    return JSON.parse(localStorage.getItem("dds") || "[]");
  }
  
  export function getAuditorias() {
    return JSON.parse(localStorage.getItem("auditorias") || "[]");
  }
  
  export function getAcidentes() {
    return JSON.parse(localStorage.getItem("acidentes") || "[]");
  }
  
  export function getPGR() {
    return JSON.parse(localStorage.getItem("pgr") || "[]");
  }
  import { PgrRisco } from "../types/Pgr";

export function getPGR(): PgrRisco[] {
  return JSON.parse(localStorage.getItem("pgr") || "[]");
}

export function savePGR(dados: PgrRisco[]) {
  localStorage.setItem("pgr", JSON.stringify(dados));
}