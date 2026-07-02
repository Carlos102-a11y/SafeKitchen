import { PgrItem } from "../models/Pgr";

const STORAGE = "pgr";

export function listarPGR(): PgrItem[] {
  return JSON.parse(
    localStorage.getItem(STORAGE) || "[]"
  );
}

export function salvarPGR(
  lista: PgrItem[]
) {
  localStorage.setItem(
    STORAGE,
    JSON.stringify(lista)
  );
}