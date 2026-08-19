import {
    useState,
  } from "react";
  
  import {
    Link,
    Navigate,
    useNavigate,
  } from "react-router-dom";
  
  import {
    ArrowRight,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    ShieldCheck,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../contexts/AuthContext";
  
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
      event: React.FormEvent<HTMLFormElement>
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
      <main className="login-page">
        <section className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand">
              <div className="login-brand-icon">
                <ShieldCheck
                  size={29}
                />
              </div>
  
              <div>
                <div className="login-brand-name">
                  SafeKitchen
                </div>
  
                <div className="login-brand-subtitle">
                  Gestão de Segurança e Saúde no Trabalho
                </div>
              </div>
            </div>
  
            <div className="login-brand-message">
              <span className="login-eyebrow">
                Segurança integrada
              </span>
  
              <h1>
                Gestão preventiva para
                cozinhas industriais.
              </h1>
  
              <p>
                Centralize riscos, PGR, EPIs,
                inspeções, acidentes, DDS e
                auditorias em um único ambiente.
              </p>
            </div>
  
            <div className="login-features">
              <Feature
                text="Controle integrado das informações de SST"
              />
  
              <Feature
                text="Monitoramento de riscos e ações preventivas"
              />
  
              <Feature
                text="Indicadores e relatórios para acompanhamento"
              />
            </div>
          </div>
  
          <div className="login-brand-footer">
            SafeKitchen • Segurança na cozinha industrial
          </div>
        </section>
  
        <section className="login-form-panel">
          <div className="login-mobile-brand">
            <div className="login-brand-icon login-brand-icon-small">
              <ShieldCheck
                size={23}
              />
            </div>
  
            <div>
              <strong>
                SafeKitchen
              </strong>
  
              <span>
                Segurança e Saúde no Trabalho
              </span>
            </div>
          </div>
  
          <div className="login-card">
            <div className="login-card-header">
              <span className="login-form-eyebrow">
                Acesso ao sistema
              </span>
  
              <h2>
                Bem-vindo de volta
              </h2>
  
              <p>
                Entre com sua conta para acessar
                o SafeKitchen.
              </p>
            </div>
  
            <form
              onSubmit={
                handleSubmit
              }
              className="login-form"
            >
              <div className="login-field">
                <label
                  htmlFor="login-email"
                >
                  E-mail
                </label>
  
                <div className="login-input-wrapper">
                  <Mail
                    size={18}
                    className="login-input-icon"
                  />
  
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={
                      email
                    }
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    disabled={
                      enviando
                    }
                  />
                </div>
              </div>
  
              <div className="login-field">
                <label
                  htmlFor="login-senha"
                >
                  Senha
                </label>
  
                <div className="login-input-wrapper">
                  <KeyRound
                    size={18}
                    className="login-input-icon"
                  />
  
                  <input
                    id="login-senha"
                    type={
                      mostrarSenha
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={
                      senha
                    }
                    onChange={(event) =>
                      setSenha(
                        event.target.value
                      )
                    }
                    disabled={
                      enviando
                    }
                  />
  
                  <button
                    type="button"
                    className="login-password-button"
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
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>
  
              {erro && (
                <div
                  className="login-error"
                  role="alert"
                >
                  {erro}
                </div>
              )}
  
              <button
                type="submit"
                className="login-submit"
                disabled={
                  enviando
                }
              >
                <span>
                  {enviando
                    ? "Entrando..."
                    : "Entrar"}
                </span>
  
                {!enviando && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>
            </form>
  
            <div className="login-divider">
              <span />
  
              <p>
                Primeira vez no SafeKitchen?
              </p>
  
              <span />
            </div>
  
            <Link
              to="/cadastro"
              className="login-register"
            >
              Criar uma conta
            </Link>
  
            <p className="login-security">
              Seus dados de acesso são protegidos
              pelo sistema de autenticação.
            </p>
          </div>
        </section>
  
        <style>
          {loginStyles}
        </style>
      </main>
    );
  }
  
  function Feature({
    text,
  }: {
    text: string;
  }) {
    return (
      <div className="login-feature">
        <div className="login-feature-check">
          <ShieldCheck
            size={15}
          />
        </div>
  
        <span>
          {text}
        </span>
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
      )
    ) {
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    }
  
    return "Não foi possível realizar o login. Tente novamente.";
  }
  
  const loginStyles = `
    .login-page {
      width: 100%;
      min-width: 0;
      min-height: 100vh;
      min-height: 100dvh;
  
      display: grid;
      grid-template-columns:
        minmax(420px, 0.95fr)
        minmax(500px, 1.05fr);
  
      background:
        #f8fafc;
    }
  
    .login-brand-panel {
      min-width: 0;
  
      position: relative;
  
      display: flex;
      flex-direction: column;
  
      justify-content:
        space-between;
  
      padding:
        48px 54px 38px;
  
      overflow: hidden;
  
      background:
        linear-gradient(
          145deg,
          #0f172a 0%,
          #111f38 48%,
          #172554 100%
        );
  
      color:
        #ffffff;
    }
  
    .login-brand-panel::before {
      content: "";
  
      position: absolute;
  
      width: 420px;
      height: 420px;
  
      top: -170px;
      right: -180px;
  
      border-radius:
        50%;
  
      background:
        rgba(
          37,
          99,
          235,
          .18
        );
    }
  
    .login-brand-panel::after {
      content: "";
  
      position: absolute;
  
      width: 320px;
      height: 320px;
  
      bottom: -190px;
      left: -120px;
  
      border-radius:
        50%;
  
      background:
        rgba(
          14,
          165,
          233,
          .1
        );
    }
  
    .login-brand-content,
    .login-brand-footer {
      position: relative;
  
      z-index: 1;
    }
  
    .login-brand {
      display: flex;
  
      align-items:
        center;
  
      gap: 13px;
    }
  
    .login-brand-icon {
      width: 50px;
      height: 50px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      flex-shrink: 0;
  
      border:
        1px solid
        rgba(
          255,
          255,
          255,
          .14
        );
  
      border-radius:
        15px;
  
      background:
        rgba(
          37,
          99,
          235,
          .22
        );
  
      color:
        #60a5fa;
    }
  
    .login-brand-name {
      color:
        #ffffff;
  
      font-size:
        20px;
  
      font-weight:
        850;
  
      letter-spacing:
        -.35px;
    }
  
    .login-brand-subtitle {
      margin-top:
        3px;
  
      color:
        #94a3b8;
  
      font-size:
        11px;
  
      line-height:
        1.4;
    }
  
    .login-brand-message {
      max-width:
        520px;
  
      margin-top:
        clamp(
          80px,
          16vh,
          170px
        );
    }
  
    .login-eyebrow {
      display:
        inline-flex;
  
      padding:
        7px 11px;
  
      border:
        1px solid
        rgba(
          96,
          165,
          250,
          .2
        );
  
      border-radius:
        999px;
  
      background:
        rgba(
          37,
          99,
          235,
          .11
        );
  
      color:
        #93c5fd;
  
      font-size:
        10px;
  
      font-weight:
        800;
  
      text-transform:
        uppercase;
  
      letter-spacing:
        .8px;
    }
  
    .login-brand-message h1 {
      margin:
        22px 0 0;
  
      max-width:
        510px;
  
      color:
        #ffffff;
  
      font-size:
        clamp(
          36px,
          4vw,
          52px
        );
  
      font-weight:
        850;
  
      line-height:
        1.04;
  
      letter-spacing:
        -1.8px;
    }
  
    .login-brand-message p {
      margin:
        20px 0 0;
  
      max-width:
        485px;
  
      color:
        #94a3b8;
  
      font-size:
        14px;
  
      line-height:
        1.75;
    }
  
    .login-features {
      display: flex;
  
      flex-direction:
        column;
  
      gap: 14px;
  
      margin-top:
        38px;
    }
  
    .login-feature {
      display: flex;
  
      align-items:
        center;
  
      gap: 11px;
  
      color:
        #cbd5e1;
  
      font-size:
        12px;
  
      line-height:
        1.45;
    }
  
    .login-feature-check {
      width: 27px;
      height: 27px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      flex-shrink: 0;
  
      border-radius:
        8px;
  
      background:
        rgba(
          37,
          99,
          235,
          .15
        );
  
      color:
        #60a5fa;
    }
  
    .login-brand-footer {
      margin-top:
        50px;
  
      color:
        #64748b;
  
      font-size:
        10px;
    }
  
    .login-form-panel {
      min-width: 0;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      padding:
        48px;
  
      box-sizing:
        border-box;
  
      background:
        #f8fafc;
    }
  
    .login-card {
      width: 100%;
      max-width:
        440px;
    }
  
    .login-card-header {
      margin-bottom:
        30px;
    }
  
    .login-form-eyebrow {
      color:
        #2563eb;
  
      font-size:
        10px;
  
      font-weight:
        850;
  
      text-transform:
        uppercase;
  
      letter-spacing:
        .8px;
    }
  
    .login-card-header h2 {
      margin:
        9px 0 0;
  
      color:
        #0f172a;
  
      font-size:
        30px;
  
      font-weight:
        850;
  
      letter-spacing:
        -.7px;
  
      line-height:
        1.2;
    }
  
    .login-card-header p {
      margin:
        9px 0 0;
  
      color:
        #64748b;
  
      font-size:
        13px;
  
      line-height:
        1.55;
    }
  
    .login-form {
      display: flex;
  
      flex-direction:
        column;
  
      gap: 18px;
    }
  
    .login-field {
      min-width: 0;
  
      display: flex;
  
      flex-direction:
        column;
  
      gap: 8px;
    }
  
    .login-field label {
      color:
        #334155;
  
      font-size:
        12px;
  
      font-weight:
        750;
    }
  
    .login-input-wrapper {
      width: 100%;
      min-width: 0;
  
      height: 48px;
  
      display: flex;
  
      align-items:
        center;
  
      gap: 10px;
  
      padding:
        0 13px;
  
      box-sizing:
        border-box;
  
      border:
        1px solid #cbd5e1;
  
      border-radius:
        11px;
  
      background:
        #ffffff;
  
      transition:
        border-color .15s ease,
        box-shadow .15s ease;
    }
  
    .login-input-wrapper:focus-within {
      border-color:
        #2563eb;
  
      box-shadow:
        0 0 0 3px
        rgba(
          37,
          99,
          235,
          .08
        );
    }
  
    .login-input-icon {
      flex-shrink: 0;
  
      color:
        #94a3b8;
    }
  
    .login-input-wrapper input {
      width: 100%;
      min-width: 0;
  
      flex: 1;
  
      border: none;
  
      outline: none;
  
      background:
        transparent;
  
      color:
        #0f172a;
  
      font-family:
        inherit;
  
      font-size:
        13px;
    }
  
    .login-input-wrapper input::placeholder {
      color:
        #94a3b8;
    }
  
    .login-input-wrapper input:disabled {
      cursor:
        not-allowed;
    }
  
    .login-password-button {
      width: 32px;
      height: 32px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      flex-shrink: 0;
  
      padding: 0;
  
      border: none;
  
      border-radius:
        8px;
  
      background:
        transparent;
  
      color:
        #64748b;
  
      cursor:
        pointer;
    }
  
    .login-password-button:hover {
      background:
        #f1f5f9;
  
      color:
        #0f172a;
    }
  
    .login-error {
      padding:
        11px 13px;
  
      border:
        1px solid #fecaca;
  
      border-radius:
        10px;
  
      background:
        #fef2f2;
  
      color:
        #b91c1c;
  
      font-size:
        11px;
  
      font-weight:
        650;
  
      line-height:
        1.45;
    }
  
    .login-submit {
      width: 100%;
      height: 48px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      gap: 9px;
  
      margin-top:
        2px;
  
      border: none;
  
      border-radius:
        11px;
  
      background:
        #2563eb;
  
      color:
        #ffffff;
  
      font-family:
        inherit;
  
      font-size:
        13px;
  
      font-weight:
        800;
  
      cursor:
        pointer;
  
      transition:
        background .15s ease,
        transform .15s ease,
        box-shadow .15s ease;
    }
  
    .login-submit:hover:not(:disabled) {
      background:
        #1d4ed8;
  
      box-shadow:
        0 8px 24px
        rgba(
          37,
          99,
          235,
          .18
        );
    }
  
    .login-submit:active:not(:disabled) {
      transform:
        translateY(1px);
    }
  
    .login-submit:disabled {
      opacity:
        .65;
  
      cursor:
        not-allowed;
    }
  
    .login-divider {
      display: grid;
  
      grid-template-columns:
        1fr auto 1fr;
  
      align-items:
        center;
  
      gap: 12px;
  
      margin:
        27px 0 18px;
    }
  
    .login-divider span {
      height: 1px;
  
      background:
        #e2e8f0;
    }
  
    .login-divider p {
      margin: 0;
  
      color:
        #94a3b8;
  
      font-size:
        10px;
  
      white-space:
        nowrap;
    }
  
    .login-register {
      width: 100%;
      height: 46px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      box-sizing:
        border-box;
  
      border:
        1px solid #cbd5e1;
  
      border-radius:
        11px;
  
      background:
        #ffffff;
  
      color:
        #334155;
  
      font-size:
        12px;
  
      font-weight:
        750;
  
      text-decoration:
        none;
  
      transition:
        border-color .15s ease,
        background .15s ease;
    }
  
    .login-register:hover {
      border-color:
        #94a3b8;
  
      background:
        #f8fafc;
    }
  
    .login-security {
      margin:
        20px 0 0;
  
      color:
        #94a3b8;
  
      font-size:
        10px;
  
      line-height:
        1.5;
  
      text-align:
        center;
    }
  
    .login-mobile-brand {
      display: none;
    }
  
    .login-brand-icon-small {
      width: 42px;
      height: 42px;
    }
  
    @media (max-width: 1000px) {
      .login-page {
        grid-template-columns:
          minmax(340px, .8fr)
          minmax(430px, 1.2fr);
      }
  
      .login-brand-panel {
        padding:
          38px 34px 30px;
      }
  
      .login-brand-message h1 {
        font-size:
          38px;
      }
  
      .login-form-panel {
        padding:
          40px;
      }
    }
  
    @media (max-width: 800px) {
      .login-page {
        display: block;
      }
  
      .login-brand-panel {
        display: none;
      }
  
      .login-form-panel {
        min-height:
          100vh;
  
        min-height:
          100dvh;
  
        display: flex;
  
        flex-direction:
          column;
  
        align-items:
          center;
  
        justify-content:
          center;
  
        padding:
          30px 20px;
      }
  
      .login-mobile-brand {
        width: 100%;
        max-width:
          440px;
  
        display: flex;
  
        align-items:
          center;
  
        gap: 11px;
  
        margin-bottom:
          36px;
      }
  
      .login-mobile-brand strong {
        display: block;
  
        color:
          #0f172a;
  
        font-size:
          16px;
  
        font-weight:
          850;
      }
  
      .login-mobile-brand span {
        display: block;
  
        margin-top:
          2px;
  
        color:
          #94a3b8;
  
        font-size:
          10px;
      }
    }
  
    @media (max-width: 480px) {
      .login-form-panel {
        justify-content:
          flex-start;
  
        padding:
          24px 16px 30px;
      }
  
      .login-mobile-brand {
        margin-bottom:
          40px;
      }
  
      .login-card-header {
        margin-bottom:
          25px;
      }
  
      .login-card-header h2 {
        font-size:
          27px;
      }
  
      .login-divider {
        gap: 9px;
      }
  
      .login-divider p {
        white-space:
          normal;
  
        text-align:
          center;
      }
    }
  `;