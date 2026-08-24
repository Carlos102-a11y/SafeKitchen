import jsPDF from "jspdf";

import { supabase } from "../lib/supabase";

import type { PgrItem } from "../models/Pgr";

interface EpiItem {
  id?: number;
  nome?: string;
  ca?: string;
  quantidade?: number;
  validade?: string;
}

interface ChecklistItem {
  id?: number;
  data?: string;
  setor?: string;
  responsavel?: string;
  observacoes?: string;

  epis?: boolean;
  piso?: boolean;
  extintor?: boolean;
  exaustao?: boolean;
  iluminacao?: boolean;
  facas?: boolean;
  quimicos?: boolean;
  emergencia?: boolean;
}

interface DDSItem {
  id?: number;
  data?: string;
  tema?: string;
  responsavel?: string;
  setor?: string;
  participantes?: number;
  duracao?: number;
  observacoes?: string;
}

interface AuditoriaItem {
  id?: number;
  data?: string;
  auditor?: string;
  setor?: string;
  tipo?: string;
  conformidade?: number;
  naoConformidades?: number;
  observacoes?: string;
  acaoCorretiva?: string;
  prazo?: string;
  status?: string;
}

interface AcidenteItem {
  id?: number;
  data?: string;
  hora?: string;
  funcionario?: string;
  setor?: string;

  tipo?:
    | "Acidente"
    | "Incidente"
    | "Quase acidente";

  gravidade?:
    | "Leve"
    | "Moderada"
    | "Grave"
    | "Crítica";

  afastamento?: boolean;
  diasAfastado?: number;
  cat?: string;
  causa?: string;
  acaoCorretiva?: string;
  riscoPgrId?: number | null;
}

type RGB = [
  number,
  number,
  number,
];

const AZUL: RGB = [
  37,
  99,
  235,
];

const AZUL_ESCURO: RGB = [
  15,
  23,
  42,
];

const CINZA: RGB = [
  100,
  116,
  139,
];

const CINZA_CLARO: RGB = [
  241,
  245,
  249,
];

const BORDA: RGB = [
  226,
  232,
  240,
];

const VERDE: RGB = [
  22,
  163,
  74,
];

const AMARELO: RGB = [
  217,
  119,
  6,
];

const LARANJA: RGB = [
  249,
  115,
  22,
];

const VERMELHO: RGB = [
  220,
  38,
  38,
];

const ROXO: RGB = [
  124,
  58,
  237,
];

interface PgrRow {
  id: number;
  setor: string;
  atividade: string;
  perigo: string;
  categoria: PgrItem["categoria"];
  probabilidade: PgrItem["probabilidade"];
  severidade: PgrItem["severidade"];
  nivel: number;
  classificacao: PgrItem["classificacao"];
  medida_controle: string;
  responsavel: string;
  prazo: string | null;
  status: PgrItem["status"];
}

interface AuditoriaRow {
  id: number;
  data: string;
  auditor: string;
  setor: string;
  tipo: string;
  conformidade: number;
  nao_conformidades: number;
  observacoes: string;
  acao_corretiva: string;
  prazo: string | null;
  status: string;
}

interface AcidenteRow {
  id: number;
  data: string;
  hora: string;
  funcionario: string;
  setor: string;

  tipo:
    | "Acidente"
    | "Incidente"
    | "Quase acidente";

  gravidade:
    | "Leve"
    | "Moderada"
    | "Grave"
    | "Crítica";

  afastamento: boolean;
  dias_afastado: number;

  cat: string;
  causa: string;

  acao_corretiva: string;

  risco_pgr_id:
    | number
    | null;
}

function converterPgr(
  item: PgrRow
): PgrItem {
  return {
    id: item.id,

    setor: item.setor,

    atividade:
      item.atividade,

    perigo:
      item.perigo,

    categoria:
      item.categoria,

    probabilidade:
      item.probabilidade,

    severidade:
      item.severidade,

    nivel:
      item.nivel,

    classificacao:
      item.classificacao,

    medidaControle:
      item.medida_controle,

    responsavel:
      item.responsavel,

    prazo:
      item.prazo ?? "",

    status:
      item.status,
  };
}

function converterAuditoria(
  item: AuditoriaRow
): AuditoriaItem {
  return {
    id:
      item.id,

    data:
      item.data,

    auditor:
      item.auditor,

    setor:
      item.setor,

    tipo:
      item.tipo,

    conformidade:
      item.conformidade,

    naoConformidades:
      item.nao_conformidades,

    observacoes:
      item.observacoes,

    acaoCorretiva:
      item.acao_corretiva,

    prazo:
      item.prazo ?? "",

    status:
      item.status,
  };
}

function converterAcidente(
  item: AcidenteRow
): AcidenteItem {
  return {
    id:
      item.id,

    data:
      item.data,

    hora:
      item.hora,

    funcionario:
      item.funcionario,

    setor:
      item.setor,

    tipo:
      item.tipo,

    gravidade:
      item.gravidade,

    afastamento:
      item.afastamento,

    diasAfastado:
      item.dias_afastado,

    cat:
      item.cat,

    causa:
      item.causa,

    acaoCorretiva:
      item.acao_corretiva,

    riscoPgrId:
      item.risco_pgr_id,
  };
}

async function carregarDadosRelatorio() {
  const [
    respostaPgr,
    respostaEpis,
    respostaChecklists,
    respostaDDS,
    respostaAuditorias,
    respostaAcidentes,
  ] = await Promise.all([
    supabase
      .from("pgr")
      .select(
        `
          id,
          setor,
          atividade,
          perigo,
          categoria,
          probabilidade,
          severidade,
          nivel,
          classificacao,
          medida_controle,
          responsavel,
          prazo,
          status
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),

    supabase
      .from("epis")
      .select(
        `
          id,
          nome,
          ca,
          quantidade,
          validade
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),

    supabase
      .from("checklists")
      .select(
        `
          id,
          data,
          setor,
          responsavel,
          observacoes,
          epis,
          piso,
          extintor,
          exaustao,
          iluminacao,
          facas,
          quimicos,
          emergencia
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),

    supabase
      .from("dds")
      .select(
        `
          id,
          data,
          tema,
          responsavel,
          setor,
          participantes,
          duracao,
          observacoes
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),

    supabase
      .from("auditorias")
      .select(
        `
          id,
          data,
          auditor,
          setor,
          tipo,
          conformidade,
          nao_conformidades,
          observacoes,
          acao_corretiva,
          prazo,
          status
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),

    supabase
      .from("acidentes")
      .select(
        `
          id,
          data,
          hora,
          funcionario,
          setor,
          tipo,
          gravidade,
          afastamento,
          dias_afastado,
          cat,
          causa,
          acao_corretiva,
          risco_pgr_id
        `
      )
      .order(
        "id",
        {
          ascending: true,
        }
      ),
  ]);

  const erro =
    respostaPgr.error ??
    respostaEpis.error ??
    respostaChecklists.error ??
    respostaDDS.error ??
    respostaAuditorias.error ??
    respostaAcidentes.error;

  if (erro) {
    console.error(
      "Erro ao carregar dados do relatório:",
      erro
    );

    window.alert(
      "Não foi possível carregar os dados para gerar o relatório."
    );

    return null;
  }

  const pgr =
    (
      respostaPgr.data ??
      []
    ).map(
      (item) =>
        converterPgr(
          item as PgrRow
        )
    );

  const epis =
    (
      respostaEpis.data ??
      []
    ) as EpiItem[];

  const checklists =
    (
      respostaChecklists.data ??
      []
    ) as ChecklistItem[];

  const dds =
    (
      respostaDDS.data ??
      []
    ) as DDSItem[];

  const auditorias =
    (
      respostaAuditorias.data ??
      []
    ).map(
      (item) =>
        converterAuditoria(
          item as AuditoriaRow
        )
    );

  const acidentes =
    (
      respostaAcidentes.data ??
      []
    ).map(
      (item) =>
        converterAcidente(
          item as AcidenteRow
        )
    );

  return {
    pgr,
    epis,
    checklists,
    dds,
    auditorias,
    acidentes,
  };
}

export async function gerarPDF() {
  const dados =
    await carregarDadosRelatorio();

  if (!dados) {
    return;
  }

  const {
    pgr,
    epis,
    checklists,
    dds,
    auditorias,
    acidentes,
  } = dados;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /*
   * PGR
   */

  const riscosCriticos =
    pgr.filter(
      (item) =>
        item.classificacao ===
        "Crítico"
    ).length;

  const riscosAltos =
    pgr.filter(
      (item) =>
        item.classificacao ===
        "Alto"
    ).length;

  const riscosMedios =
    pgr.filter(
      (item) =>
        item.classificacao ===
        "Médio"
    ).length;

  const riscosBaixos =
    pgr.filter(
      (item) =>
        item.classificacao ===
        "Baixo"
    ).length;

  const controlesConcluidos =
    pgr.filter(
      (item) =>
        item.status ===
        "Concluído"
    ).length;

  const controlesAndamento =
    pgr.filter(
      (item) =>
        item.status ===
        "Em andamento"
    ).length;

  const controlesPendentes =
    pgr.filter(
      (item) =>
        item.status ===
        "Pendente"
    ).length;

  const prazosPgrVencidos =
    pgr.filter(
      prazoPgrVencido
    ).length;

  /*
   * EPIs
   */

  const totalUnidadesEpi =
    epis.reduce(
      (total, epi) =>
        total +
        Number(
          epi.quantidade ?? 0
        ),
      0
    );

  const episEstoqueBaixo =
    epis.filter((epi) => {
      const quantidade =
        Number(
          epi.quantidade ?? 0
        );

      return (
        quantidade > 0 &&
        quantidade < 5
      );
    }).length;

  const episSemEstoque =
    epis.filter(
      (epi) =>
        Number(
          epi.quantidade ?? 0
        ) === 0
    ).length;

  const episVencidos =
    epis.filter(
      (epi) =>
        validadeVencida(
          epi.validade ?? ""
        )
    ).length;

  const episProximosVencimento =
    epis.filter(
      (epi) =>
        proximoDoVencimento(
          epi.validade ?? ""
        )
    ).length;

  /*
   * CHECKLISTS
   */

  const conformidadeChecklist =
    checklists.length > 0
      ? Math.round(
          checklists.reduce(
            (total, checklist) =>
              total +
              calcularConformidadeChecklist(
                checklist
              ),
            0
          ) /
            checklists.length
        )
      : 0;

  const checklistsCriticos =
    checklists.filter(
      (checklist) =>
        calcularConformidadeChecklist(
          checklist
        ) < 75
    ).length;

  /*
   * DDS
   */

  const totalParticipacoesDDS =
    dds.reduce(
      (total, item) =>
        total +
        Number(
          item.participantes ?? 0
        ),
      0
    );

  const tempoTotalDDS =
    dds.reduce(
      (total, item) =>
        total +
        Number(
          item.duracao ?? 0
        ),
      0
    );

  /*
   * AUDITORIAS
   */

  const conformidadeAuditorias =
    auditorias.length > 0
      ? Math.round(
          auditorias.reduce(
            (total, item) =>
              total +
              Number(
                item.conformidade ?? 0
              ),
            0
          ) /
            auditorias.length
        )
      : 0;

  const totalNaoConformidades =
    auditorias.reduce(
      (total, item) =>
        total +
        Number(
          item.naoConformidades ?? 0
        ),
      0
    );

  const auditoriasVencidas =
    auditorias.filter(
      prazoAuditoriaVencido
    ).length;

  /*
   * ACIDENTES
   */

  const acidentesReais =
    acidentes.filter(
      (item) =>
        item.tipo ===
        "Acidente"
    ).length;

  const incidentes =
    acidentes.filter(
      (item) =>
        item.tipo ===
        "Incidente"
    ).length;

  const quaseAcidentes =
    acidentes.filter(
      (item) =>
        item.tipo ===
        "Quase acidente"
    ).length;

  const ocorrenciasGraves =
    acidentes.filter(
      (item) =>
        item.gravidade ===
          "Grave" ||
        item.gravidade ===
          "Crítica"
    ).length;

  const afastamentos =
    acidentes.filter(
      (item) =>
        Boolean(
          item.afastamento
        )
    ).length;

  /*
   * ALERTAS
   *
   * Esta soma é a mesma
   * utilizada no Dashboard.
   */

  const totalAlertas =
    riscosCriticos +
    prazosPgrVencidos +
    episEstoqueBaixo +
    episSemEstoque +
    episVencidos +
    episProximosVencimento +
    checklistsCriticos +
    auditoriasVencidas +
    ocorrenciasGraves;

  /*
   * CAPA
   */

  desenharCapa(
    doc,
    {
      totalRiscos:
        pgr.length,

      totalAlertas,
    }
  );

  /*
   * RESUMO EXECUTIVO
   */

  novaPagina(
    doc,
    "Resumo Executivo",
    "Visão consolidada dos principais indicadores de SST."
  );

  let y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "Riscos no PGR",

        valor:
          pgr.length,

        cor: AZUL,
      },
      {
        titulo:
          "Riscos Críticos",

        valor:
          riscosCriticos,

        cor:
          VERMELHO,
      },
      {
        titulo:
          "Acidentes",

        valor:
          acidentesReais,

        cor: ROXO,
      },
      {
        titulo:
          "Alertas Ativos",

        valor:
          totalAlertas,

        cor:
          AMARELO,
      },
      {
        titulo:
          "EPIs",

        valor:
          epis.length,

        cor: AZUL,
      },
      {
        titulo:
          "Checklists",

        valor:
          checklists.length,

        cor: VERDE,
      },
      {
        titulo:
          "DDS",

        valor:
          dds.length,

        cor: AZUL,
      },
      {
        titulo:
          "Auditorias",

        valor:
          auditorias.length,

        cor: ROXO,
      },
    ]
  );

  y += 6;

  y = desenharSecao(
    doc,
    y,
    "Síntese da Situação"
  );

  y = escreverParagrafo(
    doc,
    montarResumoExecutivo({
      pgrTotal:
        pgr.length,

      riscosCriticos,

      riscosAltos,

      prazosPgrVencidos,

      acidentesReais,

      ocorrenciasGraves,

      episEstoqueBaixo,

      episSemEstoque,

      episVencidos,

      episProximosVencimento,

      conformidadeChecklist,

      conformidadeAuditorias,

      totalAlertas,
    }),
    y
  );

  /*
   * PGR
   */

  novaPagina(
    doc,
    "PGR e Inventário de Riscos",
    "Consolidação dos riscos ocupacionais cadastrados no SafeKitchen."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo: "Baixo",
        valor: riscosBaixos,
        cor: VERDE,
      },
      {
        titulo: "Médio",
        valor: riscosMedios,
        cor: AMARELO,
      },
      {
        titulo: "Alto",
        valor: riscosAltos,
        cor: LARANJA,
      },
      {
        titulo: "Crítico",
        valor: riscosCriticos,
        cor: VERMELHO,
      },
    ]
  );

  y += 6;

  y = desenharSecao(
    doc,
    y,
    "Situação das Medidas de Controle"
  );

  y = desenharTabela(
    doc,
    y,
    [
      "Situação",
      "Quantidade",
    ],
    [
      [
        "Concluídas",
        String(
          controlesConcluidos
        ),
      ],
      [
        "Em andamento",
        String(
          controlesAndamento
        ),
      ],
      [
        "Pendentes",
        String(
          controlesPendentes
        ),
      ],
      [
        "Prazos vencidos",
        String(
          prazosPgrVencidos
        ),
      ],
    ],
    [
      120,
      60,
    ]
  );

  y += 8;

  y = desenharSecao(
    doc,
    y,
    "Riscos Prioritários"
  );

  const riscosPrioritarios =
    pgr.filter(
      (item) =>
        item.classificacao ===
          "Crítico" ||
        item.classificacao ===
          "Alto"
    );

  if (
    riscosPrioritarios.length ===
    0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhum risco alto ou crítico registrado.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Setor",
        "Perigo",
        "Classe",
        "Nível",
        "Status",
      ],
      riscosPrioritarios.map(
        (item) => [
          item.setor,

          item.perigo,

          item.classificacao,

          String(
            item.nivel
          ),

          item.status,
        ]
      ),
      [
        30,
        61,
        28,
        18,
        43,
      ]
    );
  }

  /*
   * PLANO DE CONTROLE
   */

  novaPagina(
    doc,
    "Plano de Controle",
    "Medidas preventivas e corretivas definidas a partir do PGR."
  );

  y = 42;

  if (
    pgr.length === 0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhuma medida de controle cadastrada.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Risco",
        "Medida",
        "Responsável",
        "Prazo",
        "Status",
      ],
      pgr.map(
        (item) => [
          item.perigo,

          item.medidaControle ||
            "Não informada",

          item.responsavel ||
            "Não definido",

          formatarData(
            item.prazo
          ),

          item.status,
        ]
      ),
      [
        37,
        58,
        32,
        22,
        31,
      ]
    );
  }

  /*
   * ACIDENTES
   */

  novaPagina(
    doc,
    "Acidentes e Ocorrências",
    "Registros de acidentes, incidentes e quase acidentes."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "Acidentes",

        valor:
          acidentesReais,

        cor:
          VERMELHO,
      },
      {
        titulo:
          "Incidentes",

        valor:
          incidentes,

        cor:
          AMARELO,
      },
      {
        titulo:
          "Quase Acidentes",

        valor:
          quaseAcidentes,

        cor:
          AZUL,
      },
      {
        titulo:
          "Com Afastamento",

        valor:
          afastamentos,

        cor:
          ROXO,
      },
    ]
  );

  y += 7;

  y = desenharSecao(
    doc,
    y,
    "Registros"
  );

  if (
    acidentes.length ===
    0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhuma ocorrência registrada.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Data",
        "Tipo",
        "Setor",
        "Gravidade",
        "Afast.",
      ],
      acidentes.map(
        (item) => [
          formatarData(
            item.data ?? ""
          ),

          item.tipo ??
            "Não informado",

          item.setor ??
            "Não informado",

          item.gravidade ??
            "Não informada",

          item.afastamento
            ? "Sim"
            : "Não",
        ]
      ),
      [
        25,
        38,
        48,
        38,
        31,
      ]
    );
  }

  /*
   * EPIs
   */

  novaPagina(
    doc,
    "Controle de EPIs",
    "Estoque, Certificado de Aprovação e validade dos equipamentos."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "EPIs Cadastrados",

        valor:
          epis.length,

        cor: AZUL,
      },
      {
        titulo:
          "Unidades",

        valor:
          totalUnidadesEpi,

        cor: VERDE,
      },
      {
        titulo:
          "Estoque Baixo",

        valor:
          episEstoqueBaixo,

        cor:
          AMARELO,
      },
      {
        titulo:
          "Sem Estoque",

        valor:
          episSemEstoque,

        cor:
          VERMELHO,
      },
      {
        titulo:
          "Próx. Vencimento",

        valor:
          episProximosVencimento,

        cor:
          AMARELO,
      },
      {
        titulo:
          "Vencidos",

        valor:
          episVencidos,

        cor:
          VERMELHO,
      },
    ]
  );

  y += 7;

  y = desenharSecao(
    doc,
    y,
    "Situação dos Equipamentos"
  );

  if (
    epis.length === 0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhum EPI cadastrado.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "EPI",
        "CA",
        "Qtd.",
        "Estoque",
        "Validade",
      ],
      epis.map(
        (epi) => {
          const quantidade =
            Number(
              epi.quantidade ?? 0
            );

          return [
            epi.nome ??
              "Não informado",

            epi.ca ??
              "Não informado",

            String(
              quantidade
            ),

            quantidade === 0
              ? "Sem estoque"
              : quantidade < 5
                ? "Baixo"
                : "Normal",

            situacaoValidadeEpi(
              epi.validade ?? ""
            ),
          ];
        }
      ),
      [
        52,
        27,
        18,
        34,
        49,
      ]
    );
  }

  /*
   * CHECKLISTS
   */

  novaPagina(
    doc,
    "Checklists de Segurança",
    "Resultado das inspeções preventivas realizadas na cozinha."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "Inspeções",

        valor:
          checklists.length,

        cor: AZUL,
      },
      {
        titulo:
          "Conformidade Média",

        valor:
          `${conformidadeChecklist}%`,

        cor:
          corConformidade(
            conformidadeChecklist
          ),
      },
      {
        titulo:
          "Críticos",

        valor:
          checklistsCriticos,

        cor:
          VERMELHO,
      },
    ]
  );

  y += 7;

  if (
    checklists.length ===
    0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhuma inspeção registrada.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Data",
        "Setor",
        "Responsável",
        "Conformidade",
        "Resultado",
      ],
      checklists.map(
        (item) => {
          const conformidade =
            calcularConformidadeChecklist(
              item
            );

          return [
            formatarData(
              item.data ?? ""
            ),

            item.setor ??
              "Não informado",

            item.responsavel ??
              "Não informado",

            `${conformidade}%`,

            statusChecklist(
              conformidade
            ),
          ];
        }
      ),
      [
        27,
        42,
        44,
        30,
        37,
      ]
    );
  }

  /*
   * DDS
   */

  novaPagina(
    doc,
    "Diálogo Diário de Segurança",
    "Registro das orientações e ações de conscientização realizadas com as equipes."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "DDS Realizados",

        valor:
          dds.length,

        cor:
          AZUL,
      },
      {
        titulo:
          "Participações",

        valor:
          totalParticipacoesDDS,

        cor:
          VERDE,
      },
      {
        titulo:
          "Tempo Total",

        valor:
          `${tempoTotalDDS} min`,

        cor:
          ROXO,
      },
    ]
  );

  y += 7;

  if (
    dds.length === 0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhum DDS registrado.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Data",
        "Tema",
        "Setor",
        "Responsável",
        "Part.",
      ],
      dds.map(
        (item) => [
          formatarData(
            item.data ?? ""
          ),

          item.tema ??
            "Não informado",

          item.setor ??
            "Não informado",

          item.responsavel ??
            "Não informado",

          String(
            item.participantes ??
              0
          ),
        ]
      ),
      [
        25,
        53,
        38,
        45,
        19,
      ]
    );
  }

  /*
   * AUDITORIAS
   */

  novaPagina(
    doc,
    "Auditorias de SST",
    "Conformidade, não conformidades e acompanhamento das ações corretivas."
  );

  y = 42;

  y = desenharGradeIndicadores(
    doc,
    y,
    [
      {
        titulo:
          "Auditorias",

        valor:
          auditorias.length,

        cor: AZUL,
      },
      {
        titulo:
          "Conformidade Média",

        valor:
          `${conformidadeAuditorias}%`,

        cor:
          corConformidade(
            conformidadeAuditorias
          ),
      },
      {
        titulo:
          "Não Conformidades",

        valor:
          totalNaoConformidades,

        cor:
          AMARELO,
      },
      {
        titulo:
          "Prazos Vencidos",

        valor:
          auditoriasVencidas,

        cor:
          VERMELHO,
      },
    ]
  );

  y += 7;

  if (
    auditorias.length ===
    0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhuma auditoria registrada.",
      y
    );
  } else {
    desenharTabela(
      doc,
      y,
      [
        "Data",
        "Setor",
        "Auditor",
        "Conf.",
        "Status",
      ],
      auditorias.map(
        (item) => [
          formatarData(
            item.data ?? ""
          ),

          item.setor ??
            "Não informado",

          item.auditor ??
            "Não informado",

          `${Number(
            item.conformidade ?? 0
          )}%`,

          item.status ??
            "Não informado",
        ]
      ),
      [
        26,
        48,
        45,
        25,
        36,
      ]
    );
  }

  /*
   * ALERTAS
   */

  novaPagina(
    doc,
    "Alertas Prioritários",
    "Pontos identificados pelo sistema que exigem acompanhamento da gestão."
  );

  y = 42;

  const alertas: {
    titulo: string;
    detalhe: string;
    cor: RGB;
  }[] = [];

  if (
    riscosCriticos > 0
  ) {
    alertas.push({
      titulo:
        "Riscos críticos no PGR",

      detalhe:
        `${riscosCriticos} risco(s) necessitam de prioridade no controle.`,

      cor:
        VERMELHO,
    });
  }

  if (
    prazosPgrVencidos > 0
  ) {
    alertas.push({
      titulo:
        "Medidas do PGR atrasadas",

      detalhe:
        `${prazosPgrVencidos} medida(s) de controle possuem prazo vencido.`,

      cor:
        VERMELHO,
    });
  }

  if (
    episEstoqueBaixo > 0
  ) {
    alertas.push({
      titulo:
        "Estoque baixo de EPIs",

      detalhe:
        `${episEstoqueBaixo} EPI(s) possuem menos de 5 unidades.`,

      cor:
        AMARELO,
    });
  }

  if (
    episSemEstoque > 0
  ) {
    alertas.push({
      titulo:
        "EPIs sem estoque",

      detalhe:
        `${episSemEstoque} equipamento(s) estão sem unidades disponíveis.`,

      cor:
        VERMELHO,
    });
  }

  if (
    episVencidos > 0
  ) {
    alertas.push({
      titulo:
        "EPIs vencidos",

      detalhe:
        `${episVencidos} EPI(s) possuem validade vencida.`,

      cor:
        VERMELHO,
    });
  }

  if (
    episProximosVencimento >
    0
  ) {
    alertas.push({
      titulo:
        "EPIs próximos do vencimento",

      detalhe:
        `${episProximosVencimento} EPI(s) vencem nos próximos 30 dias.`,

      cor:
        AMARELO,
    });
  }

  if (
    checklistsCriticos > 0
  ) {
    alertas.push({
      titulo:
        "Checklists críticos",

      detalhe:
        `${checklistsCriticos} inspeção(ões) possuem conformidade inferior a 75%.`,

      cor:
        AMARELO,
    });
  }

  if (
    auditoriasVencidas > 0
  ) {
    alertas.push({
      titulo:
        "Ações de auditoria atrasadas",

      detalhe:
        `${auditoriasVencidas} auditoria(s) possuem prazo de ação vencido.`,

      cor:
        VERMELHO,
    });
  }

  if (
    ocorrenciasGraves > 0
  ) {
    alertas.push({
      titulo:
        "Ocorrências graves",

      detalhe:
        `${ocorrenciasGraves} ocorrência(s) possuem gravidade Grave ou Crítica.`,

      cor:
        VERMELHO,
    });
  }

  if (
    alertas.length === 0
  ) {
    escreverMensagemVazia(
      doc,
      "Nenhum alerta prioritário identificado no momento.",
      y
    );
  } else {
    alertas.forEach(
      (alerta) => {
        y = desenharAlerta(
          doc,
          y,
          alerta.titulo,
          alerta.detalhe,
          alerta.cor
        );
      }
    );
  }

  /*
   * CONSIDERAÇÕES FINAIS
   */

  novaPagina(
    doc,
    "Considerações Finais",
    "Síntese gerencial das informações registradas no SafeKitchen."
  );

  y = 44;

  y = escreverParagrafo(
    doc,
    "O SafeKitchen centraliza informações relacionadas à identificação de perigos, avaliação de riscos, medidas de controle, equipamentos de proteção individual, inspeções, diálogos de segurança, auditorias e registros de ocorrências.",
    y
  );

  y += 4;

  y = escreverParagrafo(
    doc,
    "Os dados deste relatório devem ser utilizados como apoio à gestão de Segurança e Saúde no Trabalho e ao acompanhamento das ações preventivas definidas pela organização.",
    y
  );

  y += 4;

  y = escreverParagrafo(
    doc,
    "O módulo de PGR do SafeKitchen auxilia na organização do inventário de riscos e das medidas de controle, permitindo acompanhar responsáveis, prazos e situação das ações cadastradas.",
    y
  );

  y += 4;

  y = escreverParagrafo(
    doc,
    "Este relatório é um recurso de apoio gerencial e não substitui documentos técnicos, avaliações profissionais ou obrigações legais aplicáveis à organização.",
    y
  );

  y += 10;

  desenharConclusao(
    doc,
    y,
    totalAlertas
  );

  /*
   * CABEÇALHO E RODAPÉ
   */

  aplicarCabecalhosERodapes(
    doc
  );

  /*
   * SALVAR
   */

  const dataArquivo =
    dataHojeArquivo();

  doc.save(
    `SafeKitchen-Relatorio-SST-${dataArquivo}.pdf`
  );
}

/*
 * CAPA
 */

function desenharCapa(
  doc: jsPDF,
  dados: {
    totalRiscos: number;
    totalAlertas: number;
  }
) {
  doc.setFillColor(
    ...AZUL_ESCURO
  );

  doc.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  doc.setFillColor(
    ...AZUL
  );

  doc.roundedRect(
    20,
    28,
    18,
    18,
    4,
    4,
    "F"
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.text(
    "SK",
    29,
    39,
    {
      align: "center",
    }
  );

  doc.setFontSize(24);

  doc.text(
    "SafeKitchen",
    44,
    39
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    148,
    163,
    184
  );

  doc.text(
    "GESTÃO DE SEGURANÇA E SAÚDE NO TRABALHO",
    44,
    45
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(29);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    "RELATÓRIO",
    20,
    105
  );

  doc.text(
    "GERENCIAL DE SST",
    20,
    118
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    148,
    163,
    184
  );

  doc.text(
    "Indicadores, riscos, controles e ações preventivas",
    20,
    130
  );

  /*
   * CARDS DA CAPA
   */

  doc.setFillColor(
    30,
    41,
    59
  );

  doc.roundedRect(
    20,
    155,
    80,
    43,
    5,
    5,
    "F"
  );

  doc.roundedRect(
    110,
    155,
    80,
    43,
    5,
    5,
    "F"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    148,
    163,
    184
  );

  doc.text(
    "RISCOS NO INVENTÁRIO",
    28,
    169
  );

  doc.text(
    "ALERTAS PRIORITÁRIOS",
    118,
    169
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(24);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    String(
      dados.totalRiscos
    ),
    28,
    187
  );

  if (
    dados.totalAlertas > 0
  ) {
    doc.setTextColor(
      248,
      113,
      113
    );
  } else {
    doc.setTextColor(
      134,
      239,
      172
    );
  }

  doc.text(
    String(
      dados.totalAlertas
    ),
    118,
    187
  );

  /*
   * RODAPÉ CAPA
   */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    148,
    163,
    184
  );

  doc.text(
    `Emitido em ${new Date().toLocaleDateString(
      "pt-BR"
    )} às ${new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`,
    20,
    270
  );

  doc.text(
    "SafeKitchen - Sistema de Gestão de SST",
    20,
    278
  );
}

/*
 * PÁGINA PADRÃO
 */

function novaPagina(
  doc: jsPDF,
  titulo: string,
  subtitulo: string
) {
  doc.addPage();

  doc.setTextColor(
    ...AZUL_ESCURO
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.text(
    titulo,
    15,
    23
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    ...CINZA
  );

  doc.text(
    subtitulo,
    15,
    30
  );

  doc.setDrawColor(
    ...BORDA
  );

  doc.line(
    15,
    35,
    195,
    35
  );
}

/*
 * INDICADORES
 */

function desenharGradeIndicadores(
  doc: jsPDF,
  yInicial: number,
  indicadores: {
    titulo: string;
    valor: string | number;
    cor: RGB;
  }[]
) {
  const largura = 42.5;
  const altura = 27;
  const espaco = 3.3;

  let x = 15;
  let y = yInicial;

  indicadores.forEach(
    (
      indicador,
      index
    ) => {
      if (
        index > 0 &&
        index % 4 === 0
      ) {
        x = 15;

        y +=
          altura + 5;
      }

      doc.setFillColor(
        255,
        255,
        255
      );

      doc.setDrawColor(
        ...BORDA
      );

      doc.roundedRect(
        x,
        y,
        largura,
        altura,
        3,
        3,
        "FD"
      );

      doc.setFillColor(
        ...indicador.cor
      );

      doc.roundedRect(
        x + 4,
        y + 4,
        4,
        19,
        2,
        2,
        "F"
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7.2);

      doc.setTextColor(
        ...CINZA
      );

      const titulo =
        doc.splitTextToSize(
          indicador.titulo,
          27
        );

      doc.text(
        titulo,
        x + 11,
        y + 8
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(15);

      doc.setTextColor(
        ...AZUL_ESCURO
      );

      doc.text(
        String(
          indicador.valor
        ),
        x + 11,
        y + 21
      );

      x +=
        largura +
        espaco;
    }
  );

  const linhas =
    Math.ceil(
      indicadores.length / 4
    );

  return (
    yInicial +
    linhas * altura +
    (linhas - 1) * 5
  );
}

/*
 * SEÇÃO
 */

function desenharSecao(
  doc: jsPDF,
  y: number,
  titulo: string
) {
  y = garantirEspaco(
    doc,
    y,
    18
  );

  doc.setFillColor(
    ...CINZA_CLARO
  );

  doc.roundedRect(
    15,
    y,
    180,
    10,
    2,
    2,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    ...AZUL_ESCURO
  );

  doc.text(
    titulo,
    19,
    y + 6.5
  );

  return y + 15;
}

/*
 * PARÁGRAFO
 */

function escreverParagrafo(
  doc: jsPDF,
  texto: string,
  y: number
) {
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    71,
    85,
    105
  );

  const linhas =
    doc.splitTextToSize(
      texto,
      174
    );

  const altura =
    linhas.length * 5;

  y = garantirEspaco(
    doc,
    y,
    altura + 5
  );

  doc.text(
    linhas,
    18,
    y
  );

  return y + altura;
}

/*
 * TABELA
 */

function desenharTabela(
  doc: jsPDF,
  yInicial: number,
  cabecalhos: string[],
  linhas: string[][],
  larguras: number[]
) {
  let y = yInicial;

  const alturaCabecalho = 9;

  const paddingX = 2.5;

  const paddingY = 2.5;

  const alturaLinhaTexto = 4;

  function desenharCabecalho() {
    y = garantirEspaco(
      doc,
      y,
      alturaCabecalho + 10
    );

    let x = 15;

    cabecalhos.forEach(
      (
        cabecalho,
        index
      ) => {
        const largura =
          larguras[index];

        doc.setFillColor(
          ...AZUL_ESCURO
        );

        doc.rect(
          x,
          y,
          largura,
          alturaCabecalho,
          "F"
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(7);

        doc.setTextColor(
          255,
          255,
          255
        );

        const texto =
          doc.splitTextToSize(
            cabecalho,
            largura -
              paddingX * 2
          );

        doc.text(
          texto,
          x + paddingX,
          y + 5.7
        );

        x += largura;
      }
    );

    y +=
      alturaCabecalho;
  }

  desenharCabecalho();

  linhas.forEach(
    (
      linha,
      indiceLinha
    ) => {
      const textos =
        linha.map(
          (
            valor,
            index
          ) =>
            doc.splitTextToSize(
              String(
                valor
              ),
              larguras[index] -
                paddingX * 2
            )
        );

      const maiorQuantidadeLinhas =
        Math.max(
          ...textos.map(
            (texto) =>
              texto.length
          )
        );

      const altura =
        Math.max(
          9,
          maiorQuantidadeLinhas *
            alturaLinhaTexto +
            paddingY * 2
        );

      if (
        y + altura >
        279
      ) {
        doc.addPage();

        y = 20;

        desenharCabecalho();
      }

      let x = 15;

      textos.forEach(
        (
          texto,
          index
        ) => {
          const largura =
            larguras[index];

          if (
            indiceLinha % 2 ===
            0
          ) {
            doc.setFillColor(
              248,
              250,
              252
            );
          } else {
            doc.setFillColor(
              255,
              255,
              255
            );
          }

          doc.setDrawColor(
            ...BORDA
          );

          doc.rect(
            x,
            y,
            largura,
            altura,
            "FD"
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(7.2);

          doc.setTextColor(
            51,
            65,
            85
          );

          doc.text(
            texto,
            x + paddingX,
            y + 5
          );

          x += largura;
        }
      );

      y += altura;
    }
  );

  return y;
}

/*
 * ALERTA
 */

function desenharAlerta(
  doc: jsPDF,
  y: number,
  titulo: string,
  detalhe: string,
  cor: RGB
) {
  const linhas =
    doc.splitTextToSize(
      detalhe,
      154
    );

  const altura =
    Math.max(
      19,
      linhas.length * 4 +
        12
    );

  y = garantirEspaco(
    doc,
    y,
    altura + 5
  );

  doc.setFillColor(
    248,
    250,
    252
  );

  doc.setDrawColor(
    ...BORDA
  );

  doc.roundedRect(
    15,
    y,
    180,
    altura,
    3,
    3,
    "FD"
  );

  doc.setFillColor(
    ...cor
  );

  doc.roundedRect(
    19,
    y + 4,
    4,
    altura - 8,
    2,
    2,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    ...AZUL_ESCURO
  );

  doc.text(
    titulo,
    28,
    y + 8
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    ...CINZA
  );

  doc.text(
    linhas,
    28,
    y + 14
  );

  return (
    y +
    altura +
    5
  );
}

/*
 * ESTADO VAZIO
 */

function escreverMensagemVazia(
  doc: jsPDF,
  texto: string,
  y: number
) {
  y = garantirEspaco(
    doc,
    y,
    20
  );

  doc.setFillColor(
    248,
    250,
    252
  );

  doc.setDrawColor(
    ...BORDA
  );

  doc.roundedRect(
    15,
    y,
    180,
    16,
    3,
    3,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8.5);

  doc.setTextColor(
    ...CINZA
  );

  doc.text(
    texto,
    105,
    y + 10,
    {
      align: "center",
    }
  );

  return y + 22;
}

/*
 * CONCLUSÃO
 */

function desenharConclusao(
  doc: jsPDF,
  y: number,
  alertas: number
) {
  const possuiAlertas =
    alertas > 0;

  const cor =
    possuiAlertas
      ? AMARELO
      : VERDE;

  doc.setFillColor(
    248,
    250,
    252
  );

  doc.setDrawColor(
    ...BORDA
  );

  doc.roundedRect(
    15,
    y,
    180,
    37,
    4,
    4,
    "FD"
  );

  doc.setFillColor(
    ...cor
  );

  doc.circle(
    31,
    y + 18.5,
    6,
    "F"
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.text(
    possuiAlertas
      ? "!"
      : "OK",
    31,
    y + 21,
    {
      align: "center",
    }
  );

  doc.setTextColor(
    ...AZUL_ESCURO
  );

  doc.setFontSize(11);

  doc.text(
    possuiAlertas
      ? "Existem pontos que requerem acompanhamento"
      : "Situação geral sem alertas prioritários",
    44,
    y + 14
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    ...CINZA
  );

  const mensagem =
    possuiAlertas
      ? `O SafeKitchen identificou ${alertas} alerta(s) prioritário(s). Consulte as seções anteriores para acompanhamento.`
      : "Não foram identificados alertas prioritários com base nos registros atuais do sistema.";

  doc.text(
    doc.splitTextToSize(
      mensagem,
      135
    ),
    44,
    y + 22
  );
}

/*
 * CABEÇALHO E RODAPÉ
 */

function aplicarCabecalhosERodapes(
  doc: jsPDF
) {
  const totalPaginas =
    doc.getNumberOfPages();

  for (
    let pagina = 2;
    pagina <= totalPaginas;
    pagina++
  ) {
    doc.setPage(
      pagina
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(
      ...AZUL
    );

    doc.text(
      "SAFETY MANAGEMENT - SAFEKITCHEN",
      15,
      10
    );

    doc.setDrawColor(
      ...BORDA
    );

    doc.line(
      15,
      284,
      195,
      284
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      ...CINZA
    );

    doc.text(
      "SafeKitchen - Relatório Gerencial de SST",
      15,
      290
    );

    doc.text(
      `Página ${pagina - 1} de ${totalPaginas - 1}`,
      195,
      290,
      {
        align: "right",
      }
    );
  }
}

/*
 * PAGINAÇÃO
 */

function garantirEspaco(
  doc: jsPDF,
  y: number,
  alturaNecessaria: number
) {
  if (
    y +
      alturaNecessaria >
    278
  ) {
    doc.addPage();

    return 20;
  }

  return y;
}

/*
 * RESUMO EXECUTIVO
 */

function montarResumoExecutivo(
  dados: {
    pgrTotal: number;
    riscosCriticos: number;
    riscosAltos: number;
    prazosPgrVencidos: number;
    acidentesReais: number;
    ocorrenciasGraves: number;
    episEstoqueBaixo: number;
    episSemEstoque: number;
    episVencidos: number;
    episProximosVencimento: number;
    conformidadeChecklist: number;
    conformidadeAuditorias: number;
    totalAlertas: number;
  }
) {
  if (
    dados.totalAlertas === 0
  ) {
    return (
      `O SafeKitchen possui atualmente ${dados.pgrTotal} risco(s) registrado(s) no inventário do PGR. ` +
      `Não foram identificados alertas prioritários nos registros atuais. ` +
      `A conformidade média dos checklists é de ${dados.conformidadeChecklist}% e a conformidade média das auditorias é de ${dados.conformidadeAuditorias}%.`
    );
  }

  return (
    `O SafeKitchen possui ${dados.pgrTotal} risco(s) registrados no inventário do PGR, sendo ${dados.riscosCriticos} crítico(s) e ${dados.riscosAltos} alto(s). ` +
    `Foram identificadas ${dados.prazosPgrVencidos} medida(s) do PGR com prazo vencido. ` +
    `Há ${dados.acidentesReais} acidente(s) registrado(s), dos quais ${dados.ocorrenciasGraves} ocorrência(s) possuem gravidade Grave ou Crítica. ` +
    `No controle de EPIs, ${dados.episEstoqueBaixo} item(ns) apresentam estoque baixo, ${dados.episSemEstoque} estão sem estoque, ${dados.episVencidos} apresentam validade vencida e ${dados.episProximosVencimento} vencem nos próximos 30 dias. ` +
    `A conformidade média dos checklists é de ${dados.conformidadeChecklist}% e das auditorias é de ${dados.conformidadeAuditorias}%. ` +
    `O sistema identificou ${dados.totalAlertas} alerta(s) prioritário(s) que devem ser acompanhados pela gestão.`
  );
}

/*
 * REGRAS DE NEGÓCIO
 */

function prazoPgrVencido(
  risco: PgrItem
) {
  if (
    !risco.prazo ||
    risco.status ===
      "Concluído"
  ) {
    return false;
  }

  return (
    criarData(
      risco.prazo,
      23,
      59,
      59
    ).getTime() <
    new Date().getTime()
  );
}

function validadeVencida(
  validade: string
) {
  if (!validade) {
    return false;
  }

  return (
    criarData(
      validade,
      23,
      59,
      59
    ).getTime() <
    new Date().getTime()
  );
}

function proximoDoVencimento(
  validade: string
) {
  if (!validade) {
    return false;
  }

  const hoje =
    new Date();

  const data =
    criarData(
      validade,
      23,
      59,
      59
    );

  if (
    data.getTime() <
    hoje.getTime()
  ) {
    return false;
  }

  const diferenca =
    data.getTime() -
    hoje.getTime();

  const dias =
    diferenca /
    (
      1000 *
      60 *
      60 *
      24
    );

  return dias <= 30;
}

function situacaoValidadeEpi(
  validade: string
) {
  if (!validade) {
    return "Não informada";
  }

  if (
    validadeVencida(
      validade
    )
  ) {
    return `${formatarData(
      validade
    )} - VENCIDO`;
  }

  if (
    proximoDoVencimento(
      validade
    )
  ) {
    return `${formatarData(
      validade
    )} - PRÓXIMO`;
  }

  return formatarData(
    validade
  );
}

function calcularConformidadeChecklist(
  checklist: ChecklistItem
) {
  const itens = [
    checklist.epis,
    checklist.piso,
    checklist.extintor,
    checklist.exaustao,
    checklist.iluminacao,
    checklist.facas,
    checklist.quimicos,
    checklist.emergencia,
  ];

  const conformes =
    itens.filter(
      Boolean
    ).length;

  return Math.round(
    (
      conformes /
      itens.length
    ) *
      100
  );
}

function statusChecklist(
  conformidade: number
) {
  if (
    conformidade === 100
  ) {
    return "Conforme";
  }

  if (
    conformidade >= 75
  ) {
    return "Atenção";
  }

  return "Crítico";
}

function prazoAuditoriaVencido(
  auditoria: AuditoriaItem
) {
  if (
    !auditoria.prazo ||
    auditoria.status ===
      "Concluída"
  ) {
    return false;
  }

  return (
    criarData(
      auditoria.prazo,
      23,
      59,
      59
    ).getTime() <
    new Date().getTime()
  );
}

function corConformidade(
  valor: number
): RGB {
  if (
    valor >= 90
  ) {
    return VERDE;
  }

  if (
    valor >= 75
  ) {
    return AZUL;
  }

  if (
    valor >= 50
  ) {
    return AMARELO;
  }

  return VERMELHO;
}

/*
 * DATAS
 */

function criarData(
  data: string,
  hora: number,
  minuto: number,
  segundo: number
) {
  const [
    ano,
    mes,
    dia,
  ] = data
    .split("-")
    .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia,
    hora,
    minuto,
    segundo
  );
}

function formatarData(
  data: string
) {
  if (!data) {
    return "Não informado";
  }

  const [
    ano,
    mes,
    dia,
  ] =
    data.split("-");

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function dataHojeArquivo() {
  const agora =
    new Date();

  const ano =
    agora.getFullYear();

  const mes =
    String(
      agora.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${ano}-${mes}-${dia}`;
}