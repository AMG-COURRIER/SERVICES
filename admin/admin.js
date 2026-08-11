/**
 * AMG Courrier Admin Panel
 */
const ADMIN_PASSWORD = 'amgadmin2026';

let binData = { shipments: {} };
let editingTracking = null;

// ========== Auth ==========
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const pwd = document.getElementById('admin-password').value;
  if (pwd === ADMIN_PASSWORD) {
    sessionStorage.setItem('amg_admin', '1');
    showApp();
  } else {
    showToast('Incorrect password', 'error');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('amg_admin');
  location.reload();
});

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  loadData();
}

if (sessionStorage.getItem('amg_admin') === '1') {
  showApp();
}

// ========== Navigation ==========
document.querySelectorAll('.nav-item[data-view], [data-view-trigger]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const view = el.dataset.view || el.dataset.viewTrigger;
    if (view) switchView(view);
  });
});

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${name}`);
  if (viewEl) viewEl.classList.add('active');

  const nav = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (nav) nav.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    shipments: 'All Shipments',
    create: editingTracking ? 'Edit Shipment' : 'Create New Shipment'
  };
  document.getElementById('page-title').textContent = titles[name] || name;

  if (name === 'create' && !editingTracking) {
    resetForm();
  }
}

// ========== Data ==========
async function loadData() {
  try {
    binData = await fetchBinData(true); // master key
    if (!binData.shipments) binData.shipments = {};
    renderDashboard();
    renderShipmentsTable();
    document.getElementById('last-sync').textContent = 'Synced ' + new Date().toLocaleTimeString();
  } catch (err) {
    console.error(err);
    showToast('Failed to load data: ' + err.message, 'error');
  }
}

document.getElementById('refresh-btn').addEventListener('click', loadData);

function getShipmentsArray() {
  return Object.values(binData.shipments || {}).sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function renderDashboard() {
  const list = getShipmentsArray();
  document.getElementById('stat-total').textContent = list.length;
  document.getElementById('stat-transit').textContent = list.filter(s =>
    ['In Transit', 'Out for Delivery', 'Picked Up'].includes(s.status)
  ).length;
  document.getElementById('stat-delivered').textContent = list.filter(s => s.status === 'Delivered').length;
  document.getElementById('stat-pending').textContent = list.filter(s =>
    ['Pending', 'Processing'].includes(s.status)
  ).length;

  const tbody = document.getElementById('recent-table-body');
  const recent = list.slice(0, 8);
  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">No shipments yet. Create one!</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(s => rowHTML(s)).join('');
  attachRowActions(tbody);
}

function renderShipmentsTable(filter = '') {
  const list = getShipmentsArray().filter(s => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (s.trackingNumber || '').toLowerCase().includes(q) ||
      (s.origin || '').toLowerCase().includes(q) ||
      (s.destination || '').toLowerCase().includes(q) ||
      (s.status || '').toLowerCase().includes(q) ||
      (s.recipient || '').toLowerCase().includes(q)
    );
  });

  const tbody = document.getElementById('shipments-table-body');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">No shipments found</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${esc(s.trackingNumber)}</strong></td>
      <td><span class="badge badge-${statusClass(s.status)}">${esc(s.status)}</span></td>
      <td>${esc(s.origin)}</td>
      <td>${esc(s.destination)}</td>
      <td>${esc(s.service)}</td>
      <td>${s.estimatedDelivery ? formatDate(s.estimatedDelivery) : '—'}</td>
      <td>
        <button class="btn-icon" data-edit="${esc(s.trackingNumber)}" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn-icon danger" data-delete="${esc(s.trackingNumber)}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
  attachRowActions(tbody);
}

function rowHTML(s) {
  return `
    <tr>
      <td><strong>${esc(s.trackingNumber)}</strong></td>
      <td><span class="badge badge-${statusClass(s.status)}">${esc(s.status)}</span></td>
      <td>${esc(s.origin)} → ${esc(s.destination)}</td>
      <td>${esc(s.service)}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td>
        <button class="btn-icon" data-edit="${esc(s.trackingNumber)}" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn-icon danger" data-delete="${esc(s.trackingNumber)}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `;
}

function attachRowActions(container) {
  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editShipment(btn.dataset.edit));
  });
  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteShipment(btn.dataset.delete));
  });
}

document.getElementById('search-shipments').addEventListener('input', (e) => {
  renderShipmentsTable(e.target.value.trim());
});

// ========== Form ==========
document.getElementById('gen-tracking').addEventListener('click', () => {
  document.getElementById('f-tracking').value = generateTrackingNumber();
});

document.getElementById('add-event-btn').addEventListener('click', () => {
  addTimelineEventRow();
});

function addTimelineEventRow(data = {}) {
  const container = document.getElementById('timeline-events');
  const div = document.createElement('div');
  div.className = 'timeline-event';
  div.innerHTML = `
    <div>
      <label>Status / Event</label>
      <input type="text" class="te-status" value="${esc(data.status || '')}" placeholder="e.g. Picked Up">
    </div>
    <div>
      <label>Location</label>
      <input type="text" class="te-location" value="${esc(data.location || '')}" placeholder="City / Facility">
    </div>
    <div>
      <label>Date & Time</label>
      <input type="datetime-local" class="te-time" value="${data.timestamp ? toLocalInput(data.timestamp) : ''}">
    </div>
    <button type="button" class="btn-icon danger te-remove" title="Remove"><i class="fas fa-times"></i></button>
  `;
  div.querySelector('.te-remove').addEventListener('click', () => div.remove());
  container.appendChild(div);
}

function resetForm() {
  editingTracking = null;
  document.getElementById('form-title').textContent = 'Create New Shipment';
  document.getElementById('edit-tracking').value = '';
  document.getElementById('shipment-form').reset();
  document.getElementById('f-tracking').value = generateTrackingNumber();
  document.getElementById('timeline-events').innerHTML = '';
  // Default first event
  addTimelineEventRow({
    status: 'Shipment Created',
    location: 'System',
    timestamp: new Date().toISOString()
  });
}

function editShipment(tracking) {
  const s = binData.shipments[tracking];
  if (!s) return;
  editingTracking = tracking;
  document.getElementById('form-title').textContent = 'Edit Shipment – ' + tracking;
  document.getElementById('edit-tracking').value = tracking;
  document.getElementById('f-tracking').value = s.trackingNumber || tracking;
  document.getElementById('f-status').value = s.status || 'Pending';
  document.getElementById('f-service').value = s.service || 'Express Ground';
  document.getElementById('f-weight').value = s.weight || '';
  document.getElementById('f-origin').value = s.origin || '';
  document.getElementById('f-destination').value = s.destination || '';
  document.getElementById('f-sender').value = s.sender || '';
  document.getElementById('f-recipient').value = s.recipient || '';
  document.getElementById('f-eta').value = s.estimatedDelivery ? toLocalInput(s.estimatedDelivery) : '';
  document.getElementById('f-location').value = s.currentLocation || '';
  document.getElementById('f-notes').value = s.notes || '';

  const container = document.getElementById('timeline-events');
  container.innerHTML = '';
  (s.timeline || []).forEach(ev => addTimelineEventRow(ev));
  if (!(s.timeline || []).length) {
    addTimelineEventRow({ status: 'Shipment Created', location: 'System', timestamp: s.createdAt || new Date().toISOString() });
  }

  switchView('create');
}

async function deleteShipment(tracking) {
  if (!confirm(`Delete shipment ${tracking}? This cannot be undone.`)) return;
  try {
    delete binData.shipments[tracking];
    await updateBinData(binData);
    showToast('Shipment deleted', 'success');
    loadData();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

document.getElementById('shipment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    let tracking = document.getElementById('f-tracking').value.trim().toUpperCase();
    if (!tracking) tracking = generateTrackingNumber();

    // Collect timeline
    const timeline = [];
    document.querySelectorAll('.timeline-event').forEach(row => {
      const status = row.querySelector('.te-status').value.trim();
      if (!status) return;
      const location = row.querySelector('.te-location').value.trim();
      const timeVal = row.querySelector('.te-time').value;
      timeline.push({
        status,
        location: location || '',
        timestamp: timeVal ? new Date(timeVal).toISOString() : new Date().toISOString(),
        completed: true
      });
    });
    // Sort by time
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const shipment = {
      trackingNumber: tracking,
      status: document.getElementById('f-status').value,
      service: document.getElementById('f-service').value,
      weight: document.getElementById('f-weight').value.trim(),
      origin: document.getElementById('f-origin').value.trim(),
      destination: document.getElementById('f-destination').value.trim(),
      sender: document.getElementById('f-sender').value.trim(),
      recipient: document.getElementById('f-recipient').value.trim(),
      estimatedDelivery: document.getElementById('f-eta').value
        ? new Date(document.getElementById('f-eta').value).toISOString()
        : null,
      currentLocation: document.getElementById('f-location').value.trim(),
      notes: document.getElementById('f-notes').value.trim(),
      timeline,
      createdAt: editingTracking && binData.shipments[editingTracking]
        ? binData.shipments[editingTracking].createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If renaming tracking number while editing
    if (editingTracking && editingTracking !== tracking) {
      delete binData.shipments[editingTracking];
    }

    binData.shipments[tracking] = shipment;
    await updateBinData(binData);

    showToast(editingTracking ? 'Shipment updated!' : 'Shipment created successfully!', 'success');
    editingTracking = null;
    await loadData();
    switchView('shipments');
  } catch (err) {
    console.error(err);
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Shipment';
  }
});

// ========== Helpers ==========
function statusClass(status) {
  return (status || '').toLowerCase().replace(/\s+/g, '-');
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3500);
}