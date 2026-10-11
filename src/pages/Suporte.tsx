import {
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Ambulance,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  HardHat,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  MessageSquareText,
  PlayCircle,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

interface Guia {
  id: string;
  titulo: string;
  descricao: string;
  rota: string;
  icon: LucideIcon;
  palavrasChave: string[];
  passos: string[];
}

const VIDEO_TUTORIAL_ID = "m4mri8Tfh2k";

const guias: Guia[] = [
  {
    id: "dashboard",
    titulo: "Dashboard",
    descricao:
      "Entenda os indicadores, alertas e a visão geral das informações de SST.",
    rota: "/",
    icon: LayoutDashboard,
    palavrasChave: [
      "dashboard",
      "indicadores",
      "alertas",
      "resumo",
    ],
    passos: [
      "Acesse o Dashboard pelo menu lateral.",
      "Consulte os indicadores gerais de riscos, EPIs, checklists, DDS, auditorias e ocorrências.",
      "Observe os alertas de maior prioridade para identificar situações que precisam de acompanhamento.",
      "Use as informações como apoio para decidir qual módulo deve ser revisado primeiro.",
    ],
  },
  {
    id: "pgr",
    titulo: "PGR",
    descricao:
      "Cadastre riscos, classifique o nível e registre medidas de controle, responsáveis e prazos.",
    rota: "/pgr",
    icon: ShieldCheck,
    palavrasChave: [
      "pgr",
      "risco",
      "perigo",
      "probabilidade",
      "severidade",
      "controle",
    ],
    passos: [
      "Acesse PGR pelo menu lateral.",
      "Cadastre o setor, a atividade, o perigo e a categoria do risco.",
      "Defina probabilidade e severidade para que o sistema calcule o nível e a classificação do risco.",
      "Informe a medida de controle, o responsável, o prazo e o status da ação.",
      "Salve o registro e acompanhe sua situação pelo próprio PGR e pela Gestão de Riscos.",
    ],
  },
  {
    id: "riscos",
    titulo: "Gestão de Riscos",
    descricao:
      "Acompanhe os riscos cadastrados no PGR por classificação, status, prazo e prioridade.",
    rota: "/riscos",
    icon: TriangleAlert,
    palavrasChave: [
      "gestão de riscos",
      "riscos",
      "classificação",
      "prazo",
      "prioridade",
    ],
    passos: [
      "Acesse Gestão de Riscos no menu lateral.",
      "Consulte os riscos que já foram cadastrados no PGR.",
      "Use a classificação e os prazos para identificar itens de maior prioridade.",
      "Quando precisar alterar um risco, faça a atualização no PGR para manter uma única base de informações.",
    ],
  },
  {
    id: "acidentes",
    titulo: "Acidentes",
    descricao:
      "Registre acidentes, incidentes e quase acidentes e relacione a ocorrência a um risco do PGR.",
    rota: "/acidentes",
    icon: Ambulance,
    palavrasChave: [
      "acidente",
      "incidente",
      "quase acidente",
      "cat",
      "afastamento",
      "ocorrência",
    ],
    passos: [
      "Acesse Acidentes pelo menu lateral.",
      "Informe os dados da ocorrência, como data, funcionário, setor, tipo e gravidade.",
      "Quando aplicável, registre afastamento, situação da CAT, causa e ação corretiva.",
      "Se a ocorrência estiver relacionada a um risco já identificado, vincule-a ao respectivo item do PGR.",
      "Salve e acompanhe o histórico das ocorrências registradas.",
    ],
  },
  {
    id: "epis",
    titulo: "EPIs",
    descricao:
      "Controle cadastro, CA, quantidade em estoque e validade dos equipamentos de proteção.",
    rota: "/epis",
    icon: HardHat,
    palavrasChave: [
      "epi",
      "epis",
      "ca",
      "estoque",
      "validade",
      "equipamento",
    ],
    passos: [
      "Acesse EPIs pelo menu lateral.",
      "Cadastre o nome do equipamento, o número do CA, a quantidade e a validade.",
      "Acompanhe avisos relacionados a estoque baixo, falta de estoque ou vencimento.",
      "Atualize o cadastro sempre que houver alteração na quantidade ou na validade do item.",
    ],
  },
  {
    id: "checklists",
    titulo: "Checklists",
    descricao:
      "Registre inspeções das condições de segurança e acompanhe o nível de conformidade.",
    rota: "/checklists",
    icon: ClipboardCheck,
    palavrasChave: [
      "checklist",
      "checklists",
      "inspeção",
      "conformidade",
      "verificação",
    ],
    passos: [
      "Acesse Checklists pelo menu lateral.",
      "Informe data, setor, responsável e observações da verificação.",
      "Marque cada item de segurança conforme a condição encontrada.",
      "Salve o checklist e consulte o resultado de conformidade apresentado pelo sistema.",
    ],
  },
  {
    id: "dds",
    titulo: "DDS",
    descricao:
      "Registre os Diálogos Diários de Segurança realizados com as equipes.",
    rota: "/dds",
    icon: MessageSquareText,
    palavrasChave: [
      "dds",
      "diálogo",
      "segurança",
      "participantes",
      "tema",
      "treinamento",
    ],
    passos: [
      "Acesse DDS pelo menu lateral.",
      "Informe a data, o tema, o responsável e o setor.",
      "Registre a quantidade de participantes, a duração e as observações relevantes.",
      "Salve o registro para manter o histórico das orientações realizadas.",
    ],
  },
  {
    id: "auditorias",
    titulo: "Auditorias",
    descricao:
      "Acompanhe conformidade, não conformidades, ações corretivas, prazos e status.",
    rota: "/auditorias",
    icon: ClipboardList,
    palavrasChave: [
      "auditoria",
      "auditorias",
      "conformidade",
      "não conformidade",
      "ação corretiva",
      "prazo",
    ],
    passos: [
      "Acesse Auditorias pelo menu lateral.",
      "Informe a data, o auditor, o setor e o tipo da auditoria.",
      "Registre o percentual de conformidade e a quantidade de não conformidades.",
      "Quando necessário, descreva a ação corretiva, o prazo e o status do acompanhamento.",
      "Salve a auditoria e acompanhe as pendências pelo próprio módulo.",
    ],
  },
];

const perguntasFrequentes = [
  {
    pergunta: "Qual é a diferença entre PGR e Gestão de Riscos?",
    resposta:
      "O PGR é o local onde os riscos são cadastrados e atualizados. A Gestão de Riscos utiliza essa mesma base para facilitar o acompanhamento por classificação, prazo, status e prioridade, evitando registros duplicados.",
  },
  {
    pergunta: "Onde cadastro um novo risco?",
    resposta:
      "O cadastro e a edição de riscos são realizados no módulo PGR. Depois de salvo, o mesmo registro também pode ser acompanhado na Gestão de Riscos.",
  },
  {
    pergunta: "Como gerar o relatório em PDF?",
    resposta:
      "No Dashboard, utilize a opção de gerar relatório. O documento reúne informações dos módulos disponíveis para apoiar o acompanhamento da gestão de SST.",
  },
  {
    pergunta: "Como é calculada a classificação de um risco?",
    resposta:
      "O nível é calculado a partir da probabilidade e da severidade informadas no PGR. Com base nesse resultado, o sistema apresenta a classificação do risco como Baixo, Médio, Alto ou Crítico.",
  },
  {
    pergunta: "Os dados de usuários diferentes ficam separados?",
    resposta:
      "Sim. Os registros do sistema são associados ao usuário autenticado e as políticas de segurança do banco restringem o acesso aos dados pertencentes à própria conta.",
  },
];

export default function Suporte() {
  const [busca, setBusca] = useState("");
  const [guiaSelecionado, setGuiaSelecionado] =
    useState<string>("pgr");

  const termoBusca = busca.trim().toLowerCase();

  const guiasFiltrados = useMemo(() => {
    if (!termoBusca) {
      return guias;
    }

    return guias.filter((guia) =>
      [
        guia.titulo,
        guia.descricao,
        ...guia.palavrasChave,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termoBusca)
    );
  }, [termoBusca]);

  const guiaAtual =
    guias.find(
      (guia) =>
        guia.id === guiaSelecionado
    ) ?? guias[0];

  return (
    <div className="suporte-page">
      <section className="suporte-hero">
        <div className="suporte-hero-copy">
          <span className="suporte-eyebrow">
            <LifeBuoy size={14} />
            Central de Ajuda
          </span>

          <h1>
            Ajuda e documentação do SafeKitchen
          </h1>

          <p>
            Encontre orientações para utilizar os
            módulos do sistema e acompanhar as
            principais rotinas de SST em cozinhas
            industriais.
          </p>

          <div className="suporte-search">
            <Search size={19} />

            <input
              type="search"
              value={busca}
              onChange={(event) =>
                setBusca(
                  event.target.value
                )
              }
              placeholder="Pesquisar PGR, EPI, auditoria, relatório..."
              aria-label="Pesquisar na Central de Ajuda"
            />
          </div>
        </div>

        <div className="suporte-hero-badge">
          <ShieldCheck size={34} />
          <strong>SafeKitchen</strong>
          <span>Gestão de SST</span>
        </div>
      </section>

      <section
        id="primeiros-passos"
        className="suporte-section"
      >
        <div className="suporte-section-heading">
          <div>
            <span>COMECE POR AQUI</span>
            <h2>Primeiros passos</h2>
          </div>

          <p>
            Três caminhos rápidos para conhecer o
            sistema.
          </p>
        </div>

        <div className="suporte-quick-grid">
          <QuickCard
            icon={BookOpenCheck}
            titulo="Conheça os módulos"
            descricao="Veja o objetivo de cada área e o fluxo recomendado de uso."
            href="#guias"
            textoLink="Abrir guias"
          />

          <QuickCard
            icon={PlayCircle}
            titulo="Tutorial em vídeo"
            descricao="Assista à apresentação do sistema e veja como utilizar os principais módulos."
            href="#video"
            textoLink="Assistir"
          />

          <QuickCard
            icon={FileText}
            titulo="Relatórios"
            descricao="Entenda como o relatório reúne as principais informações cadastradas."
            href="#faq"
            textoLink="Ver orientação"
          />
        </div>
      </section>

      <section
        id="guias"
        className="suporte-section"
      >
        <div className="suporte-section-heading">
          <div>
            <span>DOCUMENTAÇÃO</span>
            <h2>Guias do sistema</h2>
          </div>

          <p>
            Selecione um módulo para visualizar um
            passo a passo resumido.
          </p>
        </div>

        {guiasFiltrados.length > 0 ? (
          <div className="suporte-guide-layout">
            <div className="suporte-guide-list">
              {guiasFiltrados.map(
                (guia) => {
                  const Icon = guia.icon;
                  const ativo =
                    guiaAtual.id ===
                    guia.id;

                  return (
                    <button
                      key={guia.id}
                      type="button"
                      className={
                        ativo
                          ? "suporte-guide-card suporte-guide-card-active"
                          : "suporte-guide-card"
                      }
                      onClick={() =>
                        setGuiaSelecionado(
                          guia.id
                        )
                      }
                    >
                      <div className="suporte-guide-icon">
                        <Icon size={19} />
                      </div>

                      <div className="suporte-guide-copy">
                        <strong>
                          {guia.titulo}
                        </strong>
                        <span>
                          {guia.descricao}
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                        className="suporte-guide-chevron"
                      />
                    </button>
                  );
                }
              )}
            </div>

            <article className="suporte-guide-detail">
              <div className="suporte-guide-detail-top">
                <div className="suporte-guide-detail-icon">
                  <guiaAtual.icon
                    size={22}
                  />
                </div>

                <div>
                  <span>GUIA RÁPIDO</span>
                  <h3>
                    Como usar: {guiaAtual.titulo}
                  </h3>
                </div>
              </div>

              <p className="suporte-guide-detail-description">
                {guiaAtual.descricao}
              </p>

              <div className="suporte-steps">
                {guiaAtual.passos.map(
                  (passo, indice) => (
                    <div
                      key={passo}
                      className="suporte-step"
                    >
                      <div className="suporte-step-number">
                        {indice + 1}
                      </div>

                      <p>{passo}</p>
                    </div>
                  )
                )}
              </div>

              <Link
                to={guiaAtual.rota}
                className="suporte-module-link"
              >
                Ir para {guiaAtual.titulo}
                <ChevronRight size={16} />
              </Link>
            </article>
          </div>
        ) : (
          <div className="suporte-empty">
            <Search size={24} />
            <strong>
              Nenhum guia encontrado
            </strong>
            <span>
              Tente pesquisar outro termo.
            </span>
          </div>
        )}
      </section>

      <section
        id="video"
        className="suporte-section"
      >
        <div className="suporte-section-heading">
          <div>
            <span>TUTORIAL</span>
            <h2>Visão geral em vídeo</h2>
          </div>

          <p>
            Assista à apresentação do SafeKitchen e
            conheça o fluxo de uso do sistema.
          </p>
        </div>

        <div className="suporte-video-card">
          <div className="suporte-video-player">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_TUTORIAL_ID}`}
              title="Tutorial do SafeKitchen"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="suporte-video-info">
            <span className="suporte-video-label">
              NO VÍDEO
            </span>

            <h3>
              O que você vai ver
            </h3>

            <div className="suporte-video-items">
              <VideoItem text="Acesso e navegação pelo sistema" />
              <VideoItem text="Cadastro e acompanhamento de riscos no PGR" />
              <VideoItem text="Uso dos módulos operacionais e registros" />
              <VideoItem text="Leitura dos indicadores e geração do relatório" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="suporte-section"
      >
        <div className="suporte-section-heading">
          <div>
            <span>DÚVIDAS COMUNS</span>
            <h2>Perguntas frequentes</h2>
          </div>

          <p>
            Respostas rápidas sobre o funcionamento
            do SafeKitchen.
          </p>
        </div>

        <div className="suporte-faq-list">
          {perguntasFrequentes.map(
            (item) => (
              <details
                key={item.pergunta}
                className="suporte-faq-item"
              >
                <summary>
                  <div className="suporte-faq-question">
                    <HelpCircle size={18} />
                    <span>
                      {item.pergunta}
                    </span>
                  </div>

                  <ChevronRight
                    size={17}
                    className="suporte-faq-chevron"
                  />
                </summary>

                <p>{item.resposta}</p>
              </details>
            )
          )}
        </div>
      </section>

      <section className="suporte-tip">
        <div className="suporte-tip-icon">
          <Lightbulb size={21} />
        </div>

        <div>
          <strong>
            Dica de utilização
          </strong>
          <p>
            Mantenha os registros atualizados para
            que o Dashboard e o relatório reflitam a
            situação mais recente das informações de
            SST cadastradas no sistema.
          </p>
        </div>
      </section>

      <section className="suporte-about">
        <div>
          <span>SOBRE A PLATAFORMA</span>
          <h2>SafeKitchen</h2>
          <p>
            Sistema de apoio à gestão de Segurança e
            Saúde no Trabalho em cozinhas industriais,
            com foco em prevenção, organização das
            informações e acompanhamento das ações.
          </p>
        </div>

        <div className="suporte-about-badge">
          NR-01 • PGR • SST
        </div>
      </section>

      <style>{suporteStyles}</style>
    </div>
  );
}

function QuickCard({
  icon: Icon,
  titulo,
  descricao,
  href,
  textoLink,
}: {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  href: string;
  textoLink: string;
}) {
  return (
    <a
      className="suporte-quick-card"
      href={href}
    >
      <div className="suporte-quick-icon">
        <Icon size={21} />
      </div>

      <div>
        <strong>{titulo}</strong>
        <p>{descricao}</p>
      </div>

      <span className="suporte-quick-link">
        {textoLink}
        <ChevronRight size={15} />
      </span>
    </a>
  );
}

function VideoItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="suporte-video-item">
      <CheckCircle2 size={16} />
      <span>{text}</span>
    </div>
  );
}

const suporteStyles = `
  .suporte-page {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 32px;
    color: #0f172a;
    background: #f8fafc;
  }

  .suporte-hero {
    position: relative;
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 36px;
    overflow: hidden;
    padding: 42px 44px;
    box-sizing: border-box;
    border: 1px solid #1e293b;
    border-radius: 22px;
    background:
      radial-gradient(circle at 88% 10%, rgba(37, 99, 235, .23), transparent 34%),
      linear-gradient(135deg, #0f172a 0%, #111f38 52%, #172554 100%);
    box-shadow: 0 18px 45px rgba(15, 23, 42, .12);
  }

  .suporte-hero::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,.42) 42%, #000 100%);
  }

  .suporte-hero-copy {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 720px;
  }

  .suporte-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border: 1px solid rgba(96, 165, 250, .2);
    border-radius: 999px;
    background: rgba(37, 99, 235, .12);
    color: #93c5fd;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .8px;
    text-transform: uppercase;
  }

  .suporte-hero h1 {
    margin: 18px 0 0;
    max-width: 690px;
    color: #fff;
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.08;
    font-weight: 850;
    letter-spacing: -1.2px;
  }

  .suporte-hero p {
    margin: 15px 0 0;
    max-width: 650px;
    color: #a8b4c7;
    font-size: 13px;
    line-height: 1.75;
  }

  .suporte-search {
    width: 100%;
    max-width: 620px;
    height: 50px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 25px;
    padding: 0 15px;
    box-sizing: border-box;
    border: 1px solid rgba(148, 163, 184, .2);
    border-radius: 12px;
    background: rgba(15, 23, 42, .58);
    color: #94a3b8;
    backdrop-filter: blur(10px);
  }

  .suporte-search:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .14);
  }

  .suporte-search input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #f8fafc;
    font-family: inherit;
    font-size: 12px;
  }

  .suporte-search input::placeholder {
    color: #64748b;
  }

  .suporte-hero-badge {
    position: relative;
    z-index: 1;
    width: 170px;
    height: 170px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(96, 165, 250, .18);
    border-radius: 28px;
    background: rgba(37, 99, 235, .09);
    color: #60a5fa;
  }

  .suporte-hero-badge strong {
    margin-top: 13px;
    color: #fff;
    font-size: 16px;
    font-weight: 800;
  }

  .suporte-hero-badge span {
    margin-top: 4px;
    color: #64748b;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .7px;
    text-transform: uppercase;
  }

  .suporte-section {
    margin-top: 34px;
  }

  .suporte-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 26px;
    margin-bottom: 18px;
  }

  .suporte-section-heading > div > span,
  .suporte-about > div > span {
    color: #2563eb;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 1px;
  }

  .suporte-section-heading h2,
  .suporte-about h2 {
    margin: 6px 0 0;
    color: #0f172a;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 820;
    letter-spacing: -.45px;
  }

  .suporte-section-heading > p {
    max-width: 420px;
    margin: 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.55;
    text-align: right;
  }

  .suporte-quick-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .suporte-quick-card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 19px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #fff;
    color: inherit;
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(15, 23, 42, .045);
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }

  .suporte-quick-card:hover {
    transform: translateY(-2px);
    border-color: #bfdbfe;
    box-shadow: 0 12px 28px rgba(15, 23, 42, .07);
  }

  .suporte-quick-icon,
  .suporte-guide-icon,
  .suporte-guide-detail-icon,
  .suporte-tip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #eff6ff;
    color: #2563eb;
  }

  .suporte-quick-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
  }

  .suporte-quick-card strong {
    display: block;
    margin-top: 15px;
    color: #0f172a;
    font-size: 13px;
    font-weight: 780;
  }

  .suporte-quick-card p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 10.5px;
    line-height: 1.55;
  }

  .suporte-quick-link {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: auto;
    padding-top: 18px;
    color: #2563eb;
    font-size: 10px;
    font-weight: 750;
  }

  .suporte-guide-layout {
    display: grid;
    grid-template-columns: minmax(280px, .8fr) minmax(420px, 1.2fr);
    gap: 16px;
    align-items: start;
  }

  .suporte-guide-list {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .suporte-guide-card {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #fff;
    text-align: left;
    cursor: pointer;
    transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
  }

  .suporte-guide-card:hover {
    border-color: #bfdbfe;
  }

  .suporte-guide-card-active {
    border-color: #93c5fd;
    background: #f8fbff;
    box-shadow: 0 6px 18px rgba(37, 99, 235, .06);
  }

  .suporte-guide-icon {
    width: 37px;
    height: 37px;
    border-radius: 10px;
  }

  .suporte-guide-copy {
    flex: 1;
    min-width: 0;
  }

  .suporte-guide-copy strong {
    display: block;
    color: #0f172a;
    font-size: 11.5px;
    font-weight: 780;
  }

  .suporte-guide-copy span {
    display: -webkit-box;
    margin-top: 4px;
    overflow: hidden;
    color: #64748b;
    font-size: 9.5px;
    line-height: 1.45;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .suporte-guide-chevron {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .suporte-guide-detail {
    position: sticky;
    top: 20px;
    min-width: 0;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 17px;
    background: #fff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, .055);
  }

  .suporte-guide-detail-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .suporte-guide-detail-icon {
    width: 43px;
    height: 43px;
    border-radius: 12px;
  }

  .suporte-guide-detail-top span,
  .suporte-video-label {
    color: #2563eb;
    font-size: 8.5px;
    font-weight: 850;
    letter-spacing: .9px;
  }

  .suporte-guide-detail h3,
  .suporte-video-info h3 {
    margin: 4px 0 0;
    color: #0f172a;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.25px;
  }

  .suporte-guide-detail-description {
    margin: 17px 0 0;
    color: #64748b;
    font-size: 10.5px;
    line-height: 1.65;
  }

  .suporte-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 19px;
  }

  .suporte-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .suporte-step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 8px;
    background: #f1f5f9;
    color: #475569;
    font-size: 9px;
    font-weight: 800;
  }

  .suporte-step p {
    margin: 2px 0 0;
    color: #475569;
    font-size: 10.5px;
    line-height: 1.55;
  }

  .suporte-module-link {
    min-height: 41px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 21px;
    padding: 0 14px;
    border-radius: 10px;
    background: #2563eb;
    color: #fff;
    font-size: 10.5px;
    font-weight: 750;
    text-decoration: none;
    transition: background .16s ease, transform .16s ease;
  }

  .suporte-module-link:hover {
    background: #1d4ed8;
  }

  .suporte-module-link:active {
    transform: translateY(1px);
  }

  .suporte-empty {
    min-height: 190px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 25px;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    background: #fff;
    color: #94a3b8;
    text-align: center;
  }

  .suporte-empty strong {
    margin-top: 4px;
    color: #334155;
    font-size: 12px;
  }

  .suporte-empty span {
    font-size: 10px;
  }

  .suporte-video-card {
    display: grid;
    grid-template-columns: minmax(320px, 1.1fr) minmax(280px, .9fr);
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, .045);
  }

  .suporte-video-player {
    position: relative;
    width: 100%;
    min-height: 265px;
    aspect-ratio: 16 / 9;
    background: #0f172a;
  }

  .suporte-video-player iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .suporte-video-info {
    padding: 28px;
  }

  .suporte-video-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .suporte-video-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    color: #475569;
    font-size: 10.5px;
    line-height: 1.45;
  }

  .suporte-video-item svg {
    flex-shrink: 0;
    color: #16a34a;
  }

  .suporte-faq-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .suporte-faq-item {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 13px;
    background: #fff;
  }

  .suporte-faq-item summary {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 0 17px;
    cursor: pointer;
    list-style: none;
  }

  .suporte-faq-item summary::-webkit-details-marker {
    display: none;
  }

  .suporte-faq-question {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #334155;
    font-size: 11px;
    font-weight: 720;
  }

  .suporte-faq-question svg {
    flex-shrink: 0;
    color: #2563eb;
  }

  .suporte-faq-chevron {
    flex-shrink: 0;
    color: #94a3b8;
    transition: transform .16s ease;
  }

  .suporte-faq-item[open] .suporte-faq-chevron {
    transform: rotate(90deg);
  }

  .suporte-faq-item > p {
    margin: 0;
    padding: 0 17px 17px 45px;
    color: #64748b;
    font-size: 10.5px;
    line-height: 1.65;
  }

  .suporte-tip {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 30px;
    padding: 17px;
    border: 1px solid #fde68a;
    border-radius: 14px;
    background: #fffbeb;
  }

  .suporte-tip-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #fef3c7;
    color: #d97706;
  }

  .suporte-tip strong {
    color: #92400e;
    font-size: 11px;
    font-weight: 800;
  }

  .suporte-tip p {
    margin: 5px 0 0;
    color: #a16207;
    font-size: 10px;
    line-height: 1.55;
  }

  .suporte-about {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 26px;
    margin-top: 30px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #fff;
  }

  .suporte-about > div:first-child {
    max-width: 720px;
  }

  .suporte-about p {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 10.5px;
    line-height: 1.6;
  }

  .suporte-about-badge {
    flex-shrink: 0;
    padding: 8px 11px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .5px;
  }

  @media (max-width: 1100px) {
    .suporte-page {
      padding: 26px;
    }

    .suporte-hero {
      padding: 36px;
    }

    .suporte-hero-badge {
      width: 145px;
      height: 145px;
    }

    .suporte-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .suporte-page {
      padding: 22px;
    }

    .suporte-hero {
      min-height: 0;
      padding: 32px;
    }

    .suporte-hero-badge {
      display: none;
    }

    .suporte-guide-layout {
      grid-template-columns: 1fr;
    }

    .suporte-guide-detail {
      position: static;
    }

    .suporte-video-card {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 650px) {
    .suporte-page {
      padding: 16px;
    }

    .suporte-hero {
      padding: 26px 20px;
      border-radius: 18px;
    }

    .suporte-hero h1 {
      font-size: 29px;
    }

    .suporte-section {
      margin-top: 29px;
    }

    .suporte-section-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .suporte-section-heading > p {
      max-width: none;
      text-align: left;
    }

    .suporte-quick-grid {
      grid-template-columns: 1fr;
    }

    .suporte-guide-detail {
      padding: 20px;
    }

    .suporte-video-player {
      min-height: 0;
    }

    .suporte-video-info {
      padding: 22px 20px;
    }

    .suporte-faq-item > p {
      padding-left: 17px;
    }

    .suporte-about {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 420px) {
    .suporte-search {
      height: 47px;
      padding: 0 12px;
    }

    .suporte-guide-card {
      padding: 11px;
    }

    .suporte-guide-copy span {
      -webkit-line-clamp: 1;
    }

    .suporte-faq-item summary {
      padding: 0 13px;
    }

    .suporte-faq-question {
      font-size: 10.5px;
    }
  }
`;
