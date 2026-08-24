import {
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  X,
  Building2,
  Flame,
  ShieldCheck,
  UserRound,
  CalendarDays,
  Activity,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

import type { PgrItem } from "../../models/Pgr";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (risco: PgrItem) => void;
  editingItem: PgrItem | null;
}

const riscoInicial: PgrItem = {
  id: 0,

  setor: "",

  atividade: "",

  perigo: "",

  categoria: "Físico",

  probabilidade: 1,

  severidade: 1,

  nivel: 1,

  classificacao: "Baixo",

  medidaControle: "",

  responsavel: "",

  prazo: "",

  status: "Pendente",
};

export default function PgrDrawer({
  open,
  onClose,
  onSave,
  editingItem,
}: Props) {
  const [risco, setRisco] =
    useState<PgrItem>(
      riscoInicial
    );

  /*
   * CARREGAR EDIÇÃO
   */
  useEffect(() => {
    if (editingItem) {
      setRisco({
        ...editingItem,
      });
    } else {
      setRisco({
        ...riscoInicial,
      });
    }
  }, [
    editingItem,
    open,
  ]);

  /*
   * CALCULAR NÍVEL
   */
  useEffect(() => {
    const nivel =
      risco.probabilidade *
      risco.severidade;

    let classificacao: PgrItem["classificacao"] =
      "Baixo";

    if (nivel <= 4) {
      classificacao =
        "Baixo";
    } else if (
      nivel <= 9
    ) {
      classificacao =
        "Médio";
    } else if (
      nivel <= 16
    ) {
      classificacao =
        "Alto";
    } else {
      classificacao =
        "Crítico";
    }

    setRisco(
      (anterior) => ({
        ...anterior,

        nivel,

        classificacao,
      })
    );
  }, [
    risco.probabilidade,
    risco.severidade,
  ]);

  /*
   * BLOQUEAR SCROLL DA PÁGINA
   * E PERMITIR ESC PARA FECHAR
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const overflowAnterior =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function fecharComEsc(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [
    open,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  function salvar() {
    if (
      !risco.setor.trim() ||
      !risco.atividade.trim() ||
      !risco.perigo.trim()
    ) {
      window.alert(
        "Preencha pelo menos Setor, Atividade e Perigo."
      );

      return;
    }

    onSave(risco);
  }

  return (
    <div
      className="pgr-drawer-overlay"
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <aside className="pgr-drawer">
        {/* CABEÇALHO */}

        <header className="pgr-drawer-header">
          <div className="pgr-drawer-header-main">
            <div className="pgr-drawer-icon">
              <ShieldCheck
                size={22}
              />
            </div>

            <div className="pgr-drawer-title-area">
              <h2>
                {editingItem
                  ? "Editar risco"
                  : "Novo risco"}
              </h2>

              <p>
                Inventário e avaliação de
                riscos ocupacionais do PGR.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="pgr-drawer-close"
          >
            <X size={19} />
          </button>
        </header>

        {/* CONTEÚDO */}

        <div className="pgr-drawer-content">
          {/* IDENTIFICAÇÃO */}

          <Secao
            titulo="Identificação do risco"
            descricao="Informe onde o risco ocorre e qual perigo foi identificado."
          >
            <div className="pgr-drawer-grid-2">
              <Input
                label="Setor"
                placeholder="Ex.: Cozinha quente"
                value={
                  risco.setor
                }
                onChange={(e) =>
                  setRisco({
                    ...risco,

                    setor:
                      e.target.value,
                  })
                }
                icon={
                  <Building2
                    size={17}
                  />
                }
              />

              <Input
                label="Atividade"
                placeholder="Ex.: Fritura"
                value={
                  risco.atividade
                }
                onChange={(e) =>
                  setRisco({
                    ...risco,

                    atividade:
                      e.target.value,
                  })
                }
              />
            </div>

            <Input
              label="Perigo"
              placeholder="Ex.: Óleo em alta temperatura"
              value={
                risco.perigo
              }
              onChange={(e) =>
                setRisco({
                  ...risco,

                  perigo:
                    e.target.value,
                })
              }
              icon={
                <Flame size={17} />
              }
            />

            <CampoSelect
              label="Categoria"
              value={
                risco.categoria
              }
              onChange={(valor) =>
                setRisco({
                  ...risco,

                  categoria:
                    valor as PgrItem["categoria"],
                })
              }
              options={[
                "Físico",
                "Químico",
                "Biológico",
                "Ergonômico",
                "Acidente",
              ]}
            />
          </Secao>

          {/* AVALIAÇÃO */}

          <Secao
            titulo="Avaliação do risco"
            descricao="Defina probabilidade e severidade para calcular automaticamente o nível."
          >
            <div className="pgr-drawer-grid-2">
              <CampoNivel
                label="Probabilidade"
                value={
                  risco.probabilidade
                }
                onChange={(valor) =>
                  setRisco({
                    ...risco,

                    probabilidade:
                      valor,
                  })
                }
              />

              <CampoNivel
                label="Severidade"
                value={
                  risco.severidade
                }
                onChange={(valor) =>
                  setRisco({
                    ...risco,

                    severidade:
                      valor,
                  })
                }
              />
            </div>

            <div className="pgr-risk-result">
              <div>
                <div className="pgr-risk-result-label">
                  Nível calculado
                </div>

                <div className="pgr-risk-result-number">
                  {risco.nivel}
                </div>
              </div>

              <div className="pgr-risk-result-status">
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

                <span>
                  Probabilidade × Severidade
                </span>
              </div>
            </div>
          </Secao>

          {/* PLANO DE CONTROLE */}

          <Secao
            titulo="Plano de controle"
            descricao="Defina a medida preventiva, o responsável e o prazo."
          >
            <CampoTexto
              label="Medida de Controle"
              placeholder="Descreva a ação necessária para eliminar ou reduzir o risco..."
              value={
                risco.medidaControle
              }
              onChange={(valor) =>
                setRisco({
                  ...risco,

                  medidaControle:
                    valor,
                })
              }
            />

            <div className="pgr-drawer-grid-2">
              <Input
                label="Responsável"
                placeholder="Nome do responsável"
                value={
                  risco.responsavel
                }
                onChange={(e) =>
                  setRisco({
                    ...risco,

                    responsavel:
                      e.target.value,
                  })
                }
                icon={
                  <UserRound
                    size={17}
                  />
                }
              />

              <Input
                label="Prazo"
                type="date"
                value={
                  risco.prazo
                }
                onChange={(e) =>
                  setRisco({
                    ...risco,

                    prazo:
                      e.target.value,
                  })
                }
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
              />
            </div>

            <CampoSelect
              label="Status"
              value={
                risco.status
              }
              icon={
                <Activity
                  size={16}
                />
              }
              onChange={(valor) =>
                setRisco({
                  ...risco,

                  status:
                    valor as PgrItem["status"],
                })
              }
              options={[
                "Pendente",
                "Em andamento",
                "Concluído",
              ]}
            />
          </Secao>
        </div>

        {/* RODAPÉ */}

        <footer className="pgr-drawer-footer">
          <Button
            onClick={onClose}
            color="#64748B"
          >
            Cancelar
          </Button>

          <Button
            onClick={salvar}
          >
            {editingItem
              ? "Salvar alterações"
              : "Cadastrar risco"}
          </Button>
        </footer>
      </aside>

      <style>
        {`
          .pgr-drawer-overlay {
            position: fixed;
            inset: 0;

            display: flex;
            justify-content: flex-end;

            background: rgba(15, 23, 42, 0.48);
            backdrop-filter: blur(3px);

            z-index: 2000;
          }

          .pgr-drawer {
            width: 570px;
            max-width: 100%;
            height: 100vh;
            height: 100dvh;

            display: flex;
            flex-direction: column;

            box-sizing: border-box;

            background: #ffffff;

            box-shadow:
              -16px 0 45px
              rgba(15, 23, 42, 0.16);

            animation:
              pgrDrawerEntrada
              .22s ease-out;

            overflow: hidden;
          }

          .pgr-drawer-header {
            padding: 24px 26px;

            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;

            flex-shrink: 0;

            border-bottom:
              1px solid #e2e8f0;
          }

          .pgr-drawer-header-main {
            display: flex;

            gap: 13px;

            min-width: 0;
          }

          .pgr-drawer-icon {
            width: 44px;
            height: 44px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 12px;

            background: #eff6ff;
            color: #2563eb;
          }

          .pgr-drawer-title-area {
            min-width: 0;
          }

          .pgr-drawer-title-area h2 {
            margin: 0;

            color: #0f172a;

            font-size: 20px;
            font-weight: 800;

            line-height: 1.25;
          }

          .pgr-drawer-title-area p {
            margin: 5px 0 0;

            color: #64748b;

            font-size: 12px;
            line-height: 1.5;

            overflow-wrap: anywhere;
          }

          .pgr-drawer-close {
            width: 38px;
            height: 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border:
              1px solid #e2e8f0;

            border-radius: 10px;

            background: #ffffff;

            color: #64748b;

            cursor: pointer;
          }

          .pgr-drawer-content {
            flex: 1;

            min-height: 0;

            overflow-y: auto;
            overflow-x: hidden;

            padding:
              24px 26px 30px;

            box-sizing: border-box;

            -webkit-overflow-scrolling:
              touch;
          }

          .pgr-drawer-grid-2 {
            width: 100%;

            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 14px;

            min-width: 0;
          }

          .pgr-risk-result {
            width: 100%;

            margin-top: 4px;

            padding: 18px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 16px;

            box-sizing: border-box;

            background: #f8fafc;

            border:
              1px solid #e2e8f0;

            border-radius: 13px;
          }

          .pgr-risk-result-label {
            color: #64748b;

            font-size: 11px;
            font-weight: 800;

            text-transform: uppercase;

            letter-spacing: .5px;
          }

          .pgr-risk-result-number {
            margin-top: 5px;

            color: #0f172a;

            font-size: 31px;
            font-weight: 850;
          }

          .pgr-risk-result-status {
            display: flex;
            flex-direction: column;
            align-items: flex-end;

            gap: 7px;

            text-align: right;
          }

          .pgr-risk-result-status span {
            color: #94a3b8;

            font-size: 10px;

            line-height: 1.4;
          }

          .pgr-drawer-footer {
            padding: 17px 26px;

            display: flex;
            align-items: center;
            justify-content: flex-end;

            gap: 10px;

            flex-shrink: 0;

            box-sizing: border-box;

            border-top:
              1px solid #e2e8f0;

            background: #ffffff;

            padding-bottom:
              max(
                17px,
                env(
                  safe-area-inset-bottom
                )
              );
          }

          @keyframes pgrDrawerEntrada {
            from {
              transform:
                translateX(30px);

              opacity: 0;
            }

            to {
              transform:
                translateX(0);

              opacity: 1;
            }
          }

          @media (max-width: 650px) {
            .pgr-drawer {
              width: 100%;
              max-width: none;
            }

            .pgr-drawer-header {
              padding:
                18px 16px;

              gap: 12px;
            }

            .pgr-drawer-icon {
              width: 40px;
              height: 40px;

              border-radius: 11px;
            }

            .pgr-drawer-title-area h2 {
              font-size: 18px;
            }

            .pgr-drawer-title-area p {
              font-size: 11px;
            }

            .pgr-drawer-close {
              width: 36px;
              height: 36px;
            }

            .pgr-drawer-content {
              padding:
                20px 16px 26px;
            }

            .pgr-drawer-grid-2 {
              grid-template-columns:
                minmax(0, 1fr);

              gap: 0;
            }

            .pgr-risk-result {
              padding: 15px;
            }

            .pgr-drawer-footer {
              padding:
                14px 16px;

              padding-bottom:
                max(
                  14px,
                  env(
                    safe-area-inset-bottom
                  )
                );
            }

            .pgr-drawer-footer > * {
              flex: 1 1 0;
            }
          }

          @media (max-width: 430px) {
            .pgr-drawer-header {
              padding:
                16px 14px;
            }

            .pgr-drawer-content {
              padding:
                18px 14px 24px;
            }

            .pgr-risk-result {
              align-items:
                flex-start;

              flex-direction:
                column;
            }

            .pgr-risk-result-status {
              width: 100%;

              align-items:
                flex-start;

              text-align: left;
            }

            .pgr-drawer-footer {
              flex-direction:
                column;

              align-items:
                stretch;

              padding:
                12px 14px;

              padding-bottom:
                max(
                  12px,
                  env(
                    safe-area-inset-bottom
                  )
                );
            }

            .pgr-drawer-footer > * {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        width: "100%",

        minWidth: 0,

        marginBottom: 26,
      }}
    >
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            margin: 0,

            color: "#0F172A",

            fontSize: 14,

            fontWeight: 800,

            lineHeight: 1.4,
          }}
        >
          {titulo}
        </h3>

        <p
          style={{
            margin:
              "4px 0 0",

            color: "#94A3B8",

            fontSize: 11,

            lineHeight: 1.5,

            overflowWrap:
              "anywhere",
          }}
        >
          {descricao}
        </p>
      </div>

      {children}
    </section>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  options: string[];
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        marginBottom: 18,

        display: "flex",

        flexDirection:
          "column",

        gap: 8,
      }}
    >
      <label
        style={{
          color: "#334155",

          fontSize: 13,

          fontWeight: 650,
        }}
      >
        {label}
      </label>

      <div
        style={{
          width: "100%",

          minWidth: 0,

          position:
            "relative",
        }}
      >
        {icon && (
          <div
            style={{
              position:
                "absolute",

              left: 13,

              top: "50%",

              transform:
                "translateY(-50%)",

              display: "flex",

              color:
                "#94A3B8",

              pointerEvents:
                "none",
            }}
          >
            {icon}
          </div>
        )}

        <select
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          style={{
            width: "100%",

            minWidth: 0,

            height: 46,

            padding: icon
              ? "0 13px 0 40px"
              : "0 13px",

            boxSizing:
              "border-box",

            border:
              "1px solid #CBD5E1",

            borderRadius: 11,

            background:
              "#FFFFFF",

            color:
              "#0F172A",

            fontFamily:
              "inherit",

            fontSize: 13,

            outline:
              "none",

            cursor:
              "pointer",
          }}
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

function CampoNivel({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (
    valor: 1 | 2 | 3 | 4 | 5
  ) => void;
}) {
  const niveis: (
    | 1
    | 2
    | 3
    | 4
    | 5
  )[] = [
    1,
    2,
    3,
    4,
    5,
  ];

  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        marginBottom: 18,
      }}
    >
      <label
        style={{
          display: "block",

          marginBottom: 8,

          color: "#334155",

          fontSize: 13,

          fontWeight: 650,
        }}
      >
        {label}
      </label>

      <div
        style={{
          width: "100%",

          minWidth: 0,

          display: "grid",

          gridTemplateColumns:
            "repeat(5, minmax(0, 1fr))",

          gap: 6,
        }}
      >
        {niveis.map(
          (nivel) => {
            const ativo =
              value === nivel;

            return (
              <button
                key={nivel}
                type="button"
                onClick={() =>
                  onChange(
                    nivel
                  )
                }
                style={{
                  minWidth: 0,

                  height: 40,

                  padding: 0,

                  border: ativo
                    ? "1px solid #2563EB"
                    : "1px solid #CBD5E1",

                  borderRadius:
                    9,

                  background:
                    ativo
                      ? "#EFF6FF"
                      : "#FFFFFF",

                  color: ativo
                    ? "#2563EB"
                    : "#64748B",

                  fontWeight:
                    750,

                  cursor:
                    "pointer",
                }}
              >
                {nivel}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function CampoTexto({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div
      style={{
        width: "100%",

        minWidth: 0,

        marginBottom: 18,

        display: "flex",

        flexDirection:
          "column",

        gap: 8,
      }}
    >
      <label
        style={{
          color: "#334155",

          fontSize: 13,

          fontWeight: 650,
        }}
      >
        {label}
      </label>

      <textarea
        value={value}
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        rows={4}
        style={{
          width: "100%",

          minWidth: 0,

          boxSizing:
            "border-box",

          resize:
            "vertical",

          padding:
            "12px 13px",

          border:
            "1px solid #CBD5E1",

          borderRadius: 11,

          background:
            "#FFFFFF",

          color:
            "#0F172A",

          fontFamily:
            "inherit",

          fontSize: 13,

          lineHeight: 1.5,

          outline: "none",
        }}
      />
    </div>
  );
}