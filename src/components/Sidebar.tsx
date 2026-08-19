import {
  useEffect,
  useState,
} from "react";

import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ShieldCheck,
  TriangleAlert,
  Ambulance,
  HardHat,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  ChevronRight,
  Activity,
  Menu,
  X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { colors } from "../styles/theme";

interface MenuItem {
  nome: string;
  rota: string;
  icon: LucideIcon;
}

interface MenuGrupo {
  titulo: string;
  itens: MenuItem[];
}

const grupos: MenuGrupo[] = [
  {
    titulo: "VISÃO GERAL",
    itens: [
      {
        nome: "Dashboard",
        rota: "/",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    titulo: "GESTÃO PREVENTIVA",
    itens: [
      {
        nome: "PGR",
        rota: "/pgr",
        icon: ShieldCheck,
      },
      {
        nome: "Gestão de Riscos",
        rota: "/riscos",
        icon: TriangleAlert,
      },
      {
        nome: "Acidentes",
        rota: "/acidentes",
        icon: Ambulance,
      },
    ],
  },

  {
    titulo: "CONTROLE OPERACIONAL",
    itens: [
      {
        nome: "EPIs",
        rota: "/epis",
        icon: HardHat,
      },
      {
        nome: "Checklists",
        rota: "/checklists",
        icon: ClipboardCheck,
      },
      {
        nome: "DDS",
        rota: "/dds",
        icon: BookOpen,
      },
      {
        nome: "Auditorias",
        rota: "/auditorias",
        icon: ClipboardList,
      },
    ],
  },
];

export default function Sidebar() {
  const [
    mobile,
    setMobile,
  ] = useState(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    return window.matchMedia(
      "(max-width: 900px)"
    ).matches;
  });

  const [
    menuAberto,
    setMenuAberto,
  ] = useState(false);

  /*
   * DETECTAR TAMANHO DA TELA
   */
  useEffect(() => {
    const media =
      window.matchMedia(
        "(max-width: 900px)"
      );

    function atualizarTela() {
      setMobile(
        media.matches
      );

      if (!media.matches) {
        setMenuAberto(false);
      }
    }

    atualizarTela();

    media.addEventListener(
      "change",
      atualizarTela
    );

    return () => {
      media.removeEventListener(
        "change",
        atualizarTela
      );
    };
  }, []);

  /*
   * RESERVA ESPAÇO PARA O
   * CABEÇALHO MOBILE
   */
  useEffect(() => {
    const paddingAnterior =
      document.body.style.paddingTop;

    if (mobile) {
      document.body.style.paddingTop =
        "68px";
    } else {
      document.body.style.paddingTop =
        "";
    }

    return () => {
      document.body.style.paddingTop =
        paddingAnterior;
    };
  }, [mobile]);

  /*
   * BLOQUEIA SCROLL DO FUNDO
   * QUANDO O MENU MOBILE ABRE
   */
  useEffect(() => {
    if (
      !mobile ||
      !menuAberto
    ) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };
  }, [
    mobile,
    menuAberto,
  ]);

  /*
   * DESKTOP
   */
  if (!mobile) {
    return (
      <aside
        style={{
          width: 285,

          minWidth: 285,

          height: "100vh",

          position: "sticky",

          top: 0,

          display: "flex",

          flexDirection:
            "column",

          boxSizing:
            "border-box",

          background:
            colors.sidebar,

          borderRight:
            "1px solid #1E293B",

          boxShadow:
            "8px 0 30px rgba(15, 23, 42, 0.08)",

          overflowY: "auto",

          zIndex: 100,
        }}
      >
        <ConteudoSidebar />
      </aside>
    );
  }

  /*
   * MOBILE
   */
  return (
    <>
      {/* BARRA SUPERIOR MOBILE */}

      <header
        style={{
          position: "fixed",

          top: 0,

          left: 0,

          right: 0,

          height: 68,

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 15,

          padding:
            "0 18px",

          boxSizing:
            "border-box",

          background:
            colors.sidebar,

          borderBottom:
            "1px solid #1E293B",

          boxShadow:
            "0 5px 20px rgba(15, 23, 42, .14)",

          zIndex: 1200,
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            gap: 10,

            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,

              height: 38,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink: 0,

              borderRadius: 11,

              background:
                "linear-gradient(135deg, #2563EB, #3B82F6)",

              color:
                "#FFFFFF",

              boxShadow:
                "0 7px 18px rgba(37, 99, 235, .25)",
            }}
          >
            <ShieldCheck
              size={21}
            />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                color:
                  "#FFFFFF",

                fontSize: 17,

                fontWeight: 800,

                letterSpacing:
                  "-.3px",

                lineHeight: 1.1,
              }}
            >
              SafeKitchen
            </div>

            <div
              style={{
                marginTop: 3,

                color:
                  "#94A3B8",

                fontSize: 9,

                fontWeight: 700,

                letterSpacing:
                  ".6px",
              }}
            >
              GESTÃO DE SST
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setMenuAberto(
              true
            )
          }
          aria-label="Abrir menu"
          style={{
            width: 42,

            height: 42,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            flexShrink: 0,

            border:
              "1px solid #334155",

            borderRadius: 11,

            background:
              "#1E293B",

            color:
              "#E2E8F0",

            cursor:
              "pointer",
          }}
        >
          <Menu size={21} />
        </button>
      </header>

      {/* FUNDO ESCURO */}

      {menuAberto && (
        <div
          onClick={() =>
            setMenuAberto(
              false
            )
          }
          style={{
            position: "fixed",

            inset: 0,

            background:
              "rgba(2, 6, 23, .58)",

            backdropFilter:
              "blur(3px)",

            zIndex: 1250,
          }}
        />
      )}

      {/* MENU LATERAL MOBILE */}

      <aside
        style={{
          width:
            "min(315px, calc(100vw - 32px))",

          height: "100dvh",

          position: "fixed",

          top: 0,

          left: 0,

          display: "flex",

          flexDirection:
            "column",

          boxSizing:
            "border-box",

          background:
            colors.sidebar,

          borderRight:
            "1px solid #1E293B",

          boxShadow:
            "18px 0 45px rgba(2, 6, 23, .28)",

          overflowY: "auto",

          transform:
            menuAberto
              ? "translateX(0)"
              : "translateX(-105%)",

          transition:
            "transform .25s ease",

          zIndex: 1300,
        }}
      >
        {/* FECHAR */}

        <button
          type="button"
          onClick={() =>
            setMenuAberto(
              false
            )
          }
          aria-label="Fechar menu"
          style={{
            position:
              "absolute",

            top: 19,

            right: 16,

            width: 38,

            height: 38,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            border:
              "1px solid #334155",

            borderRadius: 10,

            background:
              "#1E293B",

            color:
              "#CBD5E1",

            cursor:
              "pointer",

            zIndex: 2,
          }}
        >
          <X size={18} />
        </button>

        <ConteudoSidebar
          mobile
          onNavigate={() =>
            setMenuAberto(
              false
            )
          }
        />
      </aside>
    </>
  );
}

function ConteudoSidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* LOGO */}

      <div
        style={{
          padding:
            mobile
              ? "24px 64px 23px 20px"
              : "26px 22px 24px",

          borderBottom:
            "1px solid #1E293B",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            gap: 13,
          }}
        >
          <div
            style={{
              width: 46,

              height: 46,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink: 0,

              borderRadius: 14,

              background:
                "linear-gradient(135deg, #2563EB, #3B82F6)",

              color:
                "#FFFFFF",

              boxShadow:
                "0 8px 20px rgba(37, 99, 235, 0.28)",
            }}
          >
            <ShieldCheck
              size={25}
            />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <h1
              style={{
                margin: 0,

                color:
                  "#FFFFFF",

                fontSize: 22,

                fontWeight: 750,

                letterSpacing:
                  "-0.4px",

                whiteSpace:
                  "nowrap",
              }}
            >
              SafeKitchen
            </h1>

            <span
              style={{
                display: "block",

                marginTop: 3,

                color:
                  "#94A3B8",

                fontSize: 11,

                fontWeight: 600,

                letterSpacing:
                  "0.5px",
              }}
            >
              GESTÃO DE SST
            </span>
          </div>
        </div>
      </div>

      {/* STATUS */}

      <div
        style={{
          padding:
            "18px 18px 6px",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            gap: 10,

            padding:
              "11px 13px",

            background:
              "rgba(30, 41, 59, 0.7)",

            border:
              "1px solid #26364D",

            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 31,

              height: 31,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexShrink: 0,

              borderRadius: 9,

              background:
                "rgba(37, 99, 235, 0.14)",

              color:
                "#60A5FA",
            }}
          >
            <Activity
              size={16}
            />
          </div>

          <div>
            <div
              style={{
                color:
                  "#E2E8F0",

                fontSize: 12,

                fontWeight: 650,
              }}
            >
              Sistema operacional
            </div>

            <div
              style={{
                display: "flex",

                alignItems:
                  "center",

                gap: 6,

                marginTop: 3,

                color:
                  "#94A3B8",

                fontSize: 10,
              }}
            >
              <span
                style={{
                  width: 6,

                  height: 6,

                  borderRadius:
                    "50%",

                  background:
                    "#22C55E",

                  boxShadow:
                    "0 0 8px rgba(34, 197, 94, 0.7)",
                }}
              />

              Módulos disponíveis
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO */}

      <nav
        style={{
          flex: 1,

          padding:
            "12px 16px 24px",
        }}
      >
        {grupos.map(
          (grupo) => (
            <div
              key={
                grupo.titulo
              }
              style={{
                marginBottom:
                  24,
              }}
            >
              <div
                style={{
                  padding:
                    "0 12px",

                  marginBottom:
                    8,

                  color:
                    "#64748B",

                  fontSize: 10,

                  fontWeight:
                    800,

                  letterSpacing:
                    "1px",
                }}
              >
                {
                  grupo.titulo
                }
              </div>

              <div
                style={{
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap: 4,
                }}
              >
                {grupo.itens.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <NavLink
                        key={
                          item.rota
                        }
                        to={
                          item.rota
                        }
                        end={
                          item.rota ===
                          "/"
                        }
                        onClick={
                          onNavigate
                        }
                        style={({
                          isActive,
                        }) => ({
                          position:
                            "relative",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          minHeight:
                            46,

                          padding:
                            "0 11px",

                          borderRadius:
                            11,

                          color:
                            isActive
                              ? "#FFFFFF"
                              : "#A8B4C7",

                          background:
                            isActive
                              ? "linear-gradient(90deg, rgba(37, 99, 235, 0.95), rgba(37, 99, 235, 0.72))"
                              : "transparent",

                          textDecoration:
                            "none",

                          fontSize:
                            13,

                          fontWeight:
                            isActive
                              ? 650
                              : 550,

                          transition:
                            "background .2s ease, color .2s ease, transform .2s ease",

                          boxShadow:
                            isActive
                              ? "0 6px 18px rgba(37, 99, 235, 0.20)"
                              : "none",
                        })}
                      >
                        {({
                          isActive,
                        }) => (
                          <>
                            {/* INDICADOR */}

                            {isActive && (
                              <span
                                style={{
                                  position:
                                    "absolute",

                                  left: -16,

                                  top: 10,

                                  width:
                                    3,

                                  height:
                                    26,

                                  borderRadius:
                                    "0 4px 4px 0",

                                  background:
                                    "#60A5FA",
                                }}
                              />
                            )}

                            {/* ÍCONE */}

                            <div
                              style={{
                                width:
                                  34,

                                height:
                                  34,

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                flexShrink:
                                  0,

                                borderRadius:
                                  9,

                                background:
                                  isActive
                                    ? "rgba(255, 255, 255, 0.12)"
                                    : "rgba(148, 163, 184, 0.06)",

                                color:
                                  isActive
                                    ? "#FFFFFF"
                                    : "#94A3B8",
                              }}
                            >
                              <Icon
                                size={
                                  18
                                }
                              />
                            </div>

                            {/* TEXTO */}

                            <span
                              style={{
                                flex: 1,

                                marginLeft:
                                  11,
                              }}
                            >
                              {
                                item.nome
                              }
                            </span>

                            {/* SETA */}

                            <ChevronRight
                              size={
                                15
                              }
                              style={{
                                opacity:
                                  isActive
                                    ? 0.9
                                    : 0.25,
                              }}
                            />
                          </>
                        )}
                      </NavLink>
                    );
                  }
                )}
              </div>
            </div>
          )
        )}
      </nav>

      {/* RODAPÉ */}

      <footer
        style={{
          padding:
            "18px 20px 20px",

          borderTop:
            "1px solid #1E293B",

          background:
            "rgba(2, 6, 23, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            marginBottom: 7,
          }}
        >
          <span
            style={{
              color:
                "#CBD5E1",

              fontSize: 12,

              fontWeight: 650,
            }}
          >
            SafeKitchen
          </span>

          <span
            style={{
              padding:
                "3px 7px",

              borderRadius: 6,

              background:
                "rgba(37, 99, 235, 0.14)",

              color:
                "#60A5FA",

              fontSize: 9,

              fontWeight: 800,

              letterSpacing:
                "0.5px",
            }}
          >
            V2.0
          </span>
        </div>

        <div
          style={{
            color:
              "#64748B",

            fontSize: 10,

            lineHeight: 1.5,
          }}
        >
          NR-01 • PGR • Segurança e Saúde
          <br />
          no Trabalho
        </div>
      </footer>
    </>
  );
}