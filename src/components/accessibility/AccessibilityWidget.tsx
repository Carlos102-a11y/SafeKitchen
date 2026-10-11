import {
    useEffect,
    useId,
    useRef,
    useState,
  } from "react";
  
  import type { KeyboardEvent } from "react";
  import type { LucideIcon } from "lucide-react";
  
  import {
    Accessibility,
    Activity,
    AlignJustify,
    Contrast,
    Droplet,
    Focus,
    Link2,
    Minus,
    MoveHorizontal,
    Plus,
    RotateCcw,
    Type,
    X,
  } from "lucide-react";
  
  import { useAccessibility } from "../../hooks/useAccessibility";
  
  import type {
    AccessibilitySettings,
    AccessibilityToggleKey,
  } from "../../hooks/useAccessibility";
  
  import "./accessibility.css";
  
  interface ToggleOption {
    key: AccessibilityToggleKey;
    label: string;
    Icon: LucideIcon;
  }
  
  const VISUAL_OPTIONS: ToggleOption[] = [
    {
      key: "highContrast",
      label: "Alto contraste",
      Icon: Contrast,
    },
    {
      key: "grayscale",
      label: "Escala de cinza",
      Icon: Droplet,
    },
    {
      key: "highlightLinks",
      label: "Destacar links",
      Icon: Link2,
    },
    {
      key: "strongFocus",
      label: "Foco reforçado",
      Icon: Focus,
    },
  ];
  
  const READING_OPTIONS: ToggleOption[] = [
    {
      key: "textSpacing",
      label: "Espaçamento do texto",
      Icon: MoveHorizontal,
    },
    {
      key: "lineSpacing",
      label: "Espaçamento das linhas",
      Icon: AlignJustify,
    },
    {
      key: "readableFont",
      label: "Fonte mais legível",
      Icon: Type,
    },
    {
      key: "reduceMotion",
      label: "Reduzir animações",
      Icon: Activity,
    },
  ];
  
  interface ToggleListProps {
    options: ToggleOption[];
    settings: AccessibilitySettings;
    onToggle: (key: AccessibilityToggleKey) => void;
  }
  
  function ToggleList({
    options,
    settings,
    onToggle,
  }: ToggleListProps) {
    return (
      <div className="sk-a11y-list">
        {options.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            role="switch"
            aria-checked={settings[key]}
            className="sk-a11y-switch"
            onClick={() => onToggle(key)}
          >
            <span className="sk-a11y-switch-label">
              <Icon
                className="sk-a11y-switch-icon"
                size={18}
                aria-hidden="true"
              />
  
              {label}
            </span>
  
            <span
              className="sk-a11y-track"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    );
  }
  
  export default function AccessibilityWidget() {
    const [open, setOpen] = useState(false);
  
    const {
      settings,
      textScale,
      canIncreaseText,
      canDecreaseText,
      isDefault,
      toggle,
      increaseText,
      decreaseText,
      resetText,
      resetAll,
    } = useAccessibility();
  
    const baseId = useId();
  
    const panelId = `${baseId}-painel`;
    const titleId = `${baseId}-titulo`;
    const textTitleId = `${baseId}-texto`;
    const visualTitleId = `${baseId}-visual`;
    const readingTitleId = `${baseId}-leitura`;
  
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
  
    /*
     * Ao abrir, o foco vai para o painel.
     * Assim leitores de tela anunciam o título
     * e o Tab segue direto para os controles.
     */
    useEffect(() => {
      if (open) {
        panelRef.current?.focus();
      }
    }, [open]);
  
    function closePanel() {
      setOpen(false);
      buttonRef.current?.focus();
    }
  
    /*
     * ESCAPE fecha o painel e devolve o foco
     * ao botão. Só reage a eventos que vêm de
     * dentro do widget, para não interferir
     * nos modais do sistema.
     */
    function handleKeyDown(
      event: KeyboardEvent<HTMLDivElement>
    ) {
      if (event.key === "Escape" && open) {
        event.stopPropagation();
        closePanel();
      }
    }
  
    function handleResetAll() {
      resetAll();
  
      /*
       * O botão "Restaurar padrão" fica desabilitado
       * depois de usado, então o foco volta ao painel.
       */
      panelRef.current?.focus();
    }
  
    function handleResetText() {
      resetText();
  
      panelRef.current?.focus();
    }
  
    const percent = Math.round(textScale * 100);
  
    return (
      <div
        className="sk-a11y-root"
        onKeyDown={handleKeyDown}
      >
        <button
          ref={buttonRef}
          type="button"
          className="sk-a11y-button"
          aria-label="Opções de acessibilidade"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((atual) => !atual)}
        >
          <Accessibility
            size={26}
            aria-hidden="true"
          />
  
          <span
            className="sk-a11y-button-tip"
            aria-hidden="true"
          >
            Acessibilidade
          </span>
        </button>
  
        <div
          ref={panelRef}
          id={panelId}
          className="sk-a11y-panel"
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          hidden={!open}
          style={{ outline: "none" }}
        >
          <div className="sk-a11y-header">
            <h2
              id={titleId}
              className="sk-a11y-title"
            >
              <Accessibility
                size={20}
                aria-hidden="true"
              />
  
              Acessibilidade
            </h2>
  
            <button
              type="button"
              className="sk-a11y-close"
              aria-label="Fechar painel de acessibilidade"
              onClick={closePanel}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
  
          <div className="sk-a11y-body">
            <div
              className="sk-a11y-section"
              role="group"
              aria-labelledby={textTitleId}
            >
              <h3
                id={textTitleId}
                className="sk-a11y-section-title"
              >
                Texto
              </h3>
  
              <div className="sk-a11y-stepper">
                <button
                  type="button"
                  className="sk-a11y-step-btn"
                  aria-label="Diminuir tamanho do texto"
                  disabled={!canDecreaseText}
                  onClick={decreaseText}
                >
                  <Minus
                    size={18}
                    aria-hidden="true"
                  />
                </button>
  
                <span
                  className="sk-a11y-step-value"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {percent}%
                </span>
  
                <button
                  type="button"
                  className="sk-a11y-step-btn"
                  aria-label="Aumentar tamanho do texto"
                  disabled={!canIncreaseText}
                  onClick={increaseText}
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
  
              <button
                type="button"
                className="sk-a11y-link-btn"
                disabled={settings.textLevel === 0}
                onClick={handleResetText}
              >
                Restaurar tamanho original
              </button>
            </div>
  
            <div
              className="sk-a11y-section"
              role="group"
              aria-labelledby={visualTitleId}
            >
              <h3
                id={visualTitleId}
                className="sk-a11y-section-title"
              >
                Visual
              </h3>
  
              <ToggleList
                options={VISUAL_OPTIONS}
                settings={settings}
                onToggle={toggle}
              />
            </div>
  
            <div
              className="sk-a11y-section"
              role="group"
              aria-labelledby={readingTitleId}
            >
              <h3
                id={readingTitleId}
                className="sk-a11y-section-title"
              >
                Leitura e movimento
              </h3>
  
              <ToggleList
                options={READING_OPTIONS}
                settings={settings}
                onToggle={toggle}
              />
            </div>
          </div>
  
          <div className="sk-a11y-footer">
            <button
              type="button"
              className="sk-a11y-reset"
              disabled={isDefault}
              onClick={handleResetAll}
            >
              <RotateCcw
                size={16}
                aria-hidden="true"
              />
  
              Restaurar padrão
            </button>
  
            <p className="sk-a11y-note">
              Suas preferências ficam salvas neste
              navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }