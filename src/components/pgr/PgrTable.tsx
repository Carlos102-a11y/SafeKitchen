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

        <div className="pgr-table-empty-kicker">
          Inventário PGR
        </div>

        <strong>
          Nenhum risco encontrado
        </strong>

        <span>
          Cadastre um novo risco ou altere os filtros para visualizar outros registros do inventário.
        </span>

        <style>
          {estilosTabela}
        </style>
      </div>
    );
  }

  return (
    <>
      <div className="pgr-table-shell">
        <div className="pgr-table-meta">
          <div>
            <strong>Inventário consolidado</strong>
            <span>
              {riscos.length} registro(s) exibido(s)
            </span>
          </div>

          <span className="pgr-table-scroll-hint">
            Deslize horizontalmente para ver todos os campos
          </span>
        </div>

        <div className="pgr-table-container">
          <table className="pgr-table">
            <thead>
              <tr>
                <Th>Risco identificado</Th>
                <Th>Avaliação</Th>
                <Th>Medida de controle</Th>
                <Th>Responsável</Th>
                <Th>Prazo</Th>
                <Th>Status</Th>
                <Th align="center">
                  Ações
                </Th>
              </tr>
            </thead>

            <tbody>
              {riscos.map((risco) => {
                const vencido =
                  prazoVencido(risco);

                const classeRisco =
                  classeClassificacao(
                    risco.classificacao
                  );

                return (
                  <tr
                    key={risco.id}
                    className={`pgr-row pgr-row-${classeRisco}`}
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
                            {risco.perigo}
                          </div>

                          <div className="pgr-risco-local">
                            <span>
                              {risco.setor}
                            </span>

                            <span
                              aria-hidden="true"
                              className="pgr-risco-separador"
                            >
                              •
                            </span>

                            <span>
                              {risco.atividade}
                            </span>
                          </div>

                          <div className="pgr-risco-categoria">
                            <Badge color="blue">
                              {risco.categoria}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Td>

                    {/* AVALIAÇÃO */}

                    <Td>
                      <div className="pgr-avaliacao">
                        <div className="pgr-avaliacao-topo">
                          <div
                            className={`pgr-score pgr-score-${classeRisco}`}
                          >
                            {risco.nivel}
                          </div>

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
                            {risco.classificacao}
                          </Badge>
                        </div>

                        <div className="pgr-matriz-info">
                          <TriangleAlert
                            size={13}
                          />

                          <span>
                            P{risco.probabilidade}
                            {" × "}
                            S{risco.severidade}
                          </span>
                        </div>
                      </div>
                    </Td>

                    {/* MEDIDA DE CONTROLE */}

                    <Td>
                      <div
                        className={
                          risco.medidaControle
                            ? "pgr-medida"
                            : "pgr-medida pgr-medida-vazia"
                        }
                        title={
                          risco.medidaControle ||
                          "Não informada"
                        }
                      >
                        {risco.medidaControle ||
                          "Não informada"}
                      </div>
                    </Td>

                    {/* RESPONSÁVEL */}

                    <Td>
                      <div className="pgr-responsavel">
                        <div className="pgr-responsavel-icon">
                          <UserRound
                            size={15}
                          />
                        </div>

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
                          vencido
                            ? "pgr-prazo pgr-prazo-vencido"
                            : "pgr-prazo"
                        }
                      >
                        <CalendarDays
                          size={15}
                        />

                        <span>
                          {formatarData(
                            risco.prazo
                          )}
                        </span>
                      </div>

                      {vencido && (
                        <div className="pgr-prazo-alerta">
                          Prazo vencido
                        </div>
                      )}
                    </Td>

                    {/* STATUS */}

                    <Td>
                      <div className="pgr-status-area">
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

                        <span className="pgr-status-legenda">
                          {descricaoStatus(
                            risco.status
                          )}
                        </span>
                      </div>
                    </Td>

                    {/* AÇÕES */}

                    <Td align="center">
                      <div className="pgr-acoes">
                        <button
                          type="button"
                          onClick={() =>
                            onEditar(risco)
                          }
                          title="Editar risco"
                          aria-label={`Editar risco ${risco.perigo}`}
                          className="pgr-acao pgr-acao-editar"
                        >
                          <Pencil
                            size={16}
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
                          aria-label={`Excluir risco ${risco.perigo}`}
                          className="pgr-acao pgr-acao-excluir"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
        padding: "14px 16px",
        textAlign: align,
        color: "#64748B",
        fontSize: "calc(10px * var(--sk-text-scale, 1))",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".65px",
        whiteSpace: "nowrap",
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
        padding: 16,
        textAlign: align,
        verticalAlign: "middle",
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

  const prazo = new Date(
    `${risco.prazo}T23:59:59`
  );

  return (
    prazo.getTime() <
    new Date().getTime()
  );
}

function classeClassificacao(
  classificacao: PgrItem["classificacao"]
) {
  if (classificacao === "Crítico") {
    return "critico";
  }

  if (classificacao === "Alto") {
    return "alto";
  }

  if (classificacao === "Médio") {
    return "medio";
  }

  return "baixo";
}

function descricaoStatus(
  status: PgrItem["status"]
) {
  if (status === "Concluído") {
    return "Controle finalizado";
  }

  if (status === "Em andamento") {
    return "Ação em execução";
  }

  return "Aguardando ação";
}

const estilosTabela = `
  .pgr-table-shell {
    width: 100%;
    min-width: 0;
  }

  .pgr-table-meta {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 16px;

    margin-bottom: 10px;
    padding: 0 2px;

    box-sizing: border-box;
  }

  .pgr-table-meta > div {
    min-width: 0;

    display: flex;
    align-items: baseline;

    gap: 9px;
  }

  .pgr-table-meta strong {
    color: #0f172a;

    font-size: calc(12px * var(--sk-text-scale, 1));
    font-weight: 800;
  }

  .pgr-table-meta span {
    color: #94a3b8;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 600;
  }

  .pgr-table-scroll-hint {
    display: none;
  }

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

    box-shadow:
      0 8px 28px
      rgba(15, 23, 42, 0.04);

    -webkit-overflow-scrolling: touch;

    scrollbar-width: thin;
    scrollbar-color:
      #cbd5e1 transparent;
  }

  .pgr-table-container::-webkit-scrollbar {
    height: 8px;
  }

  .pgr-table-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  .pgr-table {
    width: 100%;
    min-width: 1160px;

    border-collapse: separate;
    border-spacing: 0;

    table-layout: auto;
  }

  .pgr-table thead tr {
    background: #f8fafc;
  }

  .pgr-table thead th {
    border-bottom:
      1px solid #e2e8f0;
  }

  .pgr-table tbody tr {
    position: relative;

    background: #ffffff;

    transition:
      background .16s ease,
      box-shadow .16s ease;
  }

  .pgr-table tbody tr + tr td {
    border-top:
      1px solid #eef2f7;
  }

  .pgr-table tbody tr:hover {
    background: #fbfdff;
  }

  .pgr-table tbody tr:hover td:first-child,
  .pgr-table tbody tr:hover td:last-child {
    background: #fbfdff;
  }

  .pgr-table th:first-child,
  .pgr-table td:first-child {
    position: sticky;
    left: 0;

    z-index: 2;

    background: #ffffff;

    box-shadow:
      1px 0 0 #eef2f7;
  }

  .pgr-table thead th:first-child {
    z-index: 4;

    background: #f8fafc;
  }

  .pgr-table th:last-child,
  .pgr-table td:last-child {
    position: sticky;
    right: 0;

    z-index: 2;

    background: #ffffff;

    box-shadow:
      -1px 0 0 #eef2f7;
  }

  .pgr-table thead th:last-child {
    z-index: 4;

    background: #f8fafc;
  }

  .pgr-row-baixo td:first-child {
    box-shadow:
      inset 3px 0 0 #16a34a,
      1px 0 0 #eef2f7;
  }

  .pgr-row-medio td:first-child {
    box-shadow:
      inset 3px 0 0 #f59e0b,
      1px 0 0 #eef2f7;
  }

  .pgr-row-alto td:first-child {
    box-shadow:
      inset 3px 0 0 #f97316,
      1px 0 0 #eef2f7;
  }

  .pgr-row-critico td:first-child {
    box-shadow:
      inset 3px 0 0 #dc2626,
      1px 0 0 #eef2f7;
  }

  .pgr-risco-info {
    display: flex;
    align-items: flex-start;

    gap: 12px;

    width: 260px;
    min-width: 260px;
  }

  .pgr-risco-icon {
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border: 1px solid #e2e8f0;
    border-radius: 10px;

    background: #f8fafc;

    color: #64748b;
  }

  .pgr-risco-textos {
    min-width: 0;
    flex: 1;
  }

  .pgr-risco-perigo {
    color: #0f172a;

    font-size: calc(13px * var(--sk-text-scale, 1));
    font-weight: 800;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  .pgr-risco-local {
    min-width: 0;

    display: flex;
    align-items: center;
    flex-wrap: wrap;

    gap: 5px;

    margin-top: 5px;

    color: #64748b;

    font-size: calc(11px * var(--sk-text-scale, 1));
    line-height: 1.45;
  }

  .pgr-risco-separador {
    color: #cbd5e1;
  }

  .pgr-risco-categoria {
    margin-top: 8px;
  }

  .pgr-avaliacao {
    min-width: 150px;
  }

  .pgr-avaliacao-topo {
    display: flex;
    align-items: center;

    gap: 9px;
  }

  .pgr-score {
    width: 35px;
    height: 35px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border: 1px solid transparent;
    border-radius: 10px;

    font-size: calc(13px * var(--sk-text-scale, 1));
    font-weight: 850;
  }

  .pgr-score-baixo {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #15803d;
  }

  .pgr-score-medio {
    border-color: #fde68a;
    background: #fffbeb;
    color: #b45309;
  }

  .pgr-score-alto {
    border-color: #fed7aa;
    background: #fff7ed;
    color: #c2410c;
  }

  .pgr-score-critico {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .pgr-matriz-info {
    display: flex;
    align-items: center;

    gap: 5px;

    margin-top: 8px;

    color: #94a3b8;

    font-size: calc(10px * var(--sk-text-scale, 1));
    font-weight: 700;

    white-space: nowrap;
  }

  .pgr-medida {
    width: 240px;
    max-width: 240px;

    color: #475569;

    font-size: calc(12px * var(--sk-text-scale, 1));
    line-height: 1.55;

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .pgr-medida-vazia {
    color: #94a3b8;
    font-style: italic;
  }

  .pgr-responsavel {
    display: flex;
    align-items: center;

    gap: 8px;

    width: 155px;
    min-width: 155px;

    color: #475569;

    font-size: calc(12px * var(--sk-text-scale, 1));
    font-weight: 600;
  }

  .pgr-responsavel-icon {
    width: 29px;
    height: 29px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 8px;

    background: #f1f5f9;
    color: #64748b;
  }

  .pgr-responsavel span {
    min-width: 0;

    overflow-wrap: anywhere;
  }

  .pgr-prazo {
    display: flex;
    align-items: center;

    gap: 7px;

    min-width: 120px;

    color: #475569;

    font-size: calc(12px * var(--sk-text-scale, 1));
    font-weight: 650;

    white-space: nowrap;
  }

  .pgr-prazo svg {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .pgr-prazo-vencido {
    color: #dc2626;
  }

  .pgr-prazo-vencido svg {
    color: #dc2626;
  }

  .pgr-prazo-alerta {
    display: inline-flex;

    margin-top: 7px;
    padding: 4px 7px;

    border: 1px solid #fecaca;
    border-radius: 999px;

    background: #fef2f2;
    color: #b91c1c;

    font-size: calc(9px * var(--sk-text-scale, 1));
    font-weight: 800;

    text-transform: uppercase;
    letter-spacing: .35px;

    white-space: nowrap;
  }

  .pgr-status-area {
    min-width: 122px;
  }

  .pgr-status-legenda {
    display: block;

    margin-top: 7px;

    color: #94a3b8;

    font-size: calc(9px * var(--sk-text-scale, 1));
    font-weight: 600;

    white-space: nowrap;
  }

  .pgr-acoes {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 7px;

    min-width: 78px;
  }

  .pgr-acao {
    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    padding: 0;

    border: 1px solid transparent;
    border-radius: 9px;

    cursor: pointer;

    transition:
      transform .15s ease,
      background .15s ease,
      border-color .15s ease,
      box-shadow .15s ease;
  }

  .pgr-acao:hover {
    transform: translateY(-1px);
  }

  .pgr-acao:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: 2px;
  }

  .pgr-acao-editar {
    border-color: #bfdbfe;
    background: #eff6ff;
    color: #2563eb;
  }

  .pgr-acao-editar:hover {
    background: #dbeafe;
    box-shadow:
      0 4px 12px
      rgba(37, 99, 235, .12);
  }

  .pgr-acao-excluir {
    border-color: #fecaca;
    background: #fef2f2;
    color: #dc2626;
  }

  .pgr-acao-excluir:hover {
    background: #fee2e2;
    box-shadow:
      0 4px 12px
      rgba(220, 38, 38, .10);
  }

  .pgr-table-empty {
    width: 100%;
    min-width: 0;
    min-height: 260px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 40px;

    box-sizing: border-box;

    background:
      linear-gradient(
        180deg,
        #ffffff 0%,
        #fbfdff 100%
      );

    border:
      1px dashed #cbd5e1;

    border-radius: 16px;

    text-align: center;
  }

  .pgr-table-empty-icon {
    width: 54px;
    height: 54px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 12px;

    border: 1px solid #bfdbfe;
    border-radius: 15px;

    background: #eff6ff;
    color: #2563eb;
  }

  .pgr-table-empty-kicker {
    margin-bottom: 7px;

    color: #2563eb;

    font-size: calc(9px * var(--sk-text-scale, 1));
    font-weight: 850;

    text-transform: uppercase;
    letter-spacing: .8px;
  }

  .pgr-table-empty strong {
    color: #0f172a;

    font-size: calc(15px * var(--sk-text-scale, 1));
    font-weight: 800;
  }

  .pgr-table-empty > span {
    margin-top: 7px;

    max-width: 420px;

    color: #94a3b8;

    font-size: calc(12px * var(--sk-text-scale, 1));
    line-height: 1.6;
  }

  @media (max-width: 900px) {
    .pgr-table-scroll-hint {
      display: block;
      text-align: right;
    }
  }

  @media (max-width: 650px) {
    .pgr-table-meta {
      align-items: flex-start;
      flex-direction: column;

      gap: 5px;

      margin-bottom: 9px;
    }

    .pgr-table-meta > div {
      width: 100%;

      justify-content: space-between;
    }

    .pgr-table-scroll-hint {
      font-size: calc(9px * var(--sk-text-scale, 1)) !important;
      text-align: left;
    }

    .pgr-table-container {
      border-radius: 12px;
    }

    .pgr-table {
      min-width: 1080px;
    }

    .pgr-table th {
      padding:
        12px 13px !important;
    }

    .pgr-table td {
      padding:
        14px 13px !important;
    }

    .pgr-risco-info {
      width: 225px;
      min-width: 225px;
    }

    .pgr-risco-perigo {
      font-size: calc(12px * var(--sk-text-scale, 1));
    }

    .pgr-medida {
      width: 205px;
      max-width: 205px;

      font-size: calc(11px * var(--sk-text-scale, 1));
    }

    .pgr-responsavel {
      width: 140px;
      min-width: 140px;

      font-size: calc(11px * var(--sk-text-scale, 1));
    }

    .pgr-table-empty {
      min-height: 220px;

      padding:
        28px 18px;
    }

    .pgr-table-empty > span {
      font-size: calc(11px * var(--sk-text-scale, 1));
    }
  }

  @media (max-width: 430px) {
    .pgr-table {
      min-width: 1030px;
    }

    .pgr-risco-info {
      width: 205px;
      min-width: 205px;
    }

    .pgr-risco-icon {
      width: 34px;
      height: 34px;
    }

    .pgr-medida {
      width: 190px;
      max-width: 190px;
    }

    .pgr-acao {
      width: 32px;
      height: 32px;
    }
  }
`;
