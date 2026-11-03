  // ============================================================
  // MINI-FORMEL-RENDERER
  // ============================================================
  function mathToHtml(src) {
    let i = 0;
    const n = src.length;

    function escapeText(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function readGroup(trim) {
      if (src[i] !== "{") {
        const ch = src[i]; i++;
        return escapeText(ch === undefined ? "" : ch);
      }
      i++;
      let depth = 1;
      const start = i;
      while (i < n && depth > 0) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") depth--;
        if (depth > 0) i++;
      }
      const inner = src.slice(start, i);
      i++;
      const rendered = mathToHtml(inner);
      return trim === false ? rendered : rendered.trim();
    }

    let out = "";
    while (i < n) {
      const c = src[i];
      if (c === "\\") {
        const next = src[i + 1];
        if (next === "," || next === ";" || next === "!" || next === " ") {
          out += " "; i += 2; continue;
        }
        if (next === "%") { out += "%"; i += 2; continue; }
        let j = i + 1, name = "";
        while (j < n && /[a-zA-Z]/.test(src[j])) { name += src[j]; j++; }
        i = j;
        switch (name) {
          case "dfrac": case "frac": {
            const num = readGroup(); const den = readGroup();
            out += `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
            break;
          }
          case "sqrt": {
            let idx = "";
            if (src[i] === "[") {
              i++;
              let depth2 = 1; const start2 = i;
              while (i < n && depth2 > 0) {
                if (src[i] === "[") depth2++;
                else if (src[i] === "]") depth2--;
                if (depth2 > 0) i++;
              }
              idx = src.slice(start2, i);
              i++;
            }
            const inner = readGroup();
            out += idx ? `<sup>${idx}</sup>√(${inner})` : "√(" + inner + ")";
            break;
          }
          case "text": out += `<span class="mtext">${readGroup(false)}</span>`; break;
          case "cdot": out += " · "; break;
          case "ldots": out += "…"; break;
          case "log": out += "log"; break;
          case "ln": out += "ln"; break;
          case "lg": out += "lg"; break;
          case "Leftrightarrow": out += " ⇔ "; break;
          case "Rightarrow": out += " ⇒ "; break;
          case "rightarrow": out += " → "; break;
          case "approx": out += " ≈ "; break;
          case "neq": out += " ≠ "; break;
          case "geq": out += " ≥ "; break;
          case "leq": out += " ≤ "; break;
          case "pm": out += " ± "; break;
          case "square": out += "▢"; break;
          case "sin": case "cos": case "tan": out += name; break;
          case "alpha": out += "α"; break;
          case "beta": out += "β"; break;
          case "gamma": out += "γ"; break;
          case "pi": out += "π"; break;
          case "varepsilon": case "epsilon": out += "ε"; break;
          case "varphi": case "phi": out += "φ"; break;
          case "left": case "right": break; // Größenanpassung nicht nötig, folgendes Klammerzeichen wird normal durchgereicht
          case "quad": out += "  "; break;
          case "qquad": out += "    "; break;
          default: out += name;
        }
      } else if (c === "^") {
        i++; out += "<sup>" + readGroup() + "</sup>";
      } else if (c === "_") {
        i++; out += "<sub>" + readGroup() + "</sub>";
      } else if (c === "{") {
        out += readGroup();
      } else if (c === "}") {
        i++;
      } else {
        out += escapeText(c); i++;
      }
    }
    return out.replace(/[ \t]{2,}/g, " ");
  }

