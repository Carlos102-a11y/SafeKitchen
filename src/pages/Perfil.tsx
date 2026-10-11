import {
    useEffect,
    useState,
  } from "react";
  
  import {
    AlertCircle,
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
  
  import { useAuth } from "../contexts/AuthContext";
  import { supabase } from "../lib/supabase";
  import { colors } from "../styles/theme";
  
  export default function Perfil() {
    const { user } = useAuth();
  
    const [nome, setNome] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [cargo, setCargo] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
  
    useEffect(() => {
      setNome(
        typeof user?.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : ""
      );
  
      setEmpresa(
        typeof user?.user_metadata?.company === "string"
          ? user.user_metadata.company
          : ""
      );
  
      setCargo(
        typeof user?.user_metadata?.role === "string"
          ? user.user_metadata.role
          : ""
      );
    }, [user]);
  
    const email =
      user?.email ?? "";
  
    const emailConfirmado =
      Boolean(user?.email_confirmed_at);
  
    const dataCriacao =
      formatarData(user?.created_at);
  
    const ultimoAcesso =
      formatarData(user?.last_sign_in_at);
  
    const inicial =
      nome.trim().charAt(0).toUpperCase() ||
      email.trim().charAt(0).toUpperCase() ||
      "U";
  
    async function handleSalvar(
      event: React.FormEvent<HTMLFormElement>
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
  
      if (
        !nomeLimpo ||
        !empresaLimpa ||
        !cargoLimpo
      ) {
        setErro(
          "Preencha nome, empresa e cargo antes de salvar."
        );
  
        return;
      }
  
      if (nomeLimpo.length < 3) {
        setErro(
          "Informe seu nome completo."
        );
  
        return;
      }
  
      setSalvando(true);
  
      try {
        const { error } =
          await supabase.auth.updateUser({
            data: {
              ...user?.user_metadata,
              full_name:
                nomeLimpo,
              company:
                empresaLimpa,
              role:
                cargoLimpo,
            },
          });
  
        if (error) {
          setErro(
            "Não foi possível atualizar seu perfil. Tente novamente."
          );
  
          return;
        }
  
        setSucesso(
          "Perfil atualizado com sucesso."
        );
      } finally {
        setSalvando(false);
      }
    }
  
    return (
      <div className="perfil-page">
        <header className="perfil-header">
          <div>
            <span className="perfil-eyebrow">
              CONTA E ORGANIZAÇÃO
            </span>
  
            <h1>
              Meu perfil
            </h1>
  
            <p>
              Consulte e mantenha atualizados os dados
              utilizados na sua conta do SafeKitchen.
            </p>
          </div>
  
          <div className="perfil-header-badge">
            <ShieldCheck size={17} />
            <span>Conta protegida</span>
          </div>
        </header>
  
        <section className="perfil-hero">
          <div className="perfil-avatar">
            {inicial}
          </div>
  
          <div className="perfil-hero-info">
            <span className="perfil-hero-label">
              PERFIL PROFISSIONAL
            </span>
  
            <h2>
              {nome ||
                "Usuário SafeKitchen"}
            </h2>
  
            <p>
              {cargo ||
                "Cargo não informado"}
              {" • "}
              {empresa ||
                "Empresa não informada"}
            </p>
          </div>
  
          <div
            className={
              emailConfirmado
                ? "perfil-status perfil-status-ok"
                : "perfil-status perfil-status-alerta"
            }
          >
            {emailConfirmado ? (
              <BadgeCheck size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
  
            {emailConfirmado
              ? "E-mail verificado"
              : "E-mail pendente"}
          </div>
        </section>
  
        <div className="perfil-grid">
          <section className="perfil-card perfil-card-form">
            <div className="perfil-card-title">
              <div className="perfil-card-icon">
                <UserRound size={19} />
              </div>
  
              <div>
                <h3>Dados profissionais</h3>
                <p>
                  Essas informações identificam seu
                  perfil dentro do sistema.
                </p>
              </div>
            </div>
  
            <form
              className="perfil-form"
              onSubmit={
                handleSalvar
              }
            >
              <div className="perfil-field">
                <label htmlFor="perfil-nome">
                  Nome completo
                </label>
  
                <div className="perfil-input">
                  <UserRound size={17} />
  
                  <input
                    id="perfil-nome"
                    value={nome}
                    onChange={(event) =>
                      setNome(
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    autoComplete="name"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
  
              <div className="perfil-form-row">
                <div className="perfil-field">
                  <label htmlFor="perfil-empresa">
                    Empresa / Unidade
                  </label>
  
                  <div className="perfil-input">
                    <Building2 size={17} />
  
                    <input
                      id="perfil-empresa"
                      value={empresa}
                      onChange={(event) =>
                        setEmpresa(
                          event.target.value
                        )
                      }
                      disabled={salvando}
                      autoComplete="organization"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
  
                <div className="perfil-field">
                  <label htmlFor="perfil-cargo">
                    Cargo / Função
                  </label>
  
                  <div className="perfil-input">
                    <BriefcaseBusiness size={17} />
  
                    <input
                      id="perfil-cargo"
                      value={cargo}
                      onChange={(event) =>
                        setCargo(
                          event.target.value
                        )
                      }
                      disabled={salvando}
                      autoComplete="organization-title"
                      placeholder="Seu cargo ou função"
                    />
                  </div>
                </div>
              </div>
  
              {erro && (
                <div
                  className="perfil-message perfil-message-error"
                  role="alert"
                >
                  <AlertCircle size={16} />
                  <span>{erro}</span>
                </div>
              )}
  
              {sucesso && (
                <div
                  className="perfil-message perfil-message-success"
                  role="status"
                >
                  <CheckCircle2 size={16} />
                  <span>{sucesso}</span>
                </div>
              )}
  
              <div className="perfil-actions">
                <p>
                  As alterações são salvas na sua conta
                  de acesso.
                </p>
  
                <button
                  type="submit"
                  className="perfil-save"
                  disabled={salvando}
                >
                  <Save size={17} />
  
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>
  
          <aside className="perfil-side">
            <section className="perfil-card perfil-account-card">
              <div className="perfil-card-title">
                <div className="perfil-card-icon">
                  <Mail size={19} />
                </div>
  
                <div>
                  <h3>Conta de acesso</h3>
                  <p>
                    Informações utilizadas na
                    autenticação.
                  </p>
                </div>
              </div>
  
              <div className="perfil-info-list">
                <InfoItem
                  icon={Mail}
                  titulo="E-mail"
                  valor={
                    email ||
                    "Não informado"
                  }
                />
  
                <InfoItem
                  icon={BadgeCheck}
                  titulo="Verificação"
                  valor={
                    emailConfirmado
                      ? "E-mail confirmado"
                      : "Confirmação pendente"
                  }
                />
  
                <InfoItem
                  icon={CalendarDays}
                  titulo="Conta criada em"
                  valor={dataCriacao}
                />
  
                <InfoItem
                  icon={ShieldCheck}
                  titulo="Último acesso"
                  valor={ultimoAcesso}
                />
              </div>
            </section>
  
            <section className="perfil-security-card">
              <div className="perfil-security-icon">
                <ShieldCheck size={20} />
              </div>
  
              <div>
                <h3>Segurança da conta</h3>
                <p>
                  Seu acesso continua protegido pelo
                  sistema de autenticação do
                  SafeKitchen. O e-mail de login não é
                  alterado nesta tela.
                </p>
              </div>
            </section>
          </aside>
        </div>
  
        <style>{perfilStyles}</style>
      </div>
    );
  }
  
  function InfoItem({
    icon: Icon,
    titulo,
    valor,
  }: {
    icon: typeof Mail;
    titulo: string;
    valor: string;
  }) {
    return (
      <div className="perfil-info-item">
        <div className="perfil-info-icon">
          <Icon size={16} />
        </div>
  
        <div>
          <span>{titulo}</span>
          <strong>{valor}</strong>
        </div>
      </div>
    );
  }
  
  function formatarData(
    valor?: string | null
  ) {
    if (!valor) {
      return "Não disponível";
    }
  
    const data =
      new Date(valor);
  
    if (
      Number.isNaN(
        data.getTime()
      )
    ) {
      return "Não disponível";
    }
  
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(data);
  }
  
  const perfilStyles = `
    .perfil-page {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 36px;
      background: ${colors.background};
    }
  
    .perfil-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 26px;
    }
  
    .perfil-eyebrow {
      color: ${colors.primary};
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .9px;
    }
  
    .perfil-header h1 {
      margin: 8px 0 0;
      color: ${colors.title};
      font-size: 31px;
      font-weight: 850;
      letter-spacing: -.8px;
      line-height: 1.15;
    }
  
    .perfil-header p {
      max-width: 650px;
      margin: 9px 0 0;
      color: ${colors.textLight};
      font-size: 13px;
      line-height: 1.6;
    }
  
    .perfil-header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      padding: 10px 13px;
      border: 1px solid #DCE7F8;
      border-radius: 11px;
      background: #FFFFFF;
      color: ${colors.primary};
      font-size: 11px;
      font-weight: 750;
    }
  
    .perfil-hero {
      display: flex;
      align-items: center;
      gap: 17px;
      margin-bottom: 22px;
      padding: 22px;
      border: 1px solid ${colors.border};
      border-radius: 18px;
      background:
        linear-gradient(
          135deg,
          #FFFFFF 0%,
          #F8FBFF 100%
        );
      box-shadow:
        0 12px 35px rgba(15, 23, 42, .05);
    }
  
    .perfil-avatar {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 17px;
      background:
        linear-gradient(
          135deg,
          #2563EB,
          #3B82F6
        );
      color: #FFFFFF;
      font-size: 23px;
      font-weight: 850;
      box-shadow:
        0 10px 25px rgba(37, 99, 235, .22);
    }
  
    .perfil-hero-info {
      flex: 1;
      min-width: 0;
    }
  
    .perfil-hero-label {
      color: #64748B;
      font-size: 9px;
      font-weight: 850;
      letter-spacing: .8px;
    }
  
    .perfil-hero-info h2 {
      margin: 5px 0 0;
      color: ${colors.title};
      font-size: 20px;
      font-weight: 850;
      letter-spacing: -.35px;
    }
  
    .perfil-hero-info p {
      margin: 5px 0 0;
      color: ${colors.textLight};
      font-size: 11px;
      line-height: 1.5;
    }
  
    .perfil-status {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      flex-shrink: 0;
      padding: 8px 11px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
    }
  
    .perfil-status-ok {
      border: 1px solid #BBF7D0;
      background: #F0FDF4;
      color: #15803D;
    }
  
    .perfil-status-alerta {
      border: 1px solid #FDE68A;
      background: #FFFBEB;
      color: #B45309;
    }
  
    .perfil-grid {
      display: grid;
      grid-template-columns:
        minmax(0, 1.45fr)
        minmax(300px, .65fr);
      gap: 22px;
      align-items: start;
    }
  
    .perfil-card {
      min-width: 0;
      border: 1px solid ${colors.border};
      border-radius: 18px;
      background: #FFFFFF;
      box-shadow:
        0 12px 35px rgba(15, 23, 42, .05);
    }
  
    .perfil-card-form,
    .perfil-account-card {
      padding: 24px;
    }
  
    .perfil-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  
    .perfil-card-icon {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 12px;
      background: #EFF6FF;
      color: ${colors.primary};
    }
  
    .perfil-card-title h3 {
      margin: 0;
      color: ${colors.title};
      font-size: 14px;
      font-weight: 820;
    }
  
    .perfil-card-title p {
      margin: 4px 0 0;
      color: ${colors.textLight};
      font-size: 10px;
      line-height: 1.5;
    }
  
    .perfil-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 25px;
    }
  
    .perfil-form-row {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
  
    .perfil-field {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  
    .perfil-field label {
      color: ${colors.text};
      font-size: 11px;
      font-weight: 750;
    }
  
    .perfil-input {
      width: 100%;
      min-width: 0;
      height: 47px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
      padding: 0 13px;
      border: 1px solid #CBD5E1;
      border-radius: 11px;
      background: #FFFFFF;
      color: #94A3B8;
      transition:
        border-color .15s ease,
        box-shadow .15s ease;
    }
  
    .perfil-input:focus-within {
      border-color: ${colors.primary};
      box-shadow:
        0 0 0 3px rgba(37, 99, 235, .08);
    }
  
    .perfil-input input {
      width: 100%;
      min-width: 0;
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      color: ${colors.title};
      font-family: inherit;
      font-size: 12px;
    }
  
    .perfil-input input::placeholder {
      color: #94A3B8;
    }
  
    .perfil-input input:disabled {
      cursor: not-allowed;
    }
  
    .perfil-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      line-height: 1.5;
    }
  
    .perfil-message-error {
      border: 1px solid #FECACA;
      background: #FEF2F2;
      color: #B91C1C;
    }
  
    .perfil-message-success {
      border: 1px solid #BBF7D0;
      background: #F0FDF4;
      color: #15803D;
    }
  
    .perfil-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding-top: 4px;
    }
  
    .perfil-actions p {
      margin: 0;
      color: ${colors.textLight};
      font-size: 9px;
      line-height: 1.5;
    }
  
    .perfil-save {
      min-height: 43px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-shrink: 0;
      padding: 0 16px;
      border: none;
      border-radius: 10px;
      background: ${colors.primary};
      color: #FFFFFF;
      font-family: inherit;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      transition:
        background .15s ease,
        box-shadow .15s ease,
        transform .15s ease;
    }
  
    .perfil-save:hover:not(:disabled) {
      background: ${colors.primaryDark};
      box-shadow:
        0 8px 22px rgba(37, 99, 235, .20);
    }
  
    .perfil-save:active:not(:disabled) {
      transform: translateY(1px);
    }
  
    .perfil-save:disabled {
      opacity: .6;
      cursor: not-allowed;
    }
  
    .perfil-side {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }
  
    .perfil-info-list {
      display: flex;
      flex-direction: column;
      margin-top: 21px;
    }
  
    .perfil-info-item {
      display: flex;
      align-items: flex-start;
      gap: 11px;
      padding: 13px 0;
      border-top: 1px solid #EEF2F7;
    }
  
    .perfil-info-item:first-child {
      border-top: none;
      padding-top: 0;
    }
  
    .perfil-info-item:last-child {
      padding-bottom: 0;
    }
  
    .perfil-info-icon {
      width: 31px;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 9px;
      background: #F8FAFC;
      color: #64748B;
    }
  
    .perfil-info-item span {
      display: block;
      color: #94A3B8;
      font-size: 9px;
      font-weight: 700;
    }
  
    .perfil-info-item strong {
      display: block;
      margin-top: 3px;
      color: ${colors.text};
      font-size: 10px;
      font-weight: 750;
      line-height: 1.45;
      word-break: break-word;
    }
  
    .perfil-security-card {
      display: flex;
      gap: 12px;
      padding: 18px;
      border: 1px solid #DBEAFE;
      border-radius: 16px;
      background:
        linear-gradient(
          135deg,
          #EFF6FF,
          #F8FBFF
        );
    }
  
    .perfil-security-icon {
      width: 37px;
      height: 37px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 11px;
      background: #DBEAFE;
      color: ${colors.primary};
    }
  
    .perfil-security-card h3 {
      margin: 1px 0 0;
      color: ${colors.title};
      font-size: 12px;
      font-weight: 800;
    }
  
    .perfil-security-card p {
      margin: 6px 0 0;
      color: #64748B;
      font-size: 9px;
      line-height: 1.6;
    }
  
    @media (max-width: 1120px) {
      .perfil-grid {
        grid-template-columns: 1fr;
      }
  
      .perfil-side {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }
    }
  
    @media (max-width: 760px) {
      .perfil-page {
        padding: 24px 18px 34px;
      }
  
      .perfil-header {
        flex-direction: column;
        gap: 15px;
      }
  
      .perfil-header h1 {
        font-size: 27px;
      }
  
      .perfil-hero {
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 18px;
      }
  
      .perfil-hero-info {
        min-width:
          calc(100% - 80px);
      }
  
      .perfil-status {
        margin-left: 77px;
      }
  
      .perfil-form-row {
        grid-template-columns: 1fr;
      }
  
      .perfil-side {
        grid-template-columns: 1fr;
      }
    }
  
    @media (max-width: 480px) {
      .perfil-page {
        padding:
          20px 14px 30px;
      }
  
      .perfil-header-badge {
        width: 100%;
        box-sizing: border-box;
        justify-content: center;
      }
  
      .perfil-avatar {
        width: 52px;
        height: 52px;
        border-radius: 15px;
        font-size: 20px;
      }
  
      .perfil-hero-info {
        min-width:
          calc(100% - 68px);
      }
  
      .perfil-hero-info h2 {
        font-size: 17px;
      }
  
      .perfil-status {
        margin-left: 0;
      }
  
      .perfil-card-form,
      .perfil-account-card {
        padding: 18px;
      }
  
      .perfil-actions {
        align-items: stretch;
        flex-direction: column;
      }
  
      .perfil-save {
        width: 100%;
      }
    }
  `;