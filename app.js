// ── Data ────────────────────────────────────────────────────────────────────
const TECNICOS = [
  'Alexander','Cristiano','Emanoel','Elielton','Filipe',
  'Gabriel','Gustavo','Gustavo Mota','Lucas','Marcos',
  'Ricardo','Ronald','Ruan','Samuel','Sérgio'
];

const EQUIPAMENTOS = [
  'MP-002','MP-006','MP-007','MP-009','MP-011','MP-012','MP-013',
  'MP-014','MP-015','MP-016','MP-017','MP-018','MP-019','MP-020',
  'MP-021','MP-022',
  'TB-013','TB-015','TB-018','TB-022','TB-023','TB-024','TB-025',
  'TB-026','TB-027','TB-028','TB-029','TB-030','TB-031','TB-032','TB-043',
  'DH-002','DH-006',
  'CC-001','CC-002','CC-003','CC-004','CC-005','CC-006','CC-007',
  'BB-001','BB-002','BB-003','BB-004','BB-005','BB-006','BB-007',
  'VAPOR-001','VAPOR-002','VAPOR-003','VAPOR-004'
];

const STORAGE_KEY = 'equip_ctrl_records';
let records = [];

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

function diasEmUso(dataSaida, dataRetorno) {
  const s = new Date(dataSaida);
  const r = dataRetorno ? new Date(dataRetorno) : new Date();
  return Math.max(0, Math.round((r - s) / 86400000));
}

function getStatus(rec) {
  if (rec.dataRetorno) return 'Devolvido';
  if (diasEmUso(rec.dataSaida) > 10) return 'Em atraso';
  return 'Em uso';
}

function badgeClass(status) {
  if (status === 'Devolvido') return 'devolvido';
  if (status === 'Em atraso') return 'atraso';
  return 'em-uso';
}

// ── Storage ───────────────────────────────────────────────────────────────────
function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) records = JSON.parse(saved);
  } catch (e) { records = []; }
}

