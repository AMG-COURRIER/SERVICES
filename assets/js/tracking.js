/**
 * Frontend Tracking Logic - Connected to JSONBin
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tracking-form');
  const resultBox = document.getElementById('tracking-result');
  const notFoundBox = document.getElementById('tracking-not-found');
  const loadingEl = document.getElementById('tracking-loading');

  // Also handle homepage track forms
  document.querySelectorAll('.track-form').forEach(f => {
    if (f.id === 'tracking-form') return; // handled below
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = f.querySelector('input[type="text"]');
      const num = (input?.value || '').trim().toUpperCase();
      if (!num) return;
      // Redirect to tracking page with query
      window.location.href = `tracking.html?tn=${encodeURIComponent(num)}`;
    });
  });

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="text"]');
    const trackingNumber = (input?.value || '').trim().toUpperCase();
    if (!trackingNumber) {
      alert('Please enter a tracking number.');
      return;
    }
    await lookupTracking(trackingNumber);
  });

  // Auto-lookup from URL ?tn=
  const params = new URLSearchParams(window.location.search);
  const tn = params.get('tn');
  if (tn) {
    const input = form.querySelector('input[type="text"]');
    if (input) input.value = tn;
    lookupTracking(tn.toUpperCase());
  }

  async function lookupTracking(trackingNumber) {
    if (resultBox) resultBox.classList.remove('show');
    if (notFoundBox) notFoundBox.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';

    try {
      const data = await fetchBinData(false); // Access Key
      const shipment = data.shipments?.[trackingNumber] || data.shipments?.[trackingNumber.toUpperCase()];

      if (loadingEl) loadingEl.style.display = 'none';

      if (!shipment) {
        if (notFoundBox) {
          notFoundBox.style.display = 'block';
          notFoundBox.querySelector('.nf-number').textContent = trackingNumber;
        }
        return;
      }

      renderShipment(shipment);
      if (resultBox) {
        resultBox.classList.add('show');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error(err);
      if (loadingEl) loadingEl.style.display = 'none';
      alert('Unable to retrieve tracking data. Please try again later.\n\n' + err.message);
    }
  }

  function renderShipment(s) {
    const set = (sel, val) => {
      const el = resultBox.querySelector(sel);
      if (el) el.textContent = val || '—';
    };

    set('.tracking-number', s.trackingNumber);
    set('.tr-status', s.status);
    set('.tr-origin', s.origin);
    set('.tr-destination', s.destination);
    set('.tr-service', s.service);
    set('.tr-eta', s.estimatedDelivery ? formatDate(s.estimatedDelivery) : '—');
    set('.tr-weight', s.weight || '—');
    set('.tr-location', s.currentLocation || '—');
    set('.tr-sender', s.sender || '—');
    set('.tr-recipient', s.recipient || '—');

    // Status badge color
    const badge = resultBox.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge badge-' + (s.status || '').toLowerCase().replace(/\s+/g, '-');
      badge.innerHTML = `<i class="fas fa-circle" style="font-size:0.5rem;margin-right:6px"></i> ${s.status}`;
    }

    // Timeline
    const timelineEl = resultBox.querySelector('.timeline');
    if (timelineEl) {
      const events = s.timeline || [];
      if (!events.length) {
        timelineEl.innerHTML = '<p style="color:var(--text-light)">No timeline events yet.</p>';
      } else {
        // Mark last as active if not delivered
        const isDelivered = s.status === 'Delivered';
        timelineEl.innerHTML = events.map((ev, i) => {
          const isLast = i === events.length - 1;
          let cls = 'timeline-item completed';
          if (isLast && !isDelivered) cls = 'timeline-item active';
          if (isDelivered) cls = 'timeline-item completed';
          return `
            <div class="${cls}">
              <h5>${escapeHtml(ev.status)}</h5>
              <span>${formatDate(ev.timestamp)}${ev.location ? ' · ' + escapeHtml(ev.location) : ''}</span>
            </div>
          `;
        }).join('');
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});