import { supabase } from './supabaseClient.js'

// STATE
let projekte = []
let deleteCallback = null

// INIT
document.addEventListener('DOMContentLoaded', () => {
  ladeProjekte()
  bindEvents()
})

// EVENTS BINDEN
function bindEvents() {
  // Header Buttons
  document.getElementById('btnNeuesProjekt').addEventListener('click', () => openProjektModal())
  document.getElementById('btnZeitEintragen').addEventListener('click', openZeitModal)

  // Projekt Modal
  document.getElementById('closeProjekt').addEventListener('click', closeProjektModal)
  document.getElementById('cancelProjekt').addEventListener('click', closeProjektModal)
  document.getElementById('saveProjekt').addEventListener('click', saveProjekt)

  // Zeit Modal
  document.getElementById('closeZeit').addEventListener('click', closeZeitModal)
  document.getElementById('cancelZeit').addEventListener('click', closeZeitModal)
  document.getElementById('saveZeit').addEventListener('click', saveZeit)

  // Delete Modal
  document.getElementById('closeDelete').addEventListener('click', closeDeleteModal)
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal)
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (deleteCallback) deleteCallback()
    closeDeleteModal()
  })

  // Overlay klick schliesst Modal
  document.getElementById('modalProjekt').addEventListener('click', e => {
    if (e.target.id === 'modalProjekt') closeProjektModal()
  })
  document.getElementById('modalZeit').addEventListener('click', e => {
    if (e.target.id === 'modalZeit') closeZeitModal()
  })
  document.getElementById('modalDelete').addEventListener('click', e => {
    if (e.target.id === 'modalDelete') closeDeleteModal()
  })
}

// PROJEKTE LADEN
async function ladeProjekte() {
  const liste = document.getElementById('projektListe')
  liste.innerHTML = '<div class="loading">Lade Projekte...</div>'

  const { data, error } = await supabase
    .from('Projekt')
    .select(`
      id,
      Name,
      Beschreibung,
      Zeiten (id, Start_Zeit, Stunden)
    `)
    .order('Name')

  if (error) {
    liste.innerHTML = '<div class="loading">Fehler beim Laden.</div>'
    showToast('Fehler: ' + error.message, 'error')
    return
  }

  projekte = data
  renderProjekte(data)
  fuelleZeitProjektSelect(data)
}

// PROJEKTE RENDERN
function renderProjekte(data) {
  const liste = document.getElementById('projektListe')

  if (!data || data.length === 0) {
    liste.innerHTML = '<div class="empty">Noch keine Projekte. Erstelle dein erstes Projekt!</div>'
    return
  }

  liste.innerHTML = ''
  data.forEach(projekt => {
    const totalStunden = ((projekt.Zeiten || []).reduce((sum, z) => sum + (z.Stunden || 0), 0)).toFixed(2)
    const item = document.createElement('div')
    item.className = 'projekt-item'
    item.dataset.id = projekt.id

    item.innerHTML = `
      <div class="projekt-header">
        <span class="projekt-chevron">▶</span>
        <span class="projekt-name">${escHtml(projekt.Name)}</span>
        <span class="projekt-beschreibung-small">${escHtml(projekt.Beschreibung || '')}</span>
        <span class="projekt-total">${totalStunden}h</span>
        <div class="projekt-actions">
          <button class="btn-icon" onclick="event.stopPropagation(); editProjekt(${projekt.id})">✏️</button>
          <button class="btn-icon danger" onclick="event.stopPropagation(); deleteProjektConfirm(${projekt.id}, '${escHtml(projekt.Name)}')">🗑</button>
        </div>
      </div>
      <div class="projekt-body">
        <div class="projekt-body-inner">
          ${renderZeitenTabelle(projekt.Zeiten || [], projekt.id)}
        </div>
      </div>
    `

    // Accordion toggle
    item.querySelector('.projekt-header').addEventListener('click', () => {
      item.classList.toggle('open')
    })

    liste.appendChild(item)
  })
}