function saveRecords() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) {}
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function populateSelect(id, opts) {
  const el = document.getElementById(id);
  el.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ── Tab navigation ────────────────────────────────────────────────────────────
function setTab(tab) {
  const order = ['dashboard', 'saida', 'devolucao', 'historico'];
  document.querySelectorAll('.tab').forEach((el, i) => {
    const active = order[i] === tab;
    el.classList.toggle('active', active);
    el.setAttribute('aria-selected', active);
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + tab).classList.add('active');

  if (tab === 'devolucao') filtrarEmUso();
  if (tab === 'historico') renderHistorico();
  if (tab === 'dashboard') renderDashboard();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const emUso    = records.filter(r => !r.dataRetorno);
  const devolvidos = records.filter(r => r.dataRetorno);
  const emAtraso = emUso.filter(r => diasEmUso(r.dataSaida) > 10);

  document.getElementById('stats-cards').innerHTML = `
    <div class="stat"><div class="stat-label">Total de registros</div><div class="stat-value">${records.length}</div></div>
    <div class="stat"><div class="stat-label">Em uso agora</div><div class="stat-value amber">${emUso.length}</div></div>
    <div class="stat"><div class="stat-label">Devolvidos</div><div class="stat-value green">${devolvidos.length}</div></div>
    <div class="stat"><div class="stat-label">Em atraso (+10 dias)</div><div class="stat-value ${emAtraso.length > 0 ? 'red' : ''}">${emAtraso.length}</div></div>
  `;

  const list = document.getElementById('em-uso-list');
  if (!emUso.length) {
    list.innerHTML = '<div class="empty">Nenhum equipamento em uso no momento.</div>';
    return;
  }
  list.innerHTML = emUso.map(r => {
    const dias = diasEmUso(r.dataSaida);
    const st = getStatus(r);
    return `<div class="uso-item">
      <div class="uso-info">
        <span class="chip">${r.equipamento}</span>
        <div>
          <div style="font-weight:600;font-size:13px;">${r.projeto || 'Sem projeto'}</div>
          <div class="uso-meta">Técnico: ${r.tecnico} · Saída: ${formatDate(r.dataSaida)}</div>
        </div>
      </div>
      <div class="uso-right">
        <span class="badge ${badgeClass(st)}">${dias} dia${dias !== 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');
}

// ── Saída ─────────────────────────────────────────────────────────────────────
function registrarSaida() {
  const data    = document.getElementById('s-data').value;
  const equip   = document.getElementById('s-equip').value;
  const tecnico = document.getElementById('s-tecnico').value;
  const issak   = document.getElementById('s-issak').value;
  const projeto = document.getElementById('s-projeto').value.trim();
  const ensaios = document.getElementById('s-ensaios').value.trim();

  if (!data || !equip || !tecnico) {
    showToast('Preencha a data, o equipamento e o técnico.', true);
    return;
  }
  const emUso = records.find(r => r.equipamento === equip && !r.dataRetorno);
  if (emUso) {
    showToast(`${equip} já está em uso pelo técnico ${emUso.tecnico}.`, true);
    return;
  }

  records.unshift({
    id: Date.now(),
    dataSaida: data,
    dataRetorno: null,
    equipamento: equip,
    tecnico,
    issak,
    projeto,
    ensaios
  });
  saveRecords();
  renderDashboard();
  showToast(`Saída de ${equip} registrada com sucesso.`);
  limparFormSaida();
}

function limparFormSaida() {
  document.getElementById('s-data').value = today();
  document.getElementById('s-projeto').value = '';
  document.getElementById('s-ensaios').value = '';
}

// ── Devolução ─────────────────────────────────────────────────────────────────
function filtrarEmUso() {
  const q = (document.getElementById('dev-search').value || '').toLowerCase();
  const emUso = records.filter(r =>
    !r.dataRetorno && (
      r.equipamento.toLowerCase().includes(q) ||
      (r.tecnico || '').toLowerCase().includes(q) ||
      (r.projeto  || '').toLowerCase().includes(q)
    )
  );

  const list = document.getElementById('dev-list');
  if (!emUso.length) {
    list.innerHTML = '<div class="empty">Nenhum equipamento em uso encontrado.</div>';
    return;
  }
  list.innerHTML = emUso.map(r => {
    const dias = diasEmUso(r.dataSaida);
    const st   = getStatus(r);
    return `<div class="dev-item">
      <div class="dev-info">
        <div class="dev-title"><span class="chip" style="margin-right:8px">${r.equipamento}</span>${r.projeto || 'Sem projeto'}</div>
        <div class="dev-meta">Técnico: ${r.tecnico} · Responsável: ${r.issak} · Saída: ${formatDate(r.dataSaida)}</div>
      </div>
      <div class="dev-right">
        <span class="badge ${badgeClass(st)}">${dias}d</span>
        <button class="btn danger devolver" onclick="registrarDevolucao(${r.id})">Devolver</button>
      </div>
    </div>`;
  }).join('');
}

function registrarDevolucao(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  rec.dataRetorno = today();
  saveRecords();
  renderDashboard();
  filtrarEmUso();
  showToast(`${rec.equipamento} devolvido com sucesso.`);
}

// ── Histórico ─────────────────────────────────────────────────────────────────
function renderHistorico() {
  const q       = (document.getElementById('hist-search').value || '').toLowerCase();
  const fStatus = document.getElementById('filt-status').value;
  const fEquip  = document.getElementById('filt-equip').value;
  const fTec    = document.getElementById('filt-tecnico').value;

  // populate filter selects once
  const filtEquipEl = document.getElementById('filt-equip');
  if (filtEquipEl.options.length === 1) {
    EQUIPAMENTOS.forEach(e => {
      const o = document.createElement('option'); o.value = e; o.text = e;
      filtEquipEl.appendChild(o);
    });
    const filtTecEl = document.getElementById('filt-tecnico');
    TECNICOS.forEach(t => {
      const o = document.createElement('option'); o.value = t; o.text = t;
      filtTecEl.appendChild(o);
    });
  }

  const filtered = records.filter(r => {
    const st = getStatus(r);
    const matchQ = !q || [r.equipamento, r.tecnico, r.projeto, r.ensaios]
      .some(v => (v || '').toLowerCase().includes(q));
    return matchQ
      && (!fStatus || st === fStatus)
      && (!fEquip  || r.equipamento === fEquip)
      && (!fTec    || r.tecnico === fTec);
  });

  const tbody = document.getElementById('hist-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty">Nenhum registro encontrado.</div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const st   = getStatus(r);
    const dias = r.dataRetorno
      ? diasEmUso(r.dataSaida, r.dataRetorno)
      : diasEmUso(r.dataSaida);
    return `<tr>
      <td><span class="chip">${r.equipamento}</span></td>
      <td>${r.projeto || '—'}</td>
      <td>${r.tecnico}</td>
      <td>${r.issak || '—'}</td>
      <td>${formatDate(r.dataSaida)}</td>
      <td>${formatDate(r.dataRetorno)}</td>
      <td>${dias}</td>
      <td><span class="badge ${badgeClass(st)}">${st}</span></td>
      <td>${!r.dataRetorno
        ? `<button class="btn danger devolver" onclick="registrarDevolucao(${r.id})">Devolver</button>`
        : ''
      }</td>
    </tr>`;
  }).join('');
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportarCSV() {
  const header = ['Equipamento','Projeto','Técnico','Responsável','Saída','Devolução','Dias em uso','Status','Ensaios'];
  const rows = records.map(r => {
    const dias = r.dataRetorno
      ? diasEmUso(r.dataSaida, r.dataRetorno)
      : diasEmUso(r.dataSaida);
    return [
      r.equipamento,
      r.projeto || '',
      r.tecnico,
      r.issak || '',
      formatDate(r.dataSaida),
      formatDate(r.dataRetorno),
      dias,
      getStatus(r),
      r.ensaios || ''
    ].map(v => `"${v}"`).join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `equipamentos_${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Arquivo CSV exportado com sucesso.');
}

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  loadRecords();
  document.getElementById('s-data').value = today();
  populateSelect('s-equip', EQUIPAMENTOS);
  populateSelect('s-tecnico', TECNICOS);
  renderDashboard();
})();
