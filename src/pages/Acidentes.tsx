import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Ambulance,
  Plus,
  Search,
  TriangleAlert,
  Clock3,
  FileText,
  Pencil,
  Trash2,
  X,
  Link2,
  UserRound,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ExternalLink,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import type { PgrItem } from "../models/Pgr";

import { supabase } from "../lib/supabase";

type TipoOcorrencia =
  | "Acidente"
  | "Incidente"
  | "Quase acidente";

type Gravidade =
  | "Leve"
  | "Moderada"
  | "Grave"
  | "Crítica";

type SituacaoCAT =
  | "Não necessária"
  | "Pendente"
  | "Emitida";

type FiltroVinculo =
  | ""
  | "vinculado"
  | "nao-vinculado";

interface AcidenteItem {
  id: number;

  data: string;
  hora: string;

  funcionario: string;
  setor: string;

  tipo: TipoOcorrencia;
  gravidade: Gravidade;

  afastamento: boolean;
  diasAfastado: number;

  cat: SituacaoCAT;

  causa: string;
  acaoCorretiva: string;

  riscoPgrId: number | null;
}

interface AcidenteRow {
  id: number;

  data: string;
  hora: string;

  funcionario: string;
  setor: string;

  tipo: TipoOcorrencia;
  gravidade: Gravidade;

  afastamento: boolean;
  dias_afastado: number;

  cat: SituacaoCAT;

  causa: string;
  acao_corretiva: string;

  risco_pgr_id: number | null;
}

interface PgrRow {
  id: number;

  setor: string;
  atividade: string;
  perigo: string;

  categoria:
    PgrItem["categoria"];

  probabilidade:
    PgrItem["probabilidade"];

  severidade:
    PgrItem["severidade"];

  nivel: number;

  classificacao:
    PgrItem["classificacao"];

  medida_controle: string;

  responsavel: string;

  prazo: string | null;

  status:
    PgrItem["status"];
}

const CAMPOS_ACIDENTES = `
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
`;

const CAMPOS_PGR = `
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
`;

function criarRegistroInicial(): AcidenteItem {
  return {
    id: 0,

    data: dataHoje(),
    hora: "",

    funcionario: "",
    setor: "",

    tipo: "Acidente",
    gravidade: "Leve",

    afastamento: false,
    diasAfastado: 0,

    cat: "Não necessária",

    causa: "",
    acaoCorretiva: "",

    riscoPgrId: null,
  };
}

function converterAcidente(
  linha: AcidenteRow
): AcidenteItem {
  return {
    id:
      linha.id,

    data:
      linha.data,

    hora:
      linha.hora
        ? linha.hora.slice(
            0,
            5
          )
        : "",

    funcionario:
      linha.funcionario,

    setor:
      linha.setor,

    tipo:
      linha.tipo,

    gravidade:
      linha.gravidade,

    afastamento:
      linha.afastamento,

    diasAfastado:
      Math.max(
        0,
        Number(
          linha.dias_afastado ??
            0
        )
      ),

    cat:
      linha.cat,

    causa:
      linha.causa ??
      "",

    acaoCorretiva:
      linha.acao_corretiva ??
      "",

    riscoPgrId:
      linha.risco_pgr_id ??
      null,
  };
}

function converterPgr(
  linha: PgrRow
): PgrItem {
  return {
    id:
      linha.id,

    setor:
      linha.setor,

    atividade:
      linha.atividade,

    perigo:
      linha.perigo,

    categoria:
      linha.categoria,

    probabilidade:
      linha.probabilidade,

    severidade:
      linha.severidade,

    nivel:
      linha.nivel,

    classificacao:
      linha.classificacao,

    medidaControle:
      linha.medida_controle,

    responsavel:
      linha.responsavel,

    prazo:
      linha.prazo ??
      "",

    status:
      linha.status,
  };
}

function criarPayloadAcidente(
  registro: AcidenteItem
) {
  return {
    data:
      registro.data,

    hora:
      registro.hora,

    funcionario:
      registro.funcionario.trim(),

    setor:
      registro.setor.trim(),

    tipo:
      registro.tipo,

    gravidade:
      registro.gravidade,

    afastamento:
      registro.afastamento,

    dias_afastado:
      registro.afastamento
        ? Math.max(
            0,
            registro.diasAfastado
          )
        : 0,

    cat:
      registro.cat,

    causa:
      registro.causa.trim(),

    acao_corretiva:
      registro.acaoCorretiva.trim(),

    risco_pgr_id:
      registro.riscoPgrId,
  };
}

function useViewportWidth() {
  const [
    largura,
    setLargura,
  ] =
    useState(() =>
      typeof window !== "undefined"
        ? window.innerWidth
        : 1440
    );

  useEffect(() => {
    function atualizar() {
      setLargura(
        window.innerWidth
      );
    }

    atualizar();

    window.addEventListener(
      "resize",
      atualizar
    );

    return () => {
      window.removeEventListener(
        "resize",
        atualizar
      );
    };
  }, []);

  return largura;
}

