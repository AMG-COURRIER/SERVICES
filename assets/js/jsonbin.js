/**
 * AMG Courrier Service - JSONBin API Helper
 * Bin ID: 6a7b51a7da38895dfed69cbf
 */
const JSONBIN = {
  BIN_ID: '6a7b51a7da38895dfed69cbf',
  // Access Key - safer for public frontend reads
  ACCESS_KEY: '$2a$10$.ajvsv1kf4pn5jdsSipGKufH7dTS8.AaM2hLiezYkydWMFWs797e2',
  // Master Key - used in admin for write operations
  MASTER_KEY: '$2a$10$PwnR0G10b45nSZx9ntoBOenxK//HWPqHxJJlHpejPP9pBpvVb/KKi',
  BASE: 'https://api.jsonbin.io/v3/b'
};

/**
 * Fetch latest data from the bin
 * @param {boolean} useMaster - use master key instead of access key
 */
async function fetchBinData(useMaster = false) {
  const headers = {
    'X-Bin-Meta': 'false'
  };
  if (useMaster) {
    headers['X-Master-Key'] = JSONBIN.MASTER_KEY;
  } else {
    headers['X-Access-Key'] = JSONBIN.ACCESS_KEY;
  }

  const res = await fetch(`${JSONBIN.BASE}/${JSONBIN.BIN_ID}/latest`, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch data (${res.status})`);
  }

  const data = await res.json();
  // Ensure structure
  if (!data.shipments) data.shipments = {};
  return data;
}

/**
 * Update the entire bin (replace)
 * Always uses Master Key
 */
async function updateBinData(data) {
  const res = await fetch(`${JSONBIN.BASE}/${JSONBIN.BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN.MASTER_KEY,
      'X-Bin-Versioning': 'false'
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update data (${res.status})`);
  }

  return await res.json();
}

/**
 * Generate a tracking number
 */
function generateTrackingNumber() {
  const prefix = 'AMG';
  const num = Math.floor(1000000 + Math.random() * 9000000);
  const suffix = ['US', 'EX', 'IN', 'GR'][Math.floor(Math.random() * 4)];
  return `${prefix}${num}${suffix}`;
}

/**
 * Format date nicely
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}