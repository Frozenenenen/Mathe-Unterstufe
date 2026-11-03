  // ============================================================
  // SVG-FUNKTIONSPLOTTER (kein externes Paket)
  // ============================================================
  function makeTransform(cfg) {
    const { xmin, xmax, ymin, ymax, width, height, padLeft, padRight, padTop, padBottom } = cfg;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    return function toPx(x, y) {
      const px = padLeft + ((x - xmin) / (xmax - xmin)) * plotW;
      const py = padTop + plotH - ((y - ymin) / (ymax - ymin)) * plotH;
      return [px, py];
    };
  }
  function pathForFunction(fn, cfg) {
    const { xmin, xmax, ymin, ymax, samples } = cfg;
    const toPx = makeTransform(cfg);
    const yMargin = (ymax - ymin) * 3;
    let d = "";
    let penDown = false;
    for (let i = 0; i <= samples; i++) {
      const x = xmin + ((xmax - xmin) * i) / samples;
      let y;
      try { y = fn(x); } catch (e) { y = NaN; }
      if (typeof y !== "number" || !isFinite(y) || y < ymin - yMargin || y > ymax + yMargin) {
        penDown = false;
        continue;
      }
      const yClamped = Math.max(ymin - yMargin, Math.min(ymax + yMargin, y));
      const [px, py] = toPx(x, yClamped);
      if (!isFinite(px) || !isFinite(py)) { penDown = false; continue; }
      d += (penDown ? "L " : "M ") + px.toFixed(1) + " " + py.toFixed(1) + " ";
      penDown = true;
    }
    return d.trim();
  }
  function renderGraphSVG(fns, options) {
    const cfg = Object.assign({
      xmin: -3, xmax: 3, ymin: -5, ymax: 5,
      width: 220, height: 180,
      padLeft: 22, padRight: 8, padTop: 8, padBottom: 20,
      samples: 240,
      gridStep: 1,
      colors: ["#2563eb"]
    }, options || {});
    const toPx = makeTransform(cfg);
    const plotX = cfg.padLeft, plotY = cfg.padTop;
    const plotW = cfg.width - cfg.padLeft - cfg.padRight;
    const plotH = cfg.height - cfg.padTop - cfg.padBottom;

    // Gitter: getrennte Schrittweiten für x und y möglich (z. B. Zeit 0..10, Bestand 0..1000)
    const stepX = cfg.gridStepX || cfg.gridStep, stepY = cfg.gridStepY || cfg.gridStep;
    const fmtTick = (v) => String(Math.round(v * 1000) / 1000).replace(".", ",");
    let grid = "", ticks = "";
    for (let gx = Math.ceil(cfg.xmin / stepX) * stepX; gx <= cfg.xmax + 1e-9; gx += stepX) {
      const [px] = toPx(gx, 0);
      grid += `<line x1="${px.toFixed(1)}" y1="${plotY}" x2="${px.toFixed(1)}" y2="${(plotY + plotH).toFixed(1)}" stroke="#e2e8f0" stroke-width="1"/>`;
      if (cfg.ticks && Math.abs(gx) > 1e-9) {
        const ty = Math.min(plotY + plotH, Math.max(plotY, toPx(0, Math.max(cfg.ymin, Math.min(cfg.ymax, 0)))[1]));
        ticks += `<text x="${px.toFixed(1)}" y="${(ty + 11).toFixed(1)}" font-size="9" text-anchor="middle" fill="#475569">${fmtTick(gx)}</text>`;
      }
    }
    for (let gy = Math.ceil(cfg.ymin / stepY) * stepY; gy <= cfg.ymax + 1e-9; gy += stepY) {
      const [, py] = toPx(0, gy);
      grid += `<line x1="${plotX}" y1="${py.toFixed(1)}" x2="${(plotX + plotW).toFixed(1)}" y2="${py.toFixed(1)}" stroke="#e2e8f0" stroke-width="1"/>`;
      if (cfg.ticks && Math.abs(gy) > 1e-9) {
        const tx = Math.min(plotX + plotW, Math.max(plotX, toPx(Math.max(cfg.xmin, Math.min(cfg.xmax, 0)), 0)[0]));
        ticks += `<text x="${(tx - 3).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="#475569">${fmtTick(gy)}</text>`;
      }
    }

    // Achsen auch am Rand zeichnen, wenn 0 genau die Bereichsgrenze ist (z. B. Zeit ab 0)
    let axes = "";
    if (cfg.ymin <= 0 && cfg.ymax >= 0) {
      const [xA, yA] = toPx(cfg.xmin, 0), [xB, yB] = toPx(cfg.xmax, 0);
      axes += `<line x1="${xA.toFixed(1)}" y1="${yA.toFixed(1)}" x2="${xB.toFixed(1)}" y2="${yB.toFixed(1)}" stroke="#64748b" stroke-width="1.2"/>`;
    }
    if (cfg.xmin <= 0 && cfg.xmax >= 0) {
      const [xA, yA] = toPx(0, cfg.ymin), [xB, yB] = toPx(0, cfg.ymax);
      axes += `<line x1="${xA.toFixed(1)}" y1="${yA.toFixed(1)}" x2="${xB.toFixed(1)}" y2="${yB.toFixed(1)}" stroke="#64748b" stroke-width="1.2"/>`;
    }
    if (cfg.achsenNamen) {
      const [ax, ay] = cfg.achsenNamen;
      axes += `<text x="${(plotX + plotW).toFixed(1)}" y="${(plotY + plotH + 18).toFixed(1)}" font-size="10" text-anchor="end" fill="#334155" font-weight="bold">${ax}</text>`;
      axes += `<text x="${(plotX + 2).toFixed(1)}" y="${(plotY + 10).toFixed(1)}" font-size="10" fill="#334155" font-weight="bold">${ay}</text>`;
    }

    const fnList = Array.isArray(fns) ? fns : [{ fn: fns, color: cfg.colors[0] }];
    const clipId = "gclip" + Math.random().toString(36).slice(2, 9);
    let paths = "";
    fnList.forEach((item, idx) => {
      const color = item.color || cfg.colors[idx % cfg.colors.length];
      const d = pathForFunction(item.fn, cfg);
      if (d) {
        paths += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="butt" clip-path="url(#${clipId})"/>`;
      }
      if (item.label) {
        // Beschriftung am rechten Rand, dort wo der Graph sichtbar ist
        for (let k = 0; k <= 40; k++) {
          const x = cfg.xmax - ((cfg.xmax - cfg.xmin) * k) / 40 * 0.9;
          let y; try { y = item.fn(x); } catch (e) { y = NaN; }
          if (isFinite(y) && y > cfg.ymin && y < cfg.ymax) {
            const [px, py] = toPx(x, y);
            paths += `<text x="${(px - 4).toFixed(1)}" y="${Math.max(plotY + 11, py - 6).toFixed(1)}" font-size="11" font-weight="bold" text-anchor="end" fill="${color}" stroke="white" stroke-width="3" paint-order="stroke">${item.label}</text>`;
            break;
          }
        }
      }
    });

    // Markierungen für Musterlösungen: Punkte, Steigungsdreieck, Hilfslinien
    let marks = "";
    (cfg.marks || []).forEach((m) => {
      const col = m.color || "#dc2626";
      if (m.type === "point") {
        const [px, py] = toPx(m.x, m.y);
        marks += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.6" fill="${col}" stroke="white" stroke-width="1"/>`;
        // Beschriftung innerhalb der Zeichenfläche halten (grobe Textbreite ~6 px pro Zeichen)
        const lx = Math.max(plotX + 2, Math.min(px + (m.dx === undefined ? 6 : m.dx), plotX + plotW - String(m.label || "").length * 6.2));
        const ly = Math.max(plotY + 10, Math.min(py + (m.dy === undefined ? -6 : m.dy), plotY + plotH - 3));
        if (m.label) marks += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="10" font-weight="bold" fill="${col}" stroke="white" stroke-width="3" paint-order="stroke">${m.label}</text>`;
      } else if (m.type === "triangle") {
        // Steigungsdreieck: von (x|y) waagerecht um dx, dann senkrecht um dy
        const [x0, y0] = toPx(m.x, m.y), [x1] = toPx(m.x + m.dx, m.y), [, y1] = toPx(m.x + m.dx, m.y + m.dy);
        marks += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="1.8"/>`;
        marks += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${(y0 + (m.dy >= 0 ? 12 : -4)).toFixed(1)}" font-size="10" font-weight="bold" text-anchor="middle" fill="${col}" stroke="white" stroke-width="3" paint-order="stroke">${fmtTick(m.dx)}</text>`;
        marks += `<text x="${(x1 + 4).toFixed(1)}" y="${((y0 + y1) / 2 + 3).toFixed(1)}" font-size="10" font-weight="bold" fill="${col}" stroke="white" stroke-width="3" paint-order="stroke">${fmtTick(m.dy)}</text>`;
      } else if (m.type === "hline" || m.type === "vline") {
        const [xa, ya] = m.type === "hline" ? toPx(cfg.xmin, m.y) : toPx(m.x, cfg.ymin);
        const [xb, yb] = m.type === "hline" ? toPx(cfg.xmax, m.y) : toPx(m.x, cfg.ymax);
        marks += `<line x1="${xa.toFixed(1)}" y1="${ya.toFixed(1)}" x2="${xb.toFixed(1)}" y2="${yb.toFixed(1)}" stroke="${col}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
        if (m.label) marks += m.type === "hline"
          ? `<text x="${(xa + 4).toFixed(1)}" y="${(ya - 4).toFixed(1)}" font-size="10" fill="${col}" stroke="white" stroke-width="3" paint-order="stroke">${m.label}</text>`
          : `<text x="${(xa + 3).toFixed(1)}" y="${(plotY + 10).toFixed(1)}" font-size="10" fill="${col}" stroke="white" stroke-width="3" paint-order="stroke">${m.label}</text>`;
      }
    });

    return `<svg viewBox="0 0 ${cfg.width} ${cfg.height}" width="${cfg.width}" height="${cfg.height}" xmlns="http://www.w3.org/2000/svg" class="graph-svg">` +
      `<defs><clipPath id="${clipId}"><rect x="${plotX}" y="${plotY}" width="${plotW}" height="${plotH}"/></clipPath></defs>` +
      `<rect x="${plotX}" y="${plotY}" width="${plotW}" height="${plotH}" fill="#ffffff" stroke="#cbd5e1"/>` +
      grid + axes + paths + marks + ticks +
      `</svg>`;
  }