export default function Acidentes() {
  const navigate =
    useNavigate();

  const largura =
    useViewportWidth();

  const mobile =
    largura <= 650;

  const mobilePequeno =
    largura <= 430;

  const tablet =
    largura <= 900;

  const telaMedia =
    largura <= 1200;

  const [
    acidentes,
    setAcidentes,
  ] =
    useState<AcidenteItem[]>(
      []
    );

  const [
    pgr,
    setPgr,
  ] =
    useState<PgrItem[]>(
      []
    );

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    erroBanco,
    setErroBanco,
  ] =
    useState("");

  const [
    salvando,
    setSalvando,
  ] =
    useState(false);

  const [
    pesquisa,
    setPesquisa,
  ] =
    useState("");

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState<
      TipoOcorrencia | ""
    >("");

  const [
    filtroGravidade,
    setFiltroGravidade,
  ] =
    useState<
      Gravidade | ""
    >("");

  const [
    filtroVinculo,
    setFiltroVinculo,
  ] =
    useState<FiltroVinculo>(
      ""
    );

  const [
    drawerAberto,
    setDrawerAberto,
  ] =
    useState(false);

  const [
    editando,
    setEditando,
  ] =
    useState<AcidenteItem | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<AcidenteItem>(
      criarRegistroInicial()
    );

  /*
   * CARREGAR DADOS DO SUPABASE
   */

  useEffect(() => {
    let componenteAtivo =
      true;

    async function carregarDados() {
      setCarregando(
        true
      );

      setErroBanco(
        ""
      );

      const [
        resultadoAcidentes,
        resultadoPgr,
      ] =
        await Promise.all([
          supabase
            .from(
              "acidentes"
            )
            .select(
              CAMPOS_ACIDENTES
            )
            .order(
              "data",
              {
                ascending:
                  false,
              }
            )
            .order(
              "id",
              {
                ascending:
                  false,
              }
            ),

          supabase
            .from(
              "pgr"
            )
            .select(
              CAMPOS_PGR
            )
            .order(
              "id",
              {
                ascending:
                  true,
              }
            ),
        ]);

      if (
        !componenteAtivo
      ) {
        return;
      }

      if (
        resultadoAcidentes.error
      ) {
        console.error(
          "Erro ao carregar acidentes:",
          resultadoAcidentes.error
        );

        setAcidentes(
          []
        );

        setPgr(
          []
        );

        setErroBanco(
          "Não foi possível carregar as ocorrências."
        );

        setCarregando(
          false
        );

        return;
      }

      if (
        resultadoPgr.error
      ) {
        console.error(
          "Erro ao carregar PGR em acidentes:",
          resultadoPgr.error
        );

        setAcidentes(
          (
            (
              resultadoAcidentes.data ??
              []
            ) as AcidenteRow[]
          ).map(
            converterAcidente
          )
        );

        setPgr(
          []
        );

        setErroBanco(
          "As ocorrências foram carregadas, mas não foi possível carregar os riscos do PGR."
        );

        setCarregando(
          false
        );

        return;
      }

      setAcidentes(
        (
          (
            resultadoAcidentes.data ??
            []
          ) as AcidenteRow[]
        ).map(
          converterAcidente
        )
      );

      setPgr(
        (
          (
            resultadoPgr.data ??
            []
          ) as PgrRow[]
        ).map(
          converterPgr
        )
      );

      setCarregando(
        false
      );
    }

    void carregarDados();

    return () => {
      componenteAtivo =
        false;
    };
  }, []);

  /*
   * BLOQUEIO DO BODY
   * E TECLA ESC NO DRAWER
   */

  useEffect(() => {
    if (
      !drawerAberto
    ) {
      return;
    }

    const overflowAnterior =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    function fecharComEsc(
      evento: KeyboardEvent
    ) {
      if (
        evento.key ===
        "Escape"
      ) {
        setDrawerAberto(
          false
        );

        setEditando(
          null
        );

        setFormulario(
          criarRegistroInicial()
        );
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      document.body.style
        .overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [
    drawerAberto,
  ]);

  /*
   * PGR ORDENADO
   */

  const pgrOrdenado =
    useMemo(() => {
      const peso: Record<
        PgrItem["classificacao"],
        number
      > = {
        Baixo: 1,
        Médio: 2,
        Alto: 3,
        Crítico: 4,
      };

      return [
        ...pgr,
      ].sort(
        (
          a,
          b
        ) =>
          peso[
            b.classificacao
          ] -
          peso[
            a.classificacao
          ]
      );
    }, [
      pgr,
    ]);

  /*
   * RISCO SELECIONADO
   */

  const riscoSelecionado =
    useMemo(() => {
      if (
        formulario.riscoPgrId ===
        null
      ) {
        return null;
      }

      return (
        pgr.find(
          (
            risco
          ) =>
            risco.id ===
            formulario.riscoPgrId
        ) ??
        null
      );
    }, [
      formulario.riscoPgrId,
      pgr,
    ]);

  /*
   * INDICADORES
   */

  const totalAcidentes =
    acidentes.filter(
      (
        registro
      ) =>
        registro.tipo ===
        "Acidente"
    ).length;

  const totalGraves =
    acidentes.filter(
      (
        registro
      ) =>
        registro.gravidade ===
          "Grave" ||
        registro.gravidade ===
          "Crítica"
    ).length;

  const totalAfastamentos =
    acidentes.filter(
      (
        registro
      ) =>
        registro.afastamento
    ).length;

  const vinculadosPgr =
    acidentes.filter(
      (
        registro
      ) =>
        registro.riscoPgrId !==
          null &&
        pgr.some(
          (
            risco
          ) =>
            risco.id ===
            registro.riscoPgrId
        )
    ).length;

  const catPendentes =
    acidentes.filter(
      (
        registro
      ) =>
        registro.cat ===
        "Pendente"
    ).length;

  /*
   * FILTROS
   */

  const acidentesFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return acidentes.filter(
        (
          registro
        ) => {
          const risco =
            registro.riscoPgrId
              ? pgr.find(
                  (
                    item
                  ) =>
                    item.id ===
                    registro.riscoPgrId
                )
              : null;

          const correspondePesquisa =
            !termo ||
            registro.funcionario
              .toLowerCase()
              .includes(
                termo
              ) ||
            registro.setor
              .toLowerCase()
              .includes(
                termo
              ) ||
            registro.causa
              .toLowerCase()
              .includes(
                termo
              ) ||
            registro.tipo
              .toLowerCase()
              .includes(
                termo
              ) ||
            risco?.perigo
              .toLowerCase()
              .includes(
                termo
              ) ||
            risco?.atividade
              .toLowerCase()
              .includes(
                termo
              );

          const correspondeTipo =
            !filtroTipo ||
            registro.tipo ===
              filtroTipo;

          const correspondeGravidade =
            !filtroGravidade ||
            registro.gravidade ===
              filtroGravidade;

          const possuiVinculo =
            registro.riscoPgrId !==
              null &&
            pgr.some(
              (
                riscoPgr
              ) =>
                riscoPgr.id ===
                registro.riscoPgrId
            );

          const correspondeVinculo =
            !filtroVinculo ||
            (
              filtroVinculo ===
                "vinculado" &&
              possuiVinculo
            ) ||
            (
              filtroVinculo ===
                "nao-vinculado" &&
              !possuiVinculo
            );

          return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeGravidade &&
            correspondeVinculo
          );
        }
      );
    }, [
      acidentes,
      pesquisa,
      filtroTipo,
      filtroGravidade,
      filtroVinculo,
      pgr,
    ]);

  const filtrosAtivos =
    pesquisa.trim() !==
      "" ||
    filtroTipo !==
      "" ||
    filtroGravidade !==
      "" ||
    filtroVinculo !==
      "";

  /*
   * CRUD
   */

  function abrirNovoRegistro() {
    setEditando(
      null
    );

    setErroBanco(
      ""
    );

    setFormulario(
      criarRegistroInicial()
    );

    setDrawerAberto(
      true
    );
  }

  function editarRegistro(
    registro: AcidenteItem
  ) {
    setEditando(
      registro
    );

    setErroBanco(
      ""
    );

    setFormulario({
      ...registro,
    });

    setDrawerAberto(
      true
    );
  }

  function fecharDrawer() {
    setDrawerAberto(
      false
    );

    setEditando(
      null
    );

    setFormulario(
      criarRegistroInicial()
    );
  }

  async function salvarRegistro() {
    if (
      salvando
    ) {
      return;
    }

    if (
      !formulario.data ||
      !formulario.hora ||
      !formulario.funcionario.trim() ||
      !formulario.setor.trim()
    ) {
      window.alert(
        "Preencha Data, Hora, Funcionário e Setor."
      );

      return;
    }

    if (
      formulario.riscoPgrId !==
        null &&
      !pgr.some(
        (
          risco
        ) =>
          risco.id ===
          formulario.riscoPgrId
      )
    ) {
      window.alert(
        "O risco relacionado não existe mais no PGR. Selecione outro risco ou remova o vínculo."
      );

      return;
    }

    const registroFinal: AcidenteItem =
      {
        ...formulario,

        funcionario:
          formulario.funcionario.trim(),

        setor:
          formulario.setor.trim(),

        causa:
          formulario.causa.trim(),

        acaoCorretiva:
          formulario.acaoCorretiva.trim(),

        diasAfastado:
          formulario.afastamento
            ? Math.max(
                0,
                formulario.diasAfastado
              )
            : 0,
      };

    const payload =
      criarPayloadAcidente(
        registroFinal
      );

    setSalvando(
      true
    );

    setErroBanco(
      ""
    );

    try {
      if (
        editando
      ) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "acidentes"
            )
            .update(
              payload
            )
            .eq(
              "id",
              editando.id
            )
            .select(
              CAMPOS_ACIDENTES
            )
            .single();

        if (
          error ||
          !data
        ) {
          console.error(
            "Erro ao atualizar ocorrência:",
            error
          );

          setErroBanco(
            "Não foi possível atualizar a ocorrência."
          );

          return;
        }

        const atualizado =
          converterAcidente(
            data as AcidenteRow
          );

        setAcidentes(
          (
            listaAtual
          ) =>
            listaAtual.map(
              (
                registro
              ) =>
                registro.id ===
                atualizado.id
                  ? atualizado
                  : registro
            )
        );
      } else {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "acidentes"
            )
            .insert(
              payload
            )
            .select(
              CAMPOS_ACIDENTES
            )
            .single();

        if (
          error ||
          !data
        ) {
          console.error(
            "Erro ao cadastrar ocorrência:",
            error
          );

          setErroBanco(
            "Não foi possível registrar a ocorrência."
          );

          return;
        }

        const novoRegistro =
          converterAcidente(
            data as AcidenteRow
          );

        setAcidentes(
          (
            listaAtual
          ) => [
            novoRegistro,
            ...listaAtual,
          ]
        );
      }

      fecharDrawer();
    } finally {
      setSalvando(
        false
      );
    }
  }

  async function excluirRegistro(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este registro?"
      );

    if (
      !confirmar
    ) {
      return;
    }

    setErroBanco(
      ""
    );

    const {
      error,
    } =
      await supabase
        .from(
          "acidentes"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      console.error(
        "Erro ao excluir ocorrência:",
        error
      );

      setErroBanco(
        "Não foi possível excluir a ocorrência."
      );

      return;
    }

    setAcidentes(
      (
        listaAtual
      ) =>
        listaAtual.filter(
          (
            registro
          ) =>
            registro.id !==
            id
        )
    );
  }

  /*
   * INTEGRAÇÃO COM PGR
   */

  function selecionarRiscoPgr(
    valor: string
  ) {
    if (
      !valor
    ) {
      setFormulario(
        (
          atual
        ) => ({
          ...atual,

          riscoPgrId:
            null,
        })
      );

      return;
    }

    const id =
      Number(
        valor
      );

    const risco =
      pgr.find(
        (
          item
        ) =>
          item.id ===
          id
      );

    setFormulario(
      (
        atual
      ) => ({
        ...atual,

        riscoPgrId:
          id,

        setor:
          atual.setor.trim() ||
          risco?.setor ||
          "",
      })
    );
  }

  function buscarRiscoPgr(
    id: number | null
  ) {
    if (
      id === null
    ) {
      return null;
    }

    return (
      pgr.find(
        (
          risco
        ) =>
          risco.id ===
          id
      ) ??
      null
    );
  }

  function limparFiltros() {
    setPesquisa(
      ""
    );

    setFiltroTipo(
      ""
    );

    setFiltroGravidade(
      ""
    );

    setFiltroVinculo(
      ""
    );
  }

  return (
    <main
      style={{
        width:
          "100%",

        minWidth:
          0,

        padding:
          mobile
            ? "18px 14px 28px"
            : tablet
              ? "24px 20px 32px"
              : "32px",

        boxSizing:
          "border-box",

        overflowX:
          "hidden",
      }}
    >
      {/* CABEÇALHO */}

      <PageHeader
        title="Acidentes e Incidentes"
        subtitle="Registro, investigação e relacionamento das ocorrências com os riscos identificados no PGR."
        icon={
          Ambulance
        }
      >
        <div
          style={{
            width:
              mobile
                ? "100%"
                : "auto",

            display:
              "flex",

            flexDirection:
              mobilePequeno
                ? "column"
                : "row",

            alignItems:
              mobilePequeno
                ? "stretch"
                : "center",

            gap:
              10,
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/pgr"
              )
            }
            style={{
              ...botaoSecundario,

              justifyContent:
                "center",

              width:
                mobilePequeno
                  ? "100%"
                  : "auto",
            }}
          >
            <ShieldCheck
              size={
                17
              }
            />

            Abrir PGR
          </button>

          <Button
            onClick={
              abrirNovoRegistro
            }
          >
            <span
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  8,
              }}
            >
              <Plus
                size={
                  18
                }
              />

              Nova Ocorrência
            </span>
          </Button>
        </div>
      </PageHeader>

      {/* ERRO */}

      {erroBanco && (
        <div
          role="alert"
          style={{
            width:
              "100%",

            display:
              "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap:
              14,

            marginBottom:
              20,

            padding:
              "13px 15px",

            boxSizing:
              "border-box",

            border:
              "1px solid #FECACA",

            borderRadius:
              12,

            background:
              "#FEF2F2",

            color:
              "#B91C1C",

            fontSize:
              12,

            fontWeight:
              650,

            lineHeight:
              1.5,
          }}
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "flex-start",

              gap:
                9,
            }}
          >
            <TriangleAlert
              size={
                17
              }
              style={{
                flexShrink:
                  0,

                marginTop:
                  1,
              }}
            />

            <span>
              {
                erroBanco
              }
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setErroBanco(
                ""
              )
            }
            aria-label="Fechar aviso"
            style={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink:
                0,

              padding:
                2,

              border:
                "none",

              background:
                "transparent",

              color:
                "#B91C1C",

              cursor:
                "pointer",
            }}
          >
            <X
              size={
                16
              }
            />
          </button>
        </div>
      )}

      {/* INDICADORES */}

      <div
        style={{
          width:
            "100%",

          minWidth:
            0,

          display:
            "grid",

          gridTemplateColumns:
            mobile
              ? "minmax(0, 1fr)"
              : telaMedia
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(6, minmax(0, 1fr))",

          gap:
            mobile
              ? 12
              : 20,

          marginBottom:
            mobile
              ? 18
              : 28,
        }}
      >
        <StatCard
          title="Total de Registros"
          value={
            acidentes.length
          }
          icon={
            <FileText
              size={
                22
              }
            />
          }
          color="#2563EB"
        />

        <StatCard
          title="Acidentes"
          value={
            totalAcidentes
          }
          icon={
            <Ambulance
              size={
                22
              }
            />
          }
          color="#DC2626"
        />

        <StatCard
          title="Graves / Críticos"
          value={
            totalGraves
          }
          icon={
            <TriangleAlert
              size={
                22
              }
            />
          }
          color="#F97316"
        />

        <StatCard
          title="Com Afastamento"
          value={
            totalAfastamentos
          }
          icon={
            <Clock3
              size={
                22
              }
            />
          }
          color="#7C3AED"
        />

        <StatCard
          title="Vinculados ao PGR"
          value={
            vinculadosPgr
          }
          icon={
            <Link2
              size={
                22
              }
            />
          }
          color="#16A34A"
        />

        <StatCard
          title="CAT Pendente"
          value={
            catPendentes
          }
          icon={
            <AlertCircle
              size={
                22
              }
            />
          }
          color="#F59E0B"
        />
      </div>

      {/* PAINEL */}

      <section
        style={{
          width:
            "100%",

          minWidth:
            0,

          boxSizing:
            "border-box",

          background:
            "#FFFFFF",

          border:
            "1px solid #E2E8F0",

          borderRadius:
            mobile
              ? 14
              : 18,

          padding:
            mobile
              ? 16
              : 24,

          boxShadow:
            "0 6px 20px rgba(15,23,42,.04)",

          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            minWidth:
              0,

            marginBottom:
              mobile
                ? 17
                : 20,
          }}
        >
          <h2
            style={{
              margin:
                0,

              color:
                "#0F172A",

              fontSize:
                mobile
                  ? 16
                  : 18,

              fontWeight:
                800,

              lineHeight:
                1.3,
            }}
          >
            Histórico de Ocorrências
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",

              color:
                "#94A3B8",

              fontSize:
                12,

              lineHeight:
                1.5,

              overflowWrap:
                "anywhere",
            }}
          >
            Consulte acidentes,
            incidentes, causas,
            gravidade e riscos
            relacionados.
          </p>
        </div>

        {/* FILTROS */}

        <div
          style={{
            width:
              "100%",

            minWidth:
              0,

            padding:
              mobile
                ? 14
                : 18,

            boxSizing:
              "border-box",

            marginBottom:
              mobile
                ? 16
                : 22,

            background:
              "#F8FAFC",

            border:
              "1px solid #E2E8F0",

            borderRadius:
              mobile
                ? 12
                : 14,
          }}
        >
          <div
            style={{
              display:
                "flex",

              flexDirection:
                mobilePequeno
                  ? "column"
                  : "row",

              alignItems:
                mobilePequeno
                  ? "flex-start"
                  : "center",

              justifyContent:
                "space-between",

              gap:
                10,

              marginBottom:
                14,

              minWidth:
                0,
            }}
          >
            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  8,

                minWidth:
                  0,

                color:
                  "#475569",

                fontSize:
                  12,

                fontWeight:
                  700,
              }}
            >
              <SlidersHorizontal
                size={
                  16
                }
                style={{
                  flexShrink:
                    0,
                }}
              />

              Filtros de ocorrências
            </div>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={
                  limparFiltros
                }
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    5,

                  padding:
                    0,

                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#2563EB",

                  fontSize:
                    11,

                  fontWeight:
                    700,

                  whiteSpace:
                    "nowrap",

                  cursor:
                    "pointer",
                }}
              >
                <X
                  size={
                    13
                  }
                />

                Limpar filtros
              </button>
            )}
          </div>

          <div
            style={{
              width:
                "100%",

              minWidth:
                0,

              display:
                "grid",

              gridTemplateColumns:
                mobile
                  ? "minmax(0, 1fr)"
                  : tablet
                    ? "repeat(2, minmax(0, 1fr))"
                    : "minmax(280px, 2fr) repeat(3, minmax(160px, 1fr))",

              gap:
                mobile
                  ? 10
                  : 12,
            }}
          >
            <div
              style={{
                width:
                  "100%",

                minWidth:
                  0,

                height:
                  44,

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  10,

                padding:
                  "0 13px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid #CBD5E1",

                borderRadius:
                  10,

                background:
                  "#FFFFFF",
              }}
            >
              <Search
                size={
                  17
                }
                color="#94A3B8"
                style={{
                  flexShrink:
                    0,
                }}
              />

              <input
                type="text"
                value={
                  pesquisa
                }
                placeholder={
                  mobile
                    ? "Pesquisar ocorrências..."
                    : "Pesquisar funcionário, setor, causa ou risco..."
                }
                onChange={(
                  e
                ) =>
                  setPesquisa(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",

                  minWidth:
                    0,

                  flex:
                    1,

                  border:
                    "none",

                  outline:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#0F172A",

                  fontFamily:
                    "inherit",

                  fontSize:
                    12,
                }}
              />
            </div>

            <select
              value={
                filtroTipo
              }
              onChange={(
                e
              ) =>
                setFiltroTipo(
                  e.target.value as
                    | TipoOcorrencia
                    | ""
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todos os tipos
              </option>

              <option value="Acidente">
                Acidente
              </option>

              <option value="Incidente">
                Incidente
              </option>

              <option value="Quase acidente">
                Quase acidente
              </option>
            </select>

            <select
              value={
                filtroGravidade
              }
              onChange={(
                e
              ) =>
                setFiltroGravidade(
                  e.target.value as
                    | Gravidade
                    | ""
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todas as gravidades
              </option>

              <option value="Leve">
                Leve
              </option>

              <option value="Moderada">
                Moderada
              </option>

              <option value="Grave">
                Grave
              </option>

              <option value="Crítica">
                Crítica
              </option>
            </select>

            <select
              value={
                filtroVinculo
              }
              onChange={(
                e
              ) =>
                setFiltroVinculo(
                  e.target.value as FiltroVinculo
                )
              }
              style={
                estiloSelect
              }
            >
              <option value="">
                Todos os vínculos
              </option>

              <option value="vinculado">
                Vinculado ao PGR
              </option>

              <option value="nao-vinculado">
                Sem vínculo
              </option>
            </select>
          </div>

          <div
            style={{
              marginTop:
                11,

              color:
                "#64748B",

              fontSize:
                11,

              lineHeight:
                1.5,
            }}
          >
            Exibindo{" "}
            <strong
              style={{
                color:
                  "#0F172A",
              }}
            >
              {
                acidentesFiltrados.length
              }
            </strong>{" "}
            de{" "}
            <strong
              style={{
                color:
                  "#0F172A",
              }}
            >
              {
                acidentes.length
              }
            </strong>{" "}
            ocorrência(s)
          </div>
        </div>

        {/* TABELA */}

        {carregando ? (
          <div
            style={{
              width:
                "100%",

              padding:
                mobile
                  ? "34px 16px"
                  : "46px 20px",

              boxSizing:
                "border-box",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                14,

              background:
                "#FFFFFF",

              color:
                "#64748B",

              fontSize:
                12,

              fontWeight:
                600,

              textAlign:
                "center",
            }}
          >
            Carregando ocorrências...
          </div>
        ) : acidentesFiltrados.length ===
          0 ? (
          <EstadoVazio
            mobile={
              mobile
            }
          />
        ) : (
          <div
            style={{
              width:
                "100%",

              maxWidth:
                "100%",

              minWidth:
                0,

              overflowX:
                "auto",

              overflowY:
                "hidden",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                mobile
                  ? 12
                  : 14,

              WebkitOverflowScrolling:
                "touch",
            }}
          >
            <table
              style={{
                width:
                  "100%",

                minWidth:
                  mobile
                    ? 1000
                    : 1160,

                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#F8FAFC",
                  }}
                >
                  <Th>
                    Ocorrência
                  </Th>

                  <Th>
                    Funcionário / Local
                  </Th>

                  <Th>
                    Gravidade
                  </Th>

                  <Th>
                    Risco do PGR
                  </Th>

                  <Th>
                    Afastamento
                  </Th>

                  <Th>
                    CAT
                  </Th>

                  <Th align="center">
                    Ações
                  </Th>
                </tr>
              </thead>

              <tbody>
                {acidentesFiltrados.map(
                  (
                    registro
                  ) => {
                    const risco =
                      buscarRiscoPgr(
                        registro.riscoPgrId
                      );

                    const vinculoRemovido =
                      registro.riscoPgrId !==
                        null &&
                      !risco;

                    return (
                      <tr
                        key={
                          registro.id
                        }
                        style={{
                          borderTop:
                            "1px solid #E2E8F0",
                        }}
                      >
                        {/* OCORRÊNCIA */}

                        <Td>
                          <div
                            style={{
                              minWidth:
                                155,
                            }}
                          >
                            <Badge
                              color={
                                registro.tipo ===
                                "Acidente"
                                  ? "red"
                                  : registro.tipo ===
                                      "Incidente"
                                    ? "orange"
                                    : "yellow"
                              }
                            >
                              {
                                registro.tipo
                              }
                            </Badge>

                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  6,

                                marginTop:
                                  9,

                                color:
                                  "#64748B",

                                fontSize:
                                  11,

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              <CalendarDays
                                size={
                                  14
                                }
                                style={{
                                  flexShrink:
                                    0,
                                }}
                              />

                              {formatarData(
                                registro.data
                              )}

                              {registro.hora &&
                                ` • ${registro.hora}`}
                            </div>
                          </div>
                        </Td>

                        {/* FUNCIONÁRIO */}

                        <Td>
                          <div
                            style={{
                              width:
                                180,

                              minWidth:
                                180,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "flex-start",

                                gap:
                                  7,

                                color:
                                  "#0F172A",

                                fontSize:
                                  13,

                                fontWeight:
                                  700,
                              }}
                            >
                              <UserRound
                                size={
                                  15
                                }
                                style={{
                                  flexShrink:
                                    0,

                                  marginTop:
                                    1,
                                }}
                              />

                              <span
                                style={{
                                  minWidth:
                                    0,

                                  overflowWrap:
                                    "anywhere",
                                }}
                              >
                                {
                                  registro.funcionario
                                }
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "flex-start",

                                gap:
                                  7,

                                marginTop:
                                  6,

                                color:
                                  "#64748B",

                                fontSize:
                                  11,
                              }}
                            >
                              <MapPin
                                size={
                                  14
                                }
                                style={{
                                  flexShrink:
                                    0,

                                  marginTop:
                                    1,
                                }}
                              />

                              <span
                                style={{
                                  minWidth:
                                    0,

                                  overflowWrap:
                                    "anywhere",
                                }}
                              >
                                {
                                  registro.setor
                                }
                              </span>
                            </div>
                          </div>
                        </Td>

                        {/* GRAVIDADE */}

                        <Td>
                          <Badge
                            color={
                              registro.gravidade ===
                              "Crítica"
                                ? "red"
                                : registro.gravidade ===
                                    "Grave"
                                  ? "orange"
                                  : registro.gravidade ===
                                      "Moderada"
                                    ? "yellow"
                                    : "green"
                            }
                          >
                            {
                              registro.gravidade
                            }
                          </Badge>
                        </Td>

                        {/* PGR */}

                        <Td>
                          {risco ? (
                            <div
                              style={{
                                width:
                                  210,

                                minWidth:
                                  210,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "flex-start",

                                  gap:
                                    7,

                                  color:
                                    "#0F172A",

                                  fontSize:
                                    12,

                                  fontWeight:
                                    700,
                                }}
                              >
                                <Link2
                                  size={
                                    14
                                  }
                                  style={{
                                    flexShrink:
                                      0,

                                    marginTop:
                                      1,
                                  }}
                                />

                                <span
                                  style={{
                                    minWidth:
                                      0,

                                    overflowWrap:
                                      "anywhere",
                                  }}
                                >
                                  {
                                    risco.perigo
                                  }
                                </span>
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    5,

                                  color:
                                    "#64748B",

                                  fontSize:
                                    10,

                                  lineHeight:
                                    1.4,

                                  overflowWrap:
                                    "anywhere",
                                }}
                              >
                                {
                                  risco.setor
                                }{" "}
                                •{" "}
                                {
                                  risco.categoria
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    7,
                                }}
                              >
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
                              </div>
                            </div>
                          ) : vinculoRemovido ? (
                            <div
                              style={{
                                minWidth:
                                  170,
                              }}
                            >
                              <Badge color="red">
                                Vínculo inválido
                              </Badge>

                              <div
                                style={{
                                  marginTop:
                                    5,

                                  color:
                                    "#94A3B8",

                                  fontSize:
                                    10,
                                }}
                              >
                                O risco foi removido do PGR.
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                color:
                                  "#94A3B8",

                                fontSize:
                                  11,

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              Não vinculado
                            </span>
                          )}
                        </Td>

                        {/* AFASTAMENTO */}

                        <Td>
                          {registro.afastamento ? (
                            <Badge color="red">
                              {
                                registro.diasAfastado
                              }{" "}
                              dia(s)
                            </Badge>
                          ) : (
                            <Badge color="green">
                              Sem afastamento
                            </Badge>
                          )}
                        </Td>

                        {/* CAT */}

                        <Td>
                          <Badge
                            color={
                              registro.cat ===
                              "Emitida"
                                ? "green"
                                : registro.cat ===
                                    "Pendente"
                                  ? "yellow"
                                  : "gray"
                            }
                          >
                            {
                              registro.cat
                            }
                          </Badge>
                        </Td>

                        {/* AÇÕES */}

                        <Td align="center">
                          <div
                            style={{
                              display:
                                "flex",

                              justifyContent:
                                "center",

                              gap:
                                7,

                              minWidth:
                                122,
                            }}
                          >
                            {risco && (
                              <button
                                type="button"
                                title="Abrir PGR"
                                aria-label="Abrir PGR"
                                onClick={() =>
                                  navigate(
                                    "/pgr"
                                  )
                                }
                                style={{
                                  ...botaoAcao,

                                  background:
                                    "#F0FDF4",

                                  color:
                                    "#16A34A",
                                }}
                              >
                                <ExternalLink
                                  size={
                                    16
                                  }
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Editar ocorrência"
                              aria-label="Editar ocorrência"
                              onClick={() =>
                                editarRegistro(
                                  registro
                                )
                              }
                              style={{
                                ...botaoAcao,

                                background:
                                  "#EFF6FF",

                                color:
                                  "#2563EB",
                              }}
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Excluir ocorrência"
                              aria-label="Excluir ocorrência"
                              onClick={() =>
                                excluirRegistro(
                                  registro.id
                                )
                              }
                              style={{
                                ...botaoAcao,

                                background:
                                  "#FEF2F2",

                                color:
                                  "#DC2626",
                              }}
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DRAWER */}

      {drawerAberto && (
        <div
          className="acidentes-drawer-overlay"
          onMouseDown={(
            e
          ) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              fecharDrawer();
            }
          }}
        >
          <aside className="acidentes-drawer">
            {/* HEADER */}

            <header className="acidentes-drawer-header">
              <div className="acidentes-drawer-header-main">
                <div className="acidentes-drawer-icon">
                  <Ambulance
                    size={
                      22
                    }
                  />
                </div>

                <div className="acidentes-drawer-title">
                  <h2>
                    {editando
                      ? "Editar ocorrência"
                      : "Nova ocorrência"}
                  </h2>

                  <p>
                    Registro, investigação e
                    relacionamento com o PGR.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  fecharDrawer
                }
                aria-label="Fechar formulário"
                style={
                  botaoFechar
                }
              >
                <X
                  size={
                    19
                  }
                />
              </button>
            </header>

            {/* FORMULÁRIO */}

            <div className="acidentes-drawer-content">
              <Secao
                titulo="Ocorrência"
                descricao="Informe quando ocorreu e qual o tipo e a gravidade."
              >
                <div className="acidentes-grid-2">
                  <Campo
                    label="Data"
                    type="date"
                    value={
                      formulario.data
                    }
                    onChange={(
                      valor
                    ) =>
                      setFormulario({
                        ...formulario,

                        data:
                          valor,
                      })
                    }
                  />

                  <Campo
                    label="Hora"
                    type="time"
                    value={
                      formulario.hora
                    }
                    onChange={(
                      valor
                    ) =>
                      setFormulario({
                        ...formulario,

                        hora:
                          valor,
                      })
                    }
                  />
                </div>

                <div className="acidentes-grid-2">
                  <SelectCampo
                    label="Tipo"
                    value={
                      formulario.tipo
                    }
                    options={[
                      "Acidente",
                      "Incidente",
                      "Quase acidente",
                    ]}
                    onChange={(
                      valor
                    ) =>
                      setFormulario({
                        ...formulario,

                        tipo:
                          valor as TipoOcorrencia,
                      })
                    }
                  />

                  <SelectCampo
                    label="Gravidade"
                    value={
                      formulario.gravidade
                    }
                    options={[
                      "Leve",
                      "Moderada",
                      "Grave",
                      "Crítica",
                    ]}
                    onChange={(
                      valor
                    ) =>
                      setFormulario({
                        ...formulario,

                        gravidade:
                          valor as Gravidade,
                      })
                    }
                  />
                </div>
              </Secao>

              <Secao
                titulo="Pessoa e local"
                descricao="Identifique o colaborador e o setor onde ocorreu o evento."
              >
                <Campo
                  label="Funcionário"
                  placeholder="Nome do funcionário"
                  value={
                    formulario.funcionario
                  }
                  onChange={(
                    valor
                  ) =>
                    setFormulario({
                      ...formulario,

                      funcionario:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Setor / Local"
                  placeholder="Ex.: Cozinha quente"
                  value={
                    formulario.setor
                  }
                  onChange={(
                    valor
                  ) =>
                    setFormulario({
                      ...formulario,

                      setor:
                        valor,
                    })
                  }
                />
              </Secao>

              <Secao
                titulo="Consequências"
                descricao="Registre afastamento e situação da CAT."
              >
                <label className="acidentes-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      formulario.afastamento
                    }
                    onChange={(
                      e
                    ) =>
                      setFormulario({
                        ...formulario,

                        afastamento:
                          e.target.checked,

                        diasAfastado:
                          e.target.checked
                            ? formulario.diasAfastado
                            : 0,
                      })
                    }
                  />

                  Houve afastamento
                </label>

                {formulario.afastamento && (
                  <Campo
                    label="Dias de afastamento"
                    type="number"
                    value={
                      String(
                        formulario.diasAfastado
                      )
                    }
                    onChange={(
                      valor
                    ) =>
                      setFormulario({
                        ...formulario,

                        diasAfastado:
                          Math.max(
                            0,
                            Number(
                              valor
                            )
                          ),
                      })
                    }
                  />
                )}

                <SelectCampo
                  label="Situação da CAT"
                  value={
                    formulario.cat
                  }
                  options={[
                    "Não necessária",
                    "Pendente",
                    "Emitida",
                  ]}
                  onChange={(
                    valor
                  ) =>
                    setFormulario({
                      ...formulario,

                      cat:
                        valor as SituacaoCAT,
                    })
                  }
                />
              </Secao>

              <Secao
                titulo="Investigação"
                descricao="Registre as causas e medidas definidas após a ocorrência."
              >
                <CampoTexto
                  label="Causa da ocorrência"
                  placeholder="Descreva a causa identificada..."
                  value={
                    formulario.causa
                  }
                  onChange={(
                    valor
                  ) =>
                    setFormulario({
                      ...formulario,

                      causa:
                        valor,
                    })
                  }
                />

                <CampoTexto
                  label="Ação corretiva"
                  placeholder="Descreva a ação necessária para evitar recorrência..."
                  value={
                    formulario.acaoCorretiva
                  }
                  onChange={(
                    valor
                  ) =>
                    setFormulario({
                      ...formulario,

                      acaoCorretiva:
                        valor,
                    })
                  }
                />
              </Secao>

              {/* INTEGRAÇÃO PGR */}

              <Secao
                titulo="Relacionamento com o PGR"
                descricao="Associe a ocorrência a um risco já identificado no inventário."
              >
                <div className="acidentes-grupo-campo">
                  <label className="acidentes-label">
                    Risco relacionado
                  </label>

                  <select
                    value={
                      formulario.riscoPgrId ??
                      ""
                    }
                    onChange={(
                      e
                    ) =>
                      selecionarRiscoPgr(
                        e.target.value
                      )
                    }
                    style={
                      estiloSelect
                    }
                  >
                    <option value="">
                      Nenhum risco relacionado
                    </option>

                    {pgrOrdenado.map(
                      (
                        risco
                      ) => (
                        <option
                          key={
                            risco.id
                          }
                          value={
                            risco.id
                          }
                        >
                          {
                            risco.classificacao
                          }{" "}
                          —{" "}
                          {
                            risco.setor
                          }{" "}
                          —{" "}
                          {
                            risco.perigo
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {pgr.length ===
                  0 && (
                  <div className="acidentes-aviso-pgr">
                    Nenhum risco foi encontrado no PGR.
                    Cadastre o inventário primeiro para
                    criar o relacionamento.
                  </div>
                )}

                {riscoSelecionado && (
                  <div className="acidentes-risco-selecionado">
                    <div className="acidentes-risco-header">
                      <div
                        style={{
                          minWidth:
                            0,
                        }}
                      >
                        <div className="acidentes-risco-label">
                          Risco selecionado
                        </div>

                        <strong className="acidentes-risco-nome">
                          {
                            riscoSelecionado.perigo
                          }
                        </strong>

                        <div className="acidentes-risco-local">
                          {
                            riscoSelecionado.setor
                          }{" "}
                          •{" "}
                          {
                            riscoSelecionado.atividade
                          }
                        </div>
                      </div>

                      <Badge
                        color={
                          riscoSelecionado.classificacao ===
                          "Crítico"
                            ? "red"
                            : riscoSelecionado.classificacao ===
                                "Alto"
                              ? "orange"
                              : riscoSelecionado.classificacao ===
                                  "Médio"
                                ? "yellow"
                                : "green"
                        }
                      >
                        {
                          riscoSelecionado.classificacao
                        }
                      </Badge>
                    </div>

                    <div className="acidentes-info-pgr-grid">
                      <InfoPgr
                        titulo="Categoria"
                        valor={
                          riscoSelecionado.categoria
                        }
                      />

                      <InfoPgr
                        titulo="Nível"
                        valor={
                          String(
                            riscoSelecionado.nivel
                          )
                        }
                      />

                      <InfoPgr
                        titulo="Responsável"
                        valor={
                          riscoSelecionado.responsavel ||
                          "Não definido"
                        }
                      />

                      <InfoPgr
                        titulo="Status"
                        valor={
                          riscoSelecionado.status
                        }
                      />
                    </div>

                    <div className="acidentes-medida-controle">
                      <div>
                        Medida de controle
                      </div>

                      <p>
                        {riscoSelecionado.medidaControle ||
                          "Nenhuma medida cadastrada."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/pgr"
                        )
                      }
                      style={{
                        ...botaoLink,

                        marginTop:
                          11,
                      }}
                    >
                      Abrir inventário do PGR

                      <ExternalLink
                        size={
                          14
                        }
                      />
                    </button>
                  </div>
                )}
              </Secao>
            </div>

            {/* FOOTER */}

            <footer className="acidentes-drawer-footer">
              <Button
                onClick={
                  fecharDrawer
                }
                color="#64748B"
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  salvarRegistro
                }
              >
                {salvando
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Registrar ocorrência"}
              </Button>
            </footer>
          </aside>
        </div>
      )}

      <style>
        {
          estilosResponsivos
        }
      </style>
    </main>
  );
}

/*
 * COMPONENTES AUXILIARES
 */

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
    <section className="acidentes-form-secao">
      <div className="acidentes-form-secao-header">
        <h3>
          {
            titulo
          }
        </h3>

        <p>
          {
            descricao
          }
        </p>
      </div>

      {
        children
      }
    </section>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    valor: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="acidentes-grupo-campo">
      <label className="acidentes-label">
        {
          label
        }
      </label>

      <input
        type={
          type
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target.value
          )
        }
        style={
          estiloInput
        }
      />
    </div>
  );
}

function SelectCampo({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    valor: string
  ) => void;
}) {
  return (
    <div className="acidentes-grupo-campo">
      <label className="acidentes-label">
        {
          label
        }
      </label>

      <select
        value={
          value
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target.value
          )
        }
        style={
          estiloSelect
        }
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {
                option
              }
            </option>
          )
        )}
      </select>
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
  onChange: (
    valor: string
  ) => void;
}) {
  return (
    <div className="acidentes-grupo-campo">
      <label className="acidentes-label">
        {
          label
        }
      </label>

      <textarea
        rows={
          4
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target.value
          )
        }
        style={{
          ...estiloInput,

          height:
            "auto",

          minHeight:
            100,

          padding:
            "12px 13px",

          resize:
            "vertical",

          lineHeight:
            1.5,
        }}
      />
    </div>
  );
}

