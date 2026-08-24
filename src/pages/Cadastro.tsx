import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Eye,
  EyeOff,
  HardHat,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Ambulance,
  User,
} from "lucide-react";

import {
  useAuth,
} from "../contexts/AuthContext";

interface DestaqueProps {
  icon: ReactNode;
  titulo: string;
  descricao: string;
}

export default function Cadastro() {
  const navigate =
    useNavigate();

  const {
    cadastrar,
    user,
    loading,
  } = useAuth();

  const [
    nome,
    setNome,
  ] = useState("");

  const [
    empresa,
    setEmpresa,
  ] = useState("");

  const [
    cargo,
    setCargo,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    senha,
    setSenha,
  ] = useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [
    enviando,
    setEnviando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    sucesso,
    setSucesso,
  ] = useState("");

  const requisitosSenha =
    useMemo(
      () => ({
        tamanho:
          senha.length >= 8,
        letra:
          /[A-Za-zÀ-ÿ]/.test(
            senha
          ),
        numero:
          /\d/.test(
            senha
          ),
      }),
      [senha]
    );

  if (
    !loading &&
    user
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const nomeLimpo =
      nome.trim();

    const empresaLimpa =
      empresa.trim();

    const cargoLimpo =
      cargo.trim();

    const emailLimpo =
      email.trim();

    if (
      !nomeLimpo ||
      !empresaLimpa ||
      !cargoLimpo ||
      !emailLimpo ||
      !senha ||
      !confirmarSenha
    ) {
      setErro(
        "Preencha todos os campos."
      );

      return;
    }

    if (
      nomeLimpo.length < 3
    ) {
      setErro(
        "Informe seu nome completo."
      );

      return;
    }

    if (
      senha.length < 8
    ) {
      setErro(
        "A senha deve possuir pelo menos 8 caracteres."
      );

      return;
    }

    if (
      !requisitosSenha.letra ||
      !requisitosSenha.numero
    ) {
      setErro(
        "A senha deve conter pelo menos uma letra e um número."
      );

      return;
    }

    if (
      senha !==
      confirmarSenha
    ) {
      setErro(
        "As senhas não coincidem."
      );

      return;
    }

    setEnviando(true);

    try {
      const resultado =
        await cadastrar(
          nomeLimpo,
          empresaLimpa,
          cargoLimpo,
          emailLimpo,
          senha
        );

      if (
        resultado.error
      ) {
        setErro(
          traduzirErroCadastro(
            resultado.error
          )
        );

        return;
      }

      if (
        resultado.precisaConfirmarEmail
      ) {
        setSucesso(
          "Conta criada com sucesso. Enviamos uma mensagem para o seu e-mail. Confirme o cadastro pelo link recebido antes de entrar."
        );

        setSenha("");
        setConfirmarSenha("");

        return;
      }

      navigate(
        "/",
        {
          replace: true,
        }
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="auth-cadastro-page">
      <section className="auth-cadastro-brand-panel">
        <div
          className="auth-cadastro-grid-pattern"
          aria-hidden="true"
        />

        <div className="auth-cadastro-brand-content">
          <div className="auth-cadastro-brand">
            <div className="auth-cadastro-brand-icon">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <div className="auth-cadastro-brand-name">
                SafeKitchen
              </div>

              <div className="auth-cadastro-brand-subtitle">
                Gestão de Segurança e Saúde no Trabalho
              </div>
            </div>
          </div>

          <div className="auth-cadastro-brand-message">
            <span className="auth-cadastro-eyebrow">
              Novo cadastro
            </span>

            <h1>
              Estruture a gestão preventiva da sua operação.
            </h1>

            <p>
              Crie seu acesso para centralizar informações
              e acompanhar os principais processos de SST
              em cozinhas industriais.
            </p>
          </div>

          <div className="auth-cadastro-highlights">
            <Destaque
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              titulo="PGR e riscos ocupacionais"
              descricao="Organize perigos, avaliações, responsáveis, prazos e medidas de controle."
            />

            <Destaque
              icon={
                <HardHat
                  size={19}
                />
              }
              titulo="EPIs e inspeções"
              descricao="Acompanhe equipamentos, checklists e condições de segurança."
            />

            <Destaque
              icon={
                <Ambulance
                  size={19}
                />
              }
              titulo="Ocorrências e ações"
              descricao="Registre acidentes e incidentes e acompanhe ações preventivas."
            />

            <Destaque
              icon={
                <ClipboardCheck
                  size={19}
                />
              }
              titulo="Indicadores e relatórios"
              descricao="Consolide auditorias, DDS, alertas e informações gerenciais."
            />
          </div>
        </div>

        <div className="auth-cadastro-brand-footer">
          <span>NR-01</span>
          <span aria-hidden="true">/</span>
          <span>PGR</span>
          <span aria-hidden="true">/</span>
          <span>SST</span>
          <span aria-hidden="true">/</span>
          <span>Prevenção</span>
        </div>
      </section>

      <section className="auth-cadastro-form-panel">
        <header className="auth-cadastro-mobile-brand">
          <div className="auth-cadastro-mobile-brand-icon">
            <ShieldCheck
              size={18}
            />
          </div>

          <div>
            <strong>
              SafeKitchen
            </strong>

            <span>
              Plataforma de gestão de SST
            </span>
          </div>
        </header>

        <div className="auth-cadastro-form-container">
          {sucesso ? (
            <div
              className="auth-cadastro-success"
              aria-live="polite"
            >
              <div className="auth-cadastro-success-icon">
                <ShieldCheck
                  size={25}
                />
              </div>

              <span className="auth-cadastro-form-eyebrow">
                Cadastro concluído
              </span>

              <h2>
                Confirme seu e-mail
              </h2>

              <p>
                {sucesso}
              </p>

              <Link
                to="/login"
                className="auth-cadastro-success-button"
              >
                Ir para o login

                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-cadastro-card-header">
                <span className="auth-cadastro-form-eyebrow">
                  Criar acesso
                </span>

                <h2>
                  Criar conta corporativa
                </h2>

                <p>
                  Cadastre seus dados para iniciar a utilização
                  do SafeKitchen.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="auth-cadastro-form"
              >
                <div className="auth-cadastro-field">
                  <label
                    htmlFor="cadastro-nome"
                  >
                    Nome completo
                  </label>

                  <div className="auth-cadastro-input-wrapper">
                    <User
                      size={17}
                      className="auth-cadastro-input-icon"
                    />

                    <input
                      id="cadastro-nome"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Ex. Ana Ribeiro"
                      value={nome}
                      onChange={(event) =>
                        setNome(
                          event.target.value
                        )
                      }
                      disabled={enviando}
                      required
                    />
                  </div>
                </div>

                <div className="auth-cadastro-two-columns">
                  <div className="auth-cadastro-field">
                    <label
                      htmlFor="cadastro-empresa"
                    >
                      Empresa / Unidade
                    </label>

                    <div className="auth-cadastro-input-wrapper">
                      <Building2
                        size={17}
                        className="auth-cadastro-input-icon"
                      />

                      <input
                        id="cadastro-empresa"
                        name="organization"
                        type="text"
                        autoComplete="organization"
                        placeholder="Ex. Cozinha Central"
                        value={empresa}
                        onChange={(event) =>
                          setEmpresa(
                            event.target.value
                          )
                        }
                        disabled={enviando}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-cadastro-field">
                    <label
                      htmlFor="cadastro-cargo"
                    >
                      Cargo / Função
                    </label>

                    <div className="auth-cadastro-input-wrapper">
                      <User
                        size={17}
                        className="auth-cadastro-input-icon"
                      />

                      <input
                        id="cadastro-cargo"
                        name="organization-title"
                        type="text"
                        autoComplete="organization-title"
                        placeholder="Ex. Téc. de Segurança"
                        value={cargo}
                        onChange={(event) =>
                          setCargo(
                            event.target.value
                          )
                        }
                        disabled={enviando}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-cadastro-field">
                  <label
                    htmlFor="cadastro-email"
                  >
                    E-mail de acesso
                  </label>

                  <div className="auth-cadastro-input-wrapper">
                    <Mail
                      size={17}
                      className="auth-cadastro-input-icon"
                    />

                    <input
                      id="cadastro-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nome@empresa.com.br"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      disabled={enviando}
                      required
                    />
                  </div>
                </div>

                <div className="auth-cadastro-two-columns auth-cadastro-password-columns">
                  <div className="auth-cadastro-field">
                    <label
                      htmlFor="cadastro-senha"
                    >
                      Senha
                    </label>

                    <div className="auth-cadastro-input-wrapper">
                      <KeyRound
                        size={17}
                        className="auth-cadastro-input-icon"
                      />

                      <input
                        id="cadastro-senha"
                        name="password"
                        type={
                          mostrarSenha
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={senha}
                        onChange={(event) =>
                          setSenha(
                            event.target.value
                          )
                        }
                        disabled={enviando}
                        minLength={8}
                        required
                      />

                      <button
                        type="button"
                        className="auth-cadastro-password-button"
                        onClick={() =>
                          setMostrarSenha(
                            (valorAtual) =>
                              !valorAtual
                          )
                        }
                        aria-label={
                          mostrarSenha
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                        title={
                          mostrarSenha
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {mostrarSenha ? (
                          <EyeOff
                            size={17}
                          />
                        ) : (
                          <Eye
                            size={17}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="auth-cadastro-field">
                    <label
                      htmlFor="cadastro-confirmar-senha"
                    >
                      Confirmar senha
                    </label>

                    <div className="auth-cadastro-input-wrapper">
                      <KeyRound
                        size={17}
                        className="auth-cadastro-input-icon"
                      />

                      <input
                        id="cadastro-confirmar-senha"
                        name="password-confirmation"
                        type={
                          mostrarConfirmacao
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        value={confirmarSenha}
                        onChange={(event) =>
                          setConfirmarSenha(
                            event.target.value
                          )
                        }
                        disabled={enviando}
                        minLength={8}
                        required
                      />

                      <button
                        type="button"
                        className="auth-cadastro-password-button"
                        onClick={() =>
                          setMostrarConfirmacao(
                            (valorAtual) =>
                              !valorAtual
                          )
                        }
                        aria-label={
                          mostrarConfirmacao
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                        title={
                          mostrarConfirmacao
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {mostrarConfirmacao ? (
                          <EyeOff
                            size={17}
                          />
                        ) : (
                          <Eye
                            size={17}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="auth-cadastro-password-rules">
                  <RegraSenha
                    ativa={requisitosSenha.tamanho}
                    texto="8 ou mais caracteres"
                  />

                  <RegraSenha
                    ativa={requisitosSenha.letra}
                    texto="Pelo menos uma letra"
                  />

                  <RegraSenha
                    ativa={requisitosSenha.numero}
                    texto="Pelo menos um número"
                  />
                </div>

                {erro && (
                  <div
                    className="auth-cadastro-error"
                    role="alert"
                    aria-live="polite"
                  >
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-cadastro-submit"
                  disabled={enviando}
                >
                  {enviando ? (
                    <LoaderCircle
                      size={17}
                      className="auth-cadastro-spinner"
                    />
                  ) : (
                    <ArrowRight
                      size={17}
                    />
                  )}

                  <span>
                    {enviando
                      ? "Criando conta..."
                      : "Criar conta"}
                  </span>
                </button>
              </form>

              <div className="auth-cadastro-access-link">
                <span>
                  Já possui uma conta?
                </span>

                <Link
                  to="/login"
                >
                  Fazer login
                </Link>
              </div>

              <p className="auth-cadastro-security">
                Os dados de cada conta permanecem separados dentro do sistema de autenticação.
              </p>
            </>
          )}
        </div>

        <footer className="auth-cadastro-form-footer">
          © {new Date().getFullYear()} SafeKitchen · Plataforma de Segurança do Trabalho
        </footer>
      </section>

      <style>
        {cadastroStyles}
      </style>
    </main>
  );
}

function Destaque({
  icon,
  titulo,
  descricao,
}: DestaqueProps) {
  return (
    <div className="auth-cadastro-highlight">
      <div className="auth-cadastro-highlight-icon">
        {icon}
      </div>

      <div>
        <strong>
          {titulo}
        </strong>

        <p>
          {descricao}
        </p>
      </div>
    </div>
  );
}

function RegraSenha({
  ativa,
  texto,
}: {
  ativa: boolean;
  texto: string;
}) {
  return (
    <div
      className={
        ativa
          ? "auth-cadastro-password-rule auth-cadastro-password-rule-ok"
          : "auth-cadastro-password-rule"
      }
    >
      <span>
        <Check
          size={11}
        />
      </span>

      {texto}
    </div>
  );
}

function traduzirErroCadastro(
  mensagem: string
) {
  const erro =
    mensagem.toLowerCase();

  if (
    erro.includes(
      "password should be at least"
    )
  ) {
    return "A senha informada é muito curta.";
  }

  if (
    erro.includes(
      "user already registered"
    ) ||
    erro.includes(
      "user already exists"
    )
  ) {
    return "Já existe uma conta cadastrada com este e-mail.";
  }

  if (
    erro.includes(
      "invalid email"
    )
  ) {
    return "Informe um endereço de e-mail válido.";
  }

  if (
    erro.includes(
      "signup is disabled"
    )
  ) {
    return "O cadastro de novos usuários está desativado.";
  }

  if (
    erro.includes(
      "rate limit"
    ) ||
    erro.includes(
      "too many requests"
    )
  ) {
    return "Muitas tentativas de cadastro. Aguarde um pouco e tente novamente.";
  }

  return "Não foi possível criar sua conta. Tente novamente.";
}

const cadastroStyles = `
  .auth-cadastro-page {
    width: 100%;
    min-width: 0;
    min-height: 100vh;
    min-height: 100dvh;

    display: grid;
    grid-template-columns:
      minmax(440px, .95fr)
      minmax(570px, 1.05fr);

    background: #f8fafc;
  }

  .auth-cadastro-brand-panel {
    min-width: 0;
    min-height: 100vh;
    min-height: 100dvh;

    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 48px 54px 38px;
    box-sizing: border-box;
    overflow: hidden;

    background: #0f172a;
    color: #ffffff;
  }

  .auth-cadastro-grid-pattern {
    position: absolute;
    inset: 0;

    pointer-events: none;

    opacity: .07;

    background-image:
      linear-gradient(
        to right,
        rgba(255,255,255,.85) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(255,255,255,.85) 1px,
        transparent 1px
      );

    background-size: 56px 56px;
  }

  .auth-cadastro-brand-panel::after {
    content: "";

    position: absolute;
    width: 470px;
    height: 470px;
    right: -255px;
    bottom: -225px;

    border-radius: 50%;

    background:
      rgba(37, 99, 235, .16);
  }

  .auth-cadastro-brand-content,
  .auth-cadastro-brand-footer {
    position: relative;
    z-index: 1;
  }

  .auth-cadastro-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .auth-cadastro-brand-icon {
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    border: 1px solid rgba(255,255,255,.16);
    border-radius: 10px;

    background: rgba(255,255,255,.08);
    color: #dbeafe;
  }

  .auth-cadastro-brand-name {
    color: #ffffff;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.25px;
  }

  .auth-cadastro-brand-subtitle {
    margin-top: 2px;

    color: #94a3b8;
    font-size: 10px;
    line-height: 1.4;
  }

  .auth-cadastro-brand-message {
    max-width: 520px;
    margin-top: clamp(56px, 8vh, 100px);
  }

  .auth-cadastro-eyebrow,
  .auth-cadastro-form-eyebrow {
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      "Courier New",
      monospace;

    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .16em;
  }

  .auth-cadastro-eyebrow {
    color: #94a3b8;
  }

  .auth-cadastro-brand-message h1 {
    max-width: 510px;
    margin: 18px 0 0;

    color: #ffffff;
    font-size: clamp(32px, 3.6vw, 47px);
    font-weight: 750;
    line-height: 1.07;
    letter-spacing: -1.45px;
  }

  .auth-cadastro-brand-message > p {
    max-width: 485px;
    margin: 18px 0 0;

    color: #94a3b8;
    font-size: 14px;
    line-height: 1.7;
  }

  .auth-cadastro-highlights {
    display: flex;
    flex-direction: column;
    gap: 18px;

    margin-top: 32px;
  }

  .auth-cadastro-highlight {
    display: flex;
    align-items: flex-start;
    gap: 14px;

    max-width: 500px;
  }

  .auth-cadastro-highlight-icon {
    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    margin-top: 1px;

    color: #94a3b8;
  }

  .auth-cadastro-highlight strong {
    display: block;

    color: #e2e8f0;
    font-size: 12px;
    font-weight: 700;
  }

  .auth-cadastro-highlight p {
    margin: 4px 0 0;

    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
  }

  .auth-cadastro-brand-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;

    margin-top: 34px;
    padding-top: 22px;

    border-top: 1px solid rgba(255,255,255,.11);

    color: #64748b;

    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      "Courier New",
      monospace;

    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .auth-cadastro-form-panel {
    min-width: 0;
    min-height: 100vh;
    min-height: 100dvh;

    display: flex;
    flex-direction: column;

    background: #ffffff;
  }

  .auth-cadastro-mobile-brand {
    display: none;
  }

  .auth-cadastro-form-container {
    width: 100%;
    max-width: 560px;

    margin: auto;
    padding: 34px 32px;
    box-sizing: border-box;
  }

  .auth-cadastro-card-header {
    margin-bottom: 24px;
  }

  .auth-cadastro-form-eyebrow {
    color: #64748b;
  }

  .auth-cadastro-card-header h2,
  .auth-cadastro-success h2 {
    margin: 9px 0 0;

    color: #0f172a;
    font-size: 27px;
    font-weight: 750;
    line-height: 1.2;
    letter-spacing: -.6px;
  }

  .auth-cadastro-card-header p {
    margin: 9px 0 0;

    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
  }

  .auth-cadastro-form {
    display: flex;
    flex-direction: column;
    gap: 17px;
  }

  .auth-cadastro-field {
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .auth-cadastro-field label {
    color: #334155;
    font-size: 11px;
    font-weight: 700;
  }

  .auth-cadastro-input-wrapper {
    width: 100%;
    min-width: 0;
    height: 42px;

    display: flex;
    align-items: center;
    gap: 8px;

    padding: 0 10px;
    box-sizing: border-box;

    border: 1px solid #cbd5e1;
    border-radius: 8px;

    background: #ffffff;

    transition:
      border-color .15s ease,
      box-shadow .15s ease;
  }

  .auth-cadastro-input-wrapper:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,.08);
  }

  .auth-cadastro-input-icon {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .auth-cadastro-input-wrapper input {
    width: 100%;
    min-width: 0;
    flex: 1;

    border: none;
    outline: none;

    background: transparent;
    color: #0f172a;

    font-family: inherit;
    font-size: 11.5px;
  }

  .auth-cadastro-input-wrapper input::placeholder {
    color: #94a3b8;
  }

  .auth-cadastro-input-wrapper input:disabled {
    cursor: not-allowed;
  }

  .auth-cadastro-two-columns {
    min-width: 0;

    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .auth-cadastro-password-button {
    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    padding: 0;

    border: none;
    border-radius: 6px;

    background: transparent;
    color: #64748b;

    cursor: pointer;
  }

  .auth-cadastro-password-button:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .auth-cadastro-password-rules {
    display: flex;
    flex-wrap: wrap;
    gap: 7px 13px;

    margin-top: -3px;
  }

  .auth-cadastro-password-rule {
    display: flex;
    align-items: center;
    gap: 5px;

    color: #94a3b8;
    font-size: 9.5px;
  }

  .auth-cadastro-password-rule > span {
    width: 15px;
    height: 15px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    border: 1px solid #cbd5e1;
    border-radius: 50%;

    color: transparent;
  }

  .auth-cadastro-password-rule-ok {
    color: #166534;
  }

  .auth-cadastro-password-rule-ok > span {
    border-color: #86efac;
    background: #f0fdf4;
    color: #16a34a;
  }

  .auth-cadastro-error {
    padding: 10px 11px;

    border: 1px solid #fecaca;
    border-radius: 8px;

    background: #fef2f2;
    color: #b91c1c;

    font-size: 11px;
    font-weight: 600;
    line-height: 1.45;
  }

  .auth-cadastro-submit,
  .auth-cadastro-success-button {
    width: 100%;
    height: 43px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    box-sizing: border-box;
    padding: 0 16px;

    border: none;
    border-radius: 8px;

    background: #0f172a;
    color: #ffffff;

    font-family: inherit;
    font-size: 12px;
    font-weight: 750;
    text-decoration: none;

    cursor: pointer;

    transition:
      background .15s ease,
      transform .15s ease;
  }

  .auth-cadastro-submit:hover:not(:disabled),
  .auth-cadastro-success-button:hover {
    background: #1e293b;
  }

  .auth-cadastro-submit:active:not(:disabled),
  .auth-cadastro-success-button:active {
    transform: translateY(1px);
  }

  .auth-cadastro-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .auth-cadastro-spinner {
    animation: auth-cadastro-spin .8s linear infinite;
  }

  @keyframes auth-cadastro-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .auth-cadastro-access-link {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;

    margin-top: 22px;

    color: #64748b;
    font-size: 11px;
  }

  .auth-cadastro-access-link a {
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .auth-cadastro-security {
    margin: 19px 0 0;
    padding-top: 17px;

    border-top: 1px solid #e2e8f0;

    color: #94a3b8;
    font-size: 9.5px;
    line-height: 1.45;
    text-align: center;
  }

  .auth-cadastro-success {
    width: 100%;

    padding: 30px 26px;
    box-sizing: border-box;

    border: 1px solid #e2e8f0;
    border-radius: 12px;

    background: #ffffff;

    box-shadow:
      0 18px 45px rgba(15,23,42,.06);

    text-align: left;
  }

  .auth-cadastro-success-icon {
    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 20px;

    border-radius: 10px;

    background: #eff6ff;
    color: #2563eb;
  }

  .auth-cadastro-success p {
    margin: 12px 0 24px;

    color: #64748b;
    font-size: 12px;
    line-height: 1.65;
  }

  .auth-cadastro-form-footer {
    padding: 0 32px 24px;

    color: #94a3b8;
    font-size: 9.5px;
    text-align: center;
  }

  .auth-cadastro-mobile-brand {
    display: none;
  }

  @media (max-width: 1050px) {
    .auth-cadastro-page {
      grid-template-columns:
        minmax(350px, .78fr)
        minmax(520px, 1.22fr);
    }

    .auth-cadastro-brand-panel {
      padding: 38px 34px 30px;
    }

    .auth-cadastro-brand-message h1 {
      font-size: 36px;
    }
  }

  @media (max-width: 860px) {
    .auth-cadastro-page {
      display: block;
    }

    .auth-cadastro-brand-panel {
      display: none;
    }

    .auth-cadastro-form-panel {
      min-height: 100vh;
      min-height: 100dvh;
    }

    .auth-cadastro-mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;

      padding: 18px 22px;

      border-bottom: 1px solid #e2e8f0;
    }

    .auth-cadastro-mobile-brand-icon {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      border-radius: 8px;

      background: #0f172a;
      color: #ffffff;
    }

    .auth-cadastro-mobile-brand strong {
      display: block;

      color: #0f172a;
      font-size: 14px;
      font-weight: 800;
    }

    .auth-cadastro-mobile-brand span {
      display: block;
      margin-top: 1px;

      color: #94a3b8;
      font-size: 9px;
    }

    .auth-cadastro-form-container {
      padding: 38px 22px 32px;
    }

    .auth-cadastro-form-footer {
      padding: 0 22px 22px;
    }
  }

  @media (max-width: 560px) {
    .auth-cadastro-form-container {
      max-width: none;
      padding: 32px 16px 28px;
    }

    .auth-cadastro-card-header h2,
    .auth-cadastro-success h2 {
      font-size: 24px;
    }

    .auth-cadastro-two-columns {
      grid-template-columns: 1fr;
    }

    .auth-cadastro-password-rules {
      flex-direction: column;
      gap: 6px;
    }

    .auth-cadastro-form-footer {
      padding: 0 16px 20px;
    }
  }
`;