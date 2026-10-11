import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
  } from "react";
  
  /*
   * CHAVE DO LOCALSTORAGE
   * Não colide com as chaves já usadas
   * pelo projeto (riscos, epis, pgr, etc.)
   */
  export const ACCESSIBILITY_STORAGE_KEY =
    "safekitchen-accessibility";
  
  /*
   * NÍVEIS DE ESCALA DO TEXTO
   * 1 = tamanho original.
   * O efeito visual depende da variável
   * --sk-text-scale, usada na fase 2.
   */
  export const TEXT_SCALE_LEVELS = [
    1, 1.1, 1.25, 1.5,
  ] as const;
  
  const MAX_TEXT_LEVEL =
    TEXT_SCALE_LEVELS.length - 1;
  
  /*
   * OPÇÕES LIGA/DESLIGA
   */
  export const TOGGLE_KEYS = [
    "highContrast",
    "grayscale",
    "highlightLinks",
    "textSpacing",
    "lineSpacing",
    "readableFont",
    "reduceMotion",
    "strongFocus",
  ] as const;
  
  export type AccessibilityToggleKey =
    (typeof TOGGLE_KEYS)[number];
  
  export type AccessibilitySettings = {
    textLevel: number;
  } & Record<AccessibilityToggleKey, boolean>;
  
  export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings =
    {
      textLevel: 0,
      highContrast: false,
      grayscale: false,
      highlightLinks: false,
      textSpacing: false,
      lineSpacing: false,
      readableFont: false,
      reduceMotion: false,
      strongFocus: false,
    };
  
  /*
   * CLASSES APLICADAS NO <html>
   */
  const CLASS_BY_KEY: Record<
    AccessibilityToggleKey,
    string
  > = {
    highContrast: "sk-a11y-high-contrast",
    grayscale: "sk-a11y-grayscale",
    highlightLinks: "sk-a11y-highlight-links",
    textSpacing: "sk-a11y-text-spacing",
    lineSpacing: "sk-a11y-line-spacing",
    readableFont: "sk-a11y-readable-font",
    reduceMotion: "sk-a11y-reduce-motion",
    strongFocus: "sk-a11y-strong-focus",
  };
  
  /*
   * LEITURA SEGURA DO LOCALSTORAGE
   * Qualquer valor inválido é ignorado
   * e o padrão é usado no lugar.
   */
  function readStoredSettings(): AccessibilitySettings {
    if (typeof window === "undefined") {
      return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
    }
  
    try {
      const raw = window.localStorage.getItem(
        ACCESSIBILITY_STORAGE_KEY
      );
  
      if (!raw) {
        return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
      }
  
      const parsed: unknown = JSON.parse(raw);
  
      if (typeof parsed !== "object" || parsed === null) {
        return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
      }
  
      const data = parsed as Record<string, unknown>;
  
      const settings: AccessibilitySettings = {
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
      };
  
      for (const key of TOGGLE_KEYS) {
        if (data[key] === true) {
          settings[key] = true;
        }
      }
  
      const level = data.textLevel;
  
      if (
        typeof level === "number" &&
        Number.isInteger(level) &&
        level >= 0 &&
        level <= MAX_TEXT_LEVEL
      ) {
        settings.textLevel = level;
      }
  
      return settings;
    } catch {
      return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
    }
  }
  
  /*
   * APLICA AS CONFIGURAÇÕES NO <html>
   * Não mexe no <body>, pois o Sidebar
   * já altera padding e overflow dele.
   */
  function applySettings(
    settings: AccessibilitySettings
  ): void {
    const root = document.documentElement;
  
    for (const key of TOGGLE_KEYS) {
      root.classList.toggle(
        CLASS_BY_KEY[key],
        settings[key]
      );
    }
  
    const scale =
      TEXT_SCALE_LEVELS[settings.textLevel] ?? 1;
  
    if (scale === 1) {
      root.style.removeProperty("--sk-text-scale");
    } else {
      root.style.setProperty(
        "--sk-text-scale",
        String(scale)
      );
    }
  }
  
  function isDefaultSettings(
    settings: AccessibilitySettings
  ): boolean {
    return (
      settings.textLevel === 0 &&
      TOGGLE_KEYS.every((key) => !settings[key])
    );
  }
  
  /*
   * SALVA NO LOCALSTORAGE
   * Se tudo estiver no padrão, remove a chave.
   */
  function persistSettings(
    settings: AccessibilitySettings
  ): void {
    try {
      if (isDefaultSettings(settings)) {
        window.localStorage.removeItem(
          ACCESSIBILITY_STORAGE_KEY
        );
      } else {
        window.localStorage.setItem(
          ACCESSIBILITY_STORAGE_KEY,
          JSON.stringify(settings)
        );
      }
    } catch {
      /*
       * Armazenamento indisponível
       * (modo privado, cota cheia, etc.).
       * As configurações continuam valendo
       * durante a sessão.
       */
    }
  }
  
  export interface UseAccessibilityResult {
    settings: AccessibilitySettings;
    textScale: number;
    canIncreaseText: boolean;
    canDecreaseText: boolean;
    isDefault: boolean;
    toggle: (key: AccessibilityToggleKey) => void;
    increaseText: () => void;
    decreaseText: () => void;
    resetText: () => void;
    resetAll: () => void;
  }
  
  export function useAccessibility(): UseAccessibilityResult {
    const [settings, setSettings] =
      useState<AccessibilitySettings>(
        readStoredSettings
      );
  
    /*
     * Aplica antes da pintura para
     * evitar "piscar" ao carregar a página.
     */
    useLayoutEffect(() => {
      applySettings(settings);
    }, [settings]);
  
    useEffect(() => {
      persistSettings(settings);
    }, [settings]);
  
    const toggle = useCallback(
      (key: AccessibilityToggleKey) => {
        setSettings((atual) => ({
          ...atual,
          [key]: !atual[key],
        }));
      },
      []
    );
  
    const increaseText = useCallback(() => {
      setSettings((atual) => ({
        ...atual,
        textLevel: Math.min(
          MAX_TEXT_LEVEL,
          atual.textLevel + 1
        ),
      }));
    }, []);
  
    const decreaseText = useCallback(() => {
      setSettings((atual) => ({
        ...atual,
        textLevel: Math.max(0, atual.textLevel - 1),
      }));
    }, []);
  
    const resetText = useCallback(() => {
      setSettings((atual) => ({
        ...atual,
        textLevel: 0,
      }));
    }, []);
  
    const resetAll = useCallback(() => {
      setSettings({
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
      });
    }, []);
  
    return {
      settings,
      textScale:
        TEXT_SCALE_LEVELS[settings.textLevel] ?? 1,
      canIncreaseText:
        settings.textLevel < MAX_TEXT_LEVEL,
      canDecreaseText: settings.textLevel > 0,
      isDefault: isDefaultSettings(settings),
      toggle,
      increaseText,
      decreaseText,
      resetText,
      resetAll,
    };
  }