function InfoPgr({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="acidentes-info-pgr">
      <div className="acidentes-info-pgr-titulo">
        {
          titulo
        }
      </div>

      <div className="acidentes-info-pgr-valor">
        {
          valor
        }
      </div>
    </div>
  );
}

function EstadoVazio({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <div
      style={{
        width:
          "100%",

        minWidth:
          0,

        minHeight:
          mobile
            ? 220
            : 260,

        display:
          "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          mobile
            ? "26px 16px"
            : 30,

        boxSizing:
          "border-box",

        border:
          "1px dashed #CBD5E1",

        borderRadius:
          14,

        color:
          "#94A3B8",

        textAlign:
          "center",
      }}
    >
      <div
        style={{
          width:
            54,

          height:
            54,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          marginBottom:
            13,

          borderRadius:
            14,

          background:
            "#EFF6FF",

          color:
            "#2563EB",
        }}
      >
        <ShieldCheck
          size={
            26
          }
        />
      </div>

      <strong
        style={{
          color:
            "#334155",

          fontSize:
            14,

          lineHeight:
            1.4,
        }}
      >
        Nenhuma ocorrência encontrada
      </strong>

      <span
        style={{
          marginTop:
            5,

          maxWidth:
            360,

          fontSize:
            12,

          lineHeight:
            1.5,
        }}
      >
        Registre uma ocorrência ou altere
        os filtros utilizados.
      </span>
    </div>
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

        textAlign:
          align,

        color:
          "#64748B",

        fontSize:
          10,

        fontWeight:
          800,

        textTransform:
          "uppercase",

        letterSpacing:
          ".5px",

        whiteSpace:
          "nowrap",
      }}
    >
      {
        children
      }
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
        padding:
          18,

        textAlign:
          align,

        verticalAlign:
          "middle",

        color:
          "#475569",

        fontSize:
          12,
      }}
    >
      {
        children
      }
    </td>
  );
}

