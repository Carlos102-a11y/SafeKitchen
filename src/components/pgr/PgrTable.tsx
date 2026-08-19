import type { ReactNode } from "react";

import {
  Pencil,
  Trash2,
  Building2,
  CalendarDays,
  UserRound,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import Badge from "../ui/Badge";

import type { PgrItem } from "../../models/Pgr";

interface Props {
  riscos: PgrItem[];
  onEditar: (risco: PgrItem) => void;
  onExcluir: (id: number) => void;
}

export default function PgrTable({
  riscos,
  onEditar,
  onExcluir,
}: Props) {
  if (riscos.length === 0) {
    return (
      <div className="pgr-table-empty">
        <div className="pgr-table-empty-icon">
          <ShieldCheck size={25} />
        </div>

        <strong>
          Nenhum risco encontrado
        </strong>

        <span>
          Cadastre um risco ou altere os
          filtros de pesquisa.
        </span>

        <style>
          {estilosTabela}
        </style>
      </div>
    );
  }

  return (
    <>
      <div className="pgr-table-container">
        <table className="pgr-table">
          <thead>
            <tr>
              <Th>Risco</Th>

              <Th>
                Classificação
              </Th>

              <Th>
                Medida de Controle
              </Th>

              <Th>
                Responsável
              </Th>

              <Th>Prazo</Th>

              <Th>Status</Th>

              <Th align="center">
                Ações
              </Th>
            </tr>
          </thead>

          <tbody>
            {riscos.map(
              (risco) => (
                <tr
                  key={risco.id}
                >
                  {/* RISCO */}

                  <Td>
                    <div className="pgr-risco-info">
                      <div className="pgr-risco-icon">
                        <Building2
                          size={18}
                        />
                      </div>

                      <div className="pgr-risco-textos">
                        <div className="pgr-risco-perigo">
                          {
                            risco.perigo
                          }
                        </div>

                        <div className="pgr-risco-setor">
                          {
                            risco.setor
                          }
                        </div>

                        <div className="pgr-risco-atividade">
                          {
                            risco.atividade
                          }
                        </div>

                        <div className="pgr-risco-categoria">
                          <Badge color="blue">
                            {
                              risco.categoria
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Td>

                  {/* CLASSIFICAÇÃO */}

                  <Td>
                    <div className="pgr-classificacao">
                      <Badge
                        color={
                          risco.classificacao ===
                          "Crítico"
                            ? "red"
                            : risco.classificacao ===
                                "Alto"
                              ? "orange"
                              : risco.classificacao ===
                                  "Médio"
                                ? "yellow"
                                : "green"
                        }
                      >
                        {
                          risco.classificacao
                        }
                      </Badge>

                      <div className="pgr-nivel">
                        <TriangleAlert
                          size={14}
                        />

                        Nível{" "}
                        {
                          risco.nivel
                        }
                      </div>
                    </div>
                  </Td>

                  {/* MEDIDA DE CONTROLE */}

                  <Td>
                    <div className="pgr-medida">
                      {risco.medidaControle ||
                        "Não informada"}
                    </div>
                  </Td>

                  {/* RESPONSÁVEL */}

                  <Td>
                    <div className="pgr-responsavel">
                      <UserRound
                        size={16}
                        color="#94A3B8"
                      />

                      <span>
                        {risco.responsavel ||
                          "Não definido"}
                      </span>
                    </div>
                  </Td>

                  {/* PRAZO */}

                  <Td>
                    <div
                      className={
                        prazoVencido(
                          risco
                        )
                          ? "pgr-prazo pgr-prazo-vencido"
                          : "pgr-prazo"
                      }
                    >
                      <CalendarDays
                        size={16}
                        color={
                          prazoVencido(
                            risco
                          )
                            ? "#DC2626"
                            : "#94A3B8"
                        }
                      />

                      <span>
                        {formatarData(
                          risco.prazo
                        )}
                      </span>
                    </div>

                    {prazoVencido(
                      risco
                    ) && (
                      <div className="pgr-prazo-alerta">
                        Prazo vencido
                      </div>
                    )}
                  </Td>

                  {/* STATUS */}

                  <Td>
                    <Badge
                      color={
                        risco.status ===
                        "Concluído"
                          ? "green"
                          : risco.status ===
                              "Em andamento"
                            ? "yellow"
                            : "gray"
                      }
                    >
                      {risco.status}
                    </Badge>
                  </Td>

                  {/* AÇÕES */}

                  <Td align="center">
                    <div className="pgr-acoes">
                      <button
                        type="button"
                        onClick={() =>
                          onEditar(
                            risco
                          )
                        }
                        title="Editar risco"
                        aria-label="Editar risco"
                        className="pgr-acao pgr-acao-editar"
                      >
                        <Pencil
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onExcluir(
                            risco.id
                          )
                        }
                        title="Excluir risco"
                        aria-label="Excluir risco"
                        className="pgr-acao pgr-acao-excluir"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>
                  </Td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <style>
        {estilosTabela}
      </style>
    </>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "center"
    | "right";
}) {
  return (
    <th
      style={{
        padding:
          "15px 18px",

        textAlign: align,

        color:
          "#64748B",

        fontSize: 11,

        fontWeight: 800,

        textTransform:
          "uppercase",

        letterSpacing:
          ".55px",

        whiteSpace:
          "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "center"
    | "right";
}) {
  return (
    <td
      style={{
        padding: 18,

        textAlign: align,

        verticalAlign:
          "middle",
      }}
    >
      {children}
    </td>
  );
}

function formatarData(
  data: string
) {
  if (!data) {
    return "Sem prazo";
  }

  const [
    ano,
    mes,
    dia,
  ] = data.split("-");

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function prazoVencido(
  risco: PgrItem
) {
  if (
    !risco.prazo ||
    risco.status ===
      "Concluído"
  ) {
    return false;
  }

  const prazo =
    new Date(
      `${risco.prazo}T23:59:59`
    );

  return (
    prazo.getTime() <
    new Date().getTime()
  );
}

const estilosTabela = `
  .pgr-table-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;

    overflow-x: auto;
    overflow-y: hidden;

    box-sizing: border-box;

    background: #ffffff;

    border: 1px solid #e2e8f0;
    border-radius: 16px;

    -webkit-overflow-scrolling: touch;

    scrollbar-width: thin;
  }

  .pgr-table {
    width: 100%;
    min-width: 1080px;

    border-collapse: collapse;

    table-layout: auto;
  }

  .pgr-table thead tr {
    background: #f8fafc;
  }

  .pgr-table tbody tr {
    background: #ffffff;

    border-top:
      1px solid #e2e8f0;
  }

  .pgr-risco-info {
    display: flex;
    align-items: flex-start;

    gap: 12px;

    width: 230px;
    min-width: 230px;
  }

  .pgr-risco-icon {
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background: #f1f5f9;

    color: #64748b;
  }

  .pgr-risco-textos {
    min-width: 0;

    flex: 1;
  }

  .pgr-risco-perigo {
    color: #0f172a;

    font-size: 14px;
    font-weight: 700;

    line-height: 1.35;

    overflow-wrap: anywhere;
  }

  .pgr-risco-setor {
    margin-top: 5px;

    color: #64748b;

    font-size: 12px;

    overflow-wrap: anywhere;
  }

  .pgr-risco-atividade {
    margin-top: 3px;

    color: #94a3b8;

    font-size: 11px;

    overflow-wrap: anywhere;
  }

  .pgr-risco-categoria {
    margin-top: 8px;
  }

  .pgr-classificacao {
    min-width: 125px;
  }

  .pgr-nivel {
    display: flex;
    align-items: center;

    gap: 6px;

    margin-top: 8px;

    color: #64748b;

    font-size: 12px;
    font-weight: 600;

    white-space: nowrap;
  }

  .pgr-medida {
    width: 220px;
    max-width: 220px;

    color: #475569;

    font-size: 13px;

    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .pgr-responsavel {
    display: flex;
    align-items: center;

    gap: 8px;

    width: 145px;
    min-width: 145px;

    color: #475569;

    font-size: 13px;
  }

  .pgr-responsavel svg {
    flex-shrink: 0;
  }

  .pgr-responsavel span {
    min-width: 0;

    overflow-wrap: anywhere;
  }

  .pgr-prazo {
    display: flex;
    align-items: center;

    gap: 8px;

    min-width: 125px;

    color: #475569;

    font-size: 13px;
    font-weight: 500;

    white-space: nowrap;
  }

  .pgr-prazo svg {
    flex-shrink: 0;
  }

  .pgr-prazo-vencido {
    color: #dc2626;

    font-weight: 700;
  }

  .pgr-prazo-alerta {
    margin-top: 6px;

    color: #dc2626;

    font-size: 10px;
    font-weight: 700;

    text-transform: uppercase;

    letter-spacing: .4px;

    white-space: nowrap;
  }

  .pgr-acoes {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 7px;

    min-width: 80px;
  }

  .pgr-acao {
    width: 36px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    padding: 0;

    border: none;
    border-radius: 9px;

    cursor: pointer;

    transition:
      transform .15s ease,
      opacity .15s ease;
  }

  .pgr-acao:hover {
    transform: translateY(-1px);
  }

  .pgr-acao-editar {
    background: #eff6ff;

    color: #2563eb;
  }

  .pgr-acao-excluir {
    background: #fef2f2;

    color: #dc2626;
  }

  .pgr-table-empty {
    width: 100%;
    min-width: 0;
    min-height: 240px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 40px;

    box-sizing: border-box;

    background: #ffffff;

    border:
      1px dashed #cbd5e1;

    border-radius: 16px;

    text-align: center;
  }

  .pgr-table-empty-icon {
    width: 52px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 14px;

    border-radius: 14px;

    background: #eff6ff;

    color: #2563eb;
  }

  .pgr-table-empty strong {
    color: #0f172a;

    font-size: 15px;
  }

  .pgr-table-empty span {
    margin-top: 6px;

    max-width: 360px;

    color: #94a3b8;

    font-size: 13px;

    line-height: 1.5;
  }

  @media (max-width: 650px) {
    .pgr-table-container {
      border-radius: 12px;
    }

    .pgr-table {
      min-width: 980px;
    }

    .pgr-table th {
      padding:
        13px 14px;
    }

    .pgr-table td {
      padding: 14px;
    }

    .pgr-risco-info {
      width: 205px;
      min-width: 205px;
    }

    .pgr-risco-perigo {
      font-size: 13px;
    }

    .pgr-medida {
      width: 190px;
      max-width: 190px;

      font-size: 12px;
    }

    .pgr-responsavel {
      width: 135px;
      min-width: 135px;

      font-size: 12px;
    }

    .pgr-table-empty {
      min-height: 210px;

      padding:
        26px 18px;
    }

    .pgr-table-empty span {
      font-size: 12px;
    }
  }

  @media (max-width: 430px) {
    .pgr-table {
      min-width: 930px;
    }

    .pgr-risco-info {
      width: 190px;
      min-width: 190px;
    }

    .pgr-medida {
      width: 175px;
      max-width: 175px;
    }

    .pgr-acao {
      width: 34px;
      height: 34px;
    }
  }
`;