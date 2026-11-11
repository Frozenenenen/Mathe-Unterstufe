  // ---------- Rendering: Aufgabe ----------
  // Baut die Eingabefelder einer Aufgabe in 'card' und liefert die (versteckten)
  // Eingabe-Elemente zurück. 'prefix' macht die Feld-IDs eindeutig, damit auch
  // mehrere Aufgaben auf einer Seite (Klassenarbeit) funktionieren.
  // Freie Rechenzeilen: beliebig viele Zwischenzeilen, die letzte Zeile (x = …) wird geprüft.
  // Nach dem Prüfen zeigt jede Zeile, ob sie noch zur Ausgangsgleichung passt.
  function vorschauTex(z) {
    return String(z).replace(/\^\(([^()]*)\)/g, "^{$1}").replace(/\^(-?[\d.,]+)/g, "^{$1}").replace(/²/g, "^{2}").replace(/³/g, "^{3}")
      .replace(/[*·]/g, " \\cdot ").replace(/=/g, " = ").replace(/([^ ])([+])/g, "$1 $2 ").replace(/(\S)-(?![^{]*})/g, "$1 - ");
  }
  function baueRechenzeilen(task, card, prefix, beiEnter) {
    const wrap = el("div", { class: "rechenzeilen" });
    wrap.appendChild(el("div", { class: "rz-hinweis", html: "Rechne Zeile für Zeile. In die <b>letzte Zeile</b> kommt das Ergebnis, z. B. <code>x = 3</code> oder <code>x = -5/4</code>." }));
    const liste = el("div", { class: "rz-liste" });
    const hidden = el("input", { type: "hidden", id: prefix + "0" });
    const zeilen = []; hidden._visual = zeilen; hidden._fehlerZiel = () => zeilen[zeilen.length - 1]; // rot wird nur die Ergebniszeile
    const msg = el("div", { class: "field-msg", id: prefix + "0-msg" });
    const MARKE = { ok: ["rz-ok", "✓ passt"], falsch: ["rz-falsch", "✗ In dieser Zeile steckt ein Fehler"], folge: ["", ""], keineGleichung: ["rz-info", "Keine Gleichung (= fehlt)"], unlesbar: ["rz-info", "Nicht lesbar – erlaubt sind Zahlen, x, + − · / ^ und Klammern"] };
    function aktualisiere() { hidden.value = ML.zeilenErgebnis(zeilen.length ? zeilen[zeilen.length - 1].value : "") || (zeilen.length ? zeilen[zeilen.length - 1].value : ""); }
    function neueZeile(fokus) {
      const inp = el("input", { type: "text", class: "rz-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": `Zeile ${zeilen.length + 1}` });
      const vorschau = el("div", { class: "rz-vorschau" }), marke = el("div", { class: "rz-marke" });
      inp._marke = marke;
      inp.addEventListener("input", () => { vorschau.innerHTML = inp.value.trim() ? ML.mathToHtml(vorschauTex(inp.value)) : ""; marke.textContent = ""; marke.className = "rz-marke"; aktualisiere(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (beiEnter) beiEnter(); } });
      zeilen.push(inp);
      liste.appendChild(el("div", { class: "rz-zeile" }, [inp, vorschau, marke]));
      plusBtn.disabled = hidden.disabled; minusBtn.style.display = zeilen.length > 1 ? "" : "none";
      aktualisiere();
      if (fokus) inp.focus();
    }
    const plusBtn = el("button", { type: "button", class: "btn secondary rz-plus", onclick: () => neueZeile(true) }, [document.createTextNode("+ Zusätzliche Zeile")]);
    const minusBtn = el("button", { type: "button", class: "btn ghost rz-plus", onclick: () => {
      if (zeilen.length < 2) return; zeilen.pop(); liste.removeChild(liste.lastChild); minusBtn.style.display = zeilen.length > 1 ? "" : "none"; aktualisiere();
    } }, [document.createTextNode("− Zeile entfernen")]);
    hidden._buttons = [plusBtn, minusBtn];
    wrap.appendChild(liste);
    wrap.appendChild(el("div", { class: "rz-knoepfe" }, [plusBtn, minusBtn]));
    wrap.appendChild(msg); wrap.appendChild(hidden);
    card.appendChild(wrap);
    neueZeile(false);
    // nach dem Prüfen: jede Zeile gegen die Lösung der Ausgangsgleichung halten (verrät die Lösung nicht)
    hidden._nachPruefen = () => {
      const a = task.answer[0], x0 = typeof a === "number" ? a : a.num / a.den;
      let fehlerGezeigt = false;
      zeilen.forEach((z, k) => {
        const letzte = k === zeilen.length - 1;
        let r = ML.zeilePruefen(z.value, x0);
        if (r === "leer") { z._marke.textContent = ""; return; }
        if (r === "falsch" && fehlerGezeigt) r = "folge";             // nur die erste falsche Zeile markieren
        if (r === "falsch") fehlerGezeigt = true;
        if (letzte && ML.zeilenErgebnis(z.value) !== null) r = null;   // Ergebnis prüft die normale Prüfung
        const [cls, txt] = r ? MARKE[r] : ["", ""];
        z._marke.className = "rz-marke " + cls; z._marke.textContent = txt;
      });
      const letzteZ = zeilen.length ? zeilen[zeilen.length - 1].value.trim() : "";
      msg.dataset.zusatz = !letzteZ ? "Trage in die letzte Zeile dein Ergebnis ein: x = Zahl."
        : ML.zeilenErgebnis(letzteZ) === null ? "Die letzte Zeile muss das Ergebnis sein: x = Zahl." : "Das Ergebnis in der letzten Zeile stimmt noch nicht.";
    };
    return [hidden];
  }
  function baueEingaben(task, level, card, prefix, beiEnter) {
    // Eingabefelder -- Anzahl richtet sich nach task.numFields (kann > answer.length
    // sein, damit die Feldanzahl selbst nie die Lösung verrät; bei den aktuellen
    // Stufen ist numFields stets gleich answer.length).
    const inputs = [];
    if (task.zeilen) return baueRechenzeilen(task, card, prefix, beiEnter);
    if (task.graphs && task.fieldType === "select") {
      // Graphen-Zuordnung: Raster aus SVG-Grafik + Beschriftung + Dropdown
      const grid = el("div", { class: "graph-grid" });
      task.graphs.forEach((g, idx) => {
        const fieldId = prefix + idx;
        const cell = el("div", { class: "graph-cell" });
        cell.appendChild(el("div", {
          class: "graph-svg-holder",
          html: ML.renderGraphSVG(g.fn, Object.assign({ colors: ["#2563eb"] }, task.graphConfig))
        }));
        cell.appendChild(el("label", { for: fieldId, class: "graph-label" }, [document.createTextNode(g.id)]));
        const select = el("select", { id: fieldId });
        select.appendChild(el("option", { value: "" }, [document.createTextNode("-- wählen --")]));
        task.fieldOptions.forEach((opt) => {
          select.appendChild(el("option", { value: opt.value }, [document.createTextNode(opt.text)]));
        });
        cell.appendChild(select);
        const msg = el("div", { class: "field-msg", id: fieldId + "-msg" });
        cell.appendChild(msg);
        grid.appendChild(cell);
        inputs.push(select);
      });
      card.appendChild(grid);
    } else {
      // Schreibform: Felder direkt im Ausdruck, z. B. [0, "x", { h: 1 }] = ▢x^▢ (Basis rechtsbündig, Exponent hochgestellt
      // und linksbündig) oder [0, 1] = gemischte Zahl. Strings sind TeX-Text, Zahlen normale Felder, { h: i } hochgestellte Felder.
      const form = Array.isArray(task.eingabeForm) ? task.eingabeForm : null;
      const formIdx = new Map(); // Feldnummer -> "normal" | "hoch"
      if (form) form.forEach((t) => { if (typeof t === "number") formIdx.set(t, "normal"); else if (t && typeof t === "object" && typeof t.h === "number") formIdx.set(t.h, "hoch"); });
      const formTeile = {}; // Feldnummer -> { wrap, msg }
      let formZeile = null, formMsgs = null;
      for (let idx = 0; idx < task.numFields; idx++) {
        const fieldId = prefix + idx;
        const imForm = formIdx.has(idx);
        if (imForm && !formZeile) { // Platzhalter an der Stelle des ersten Formfelds, wird nach der Schleife gefüllt
          formZeile = el("div", { class: "formel-eingabe" }); formMsgs = el("div", { class: "formel-msgs" });
          card.appendChild(el("div", { class: "field-row formel-row" }, [formZeile, formMsgs]));
        }
        const label = (task.fieldLabels && task.fieldLabels[idx]) || `Feld ${idx + 1}`;
        // Effektiver Feldtyp: perFieldType (gemischte Aufgaben) hat Vorrang,
        // sonst der einheitliche task.fieldType (z.B. "choice" für Spiel 1),
        // sonst normales Texteingabefeld.
        const fType = (task.perFieldType && task.perFieldType[idx]) || task.fieldType || "text";
        const row = el("div", { class: "field-row" });
        row.appendChild(el("label", { for: fieldId }, [document.createTextNode(label)]));

        if (fType === "choice") {
          const choices = (task.fieldChoices && task.fieldChoices[idx]) || [];
          const hidden = el("input", { type: "hidden", id: fieldId });
          const btnGroup = el("div", { class: "choice-btn-group" });
          const buttons = [];
          choices.forEach((choiceVal) => {
            const btn = el("button", {
              type: "button", class: "choice-btn",
              onclick: () => {
                hidden.value = choiceVal;
                buttons.forEach((b) => b.classList.remove("selected"));
                btn.classList.add("selected");
              }
            }, [document.createTextNode(choiceVal)]);
            buttons.push(btn);
            btnGroup.appendChild(btn);
          });
          hidden._buttons = buttons;
          row.appendChild(btnGroup);
          row.appendChild(hidden);
          inputs.push(hidden);
        } else {
          // Handy-taugliche Eingabe: Zifferntastatur (inputmode decimal) hat
          // weder "/" noch (auf iOS) "-". Daher:
          //  - Bruchfelder: zwei Ziffernfelder übereinander (Zähler / Nenner)
          //  - alle Zahlenfelder: eigener ±-Knopf für das Vorzeichen
          // Der Prüflogik wird wie bisher ein Text ("-3/4", "2,5") übergeben.
          const ans = task.answer ? task.answer[idx] : null;
          const isFraction = task.answerType === "fraction" || (ans && typeof ans === "object" && "num" in ans);
          const hidden = el("input", { type: "hidden", id: fieldId });
          const wrap = el("div", { class: "num-input-wrap" });
          let negative = false;
          // ±-Knopf nur in Stufen, in denen negative Ergebnisse vorkommen können
          // (pro Stufe festgelegt, nicht pro Aufgabe -- sonst verriete der Knopf die Lösung)
          const wantSign = task.fieldSigned ? !!task.fieldSigned[idx] : !!level.signed;
          const signBtn = wantSign ? el("button", { type: "button", class: "sign-btn", title: "Vorzeichen wechseln", "aria-label": "Vorzeichen: plus (antippen für minus)" }, [document.createTextNode("+")]) : null;
          const onEnter = (ev) => { if (ev.key === "Enter") { ev.preventDefault(); if (beiEnter) beiEnter(); } };
          const mkInput = (cls, ph, label) => {
            const inp = el("input", { type: "text", class: cls, inputmode: "decimal", autocomplete: "off", placeholder: ph, "aria-label": label });
            inp.addEventListener("keydown", onEnter);
            return inp;
          };
          let parts;
          if (isFraction) {
            const zIn = mkInput("frac-in", imForm ? "" : "Zähler", label + " (Zähler)");
            const nIn = mkInput("frac-in", imForm ? "" : "Nenner", label + " (Nenner)");
            const fracBox = el("div", { class: "frac-input" }, [zIn, el("div", { class: "frac-bar" }), nIn]);
            parts = [zIn, nIn];
            if (signBtn) wrap.appendChild(signBtn);
            wrap.appendChild(fracBox);
            const hint = el("div", { class: "frac-hint" }, [document.createTextNode("Ganze Zahl? Nenner leer lassen.")]);
            wrap.appendChild(hint);
          } else {
            const ph = (task.fieldPlaceholders && task.fieldPlaceholders[idx] != null) ? task.fieldPlaceholders[idx] : "";
            const vIn = mkInput("num-in", ph, label);
            parts = [vIn];
            if (signBtn) wrap.appendChild(signBtn);
            wrap.appendChild(vIn);
          }
          const sync = () => {
            const strip = (s) => s.trim().replace(/^[-−–+]/, "");
            // Minus, das jemand direkt eintippt (z. B. am PC), zählt ebenfalls
            const typedMinus = parts.some(p => /^[-−–]/.test(p.value.trim()));
            const neg = negative !== typedMinus;
            const z = strip(parts[0].value);
            let v = z;
            if (isFraction) {
              const n = strip(parts[1].value);
              if (n !== "") v = z + "/" + n;
            }
            hidden.value = v === "" ? "" : (neg ? "-" : "") + v;
            if (signBtn) {
              signBtn.classList.toggle("active", neg);
              signBtn.textContent = neg ? "−" : "+";
              signBtn.setAttribute("aria-label", neg ? "Vorzeichen: minus (antippen für plus)" : "Vorzeichen: plus (antippen für minus)");
            }
          };
          parts.forEach(p => p.addEventListener("input", sync));
          if (signBtn) signBtn.addEventListener("click", () => { negative = !negative; sync(); });
          hidden._visual = parts;
          hidden._signBtn = signBtn;
          if (imForm) {
            wrap.classList.add(formIdx.get(idx) === "hoch" ? "fe-hoch" : "fe-normal");
            if (isFraction) wrap.classList.add("fe-bruch");
            wrap.appendChild(hidden);
            const msg = el("div", { class: "field-msg", id: fieldId + "-msg" });
            formTeile[idx] = { wrap, msg, isFraction };
            inputs.push(hidden);
            continue;
          }
          row.appendChild(wrap);
          row.appendChild(hidden);
          inputs.push(hidden);
        }

        const msg = el("div", { class: "field-msg", id: fieldId + "-msg" });
        row.appendChild(msg);
        card.appendChild(row);
      }
      if (formZeile) {
        form.forEach((t) => {
          if (typeof t === "string") formZeile.appendChild(el("span", { class: "fe-text", html: ML.mathToHtml(t) }));
          else { const i = typeof t === "number" ? t : t.h; if (formTeile[i]) formZeile.appendChild(formTeile[i].wrap); }
        });
        Object.keys(formTeile).sort((a, b) => a - b).forEach((i) => formMsgs.appendChild(formTeile[i].msg));
        if (Object.values(formTeile).some((f) => f.isFraction)) formMsgs.appendChild(el("div", { class: "frac-hint" }, [document.createTextNode("Ganze Zahl im Bruchfeld? Nenner leer lassen.")]));
      }
    }

    return inputs;
  }

