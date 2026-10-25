import jsPDF from "jspdf";

import type { Afastamento } from "../models/Afastamento";
import {
  ROTULO_CATEGORIA_CURTO,
  ROTULO_SITUACAO,
} from "../models/Afastamento";
import type { Funcionario } from "../models/Funcionario";
import type { DocumentoLtcat, RevisaoLtcat } from "../models/Ltcat";
import { ROTULO_SITUACAO_REVISAO } from "../models/Ltcat";
import type {
  AcidenteFuncionario,
  EpiResumo,
  ExposicaoPpp,
  PeriodoProfissional,
  PppCadastro,
  RiscoPgrResumo,
} from "../models/Ppp";
import {
  ROTULO_EPI_EFICAZ,
  ROTULO_TIPO_AGENTE,
  ROTULO_TIPO_AVALIACAO,
} from "../models/Ppp";

import { mascararCpf, mascararNit } from "./cpf";
import { formatarData } from "./datas";
import type { Pendencia } from "./pppPendencias";
import { textoIntervalo } from "./pppPendencias";

export interface DadosRelatorioPpp {
  funcionario: Funcionario;
  cadastro: PppCadastro | null;
  periodos: PeriodoProfissional[];
  exposicoes: ExposicaoPpp[];
  pendencias: Pendencia[];
  revisoesPorId: Map<number, RevisaoLtcat>;
  documentosPorId: Map<number, DocumentoLtcat>;
  riscosPorId: Map<number, RiscoPgrResumo>;
  episPorId: Map<number, EpiResumo>;
  afastamentos: Afastamento[];
  acidentes: AcidenteFuncionario[];
}

type RGB = [number, number, number];

const AZUL: RGB = [37, 99, 235];
const AZUL_ESCURO: RGB = [15, 23, 42];
const CINZA: RGB = [100, 116, 139];
const CINZA_CLARO: RGB = [241, 245, 249];
const BORDA: RGB = [226, 232, 240];
const VERMELHO: RGB = [185, 28, 28];
const AMARELO: RGB = [146, 64, 14];

const MARGEM = 15;
const LARGURA = 180;
const LIMITE_Y = 272;
const INICIO_Y = 24;

/* Mantém apenas caracteres suportados pela fonte padrão do PDF. */
function limpar(texto: string) {
  return texto
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\t/g, " ")
    .replace(/[^\n\x20-\x7E\u00A1-\u00FF]/g, "?");
}

function garantir(doc: jsPDF, y: number, altura: number) {
  if (y + altura > LIMITE_Y) {
    doc.addPage();

    return INICIO_Y;
  }

  return y;
}

function secao(doc: jsPDF, y: number, titulo: string) {
  const posicao = garantir(doc, y, 18);

  doc.setFillColor(...CINZA_CLARO);
  doc.roundedRect(MARGEM, posicao, LARGURA, 9, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...AZUL_ESCURO);
  doc.text(limpar(titulo), MARGEM + 4, posicao + 6);

  return posicao + 14;
}

function paragrafo(
  doc: jsPDF,
  y: number,
  texto: string,
  cor: RGB = CINZA,
  negrito = false
) {
  doc.setFont("helvetica", negrito ? "bold" : "normal");
  doc.setFontSize(9);
  doc.setTextColor(...cor);

  const linhas = doc.splitTextToSize(limpar(texto), LARGURA - 4);

  const posicao = garantir(doc, y, linhas.length * 4.4 + 2);

  doc.text(linhas, MARGEM + 2, posicao);

  return posicao + linhas.length * 4.4 + 2;
}

function campo(doc: jsPDF, y: number, rotulo: string, valor: string) {
  const linhas = doc.splitTextToSize(limpar(valor || "Não informado"), 122);

  const posicao = garantir(doc, y, linhas.length * 4.3 + 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...CINZA);
  doc.text(limpar(rotulo), MARGEM + 2, posicao);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...AZUL_ESCURO);
  doc.text(linhas, MARGEM + 54, posicao);

  return posicao + linhas.length * 4.3 + 1.5;
}

