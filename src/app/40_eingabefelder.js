  // ---------- Rendering: Aufgabe ----------
  // Baut die Eingabefelder einer Aufgabe in 'card' und liefert die (versteckten)
  // Eingabe-Elemente zurück. 'prefix' macht die Feld-IDs eindeutig, damit auch
  // mehrere Aufgaben auf einer Seite (Klassenarbeit) funktionieren.
  function baueEingaben(task, level, card, prefix, beiEnter) {
    // Eingabefelder -- Anzahl richtet sich nach task.numFields (kann > answer.length
    // sein, damit die Feldanzahl selbst nie die Lösung verrät; bei den aktuellen
    // Stufen ist numFields stets gleich answer.length).
    const inputs = [];
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

