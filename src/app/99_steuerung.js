  function render() {
    if (examTimer) { clearInterval(examTimer); examTimer = null; }
    if (state.view === "home") renderHome();
    else if (state.view === "levels") renderLevels();
    else if (state.view === "task") renderTask();
    else if (state.view === "exam-setup") renderExamSetup();
    else if (state.view === "exam") renderExam();
    else if (state.view === "print") renderPrint();
  }

  initStorage().then(render);
})();