function tabela(
  doc: jsPDF,
  yInicial: number,
  cabecalhos: string[],
  linhas: string[][],
  larguras: number[]
) {
  let y = yInicial;

  const alturaCabecalho = 8;

  function desenharCabecalho() {
    y = garantir(doc, y, alturaCabecalho + 12);

    let x = MARGEM;

    cabecalhos.forEach((cabecalho, index) => {
      doc.setFillColor(...AZUL_ESCURO);
      doc.rect(x, y, larguras[index], alturaCabecalho, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(limpar(cabecalho), x + 2, y + 5.4);

      x += larguras[index];
    });

    y += alturaCabecalho;
  }

  desenharCabecalho();

  linhas.forEach((linha, indice) => {
    const textos = linha.map((valor, index) =>
      doc.splitTextToSize(limpar(valor), larguras[index] - 4)
    );

    const altura = Math.max(
      8,
      Math.max(...textos.map((texto) => texto.length)) * 3.8 + 4
    );

    if (y + altura > LIMITE_Y) {
      doc.addPage();
      y = INICIO_Y;
      desenharCabecalho();
    }

    let x = MARGEM;

    textos.forEach((texto, index) => {
      doc.setFillColor(indice % 2 === 0 ? 248 : 255, indice % 2 === 0 ? 250 : 255, indice % 2 === 0 ? 252 : 255);
      doc.setDrawColor(...BORDA);
      doc.rect(x, y, larguras[index], altura, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(51, 65, 85);
      doc.text(texto, x + 2, y + 4.6);

      x += larguras[index];
    });

    y += altura;
  });

  return y + 4;
}

function textoFonte(
  exposicao: ExposicaoPpp,
  dados: DadosRelatorioPpp
) {
  const partes: string[] = [];

  if (exposicao.ltcatRevisaoId !== null) {
    const revisao = dados.revisoesPorId.get(exposicao.ltcatRevisaoId);

    const documento = revisao
      ? dados.documentosPorId.get(revisao.documentoId)
      : undefined;

    partes.push(
      revisao
        ? `LTCAT "${documento?.titulo ?? "documento"}", revisão ${revisao.numero} (${ROTULO_SITUACAO_REVISAO[revisao.situacao]}${revisao.arquivoPath ? ", arquivo anexado" : ", sem arquivo anexado"})`
        : "LTCAT referenciado não encontrado"
    );
  }

  if (exposicao.pgrId !== null) {
    const risco = dados.riscosPorId.get(exposicao.pgrId);

    partes.push(
      risco
        ? `PGR: ${risco.setor} - ${risco.perigo} (referência interna; não comprova exposição previdenciária)`
        : "PGR referenciado não encontrado"
    );
  }

  if (exposicao.fonteDescricao.trim()) {
    partes.push(`Outra fonte: ${exposicao.fonteDescricao.trim()}`);
  }

  return partes.length > 0 ? partes.join("; ") : "";
}

export function gerarRelatorioPpp(dados: DadosRelatorioPpp) {
  const { funcionario, cadastro, periodos, exposicoes, pendencias } = dados;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const emitidoEm = `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  /* TÍTULO E AVISO */

  let y = INICIO_Y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...AZUL_ESCURO);
  doc.text("Relatório de apoio à conferência do PPP", MARGEM, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text(limpar(`Gerado pelo SafeKitchen em ${emitidoEm}`), MARGEM, y + 6);

  y += 13;

  const aviso =
    "DOCUMENTO DE APOIO INTERNO. Este relatório NÃO é o Perfil Profissiográfico Previdenciário e não substitui o PPP oficial (emitido em meio eletrônico, via eSocial), nem laudos técnicos assinados por profissional habilitado. Reúne apenas os dados cadastrados no SafeKitchen, sem conclusões. Informações pendentes ou divergentes exigem conferência técnica. O SafeKitchen não transmite eventos ao eSocial.";

  const linhasAviso = doc.splitTextToSize(limpar(aviso), LARGURA - 8);

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(MARGEM, y, LARGURA, linhasAviso.length * 4.3 + 8, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...AMARELO);
  doc.text(linhasAviso, MARGEM + 4, y + 6);

  y += linhasAviso.length * 4.3 + 14;

  /* 1. TRABALHADOR */

  y = secao(doc, y, "1. Identificação do trabalhador");

  y = campo(doc, y, "Nome", funcionario.nome);
  y = campo(doc, y, "Matrícula", funcionario.matricula);
  y = campo(doc, y, "CPF (parcialmente oculto)", cadastro ? mascararCpf(cadastro.cpf) : "");
  y = campo(doc, y, "NIT/PIS (parcialmente oculto)", cadastro ? mascararNit(cadastro.nit) : "");
  y = campo(doc, y, "Data de nascimento", cadastro?.dataNascimento ? formatarData(cadastro.dataNascimento) : "");
  y = campo(doc, y, "Admissão", funcionario.dataAdmissao ? formatarData(funcionario.dataAdmissao) : "");
  y = campo(
    doc,
    y,
    "Situação no cadastro",
    funcionario.situacao === "ativo"
      ? "Ativo"
      : `Desligado${funcionario.dataDesligamento ? ` em ${formatarData(funcionario.dataDesligamento)}` : ""}`
  );
  y = campo(doc, y, "Setor e função atuais", [funcionario.setor, funcionario.funcao].filter(Boolean).join(" - "));

  y += 4;

  /* 2. HISTÓRICO */

  y = secao(doc, y, "2. Histórico profissional registrado");

  if (periodos.length === 0) {
    y = paragrafo(doc, y, "Nenhum período profissional registrado.");
  } else {
    const ordenados = [...periodos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));

    y = tabela(
      doc,
      y,
      ["Período", "Setor", "Função", "CBO", "Atividades exercidas"],
      ordenados.map((periodo) => [
        textoIntervalo(periodo.dataInicio, periodo.dataFim),
        periodo.setor || "Não informado",
        periodo.funcao || "Não informado",
        periodo.cbo || "Não informado",
        periodo.atividades || "Não informado",
      ]),
      [32, 30, 30, 20, 68]
    );
  }

  /* 3. CONDIÇÕES AMBIENTAIS */

  y = secao(doc, y + 2, "3. Condições ambientais registradas (com fonte e responsável)");

  if (exposicoes.length === 0) {
    y = paragrafo(doc, y, "Nenhuma condição ambiental registrada.");
  } else {
    const ordenadas = [...exposicoes].sort((a, b) => a.periodoInicio.localeCompare(b.periodoInicio));

    ordenadas.forEach((exposicao, indice) => {
      y = garantir(doc, y, 40);

      y = paragrafo(
        doc,
        y,
        `Registro ${indice + 1}: ${textoIntervalo(exposicao.periodoInicio, exposicao.periodoFim)}`,
        AZUL_ESCURO,
        true
      );

      const epi = exposicao.epiId !== null ? dados.episPorId.get(exposicao.epiId) : undefined;

      y = campo(doc, y, "Setor e atividade", [exposicao.setor, exposicao.atividade].filter(Boolean).join(" - "));
      y = campo(doc, y, "Tipo de agente", ROTULO_TIPO_AGENTE[exposicao.tipoAgente]);
      y = campo(doc, y, "Agente", exposicao.tipoAgente === "ausencia" ? "Não se aplica" : exposicao.agente);
      y = campo(doc, y, "Avaliação", ROTULO_TIPO_AVALIACAO[exposicao.tipoAvaliacao]);
      y = campo(
        doc,
        y,
        "Resultado informado",
        [exposicao.resultado, exposicao.unidade].filter(Boolean).join(" ")
      );
      y = campo(doc, y, "Metodologia", exposicao.metodologia);
      y = campo(doc, y, "Proteção coletiva", exposicao.medidasColetivas);
      y = campo(doc, y, "EPI relacionado", epi ? `${epi.nome} (CA ${epi.ca})` : "");
      y = campo(doc, y, "Eficácia do EPI informada", ROTULO_EPI_EFICAZ[exposicao.epiEficaz]);
      y = campo(doc, y, "Fonte documental", textoFonte(exposicao, dados));
      y = campo(
        doc,
        y,
        "Responsável técnico",
        [exposicao.responsavelNome, exposicao.responsavelRegistro].filter(Boolean).join(" - registro ")
      );

      if (exposicao.observacoes.trim()) {
        y = campo(doc, y, "Observações", exposicao.observacoes);
      }

      y += 3;
    });
  }

  /* 4. AFASTAMENTOS E ACIDENTES */

  y = secao(doc, y + 2, "4. Afastamentos e acidentes registrados no SafeKitchen");

  y = paragrafo(
    doc,
    y,
    "Constam apenas registros vinculados ao cadastro do funcionário. Acidentes registrados somente com o nome em texto não são considerados. A situação da CAT é a informada no módulo Acidentes."
  );

  if (dados.afastamentos.length === 0) {
    y = paragrafo(doc, y, "Nenhum afastamento registrado para este funcionário.", AZUL_ESCURO);
  } else {
    y = tabela(
      doc,
      y,
      ["Início", "Previsão", "Retorno efetivo", "Categoria", "Situação"],
      dados.afastamentos.map((afastamento) => [
        formatarData(afastamento.dataInicio),
        formatarData(afastamento.previsaoRetorno, "Não informada"),
        afastamento.situacao === "encerrado" ? formatarData(afastamento.dataRetorno) : "Não registrado",
        ROTULO_CATEGORIA_CURTO[afastamento.categoria],
        ROTULO_SITUACAO[afastamento.situacao],
      ]),
      [28, 30, 34, 52, 36]
    );
  }

  if (dados.acidentes.length === 0) {
    y = paragrafo(doc, y, "Nenhum acidente ou incidente vinculado a este funcionário.", AZUL_ESCURO);
  } else {
    y = tabela(
      doc,
      y,
      ["Data", "Tipo", "Gravidade", "Situação da CAT"],
      dados.acidentes.map((acidente) => [
        formatarData(acidente.data),
        acidente.tipo,
        acidente.gravidade,
        acidente.cat,
      ]),
      [32, 52, 46, 50]
    );
  }

  /* 5. PENDÊNCIAS */

  y = secao(doc, y + 2, "5. Pendências e pontos de conferência técnica");

  if (pendencias.length === 0) {
    y = paragrafo(
      doc,
      y,
      "Nenhuma pendência apontada pelas regras do sistema. Isso não dispensa a conferência técnica do conteúdo."
    );
  } else {
    pendencias.forEach((pendencia) => {
      y = paragrafo(
        doc,
        y,
        `${pendencia.tipo === "pendencia" ? "[PENDENTE]" : "[CONFERIR]"} ${pendencia.texto}`,
        pendencia.tipo === "pendencia" ? VERMELHO : AMARELO
      );
    });
  }

  /* 6. DOCUMENTOS-FONTE */

  y = secao(doc, y + 2, "6. Documentos-fonte referenciados");

  const idsRevisoes = Array.from(
    new Set(
      exposicoes
        .map((exposicao) => exposicao.ltcatRevisaoId)
        .filter((id): id is number => id !== null)
    )
  );

  if (idsRevisoes.length === 0) {
    y = paragrafo(doc, y, "Nenhuma revisão de LTCAT referenciada.");
  } else {
    y = tabela(
      doc,
      y,
      ["Documento", "Revisão", "Situação", "Responsável e registro", "Arquivo"],
      idsRevisoes.map((id) => {
        const revisao = dados.revisoesPorId.get(id);
        const documento = revisao ? dados.documentosPorId.get(revisao.documentoId) : undefined;

        return [
          documento?.titulo ?? "Não encontrado",
          revisao ? String(revisao.numero) : "-",
          revisao ? ROTULO_SITUACAO_REVISAO[revisao.situacao] : "-",
          revisao ? [revisao.responsavelNome, revisao.registroProfissional].filter(Boolean).join(" - ") || "Não informado" : "-",
          revisao?.arquivoPath ? "Anexado" : "Sem arquivo",
        ];
      }),
      [50, 18, 36, 52, 24]
    );
  }

  /* CABEÇALHO E RODAPÉ EM TODAS AS PÁGINAS */

  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...AZUL);
    doc.text("SAFEKITCHEN - APOIO A CONFERÊNCIA DO PPP", MARGEM, 10);

    doc.setDrawColor(...BORDA);
    doc.line(MARGEM, 280, MARGEM + LARGURA, 280);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...CINZA);
    doc.text("Documento de apoio. Não substitui o PPP oficial nem laudos técnicos.", MARGEM, 285);
    doc.text(`Página ${pagina} de ${totalPaginas}`, MARGEM + LARGURA, 285, { align: "right" });
  }

  const nomeArquivo = funcionario.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  doc.save(`SafeKitchen-Apoio-PPP-${nomeArquivo || "funcionario"}.pdf`);
}