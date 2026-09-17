const state = { words: [], selected: new Date() };
const el = id => document.getElementById(id);
const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const prettyDate = d => d.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });

async function load() {
  try {
    const response = await fetch('data/words.json', { cache:'no-store' });
    if (!response.ok) throw new Error('The word collection could not be opened.');
    const payload = await response.json();
    state.words = payload.words;
    const requested = new URLSearchParams(location.search).get('date');
    if (requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)) state.selected = new Date(`${requested}T12:00:00`);
    render();
  } catch (error) {
    el('loading').hidden = true; el('error').hidden = false; el('error').textContent = error.message;
  }
}

function findWord(date) {
  const exact = state.words.find(item => item.date === localDate(date));
  if (exact) return exact;
  const start = new Date(state.words[0].date + 'T12:00:00');
  const days = Math.floor((date - start) / 86400000);
  return state.words[((days % state.words.length) + state.words.length) % state.words.length];
}

function render() {
  const item = findWord(state.selected); const key = localDate(state.selected);
  el('loading').hidden = true; el('content').hidden = false; el('date').textContent = prettyDate(state.selected);
  ['word','partOfSpeech','pronunciation','meaning','poeticSentence','professionalSentence','romanticSentence','origin'].forEach(id => el(id).textContent = item[id]);
  el('synonyms').textContent = item.synonyms.join(' · ');
  el('study').href = `https://www.google.com/search?q=${encodeURIComponent(item.word + ' meaning pronunciation examples')}`;
  el('line').value = localStorage.getItem(`line:${key}`) || '';
  const remembered = localStorage.getItem(`remembered:${key}`) === 'true';
  el('remember').textContent = remembered ? 'Remembered ✓' : 'Mark as remembered';
  el('remember').classList.toggle('remembered', remembered);
  const total = Object.keys(localStorage).filter(k => k.startsWith('remembered:') && localStorage.getItem(k)==='true').length;
  el('streak').textContent = `${total || 1} word${total === 1 ? '' : 's'} in your practice`;
  history.replaceState(null, '', key === localDate(new Date()) ? location.pathname : `?date=${key}`);
}

el('previous').onclick = () => { state.selected.setDate(state.selected.getDate()-1); render(); };
el('next').onclick = () => { state.selected.setDate(state.selected.getDate()+1); render(); };
el('today').onclick = () => { state.selected = new Date(); render(); };
el('listen').onclick = () => { const speech = new SpeechSynthesisUtterance(el('word').textContent); speech.rate=.75; speechSynthesis.cancel(); speechSynthesis.speak(speech); };
el('remember').onclick = () => { const key=localDate(state.selected); const next=localStorage.getItem(`remembered:${key}`)!=='true'; localStorage.setItem(`remembered:${key}`,next); render(); };
let saveTimer; el('line').addEventListener('input', e => { clearTimeout(saveTimer); const key=localDate(state.selected); localStorage.setItem(`line:${key}`,e.target.value); el('saved').textContent='Saved on this Mac'; saveTimer=setTimeout(()=>el('saved').textContent='',1800); });
document.addEventListener('keydown', e => { if (e.target.tagName==='TEXTAREA') return; if(e.key==='ArrowLeft') el('previous').click(); if(e.key==='ArrowRight') el('next').click(); });
load();
