const API_BASE = '/api';

// Global token - stored in window object, never blocked by browser
window._appToken = null;
window._appUser = null;

const state = { questions: [], answers: {}, currentQuestion: 0, result: null, history: [] };

// Getters
const getToken = () => window._appToken;
const getUser = () => window._appUser;

const setAuth = (token, user) => {
  window._appToken = token;
  window._appUser = user;
  // Try to save, but don't depend on it
  try { localStorage.setItem('_t', token); localStorage.setItem('_u', JSON.stringify(user)); } catch(e){}
  try { sessionStorage.setItem('_t', token); sessionStorage.setItem('_u', JSON.stringify(user)); } catch(e){}
};

const clearAuthData = () => {
  window._appToken = null;
  window._appUser = null;
  try { localStorage.clear(); } catch(e){}
  try { sessionStorage.clear(); } catch(e){}
};

const tryLoadAuth = () => {
  // Try all storage methods
  try {
    const t = localStorage.getItem('_t');
    const u = localStorage.getItem('_u');
    if (t && u) { window._appToken = t; window._appUser = JSON.parse(u); return true; }
  } catch(e){}
  try {
    const t = sessionStorage.getItem('_t');
    const u = sessionStorage.getItem('_u');
    if (t && u) { window._appToken = t; window._appUser = JSON.parse(u); return true; }
  } catch(e){}
  return false;
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers||{}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const toast = (msg, type = 'info') => {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${{success:'✓',error:'✗',info:'ℹ'}[type]||'i'}</span><span>${msg}</span>`;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3600);
};

const setLoading = (show, text = 'Processing…') => {
  let o = $('#loading-overlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'loading-overlay'; o.className = 'loading-overlay';
    o.innerHTML = `<div class="spinner"></div><p></p>`;
    document.body.appendChild(o);
  }
  o.style.display = show ? 'flex' : 'none';
  o.querySelector('p').textContent = text;
};

const pages = ['landing','auth','dashboard','quiz','results','history'];
const showPage = name => {
  pages.forEach(p => { const el = $(`#page-${p}`); if(el) el.classList.remove('active'); });
  const t = $(`#page-${name}`); if(t) t.classList.add('active');
  const nav = $('#navbar');
  if (['dashboard','quiz','results','history'].includes(name)) {
    nav.classList.add('visible');
    const user = getUser();
    if (user) {
      const n = $('#nav-user-name'); const a = $('#nav-avatar');
      if(n) n.textContent = user.name;
      if(a) a.textContent = user.name[0].toUpperCase();
    }
  } else nav.classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const initAuth = () => {
  $$('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.auth-tab').forEach(t => t.classList.remove('active'));
      $$('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      $(`#form-${tab.dataset.tab}`).classList.add('active');
    });
  });

  $('#form-register').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;
    if (!name||!email||!password) { toast('Fill all fields','error'); return; }
    setLoading(true, 'Creating account…');
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password}) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message||'Failed');
      setAuth(json.token, json.user);
      setLoading(false);
      toast(`Welcome, ${json.user.name}! 🎉`, 'success');
      showDashboard();
    } catch(err) { setLoading(false); toast(err.message,'error'); }
  });

  $('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    if (!email||!password) { toast('Fill all fields','error'); return; }
    setLoading(true, 'Signing in…');
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message||'Failed');
      setAuth(json.token, json.user);
      setLoading(false);
      toast(`Welcome back, ${json.user.name}! ✨`, 'success');
      showDashboard();
    } catch(err) { setLoading(false); toast(err.message,'error'); }
  });
};

const showDashboard = async () => {
  const user = getUser();
  if (!user) { showPage('landing'); return; }
  showPage('dashboard');
  $('#dash-user-name').textContent = user.name.split(' ')[0];
  $('#dash-member-since').textContent = new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'});
  try {
    const data = await apiFetch('/history');
    state.history = data.results;
    $('#dash-total-tests').textContent = data.results.length;
    if (data.results.length > 0) {
      const latest = data.results[0];
      $('#dash-last-type').textContent = latest.personalityType;
      $('#dash-last-date').textContent = `Last: ${new Date(latest.completedAt).toLocaleDateString()}`;
      $('#btn-view-latest').style.display = 'inline-flex';
      $('#btn-view-latest').onclick = () => viewHistoryResult(latest.sessionId);
    } else {
      $('#dash-last-type').textContent = 'Not taken yet';
      $('#dash-last-date').textContent = 'Take your first test!';
      $('#btn-view-latest').style.display = 'none';
    }
  } catch(e) { console.log('dash err:', e.message); }
};

