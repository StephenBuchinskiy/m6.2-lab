const q  = (sel, root = document) => root.querySelector(sel);
const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Functions to collect text from the document
function getGridText() {
    return qa('.grid .block p').map(p => p.textContent).join(' ');
}

function countParagraphs() { 
    return qa('.grid .block p').length; 
}

function countSentences(text) {
    const m = String(text || '').match(/[.!?](?=\s|$)/g);
    return m ? m.length : 0;
}

function countWords(text) {
    const m = String(text || '').match(/[\p{L}\p{N}’'-]+/gu);
    return m ? m.length : 0;
}

function countLetters(text) {
    const m = String(text || '').match(/\p{L}/gu);
    return m ? m.length : 0;
}

// Normalize radio values
function metricKey(value) {
    const v = String(value || '').toLowerCase();
    if (v.startsWith('para')) return 'Paragraphs';
    if (v.startsWith('sent')) return 'Sentences';
    if (v.startsWith('word')) return 'Words';
    if (v.startsWith('lett')) return 'Letters';
}

// Compute all values
function computeAll() {
    const text = getGridText();
    return {
        Paragraphs: countParagraphs(),
        Sentences:  countSentences(text),
        Words:      countWords(text),
        Letters:    countLetters(text),
    };
}

  // Show live counts next to each radio
  function refreshLabels(radios) {
    const counts = computeAll();
    radios.forEach(radio => {
      const label  = radio.closest('label');
      const metric = metricKey(radio.value);
      const value  = counts[metric] ?? 0;

      if (!label) return;

      // Put live text in a span.metric-text (create if missing)
      let span = label.querySelector('.metric-text');
      if (!span) {
        span = document.createElement('span');
        span.className = 'metric-text';
        label.appendChild(span);
      }
      span.textContent = ` ${metric}: ${value}`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Radios live in .controls; fall back to document if needed
    const controls = q('.controls') || document;
    const radios   = qa('input[type="radio"]', controls);

    // Enforce single selection even if names differ
    radios.forEach(r =>
      r.addEventListener('change', () =>
        radios.forEach(x => { if (x !== r) x.checked = false; })
      )
    );

    if (radios.length) refreshLabels(radios);

    // Button can be #show-option or #show-quote
    const button = q('#show-option') || q('#show-quote') || null;

    if (button) {
      button.addEventListener('click', () => {
        if (!radios.length) { alert('No options available.'); return; }
        const selected = radios.find(r => r.checked) || radios[0];
        const metric   = metricKey(selected.value);
        const counts   = computeAll();
        alert(`${metric}: ${counts[metric] ?? 0}`);
      });
    }
  });

