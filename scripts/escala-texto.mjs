import {
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
  } from "node:fs";
  import { extname, join, sep } from "node:path";
  
  /*
   * USO
   *   node scripts/escala-texto.mjs                  (simulação)
   *   node scripts/escala-texto.mjs --apply          (aplica)
   *   node scripts/escala-texto.mjs --apply src/pages/Dashboard.tsx
   *                                                  (só um arquivo)
   */
  
  const args = process.argv.slice(2);
  
  const apply = args.includes("--apply");
  const targets = args.filter((a) => !a.startsWith("--"));
  
  const roots =
    targets.length > 0
      ? targets
      : ["src/pages", "src/components"];
  
  const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);
  
  /* O widget de acessibilidade não deve escalar */
  const IGNORED = ["src/components/accessibility"];
  
  const SCALE = "var(--sk-text-scale, 1)";
  
  function calcPx(n) {
    return `calc(${n}px * ${SCALE})`;
  }
  
  function normalize(p) {
    return p.split(sep).join("/");
  }
  
  function* walk(p) {
    const stat = statSync(p);
  
    if (stat.isDirectory()) {
      for (const name of readdirSync(p)) {
        yield* walk(join(p, name));
      }
    } else if (EXTENSIONS.has(extname(p))) {
      yield p;
    }
  }
  
  function isIgnored(file) {
    const path = normalize(file);
  
    return IGNORED.some((dir) => path.startsWith(dir));
  }
  
  /*
   * Encontra o fim da expressão de um fontSize:
   * a primeira vírgula ou chave/parêntese de fechamento
   * fora de strings e de parênteses internos.
   */
  function findExpressionEnd(text, start) {
    let depth = 0;
    let quote = null;
  
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
  
      if (quote) {
        if (ch === quote && text[i - 1] !== "\\") {
          quote = null;
        }
  
        continue;
      }
  
      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        continue;
      }
  
      if (ch === "(" || ch === "[" || ch === "{") {
        depth++;
      } else if (ch === ")" || ch === "]" || ch === "}") {
        if (depth === 0) {
          return i;
        }
  
        depth--;
      } else if (ch === "," && depth === 0) {
        return i;
      }
    }
  
    return text.length;
  }
  
  /*
   * Converte, dentro da expressão de um fontSize:
   *   "14px"            -> "calc(14px * var(...))"
   *   14                -> "calc(14px * var(...))"
   *   cond ? 24 : 28    -> cond ? "calc(...)" : "calc(...)"
   * Números fora das posições de valor (como em
   * "largura > 600") não são tocados.
   */
  function convertExpression(expr) {
    let count = 0;
  
    let out = expr.replace(
      /(["'])(\d+(?:\.\d+)?)px\1/g,
      (_match, _quote, n) => {
        count++;
  
        return `"${calcPx(n)}"`;
      }
    );
  
    out = out.replace(
      /(^\s*|[?:]\s*)(\d+(?:\.\d+)?)(?=\s*(?::|$))/g,
      (_match, before, n) => {
        count++;
  
        return `${before}"${calcPx(n)}"`;
      }
    );
  
    return { out, count };
  }
  
  /*
   * Em gráficos Recharts, fontSize em tick, eixos, legendas e
   * labels vira atributo SVG, que não aceita var().
   */
  function looksLikeSvgAttribute(text, index) {
    const before = text
      .slice(0, index)
      .split(/\r?\n/)
      .slice(-4)
      .join("\n");
  
    return /(\btick\b|<XAxis|<YAxis|<Legend|<Label\b|<Text\b|<PolarAngleAxis|<PolarRadiusAxis|\blabel=\{)/.test(
      before
    );
  }
  
  function lineOf(text, index) {
    return text.slice(0, index).split("\n").length;
  }
  
  function transform(source) {
    const usesRecharts = /from\s+["']recharts["']/.test(source);
  
    const stats = { css: 0, inline: 0, skipped: [] };
  
    /* 1. CSS: font-size: clamp(...) */
    let out = source.replace(
      /font-size\s*:\s*(clamp\([^()]*\))(?=\s*[;}\r\n])/gi,
      (_match, fn) => {
        stats.css++;
  
        return `font-size: calc(${fn} * ${SCALE})`;
      }
    );
  
    /* 2. CSS: font-size: 14px */
    out = out.replace(
      /font-size\s*:\s*(\d+(?:\.\d+)?)px/gi,
      (_match, n) => {
        stats.css++;
  
        return `font-size: ${calcPx(n)}`;
      }
    );
  
    /* 3. Inline React: fontSize: ... */
    const re = /fontSize\s*:/g;
  
    let result = "";
    let cursor = 0;
    let match;
  
    while ((match = re.exec(out)) !== null) {
      const start = match.index + match[0].length;
      const end = findExpressionEnd(out, start);
      const expr = out.slice(start, end);
  
      /* Evita falsos positivos (ex.: tipos "fontSize: number;") */
      if (expr.includes(";") || expr.length > 300) {
        continue;
      }
  
      const converted = convertExpression(expr);
  
      if (converted.count === 0) {
        continue;
      }
  
      if (usesRecharts && looksLikeSvgAttribute(out, match.index)) {
        stats.skipped.push(lineOf(out, match.index));
  
        continue;
      }
  
      result += out.slice(cursor, start) + converted.out;
      cursor = end;
      stats.inline += converted.count;
    }
  
    result += out.slice(cursor);
  
    return { out: result, ...stats };
  }
  
  const totals = {
    files: 0,
    css: 0,
    inline: 0,
  };
  
  const pending = [];
  const skippedSvg = [];
  
  for (const root of roots) {
    for (const file of walk(root)) {
      if (isIgnored(file)) {
        continue;
      }
  
      const source = readFileSync(file, "utf8");
  
      const result = transform(source);
  
      const changed = result.css + result.inline;
  
      if (changed > 0) {
        totals.files++;
        totals.css += result.css;
        totals.inline += result.inline;
  
        console.log(
          `${normalize(file)}: ${changed} alteracoes` +
            ` (css ${result.css}, inline ${result.inline})`
        );
  
        if (apply) {
          writeFileSync(file, result.out, "utf8");
        }
      }
  
      result.skipped.forEach((line) =>
        skippedSvg.push(`${normalize(file)}:${line}`)
      );
  
      /* Linhas com font-size que continuam sem a escala */
      const lines = result.out.split(/\r?\n/);
  
      lines.forEach((line, index) => {
        if (!/font-?size/i.test(line)) {
          return;
        }
  
        const trecho = lines.slice(index, index + 3).join(" ");
  
        if (!/calc\(/.test(trecho)) {
          pending.push(
            `${normalize(file)}:${index + 1}: ${line.trim()}`
          );
        }
      });
    }
  }
  
  console.log("");
  console.log(apply ? "APLICADO." : "SIMULACAO (nada foi alterado).");
  console.log(`Arquivos alterados: ${totals.files}`);
  console.log(`font-size em CSS: ${totals.css}`);
  console.log(`fontSize inline: ${totals.inline}`);
  
  if (skippedSvg.length > 0) {
    console.log("");
    console.log(
      `Ignorados por parecerem atributos SVG do Recharts (${skippedSvg.length}):`
    );
  
    skippedSvg.forEach((line) => console.log(line));
  }
  
  if (pending.length > 0) {
    console.log("");
    console.log(
      `Ficaram sem escala (${pending.length}). Revisar se necessario:`
    );
  
    pending.slice(0, 60).forEach((line) => console.log(line));
  
    if (pending.length > 60) {
      console.log(`... e mais ${pending.length - 60}`);
    }
  }
  
  if (!apply) {
    console.log("");
    console.log("Para aplicar: node scripts/escala-texto.mjs --apply");
  }