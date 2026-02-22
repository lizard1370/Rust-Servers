function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem('rust_contacts') || '[]');
  displayStats(contacts);
  displayContacts(contacts);
}

function displayStats(contacts) {
  const statCount = document.querySelector('.admin-stat-value');
  if (statCount) {
    statCount.textContent = contacts.length;
  }
}

function displayContacts(contacts) {
  const tbody = document.querySelector('.contacts-table tbody');
  if (!tbody) return;

  if (contacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-contacts"><p>No contacts received yet</p></td></tr>';
    return;
  }

  const sorted = contacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  tbody.innerHTML = sorted.map(contact => `
    <tr>
      <td class="contact-name">${escapeHtml(contact.name)}</td>
      <td class="contact-email">${escapeHtml(contact.email)}</td>
      <td class="contact-subject">${escapeHtml(contact.subject)}</td>
      <td class="contact-date">${formatDate(contact.timestamp)}</td>
      <td class="contact-actions">
        <button class="btn-view" onclick="viewContact(${contact.id})">View</button>
        <button class="btn-delete" onclick="deleteContact(${contact.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function viewContact(id) {
  const contacts = JSON.parse(localStorage.getItem('rust_contacts') || '[]');
  const contact = contacts.find(c => c.id === id);

  if (!contact) return;

  const modal = document.querySelector('.modal');
  const modalValue = document.querySelector('input');

  document.querySelector('[data-field="name"] .modal-value').textContent = escapeHtml(contact.name);
  document.querySelector('[data-field="email"] .modal-value').textContent = escapeHtml(contact.email);
  document.querySelector('[data-field="subject"] .modal-value').textContent = escapeHtml(contact.subject);
  document.querySelector('[data-field="message"] .modal-value').textContent = escapeHtml(contact.message);
  document.querySelector('[data-field="date"] .modal-value').textContent = formatDate(contact.timestamp);

  modal.classList.add('active');
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;

  let contacts = JSON.parse(localStorage.getItem('rust_contacts') || '[]');
  contacts = contacts.filter(c => c.id !== id);
  localStorage.setItem('rust_contacts', JSON.stringify(contacts));
  loadContacts();
}

function closeModal() {
  document.querySelector('.modal').classList.remove('active');
}

function exportContacts() {
  const contacts = JSON.parse(localStorage.getItem('rust_contacts') || '[]');

  if (contacts.length === 0) {
    alert('No contacts to export');
    return;
  }

  const csv = [
    ['Name', 'Email', 'Subject', 'Message', 'Date'],
    ...contacts.map(c => [c.name, c.email, c.subject, c.message, new Date(c.timestamp).toLocaleString()])
  ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rust-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function clearAllContacts() {
  if (!confirm('Clear all contacts? This cannot be undone.')) return;
  localStorage.removeItem('rust_contacts');
  loadContacts();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
  loadContacts();

  const modal = document.querySelector('.modal');
  const closeBtn = document.querySelector('.btn-close');
  const exportBtn = document.querySelector('.btn-export');
  const clearBtn = document.querySelector('.btn-clear');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportContacts);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllContacts);
  }

  setInterval(loadContacts, 5000);
});
