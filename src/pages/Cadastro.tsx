import {
    useState,
  } from "react";
  
  import type {
    FormEvent,
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
    User,
  } from "lucide-react";
  
  import {
    useAuth,
  } from "../contexts/AuthContext";
  
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
  
      const emailLimpo =
        email.trim();
  
      if (
        !nomeLimpo ||
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
            "Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar."
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
      <main className="cadastro-page">
        <section className="cadastro-brand-panel">
          <div className="cadastro-brand-content">
            <div className="cadastro-brand">
              <div className="cadastro-brand-icon">
                <ShieldCheck
                  size={29}
                />
              </div>
  
              <div>
                <div className="cadastro-brand-name">
                  SafeKitchen
                </div>
  
                <div className="cadastro-brand-subtitle">
                  Gestão de Segurança e Saúde no Trabalho
                </div>
              </div>
            </div>
  
            <div className="cadastro-brand-message">
              <span className="cadastro-eyebrow">
                Gestão preventiva
              </span>
  
              <h1>
                Comece a organizar a segurança
                da sua operação.
              </h1>
  
              <p>
                Crie sua conta e tenha um ambiente
                centralizado para acompanhar os
                principais processos de SST em
                cozinhas industriais.
              </p>
            </div>
  
            <div className="cadastro-features">
              <Feature
                text="Inventário de riscos e plano de ação do PGR"
              />
  
              <Feature
                text="Controle de EPIs, checklists e ocorrências"
              />
  
              <Feature
                text="Indicadores, auditorias, DDS e relatórios"
              />
            </div>
          </div>
  
          <div className="cadastro-brand-footer">
            SafeKitchen • Prevenção, controle e acompanhamento
          </div>
        </section>
  
        <section className="cadastro-form-panel">
          <div className="cadastro-mobile-brand">
            <div className="cadastro-brand-icon cadastro-brand-icon-small">
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
  
          <div className="cadastro-card">
            <div className="cadastro-card-header">
              <span className="cadastro-form-eyebrow">
                Nova conta
              </span>
  
              <h2>
                Crie seu acesso
              </h2>
  
              <p>
                Preencha seus dados para começar
                a utilizar o SafeKitchen.
              </p>
            </div>
  
            {sucesso ? (
              <div className="cadastro-success-area">
                <div className="cadastro-success-icon">
                  <ShieldCheck
                    size={27}
                  />
                </div>
  
                <h3>
                  Cadastro realizado
                </h3>
  
                <p>
                  {sucesso}
                </p>
  
                <Link
                  to="/login"
                  className="cadastro-submit cadastro-success-button"
                >
                  Ir para o login
  
                  <ArrowRight
                    size={18}
                  />
                </Link>
              </div>
            ) : (
              <>
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="cadastro-form"
                >
                  <div className="cadastro-field">
                    <label
                      htmlFor="cadastro-nome"
                    >
                      Nome completo
                    </label>
  
                    <div className="cadastro-input-wrapper">
                      <User
                        size={18}
                        className="cadastro-input-icon"
                      />
  
                      <input
                        id="cadastro-nome"
                        type="text"
                        autoComplete="name"
                        placeholder="Digite seu nome"
                        value={
                          nome
                        }
                        onChange={(event) =>
                          setNome(
                            event.target.value
                          )
                        }
                        disabled={
                          enviando
                        }
                      />
                    </div>
                  </div>
  
                  <div className="cadastro-field">
                    <label
                      htmlFor="cadastro-email"
                    >
                      E-mail
                    </label>
  
                    <div className="cadastro-input-wrapper">
                      <Mail
                        size={18}
                        className="cadastro-input-icon"
                      />
  
                      <input
                        id="cadastro-email"
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
  
                  <div className="cadastro-password-grid">
                    <div className="cadastro-field">
                      <label
                        htmlFor="cadastro-senha"
                      >
                        Senha
                      </label>
  
                      <div className="cadastro-input-wrapper">
                        <KeyRound
                          size={18}
                          className="cadastro-input-icon"
                        />
  
                        <input
                          id="cadastro-senha"
                          type={
                            mostrarSenha
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          placeholder="Sua senha"
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
                          className="cadastro-password-button"
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
  
                    <div className="cadastro-field">
                      <label
                        htmlFor="cadastro-confirmar-senha"
                      >
                        Confirmar senha
                      </label>
  
                      <div className="cadastro-input-wrapper">
                        <KeyRound
                          size={18}
                          className="cadastro-input-icon"
                        />
  
                        <input
                          id="cadastro-confirmar-senha"
                          type={
                            mostrarConfirmacao
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          placeholder="Repita a senha"
                          value={
                            confirmarSenha
                          }
                          onChange={(event) =>
                            setConfirmarSenha(
                              event.target.value
                            )
                          }
                          disabled={
                            enviando
                          }
                        />
  
                        <button
                          type="button"
                          className="cadastro-password-button"
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
                  </div>
  
                  <p className="cadastro-password-help">
                    Use pelo menos 8 caracteres.
                  </p>
  
                  {erro && (
                    <div
                      className="cadastro-error"
                      role="alert"
                    >
                      {erro}
                    </div>
                  )}
  
                  <button
                    type="submit"
                    className="cadastro-submit"
                    disabled={
                      enviando
                    }
                  >
                    <span>
                      {enviando
                        ? "Criando conta..."
                        : "Criar conta"}
                    </span>
  
                    {!enviando && (
                      <ArrowRight
                        size={18}
                      />
                    )}
                  </button>
                </form>
  
                <div className="cadastro-divider">
                  <span />
  
                  <p>
                    Já possui uma conta?
                  </p>
  
                  <span />
                </div>
  
                <Link
                  to="/login"
                  className="cadastro-login"
                >
                  Entrar no SafeKitchen
                </Link>
  
                <p className="cadastro-security">
                  Sua conta será utilizada para
                  proteger e separar seus dados
                  dentro do sistema.
                </p>
              </>
            )}
          </div>
        </section>
  
        <style>
          {cadastroStyles}
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
      <div className="cadastro-feature">
        <div className="cadastro-feature-check">
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
    .cadastro-page {
      width: 100%;
      min-width: 0;
      min-height: 100vh;
      min-height: 100dvh;
  
      display: grid;
      grid-template-columns:
        minmax(420px, 0.95fr)
        minmax(560px, 1.05fr);
  
      background:
        #f8fafc;
    }
  
    .cadastro-brand-panel {
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
  
    .cadastro-brand-panel::before {
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
  
    .cadastro-brand-panel::after {
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
  
    .cadastro-brand-content,
    .cadastro-brand-footer {
      position: relative;
  
      z-index: 1;
    }
  
    .cadastro-brand {
      display: flex;
  
      align-items:
        center;
  
      gap: 13px;
    }
  
    .cadastro-brand-icon {
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
  
    .cadastro-brand-name {
      color:
        #ffffff;
  
      font-size:
        20px;
  
      font-weight:
        850;
  
      letter-spacing:
        -.35px;
    }
  
    .cadastro-brand-subtitle {
      margin-top:
        3px;
  
      color:
        #94a3b8;
  
      font-size:
        11px;
  
      line-height:
        1.4;
    }
  
    .cadastro-brand-message {
      max-width:
        530px;
  
      margin-top:
        clamp(
          65px,
          13vh,
          140px
        );
    }
  
    .cadastro-eyebrow {
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
  
    .cadastro-brand-message h1 {
      margin:
        22px 0 0;
  
      max-width:
        530px;
  
      color:
        #ffffff;
  
      font-size:
        clamp(
          34px,
          4vw,
          50px
        );
  
      font-weight:
        850;
  
      line-height:
        1.04;
  
      letter-spacing:
        -1.7px;
    }
  
    .cadastro-brand-message p {
      margin:
        20px 0 0;
  
      max-width:
        490px;
  
      color:
        #94a3b8;
  
      font-size:
        14px;
  
      line-height:
        1.75;
    }
  
    .cadastro-features {
      display: flex;
  
      flex-direction:
        column;
  
      gap: 14px;
  
      margin-top:
        36px;
    }
  
    .cadastro-feature {
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
  
    .cadastro-feature-check {
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
  
    .cadastro-brand-footer {
      margin-top:
        45px;
  
      color:
        #64748b;
  
      font-size:
        10px;
    }
  
    .cadastro-form-panel {
      min-width: 0;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      padding:
        42px 48px;
  
      box-sizing:
        border-box;
  
      background:
        #f8fafc;
    }
  
    .cadastro-card {
      width: 100%;
      max-width:
        520px;
    }
  
    .cadastro-card-header {
      margin-bottom:
        27px;
    }
  
    .cadastro-form-eyebrow {
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
  
    .cadastro-card-header h2 {
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
  
    .cadastro-card-header p {
      margin:
        9px 0 0;
  
      color:
        #64748b;
  
      font-size:
        13px;
  
      line-height:
        1.55;
    }
  
    .cadastro-form {
      display: flex;
  
      flex-direction:
        column;
  
      gap: 17px;
    }
  
    .cadastro-field {
      min-width: 0;
  
      display: flex;
  
      flex-direction:
        column;
  
      gap: 8px;
    }
  
    .cadastro-field label {
      color:
        #334155;
  
      font-size:
        12px;
  
      font-weight:
        750;
    }
  
    .cadastro-input-wrapper {
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
  
    .cadastro-input-wrapper:focus-within {
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
  
    .cadastro-input-icon {
      flex-shrink: 0;
  
      color:
        #94a3b8;
    }
  
    .cadastro-input-wrapper input {
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
  
    .cadastro-input-wrapper input::placeholder {
      color:
        #94a3b8;
    }
  
    .cadastro-input-wrapper input:disabled {
      cursor:
        not-allowed;
    }
  
    .cadastro-password-grid {
      min-width: 0;
  
      display: grid;
  
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
  
      gap: 13px;
    }
  
    .cadastro-password-button {
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
  
    .cadastro-password-button:hover {
      background:
        #f1f5f9;
  
      color:
        #0f172a;
    }
  
    .cadastro-password-help {
      margin:
        -8px 0 0;
  
      color:
        #94a3b8;
  
      font-size:
        10px;
  
      line-height:
        1.4;
    }
  
    .cadastro-error {
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
  
    .cadastro-submit {
      width: 100%;
      height: 48px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      gap: 9px;
  
      box-sizing:
        border-box;
  
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
  
      text-decoration:
        none;
  
      cursor:
        pointer;
  
      transition:
        background .15s ease,
        transform .15s ease,
        box-shadow .15s ease;
    }
  
    .cadastro-submit:hover:not(:disabled) {
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
  
    .cadastro-submit:active:not(:disabled) {
      transform:
        translateY(1px);
    }
  
    .cadastro-submit:disabled {
      opacity:
        .65;
  
      cursor:
        not-allowed;
    }
  
    .cadastro-divider {
      display: grid;
  
      grid-template-columns:
        1fr auto 1fr;
  
      align-items:
        center;
  
      gap: 12px;
  
      margin:
        25px 0 17px;
    }
  
    .cadastro-divider span {
      height: 1px;
  
      background:
        #e2e8f0;
    }
  
    .cadastro-divider p {
      margin: 0;
  
      color:
        #94a3b8;
  
      font-size:
        10px;
  
      white-space:
        nowrap;
    }
  
    .cadastro-login {
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
  
    .cadastro-login:hover {
      border-color:
        #94a3b8;
  
      background:
        #f8fafc;
    }
  
    .cadastro-security {
      margin:
        19px 0 0;
  
      color:
        #94a3b8;
  
      font-size:
        10px;
  
      line-height:
        1.5;
  
      text-align:
        center;
    }
  
    .cadastro-success-area {
      width: 100%;
  
      padding:
        32px 28px;
  
      box-sizing:
        border-box;
  
      border:
        1px solid #dbeafe;
  
      border-radius:
        16px;
  
      background:
        #ffffff;
  
      text-align:
        center;
  
      box-shadow:
        0 12px 35px
        rgba(
          15,
          23,
          42,
          .06
        );
    }
  
    .cadastro-success-icon {
      width: 54px;
      height: 54px;
  
      display: flex;
  
      align-items:
        center;
  
      justify-content:
        center;
  
      margin:
        0 auto;
  
      border-radius:
        15px;
  
      background:
        #eff6ff;
  
      color:
        #2563eb;
    }
  
    .cadastro-success-area h3 {
      margin:
        17px 0 0;
  
      color:
        #0f172a;
  
      font-size:
        19px;
  
      font-weight:
        850;
    }
  
    .cadastro-success-area p {
      margin:
        9px auto 22px;
  
      max-width:
        390px;
  
      color:
        #64748b;
  
      font-size:
        12px;
  
      line-height:
        1.65;
    }
  
    .cadastro-success-button {
      margin-top: 0;
    }
  
    .cadastro-mobile-brand {
      display: none;
    }
  
    .cadastro-brand-icon-small {
      width: 42px;
      height: 42px;
    }
  
    @media (max-width: 1050px) {
      .cadastro-page {
        grid-template-columns:
          minmax(340px, .8fr)
          minmax(500px, 1.2fr);
      }
  
      .cadastro-brand-panel {
        padding:
          38px 34px 30px;
      }
  
      .cadastro-brand-message h1 {
        font-size:
          37px;
      }
  
      .cadastro-form-panel {
        padding:
          38px;
      }
    }
  
    @media (max-width: 850px) {
      .cadastro-page {
        display: block;
      }
  
      .cadastro-brand-panel {
        display: none;
      }
  
      .cadastro-form-panel {
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
  
      .cadastro-mobile-brand {
        width: 100%;
        max-width:
          520px;
  
        display: flex;
  
        align-items:
          center;
  
        gap: 11px;
  
        margin-bottom:
          32px;
      }
  
      .cadastro-mobile-brand strong {
        display: block;
  
        color:
          #0f172a;
  
        font-size:
          16px;
  
        font-weight:
          850;
      }
  
      .cadastro-mobile-brand span {
        display: block;
  
        margin-top:
          2px;
  
        color:
          #94a3b8;
  
        font-size:
          10px;
      }
    }
  
    @media (max-width: 560px) {
      .cadastro-form-panel {
        justify-content:
          flex-start;
  
        padding:
          24px 16px 30px;
      }
  
      .cadastro-mobile-brand {
        margin-bottom:
          35px;
      }
  
      .cadastro-card-header {
        margin-bottom:
          24px;
      }
  
      .cadastro-card-header h2 {
        font-size:
          27px;
      }
  
      .cadastro-password-grid {
        grid-template-columns:
          1fr;
      }
  
      .cadastro-divider {
        gap:
          9px;
      }
  
      .cadastro-divider p {
        white-space:
          normal;
  
        text-align:
          center;
      }
    }
  `;