const startQuiz = async () => {
  const token = getToken();
  if (!token) { toast('Please login first','error'); showPage('auth'); return; }
  setLoading(true, 'Loading questions…');
  try {
    const res = await fetch('/api/questions', { headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message||'Failed to load questions');
    state.questions = data.questions;
    state.answers = {};
    state.currentQuestion = 0;
    setLoading(false);
    showPage('quiz');
    renderQuestion();
  } catch(err) { setLoading(false); toast(err.message,'error'); console.error(err); }
};

const renderQuestion = () => {
  const total = state.questions.length;
  const idx = state.currentQuestion;
  const q = state.questions[idx];
  $('.progress-bar-fill').style.width = `${(idx/total)*100}%`;
  $('.progress-text').textContent = `${idx} of ${total} answered`;
  const TC = {openness:'#a855f7',conscientiousness:'#00d4aa',extraversion:'#f5c842',agreeableness:'#ff6b6b',neuroticism:'#4fc3f7'};
  const color = TC[q.trait]||'#7c5cfc';
  const labels = ['','Not at all','A little','Somewhat','Mostly','Very much'];
  $('#question-container').innerHTML = `
    <div class="question-card animate-in">
      <div class="question-meta">
        <span class="trait-badge" style="color:${color};border-color:${color}30;background:${color}15;">${q.trait.charAt(0).toUpperCase()+q.trait.slice(1)}</span>
        <span class="q-number">Q${idx+1} / ${total}</span>
      </div>
      <p class="question-text">${q.text}</p>
      <div class="likert-scale">
        <div class="likert-labels"><span>Strongly Disagree</span><span>Strongly Agree</span></div>
        <div class="likert-options">
          ${[1,2,3,4,5].map(v=>`
            <div class="likert-option">
              <input type="radio" name="q_${q._id}" id="q_${q._id}_${v}" value="${v}" ${state.answers[q._id]===v?'checked':''}>
              <label for="q_${q._id}_${v}"><span class="score-num">${v}</span><span>${labels[v]}</span></label>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  $$(`input[name="q_${q._id}"]`).forEach(r => {
    r.addEventListener('change', () => { state.answers[q._id] = parseInt(r.value); updateQuizNav(); });
  });
  updateQuizNav();
};

const updateQuizNav = () => {
  const idx = state.currentQuestion;
  const q = state.questions[idx];
  const answered = state.answers[q._id] != null;
  const isLast = idx === state.questions.length - 1;
  $('#btn-quiz-prev').style.display = idx===0 ? 'none' : 'inline-flex';
  $('#btn-quiz-next').style.display = isLast ? 'none' : 'inline-flex';
  $('#btn-quiz-submit').style.display = isLast ? 'inline-flex' : 'none';
  $('#btn-quiz-next').disabled = !answered;
  $('#btn-quiz-submit').disabled = !answered;
};

const quizNext = () => { if(state.currentQuestion < state.questions.length-1){ state.currentQuestion++; renderQuestion(); } };
const quizPrev = () => { if(state.currentQuestion > 0){ state.currentQuestion--; renderQuestion(); } };

const submitQuiz = async () => {
  const total = state.questions.length;
  const answered = Object.keys(state.answers).length;
  if (answered < total) { toast(`Answer all ${total} questions (${total-answered} left)`,'error'); return; }
  const answers = Object.entries(state.answers).map(([questionId,value])=>({questionId,value}));
  setLoading(true,'Analyzing your personality…');
  try {
    const token = getToken();
    const res = await fetch('/api/submit', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({answers}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message||'Submit failed');
    state.result = data.result;
    setLoading(false);
    toast('Analysis complete! ✨','success');
    showResults(data.result);
  } catch(err) { setLoading(false); toast(err.message,'error'); }
};

const TRAIT_CONFIG = {
  openness:{label:'Openness',color:'#a855f7',emoji:'🎨'},
  conscientiousness:{label:'Conscientiousness',color:'#00d4aa',emoji:'📋'},
  extraversion:{label:'Extraversion',color:'#f5c842',emoji:'🌟'},
  agreeableness:{label:'Agreeableness',color:'#ff6b6b',emoji:'💖'},
  neuroticism:{label:'Neuroticism',color:'#4fc3f7',emoji:'🌊'}
};
let radarChart = null;

const showResults = result => {
  showPage('results');
  $('#result-personality-type').textContent = result.personalityType;
  $('#result-completed-at').textContent = `Assessed ${new Date(result.completedAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}`;
  $('#result-dominant-traits').innerHTML = result.dominantTraits.map(t=>{const c=TRAIT_CONFIG[t];return`<span class="trait-badge" style="color:${c.color};border-color:${c.color}40;background:${c.color}15;padding:6px 14px;">${c.emoji} ${c.label}</span>`;}).join('');
  $('#result-summary').textContent = result.summary;
  $('#result-suggestions').innerHTML = result.suggestions.map(s=>`<div class="suggestion-item"><span class="bullet">◆</span><span>${s}</span></div>`).join('');
  $('#result-traits-breakdown').innerHTML = Object.entries(result.scores).map(([trait,score])=>{const c=TRAIT_CONFIG[trait];return`<div class="trait-row"><div class="trait-row-header"><span class="trait-name">${c.emoji} ${c.label}</span><span class="trait-score" style="color:${c.color}">${score}%</span></div><div class="trait-bar-bg"><div class="trait-bar-fill" data-score="${score}" style="background:${c.color};width:0%"></div></div></div>`;}).join('');
  setTimeout(()=>{ $$('.trait-bar-fill').forEach(b=>{ b.style.width=`${b.dataset.score}%`; }); },100);
  buildRadarChart(result.scores);
  $('#btn-download-pdf').onclick = () => downloadPDF(result.sessionId);
  $('#btn-email-report').onclick = () => openEmailModal(result.sessionId);
  $('#btn-retake-quiz').onclick = startQuiz;
  $('#btn-view-history').onclick = showHistory;
};

const buildRadarChart = scores => {
  const ctx = $('#radar-chart').getContext('2d');
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx,{type:'radar',data:{labels:Object.keys(scores).map(t=>TRAIT_CONFIG[t].label),datasets:[{label:'Your Scores',data:Object.values(scores),backgroundColor:'rgba(124,92,252,0.2)',borderColor:'#7c5cfc',borderWidth:2.5,pointBackgroundColor:['#a855f7','#00d4aa','#f5c842','#ff6b6b','#4fc3f7'],pointBorderColor:'#080b14',pointBorderWidth:2,pointRadius:6,pointHoverRadius:9}]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{min:0,max:100,ticks:{stepSize:20,color:'#4a5568',font:{size:10},backdropColor:'transparent'},grid:{color:'rgba(255,255,255,0.06)'},angleLines:{color:'rgba(255,255,255,0.06)'},pointLabels:{color:'#8892b0',font:{family:'DM Sans',size:11}}}},plugins:{legend:{display:false},tooltip:{backgroundColor:'#0e1325',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,titleColor:'#f0f0ff',bodyColor:'#8892b0',callbacks:{label:c=>` Score: ${c.raw}%`}}}}});
};

