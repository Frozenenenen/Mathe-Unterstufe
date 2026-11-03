  // ---------- App-Zustand ----------
  const state = { view: "home", topicKey: null, levelId: null, task: null, checked: false, showSteps: false, stepsRevealed: false };

  const app = document.getElementById("app");

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (children) children.forEach(c => { if (c) e.appendChild(c); });
    return e;
  }
  function text(tag, cls, str) { return el(tag, { class: cls }, [document.createTextNode(str)]); }

