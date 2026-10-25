import type { Funcionario } from "../models/Funcionario";
import type { RevisaoLtcat } from "../models/Ltcat";
import { ROTULO_SITUACAO_REVISAO } from "../models/Ltcat";
import type {
  ExposicaoPpp,
  PeriodoProfissional,
  PppCadastro,
} from "../models/Ppp";

import { formatarData, somarDias } from "./datas";

export interface Pendencia {
  tipo: "pendencia" | "conferencia";
  texto: string;
}

export interface ContextoPendencias {
  funcionario: Funcionario;
  cadastro: PppCadastro | null;
  periodos: PeriodoProfissional[];
  exposicoes: ExposicaoPpp[];
  revisoesPorId: Map<number, RevisaoLtcat>;
}

const FIM_ABERTO = "9999-12-31";

export function textoIntervalo(inicio: string, fim: string) {
  return `${formatarData(inicio)} a ${fim ? formatarData(fim) : "atual"}`;
}

export function sobrepoe(
  inicioA: string,
  fimA: string,
  inicioB: string,
  fimB: string
) {
  return inicioA <= (fimB || FIM_ABERTO) && inicioB <= (fimA || FIM_ABERTO);
}

export function calcularPendencias(ctx: ContextoPendencias): Pendencia[] {
  const lista: Pendencia[] = [];

  const { funcionario, cadastro, periodos, exposicoes, revisoesPorId } = ctx;

  /* IDENTIFICAÇÃO */

  const faltantes: string[] = [];

  if (!cadastro || !cadastro.cpf) {
    faltantes.push("CPF");
  }

  if (!cadastro || !cadastro.nit) {
    faltantes.push("NIT/PIS");
  }

  if (!cadastro || !cadastro.dataNascimento) {
    faltantes.push("data de nascimento");
  }

  if (faltantes.length > 0) {
    lista.push({
      tipo: "pendencia",
      texto: `Identificação do trabalhador incompleta: ${faltantes.join(", ")}.`,
    });
  }

  if (!funcionario.dataAdmissao) {
    lista.push({
      tipo: "pendencia",
      texto: "Data de admissão não informada no cadastro de funcionários.",
    });
  }

  /* HISTÓRICO PROFISSIONAL */

  if (periodos.length === 0) {
    lista.push({
      tipo: "pendencia",
      texto: "Nenhum período profissional registrado.",
    });
  } else {
    const ordenados = [...periodos].sort((a, b) =>
      a.dataInicio.localeCompare(b.dataInicio)
    );

    ordenados.forEach((periodo) => {
      const rotulo = `Período ${textoIntervalo(periodo.dataInicio, periodo.dataFim)}`;

      if (!periodo.setor || !periodo.funcao) {
        lista.push({
          tipo: "pendencia",
          texto: `${rotulo}: setor ou função não informados.`,
        });
      }

      if (!periodo.atividades.trim()) {
        lista.push({
          tipo: "pendencia",
          texto: `${rotulo}: atividades exercidas não descritas.`,
        });
      }
    });

    for (let i = 0; i < ordenados.length - 1; i++) {
      const atual = ordenados[i];
      const proximo = ordenados[i + 1];

      if (proximo.dataInicio <= (atual.dataFim || FIM_ABERTO)) {
        lista.push({
          tipo: "conferencia",
          texto: `Períodos profissionais sobrepostos: ${textoIntervalo(atual.dataInicio, atual.dataFim)} e ${textoIntervalo(proximo.dataInicio, proximo.dataFim)}.`,
        });
      } else if (
        atual.dataFim &&
        proximo.dataInicio > somarDias(atual.dataFim, 1)
      ) {
        lista.push({
          tipo: "conferencia",
          texto: `Intervalo sem período registrado entre ${formatarData(atual.dataFim)} e ${formatarData(proximo.dataInicio)}.`,
        });
      }
    }

    if (
      funcionario.dataAdmissao &&
      ordenados[0].dataInicio > funcionario.dataAdmissao
    ) {
      lista.push({
        tipo: "conferencia",
        texto: `O primeiro período registrado começa em ${formatarData(ordenados[0].dataInicio)}, depois da admissão (${formatarData(funcionario.dataAdmissao)}).`,
      });
    }
  }

  /* CONDIÇÕES AMBIENTAIS */

  if (exposicoes.length === 0) {
    lista.push({
      tipo: "pendencia",
      texto:
        "Nenhum registro de condições ambientais (exposição a agente nocivo ou declaração de ausência).",
    });
  } else {
    periodos.forEach((periodo) => {
      const coberto = exposicoes.some((exposicao) =>
        sobrepoe(
          exposicao.periodoInicio,
          exposicao.periodoFim,
          periodo.dataInicio,
          periodo.dataFim
        )
      );

      if (!coberto) {
        lista.push({
          tipo: "pendencia",
          texto: `Período profissional ${textoIntervalo(periodo.dataInicio, periodo.dataFim)} sem registro de condições ambientais.`,
        });
      }
    });
  }

  exposicoes.forEach((exposicao) => {
    const rotulo = `Condição ambiental ${textoIntervalo(exposicao.periodoInicio, exposicao.periodoFim)}${exposicao.agente ? ` (${exposicao.agente})` : ""}`;

    const temFonte =
      exposicao.ltcatRevisaoId !== null ||
      exposicao.pgrId !== null ||
      exposicao.fonteDescricao.trim() !== "";

    if (!temFonte) {
      lista.push({
        tipo: "pendencia",
        texto: `${rotulo}: sem fonte documental vinculada.`,
      });
    }

    if (
      !exposicao.responsavelNome.trim() ||
      !exposicao.responsavelRegistro.trim()
    ) {
      lista.push({
        tipo: "pendencia",
        texto: `${rotulo}: responsável técnico ou registro profissional não informados.`,
      });
    }

    if (
      exposicao.tipoAvaliacao === "quantitativa" &&
      (!exposicao.resultado.trim() ||
        !exposicao.unidade.trim() ||
        !exposicao.metodologia.trim())
    ) {
      lista.push({
        tipo: "pendencia",
        texto: `${rotulo}: avaliação quantitativa sem resultado, unidade ou metodologia.`,
      });
    }

    if (
      exposicao.tipoAvaliacao === "nao_informada" &&
      exposicao.tipoAgente !== "ausencia"
    ) {
      lista.push({
        tipo: "conferencia",
        texto: `${rotulo}: tipo de avaliação não informado.`,
      });
    }

    if (exposicao.ltcatRevisaoId !== null) {
      const revisao = revisoesPorId.get(exposicao.ltcatRevisaoId);

      if (!revisao) {
        lista.push({
          tipo: "pendencia",
          texto: `${rotulo}: a revisão de LTCAT referenciada não foi encontrada.`,
        });
      } else {
        if (revisao.situacao !== "vigente") {
          lista.push({
            tipo: "conferencia",
            texto: `${rotulo}: a revisão ${revisao.numero} do LTCAT está "${ROTULO_SITUACAO_REVISAO[revisao.situacao]}" e não tem vigência validada no sistema.`,
          });
        }

        const forado =
          (revisao.periodoInicio !== "" &&
            exposicao.periodoInicio < revisao.periodoInicio) ||
          (revisao.periodoFim !== "" &&
            (exposicao.periodoFim === "" ||
              exposicao.periodoFim > revisao.periodoFim));

        if (forado) {
          lista.push({
            tipo: "conferencia",
            texto: `${rotulo}: o período não está contido no período avaliado do LTCAT (${textoIntervalo(revisao.periodoInicio, revisao.periodoFim)}).`,
          });
        }
      }
    }

    if (
      exposicao.ltcatRevisaoId === null &&
      exposicao.pgrId !== null &&
      exposicao.fonteDescricao.trim() === ""
    ) {
      lista.push({
        tipo: "conferencia",
        texto: `${rotulo}: a fonte é apenas o PGR. O PGR não comprova, por si só, exposição previdenciária; confirme em laudo técnico.`,
      });
    }
  });

  return lista;
}