const downloadPDF = async sessionId => {
  toast('Generating PDF…','info');
  try {
    const res = await fetch(`${API_BASE}/result/${sessionId}/pdf`,{headers:{Authorization:`Bearer ${getToken()}`}});
    if(!res.ok) throw new Error('Failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=`personality-report-${sessionId}.pdf`; a.click();
    URL.revokeObjectURL(url);
    toast('PDF downloaded! 📄','success');
  } catch(err) { toast('PDF failed.','error'); }
};

const openEmailModal = (sessionId) => {
  const modal = $('#email-modal');
  const user = getUser();
  // Pre-fill with user's email
  $('#email-input').value = user ? user.email : '';
  modal.style.display = 'flex';

  $('#btn-close-modal').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  $('#btn-send-email').onclick = async () => {
    const email = $('#email-input').value.trim();
    if (!email) { toast('Enter an email address', 'error'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast('Invalid email address', 'error'); return; }

    $('#btn-send-email').disabled = true;
    $('#btn-send-email').textContent = 'Sending…';

    try {
      const res = await fetch(`${API_BASE}/result/${sessionId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      modal.style.display = 'none';
      toast('Report sent to your email! 📧', 'success');
    } catch(err) {
      toast(err.message, 'error');
    } finally {
      $('#btn-send-email').disabled = false;
      $('#btn-send-email').textContent = 'Send Report →';
    }
  };
};

const showHistory = async () => {
  showPage('history');
  setLoading(true,'Loading history…');
  try {
    const data = await apiFetch('/history');
    state.history = data.results;
    setLoading(false);
    renderHistory();
  } catch(err) { setLoading(false); toast('Failed.','error'); }
};

const renderHistory = () => {
  const container = $('#history-list');
  if (state.history.length===0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🧬</div><p>No tests yet!</p><button class="btn btn-primary" onclick="startQuiz()">Start Assessment</button></div>`;
    return;
  }
  container.innerHTML = state.history.map(r=>{
    const mini = Object.entries(r.scores).map(([t,s])=>{const c=TRAIT_CONFIG[t];return`<div class="mini-score"><span class="mini-score-label">${c.label.substring(0,3)}</span><span class="mini-score-val" style="color:${c.color}">${s}</span></div>`;}).join('');
    return`<div class="history-item" onclick="viewHistoryResult('${r.sessionId}')"><div><div class="history-type">${r.personalityType}</div><div class="history-date">${new Date(r.completedAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div></div><div class="history-mini-scores">${mini}</div><button class="btn btn-sm btn-ghost">View →</button></div>`;
  }).join('');
};

const viewHistoryResult = async sessionId => {
  setLoading(true,'Loading…');
  try { const data = await apiFetch(`/result/${sessionId}`); setLoading(false); showResults(data.result); }
  catch(err) { setLoading(false); toast('Failed.','error'); }
};

const logout = () => { clearAuthData(); toast('Logged out.','info'); showPage('landing'); };

const init = () => {
  const loggedIn = tryLoadAuth();
  if (loggedIn) {
    showDashboard();
  } else {
    showPage('landing');
  }
  initAuth();
  $('#btn-get-started')?.addEventListener('click', () => showPage('auth'));
  $('#btn-landing-login')?.addEventListener('click', () => {
    showPage('auth');
    $$('.auth-tab').forEach(t=>t.classList.remove('active'));
    $$('.auth-form').forEach(f=>f.classList.remove('active'));
    $('[data-tab="login"]').classList.add('active');
    $('#form-login').classList.add('active');
  });
  $('#nav-dashboard')?.addEventListener('click', showDashboard);
  $('#nav-history')?.addEventListener('click', showHistory);
  $('#nav-take-test')?.addEventListener('click', startQuiz);
  $('#nav-logout')?.addEventListener('click', logout);
  $('#nav-logo')?.addEventListener('click', () => getUser() ? showDashboard() : showPage('landing'));
  $('#btn-quiz-prev')?.addEventListener('click', quizPrev);
  $('#btn-quiz-next')?.addEventListener('click', quizNext);
  $('#btn-quiz-submit')?.addEventListener('click', submitQuiz);
  document.addEventListener('keydown', e => {
    if (!$('#page-quiz').classList.contains('active')) return;
    if (e.key==='ArrowRight'||e.key==='Enter') {
      const n=$('#btn-quiz-next'); const s=$('#btn-quiz-submit');
      if(n.style.display!=='none'&&!n.disabled) quizNext();
      else if(s.style.display!=='none'&&!s.disabled) submitQuiz();
    }
    if (e.key==='ArrowLeft') quizPrev();
    if (e.key>='1'&&e.key<='5') {
      const q=state.questions[state.currentQuestion];
      const r=$(`#q_${q._id}_${e.key}`);
      if(r){ r.checked=true; r.dispatchEvent(new Event('change')); }
    }
  });
};

document.addEventListener('DOMContentLoaded', init);
