/* ============================================================
   NEXA — Voice open mic for the Command Center
   Uses the Web Speech API (Chrome/Edge/Safari). Transcribes a
   spoken command into the command bar and dispatches it.
   ============================================================ */
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('micBtn');
  const cmd = document.getElementById('cmd');
  if (!btn || !cmd) return;
  if (!SR) { btn.title = 'Voice not supported in this browser'; btn.style.opacity = 0.45; btn.style.cursor = 'not-allowed'; return; }

  const langMap = { en: 'en-US', de: 'de-DE', nl: 'nl-NL' };
  const rec = new SR();
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  let listening = false, finalText = '';

  btn.addEventListener('click', () => {
    rec.lang = langMap[(window.I18N && I18N.lang) || 'en'] || 'en-US';
    if (listening) { rec.stop(); return; }
    finalText = '';
    try { rec.start(); } catch (e) {}
  });

  rec.onstart = () => { listening = true; btn.classList.add('rec'); cmd.placeholder = (window.I18N ? I18N.t('cc.listening') : 'Listening…'); };
  rec.onend = () => {
    listening = false; btn.classList.remove('rec');
    cmd.placeholder = (window.I18N ? I18N.t('cc.cmd_ph') : 'Tell your workforce what to accomplish…');
    if (finalText.trim() && window.runCommand) window.runCommand(finalText.trim());
  };
  rec.onresult = (e) => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      txt += e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
    }
    cmd.value = txt;
  };
  rec.onerror = () => { listening = false; btn.classList.remove('rec'); };
})();