/*
 * DATAS
 */

function formatarData(
  data: string
) {
  if (
    !data
  ) {
    return "Sem data";
  }

  const [
    ano,
    mes,
    dia,
  ] =
    data.split(
      "-"
    );

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function dataHoje() {
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

/*
 * ESTILOS
 */

const estiloInput = {
  width:
    "100%",

  minWidth:
    0,

  height:
    46,

  padding:
    "0 13px",

  boxSizing:
    "border-box" as const,

  border:
    "1px solid #CBD5E1",

  borderRadius:
    11,

  background:
    "#FFFFFF",

  color:
    "#0F172A",

  fontFamily:
    "inherit",

  fontSize:
    13,

  outline:
    "none",
};

const estiloSelect = {
  ...estiloInput,

  cursor:
    "pointer",
};

const botaoAcao = {
  width:
    36,

  height:
    36,

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  flexShrink:
    0,

  padding:
    0,

  border:
    "none",

  borderRadius:
    9,

  cursor:
    "pointer",
};

const botaoFechar = {
  width:
    38,

  height:
    38,

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  flexShrink:
    0,

  padding:
    0,

  border:
    "1px solid #E2E8F0",

  borderRadius:
    10,

  background:
    "#FFFFFF",

  color:
    "#64748B",

  cursor:
    "pointer",
};

const botaoSecundario = {
  height:
    42,

  display:
    "flex",

  alignItems:
    "center",

  gap:
    8,

  padding:
    "0 14px",

  border:
    "1px solid #CBD5E1",

  borderRadius:
    10,

  background:
    "#FFFFFF",

  color:
    "#475569",

  fontFamily:
    "inherit",

  fontSize:
    12,

  fontWeight:
    700,

  cursor:
    "pointer",
};

const botaoLink = {
  width:
    "100%",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "space-between",

  gap:
    10,

  padding:
    0,

  border:
    "none",

  background:
    "transparent",

  color:
    "#2563EB",

  fontFamily:
    "inherit",

  fontSize:
    10,

  fontWeight:
    750,

  cursor:
    "pointer",
};

const estilosResponsivos = `
  .acidentes-drawer-overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: flex-end;

    background:
      rgba(15, 23, 42, .48);

    backdrop-filter:
      blur(3px);

    z-index: 2000;
  }

  .acidentes-drawer {
    width: 610px;
    max-width: 100%;

    height: 100vh;
    height: 100dvh;

    display: flex;
    flex-direction: column;

    box-sizing: border-box;

    background: #ffffff;

    box-shadow:
      -16px 0 45px
      rgba(15, 23, 42, .16);

    overflow: hidden;
  }

  .acidentes-drawer-header {
    padding: 24px 26px;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    gap: 20px;

    flex-shrink: 0;

    border-bottom:
      1px solid #e2e8f0;
  }

  .acidentes-drawer-header-main {
    min-width: 0;

    display: flex;

    gap: 12px;
  }

  .acidentes-drawer-icon {
    width: 44px;
    height: 44px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: #fef2f2;

    color: #dc2626;
  }

  .acidentes-drawer-title {
    min-width: 0;
  }

  .acidentes-drawer-title h2 {
    margin: 0;

    color: #0f172a;

    font-size: 20px;
    font-weight: 800;

    line-height: 1.25;
  }

  .acidentes-drawer-title p {
    margin: 5px 0 0;

    color: #64748b;

    font-size: 12px;

    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .acidentes-drawer-content {
    flex: 1;

    min-height: 0;

    padding:
      24px 26px;

    box-sizing: border-box;

    overflow-y: auto;
    overflow-x: hidden;

    -webkit-overflow-scrolling:
      touch;
  }

  .acidentes-grid-2 {
    width: 100%;

    min-width: 0;

    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 14px;
  }

  .acidentes-form-secao {
    width: 100%;

    min-width: 0;

    margin-bottom: 28px;
  }

  .acidentes-form-secao-header {
    margin-bottom: 16px;
  }

  .acidentes-form-secao-header h3 {
    margin: 0;

    color: #0f172a;

    font-size: 14px;
    font-weight: 800;
  }

  .acidentes-form-secao-header p {
    margin: 4px 0 0;

    color: #94a3b8;

    font-size: 11px;

    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .acidentes-grupo-campo {
    width: 100%;

    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 8px;

    margin-bottom: 16px;
  }

  .acidentes-label {
    color: #334155;

    font-size: 13px;

    font-weight: 650;
  }

  .acidentes-checkbox {
    display: flex;
    align-items: center;

    gap: 10px;

    margin-bottom: 16px;

    color: #334155;

    font-size: 13px;
    font-weight: 650;

    cursor: pointer;
  }

  .acidentes-checkbox input {
    flex-shrink: 0;
  }

  .acidentes-aviso-pgr {
    padding: 13px;

    box-sizing: border-box;

    border:
      1px solid #bfdbfe;

    border-radius: 11px;

    background: #eff6ff;

    color: #475569;

    font-size: 11px;

    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .acidentes-risco-selecionado {
    width: 100%;

    min-width: 0;

    margin-top: 8px;

    padding: 16px;

    box-sizing: border-box;

    border:
      1px solid #e2e8f0;

    border-radius: 13px;

    background: #f8fafc;
  }

  .acidentes-risco-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 15px;

    margin-bottom: 13px;

    min-width: 0;
  }

  .acidentes-risco-label {
    color: #64748b;

    font-size: 9px;
    font-weight: 800;

    text-transform: uppercase;

    letter-spacing: .5px;
  }

  .acidentes-risco-nome {
    display: block;

    margin-top: 4px;

    color: #0f172a;

    font-size: 14px;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  .acidentes-risco-local {
    margin-top: 4px;

    color: #64748b;

    font-size: 10px;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  .acidentes-info-pgr-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 10px;
  }

  .acidentes-info-pgr {
    min-width: 0;

    padding:
      10px 11px;

    box-sizing: border-box;

    border:
      1px solid #e2e8f0;

    border-radius: 9px;

    background: #ffffff;
  }

  .acidentes-info-pgr-titulo {
    color: #94a3b8;

    font-size: 8px;

    font-weight: 800;

    text-transform: uppercase;
  }

  .acidentes-info-pgr-valor {
    margin-top: 4px;

    color: #334155;

    font-size: 11px;

    font-weight: 700;

    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  .acidentes-medida-controle {
    margin-top: 10px;

    padding:
      11px 12px;

    box-sizing: border-box;

    border-radius: 9px;

    background: #ffffff;

    border:
      1px solid #e2e8f0;
  }

  .acidentes-medida-controle > div {
    color: #64748b;

    font-size: 9px;
    font-weight: 800;

    text-transform: uppercase;
  }

  .acidentes-medida-controle p {
    margin:
      5px 0 0;

    color: #475569;

    font-size: 11px;

    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .acidentes-drawer-footer {
    padding:
      17px 26px;

    display: flex;

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

  @media (max-width: 650px) {
    .acidentes-drawer {
      width: 100%;
      max-width: none;
    }

    .acidentes-drawer-header {
      padding:
        18px 16px;

      gap: 12px;
    }

    .acidentes-drawer-icon {
      width: 40px;
      height: 40px;

      border-radius: 11px;
    }

    .acidentes-drawer-title h2 {
      font-size: 18px;
    }

    .acidentes-drawer-title p {
      font-size: 11px;
    }

    .acidentes-drawer-content {
      padding:
        20px 16px 26px;
    }

    .acidentes-grid-2 {
      grid-template-columns:
        minmax(0, 1fr);

      gap: 0;
    }

    .acidentes-drawer-footer {
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

    .acidentes-drawer-footer > * {
      flex: 1 1 0;
    }
  }

  @media (max-width: 430px) {
    .acidentes-drawer-header {
      padding:
        16px 14px;
    }

    .acidentes-drawer-content {
      padding:
        18px 14px 24px;
    }

    .acidentes-risco-header {
      flex-direction: column;

      align-items:
        flex-start;
    }

    .acidentes-info-pgr-grid {
      grid-template-columns:
        minmax(0, 1fr);
    }

    .acidentes-drawer-footer {
      flex-direction: column;

      align-items: stretch;

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

    .acidentes-drawer-footer > * {
      width: 100%;
    }
  }
`;