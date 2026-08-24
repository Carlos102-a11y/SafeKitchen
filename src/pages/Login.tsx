import {
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
  ClipboardCheck,
  Eye,
  EyeOff,
  HardHat,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Ambulance,
} from "lucide-react";

import {
  useAuth,
} from "../contexts/AuthContext";

interface DestaqueProps {
  icon: ReactNode;
  titulo: string;
  descricao: string;
}

export default function Login() {
  const navigate =
    useNavigate();

  const {
    entrar,
    user,
    loading,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    senha,
    setSenha,
  ] = useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    enviando,
    setEnviando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

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

    const emailLimpo =
      email.trim();

    if (
      !emailLimpo ||
      !senha
    ) {
      setErro(
        "Informe o e-mail e a senha."
      );

      return;
    }

    setEnviando(true);

    try {
      const resultado =
        await entrar(
          emailLimpo,
          senha
        );

      if (
        resultado.error
      ) {
        setErro(
          traduzirErroLogin(
            resultado.error
          )
        );

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
    <main className="auth-login-page">
      <section className="auth-login-brand-panel">
        <div
          className="auth-login-grid-pattern"
          aria-hidden="true"
        />

        <div className="auth-login-brand-content">
          <div className="auth-login-brand">
            <div className="auth-login-brand-icon">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <div className="auth-login-brand-name">
                SafeKitchen
              </div>

              <div className="auth-login-brand-subtitle">
                Gestão de Segurança e Saúde no Trabalho
              </div>
            </div>
          </div>

          <div className="auth-login-brand-message">
            <span className="auth-login-eyebrow">
              Gestão de SST
            </span>

            <h1>
              Segurança e prevenção em cozinhas industriais.
            </h1>

            <p>
              Centralize riscos, inspeções, EPIs,
              ocorrências e ações preventivas em um
              único ambiente de gestão.
            </p>
          </div>

          <div className="auth-login-highlights">
            <Destaque
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              titulo="PGR e Gestão de Riscos"
              descricao="Inventário, avaliação e acompanhamento das medidas de controle."
            />

            <Destaque
              icon={
                <ClipboardCheck
                  size={19}
                />
              }
              titulo="Checklists e Auditorias"
              descricao="Inspeções e acompanhamento das condições de segurança."
            />

            <Destaque
              icon={
                <HardHat
                  size={19}
                />
              }
              titulo="Controle de EPIs"
              descricao="Acompanhamento de CA, estoque e validade dos equipamentos."
            />

            <Destaque
              icon={
                <Ambulance
                  size={19}
                />
              }
              titulo="Ocorrências e DDS"
              descricao="Registro de acidentes, incidentes e ações de conscientização."
            />
          </div>
        </div>

        <div className="auth-login-brand-footer">
          <span>NR-01</span>
          <span aria-hidden="true">/</span>
          <span>PGR</span>
          <span aria-hidden="true">/</span>
          <span>SST</span>
          <span aria-hidden="true">/</span>
          <span>Prevenção</span>
        </div>
      </section>

      <section className="auth-login-form-panel">
        <header className="auth-login-mobile-brand">
          <div className="auth-login-mobile-brand-icon">
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

        <div className="auth-login-form-container">
          <div className="auth-login-card-header">
            <span className="auth-login-form-eyebrow">
              Acesso à plataforma
            </span>

            <h2>
              Entrar na sua conta
            </h2>

            <p>
              Informe suas credenciais para acessar
              os módulos de gestão do SafeKitchen.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-login-form"
          >
            <div className="auth-login-field">
              <label
                htmlFor="login-email"
              >
                E-mail
              </label>

              <div className="auth-login-input-wrapper">
                <Mail
                  size={17}
                  className="auth-login-input-icon"
                />

                <input
                  id="login-email"
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

            <div className="auth-login-field">
              <label
                htmlFor="login-senha"
              >
                Senha
              </label>

              <div className="auth-login-input-wrapper">
                <KeyRound
                  size={17}
                  className="auth-login-input-icon"
                />

                <input
                  id="login-senha"
                  name="password"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) =>
                    setSenha(
                      event.target.value
                    )
                  }
                  disabled={enviando}
                  required
                />

                <button
                  type="button"
                  className="auth-login-password-button"
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

            {erro && (
              <div
                className="auth-login-error"
                role="alert"
                aria-live="polite"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="auth-login-submit"
              disabled={enviando}
            >
              {enviando ? (
                <LoaderCircle
                  size={17}
                  className="auth-login-spinner"
                />
              ) : (
                <ArrowRight
                  size={17}
                />
              )}

              <span>
                {enviando
                  ? "Entrando..."
                  : "Entrar"}
              </span>
            </button>
          </form>

          <div className="auth-login-access-link">
            <span>
              Ainda não possui acesso?
            </span>

            <Link
              to="/cadastro"
            >
              Criar uma conta
            </Link>
          </div>

          <div className="auth-login-security">
            <ShieldCheck
              size={14}
            />

            <span>
              O acesso é protegido pelo sistema de autenticação do SafeKitchen.
            </span>
          </div>
        </div>

        <footer className="auth-login-form-footer">
          © {new Date().getFullYear()} SafeKitchen · Plataforma de Segurança do Trabalho
        </footer>
      </section>

      <style>
        {loginStyles}
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
    <div className="auth-login-highlight">
      <div className="auth-login-highlight-icon">
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

function traduzirErroLogin(
  mensagem: string
) {
  const erro =
    mensagem.toLowerCase();

  if (
    erro.includes(
      "invalid login credentials"
    )
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (
    erro.includes(
      "email not confirmed"
    )
  ) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (
    erro.includes(
      "too many requests"
    ) ||
    erro.includes(
      "rate limit"
    )
  ) {
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }

  return "Não foi possível realizar o login. Tente novamente.";
}

const loginStyles = `
  .auth-login-page {
    width: 100%;
    min-width: 0;
    min-height: 100vh;
    min-height: 100dvh;

    display: grid;
    grid-template-columns:
      minmax(440px, .95fr)
      minmax(500px, 1.05fr);

    background: #f8fafc;
  }

  .auth-login-brand-panel {
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

  .auth-login-grid-pattern {
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

  .auth-login-brand-panel::after {
    content: "";

    position: absolute;
    width: 470px;
    height: 470px;
    right: -255px;
    bottom: -225px;

    border-radius: 50%;

    background:
      rgba(37, 99, 235, .16);

    filter: blur(2px);
  }

  .auth-login-brand-content,
  .auth-login-brand-footer {
    position: relative;
    z-index: 1;
  }

  .auth-login-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .auth-login-brand-icon {
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

  .auth-login-brand-name {
    color: #ffffff;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.25px;
  }

  .auth-login-brand-subtitle {
    margin-top: 2px;

    color: #94a3b8;
    font-size: 10px;
    line-height: 1.4;
  }

  .auth-login-brand-message {
    max-width: 510px;
    margin-top: clamp(62px, 10vh, 118px);
  }

  .auth-login-eyebrow,
  .auth-login-form-eyebrow {
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

  .auth-login-eyebrow {
    color: #94a3b8;
  }

  .auth-login-brand-message h1 {
    max-width: 500px;
    margin: 18px 0 0;

    color: #ffffff;
    font-size: clamp(34px, 3.8vw, 50px);
    font-weight: 750;
    line-height: 1.07;
    letter-spacing: -1.5px;
  }

  .auth-login-brand-message > p {
    max-width: 480px;
    margin: 18px 0 0;

    color: #94a3b8;
    font-size: 14px;
    line-height: 1.7;
  }

  .auth-login-highlights {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-top: 36px;
  }

  .auth-login-highlight {
    display: flex;
    align-items: flex-start;
    gap: 14px;

    max-width: 500px;
  }

  .auth-login-highlight-icon {
    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    margin-top: 1px;

    color: #94a3b8;
  }

  .auth-login-highlight strong {
    display: block;

    color: #e2e8f0;
    font-size: 12px;
    font-weight: 700;
  }

  .auth-login-highlight p {
    margin: 4px 0 0;

    color: #64748b;
    font-size: 11px;
    line-height: 1.55;
  }

  .auth-login-brand-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;

    margin-top: 40px;
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

  .auth-login-form-panel {
    min-width: 0;
    min-height: 100vh;
    min-height: 100dvh;

    display: flex;
    flex-direction: column;

    background: #ffffff;
  }

  .auth-login-mobile-brand {
    display: none;
  }

  .auth-login-form-container {
    width: 100%;
    max-width: 420px;

    margin: auto;
    padding: 48px 32px;
    box-sizing: border-box;
  }

  .auth-login-card-header {
    margin-bottom: 30px;
  }

  .auth-login-form-eyebrow {
    color: #64748b;
  }

  .auth-login-card-header h2 {
    margin: 9px 0 0;

    color: #0f172a;
    font-size: 27px;
    font-weight: 750;
    line-height: 1.2;
    letter-spacing: -.6px;
  }

  .auth-login-card-header p {
    margin: 9px 0 0;

    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }

  .auth-login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .auth-login-field {
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .auth-login-field label {
    color: #334155;
    font-size: 11px;
    font-weight: 700;
  }

  .auth-login-input-wrapper {
    width: 100%;
    min-width: 0;
    height: 43px;

    display: flex;
    align-items: center;
    gap: 9px;

    padding: 0 11px;
    box-sizing: border-box;

    border: 1px solid #cbd5e1;
    border-radius: 8px;

    background: #ffffff;

    transition:
      border-color .15s ease,
      box-shadow .15s ease;
  }

  .auth-login-input-wrapper:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,.08);
  }

  .auth-login-input-icon {
    flex-shrink: 0;
    color: #94a3b8;
  }

  .auth-login-input-wrapper input {
    width: 100%;
    min-width: 0;
    flex: 1;

    border: none;
    outline: none;

    background: transparent;
    color: #0f172a;

    font-family: inherit;
    font-size: 12px;
  }

  .auth-login-input-wrapper input::placeholder {
    color: #94a3b8;
  }

  .auth-login-input-wrapper input:disabled {
    cursor: not-allowed;
  }

  .auth-login-password-button {
    width: 30px;
    height: 30px;

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

  .auth-login-password-button:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .auth-login-error {
    padding: 10px 11px;

    border: 1px solid #fecaca;
    border-radius: 8px;

    background: #fef2f2;
    color: #b91c1c;

    font-size: 11px;
    font-weight: 600;
    line-height: 1.45;
  }

  .auth-login-submit {
    width: 100%;
    height: 43px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    margin-top: 2px;
    padding: 0 16px;

    border: none;
    border-radius: 8px;

    background: #0f172a;
    color: #ffffff;

    font-family: inherit;
    font-size: 12px;
    font-weight: 750;

    cursor: pointer;

    transition:
      background .15s ease,
      transform .15s ease;
  }

  .auth-login-submit:hover:not(:disabled) {
    background: #1e293b;
  }

  .auth-login-submit:active:not(:disabled) {
    transform: translateY(1px);
  }

  .auth-login-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .auth-login-spinner {
    animation: auth-login-spin .8s linear infinite;
  }

  @keyframes auth-login-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .auth-login-access-link {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;

    margin-top: 26px;

    color: #64748b;
    font-size: 11px;
  }

  .auth-login-access-link a {
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .auth-login-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    margin-top: 26px;
    padding-top: 18px;

    border-top: 1px solid #e2e8f0;

    color: #94a3b8;
    font-size: 9.5px;
    line-height: 1.45;
    text-align: center;
  }

  .auth-login-form-footer {
    padding: 0 32px 28px;

    color: #94a3b8;
    font-size: 9.5px;
    text-align: center;
  }

  @media (max-width: 980px) {
    .auth-login-page {
      grid-template-columns:
        minmax(350px, .8fr)
        minmax(430px, 1.2fr);
    }

    .auth-login-brand-panel {
      padding: 38px 34px 30px;
    }

    .auth-login-brand-message h1 {
      font-size: 37px;
    }
  }

  @media (max-width: 800px) {
    .auth-login-page {
      display: block;
    }

    .auth-login-brand-panel {
      display: none;
    }

    .auth-login-form-panel {
      min-height: 100vh;
      min-height: 100dvh;
    }

    .auth-login-mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;

      padding: 18px 22px;

      border-bottom: 1px solid #e2e8f0;
    }

    .auth-login-mobile-brand-icon {
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

    .auth-login-mobile-brand strong {
      display: block;

      color: #0f172a;
      font-size: 14px;
      font-weight: 800;
    }

    .auth-login-mobile-brand span {
      display: block;
      margin-top: 1px;

      color: #94a3b8;
      font-size: 9px;
    }

    .auth-login-form-container {
      padding: 48px 22px 36px;
    }

    .auth-login-form-footer {
      padding: 0 22px 22px;
    }
  }

  @media (max-width: 480px) {
    .auth-login-form-container {
      max-width: none;
      padding: 38px 16px 30px;
    }

    .auth-login-card-header h2 {
      font-size: 25px;
    }

    .auth-login-form-footer {
      padding: 0 16px 20px;
    }
  }
`;