// ZEITEN TABELLE
function renderZeitenTabelle(zeiten, projektId) {
  if (zeiten.length === 0) {
    return '<div class="no-zeiten">Noch keine Zeiteinträge für dieses Projekt.</div>'
  }

  const sorted = [...zeiten].sort((a, b) => new Date(b.Start_Zeit) - new Date(a.Start_Zeit))

  const rows = sorted.map(z => {
    const datum = formatDatum(z.Start_Zeit)
    return `
      <tr>
        <td class="col-datum">${datum}</td>
        <td class="col-stunden">${z.Stunden}h</td>
        <td class="col-actions">
          <button class="btn-icon danger" onclick="deleteZeitConfirm(${z.id})">🗑</button>
        </td>
      </tr>
    `
  }).join('')

  return `
    <table class="zeiten-table">
      <thead>
        <tr>
          <th class="col-datum">Datum & Startzeit</th>
          <th class="col-stunden">Stunden</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

// PROJEKT MODAL
function openProjektModal(projekt = null) {
  document.getElementById('projektEditId').value = projekt ? projekt.id : ''
  document.getElementById('projektName').value = projekt ? projekt.Name : ''
  document.getElementById('projektBeschreibung').value = projekt ? (projekt.Beschreibung || '') : ''
  document.getElementById('modalProjektTitel').textContent = projekt ? 'Projekt bearbeiten' : 'Neues Projekt'
  document.getElementById('modalProjekt').classList.remove('hidden')
  document.getElementById('projektName').focus()
}

function closeProjektModal() {
  document.getElementById('modalProjekt').classList.add('hidden')
}

async function saveProjekt() {
  const name = document.getElementById('projektName').value.trim()
  const beschreibung = document.getElementById('projektBeschreibung').value.trim()
  const editId = document.getElementById('projektEditId').value

  if (!name) { showToast('Name ist erforderlich', 'error'); return }

  if (editId) {
    const { error } = await supabase
      .from('Projekt')
      .update({ Name: name, Beschreibung: beschreibung || null })
      .eq('id', editId)

    if (error) { showToast('Fehler: ' + error.message, 'error'); return }
    showToast('Projekt aktualisiert', 'success')
  } else {
    const { error } = await supabase
      .from('Projekt')
      .insert({ Name: name, Beschreibung: beschreibung || null })

    if (error) { showToast('Fehler: ' + error.message, 'error'); return }
    showToast('Projekt erstellt', 'success')
  }

  closeProjektModal()
  ladeProjekte()
}

// EDIT PROJEKT
window.editProjekt = function(id) {
  const p = projekte.find(p => p.id === id)
  if (p) openProjektModal(p)
}

// DELETE PROJEKT
window.deleteProjektConfirm = function(id, name) {
  document.getElementById('deleteMessage').textContent = `Projekt "${name}" wirklich löschen? Alle Zeiteinträge werden ebenfalls gelöscht.`
  deleteCallback = () => deleteProjekt(id)
  document.getElementById('modalDelete').classList.remove('hidden')
}

async function deleteProjekt(id) {
  // Zuerst Zeiten löschen
  await supabase.from('Zeiten').delete().eq('Projekt_id', id)
  await supabase.from('Projekt_Person').delete().eq('Projekt_id', id)

  const { error } = await supabase.from('Projekt').delete().eq('id', id)
  if (error) { showToast('Fehler: ' + error.message, 'error'); return }

  showToast('Projekt gelöscht', 'success')
  ladeProjekte()
}

// ZEIT MODAL
function openZeitModal() {
  // Standardmässig jetzt als Startzeit
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  document.getElementById('zeitStart').value = now.toISOString().slice(0, 16)
  document.getElementById('zeitStunden').value = ''
  document.getElementById('zeitProjekt').value = ''
  document.getElementById('modalZeit').classList.remove('hidden')
}

function closeZeitModal() {
  document.getElementById('modalZeit').classList.add('hidden')
}

async function saveZeit() {
  const projektId = document.getElementById('zeitProjekt').value
  const start = document.getElementById('zeitStart').value
  const stunden = parseFloat(document.getElementById('zeitStunden').value)

  if (!projektId) { showToast('Bitte Projekt wählen', 'error'); return }
  if (!start) { showToast('Bitte Datum & Startzeit angeben', 'error'); return }
  if (!stunden || stunden <= 0) { showToast('Bitte gültige Stunden angeben', 'error'); return }

  const { error } = await supabase.from('Zeiten').insert({
    Projekt_id: parseInt(projektId),
    Start_Zeit: new Date(start).toISOString(),
    Stunden: stunden
  })

  if (error) { showToast('Fehler: ' + error.message, 'error'); return }

  showToast('Zeit eingetragen', 'success')
  closeZeitModal()
  ladeProjekte()
}

// DELETE ZEIT
window.deleteZeitConfirm = function(id) {
  document.getElementById('deleteMessage').textContent = 'Diesen Zeiteintrag wirklich löschen?'
  deleteCallback = () => deleteZeit(id)
  document.getElementById('modalDelete').classList.remove('hidden')
}

async function deleteZeit(id) {
  const { error } = await supabase.from('Zeiten').delete().eq('id', id)
  if (error) { showToast('Fehler: ' + error.message, 'error'); return }
  showToast('Eintrag gelöscht', 'success')
  ladeProjekte()
}

function closeDeleteModal() {
  document.getElementById('modalDelete').classList.add('hidden')
  deleteCallback = null
}

// HILFSFUNKTIONEN
function fuelleZeitProjektSelect(data) {
  const select = document.getElementById('zeitProjekt')
  select.innerHTML = '<option value="">Projekt wählen...</option>'
  data.forEach(p => {
    const option = document.createElement('option')
    option.value = p.id
    option.textContent = p.Name
    select.appendChild(option)
  })
}

function formatDatum(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

let toastTimeout
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.className = `toast ${type}`
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toast.className = 'toast hidden' }, 3000)
}