let starredServers = JSON.parse(localStorage.getItem('starredServers')) || [];

async function loadServers() {
  try {
    const response = await fetch('http://localhost:3000/api/servers');
    const data = await response.json();

    const servers = data.data.map(server => {
      const details = server.attributes.details || {};

      return {
        id: server.id,
        name: server.attributes.name,
        region: server.attributes.country || "Unknown",
        gameMode: details.rust_type || "modded",
        players: server.attributes.players,
        maxPlayers: server.attributes.maxPlayers,
        wipeDate: details.rust_last_wipe
          ? new Date(details.rust_last_wipe).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Unknown",
        ip: server.attributes.ip,
        port: server.attributes.port,
        map: details.map || "Procedural",
        mapUrl: details.map_url || null,
        description: details.rust_description || "No description available"
      };
    });

    displayServers(servers);
    setupFilters(servers);

  } catch (error) {
    console.error('Error loading servers:', error);
  }
}

function displayServers(servers) {
  const serversList = document.querySelector('.servers-list');
  if (!serversList) return;

  if (servers.length === 0) {
    serversList.innerHTML = '<div class="no-results"><p>No servers found.</p></div>';
    return;
  }

  serversList.innerHTML = servers.map(server => `
    <div class="server-card">
      <div>
        <div class="server-header">
          <div class="server-name">${server.name}</div>
          <div class="server-region">${server.region}</div>
        </div>
        <div class="server-details">
          <div class="server-detail"><span>Mode</span><span>${server.gameMode}</span></div>
          <div class="server-detail"><span>Players</span><span>${server.players}/${server.maxPlayers}</span></div>
          <div class="server-detail"><span>Wipe</span><span>${server.wipeDate}</span></div>
        </div>
      </div>
      <div class="server-actions">
        <button class="btn-join" data-ip="${server.ip}" data-port="${server.port}">Join</button>
        <button class="btn-join btn-info" data-id="${server.id}">Info</button>
        <button class="btn-bookmark" data-id="${server.id}">${starredServers.includes(server.id) ? '★' : '☆'}</button>
      </div>
    </div>
  `).join('');

  setupButtons(servers);
}

function setupButtons(servers) {
  document.querySelectorAll('.btn-join').forEach(btn => {
    if (!btn.classList.contains('btn-info')) {
      btn.onclick = () => {
        const command = `client.connect ${btn.dataset.ip}:${btn.dataset.port}`;
        navigator.clipboard.writeText(command);
        showToast("Copied: " + command);
      }
    }
  });

  document.querySelectorAll('.btn-info').forEach(btn => {
    btn.onclick = () => {
      const server = servers.find(s => s.id === btn.dataset.id);
      showInfo(server);
    }
  });

  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if(starredServers.includes(id)) {
        starredServers = starredServers.filter(sid => sid !== id);
      } else {
        starredServers.push(id);
      }
      localStorage.setItem('starredServers', JSON.stringify(starredServers));
      displayServers(servers);
      showToast("Updated starred servers");
    }
  });
}

function setupFilters(servers) {
  const searchInput = document.querySelector('.search-box input');
  const filterButtons = document.querySelectorAll('.filter-btn');
  let currentFilter = "all";

  function applyFilters() {
    let filtered = servers;

    if (currentFilter === "starred") {
      filtered = filtered.filter(s => starredServers.includes(s.id));
    } else if (["US","EU","AS"].includes(currentFilter)) {
      filtered = filtered.filter(s => s.region === currentFilter);
    } else if (currentFilter !== "all") {
      filtered = filtered.filter(s =>
        s.gameMode.toLowerCase().includes(currentFilter)
      );
    }

    const query = searchInput.value.toLowerCase();
    if (query) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.region.toLowerCase().includes(query)
      );
    }

    displayServers(filtered);
  }

  searchInput.addEventListener('input', applyFilters);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      applyFilters();
    });
  });

  applyFilters();
}
const legalTexts = {
  tos: `<h2>Terms of Service</h2>
  <p>By using this server and website, you agree to follow the rules. Cheating or harassment may lead to bans. Kevin Fries and the server owners aren't responsible for lost items or data.</p>`,

  privacy: `<h2>Privacy Policy</h2>
  <p>We collect minimal data (like username or email if registering). Data is used only to run the server and send updates. We never sell your info. Kevin Fries owns the server data.</p>`,

  eula: `<h2>End User License Agreement</h2>
  <p>You must own a legal copy of Rust to play. Server files may not be copied, modified, or distributed without permission. Kevin Fries retains all rights to server content.</p>`,

  code: `<h2>Code of Conduct</h2>
  <ul>
    <li>Be respectful to all players.</li>
    <li>No cheating, exploiting, or hacking.</li>
    <li>No hate speech or harassment.</li>
    <li>Follow admin instructions. Breaking rules may result in bans.</li>
  </ul>`
};

document.querySelectorAll('.legal-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const type = link.dataset.type;
    const modal = document.createElement('div');
    modal.className = 'legal-modal';
    modal.innerHTML = `
      <div class="legal-content">
        <div class="legal-header">
          <span>Legal Info</span>
          <span class="legal-close">&times;</span>
        </div>
        <div class="legal-body">${legalTexts[type]}</div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.legal-close').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
  });
});
function showInfo(server) {
  const modal = document.createElement('div');
  modal.className = "server-modal";

  const mapImage = server.mapUrl
    ? `<img src="${server.mapUrl}" alt="${server.map}">`
    : `<div class="no-map">No Map Image Available</div>`;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${server.name}</h2>
        <span class="modal-close">&times;</span>
      </div>
      <div class="modal-map">${mapImage}</div>
      <div class="modal-grid">
        <div><strong>Region</strong><span>${server.region}</span></div>
        <div><strong>Mode</strong><span>${server.gameMode}</span></div>
        <div><strong>Players</strong><span>${server.players}/${server.maxPlayers}</span></div>
        <div><strong>Map</strong><span>${server.map}</span></div>
        <div><strong>Wipe</strong><span>${server.wipeDate}</span></div>
        <div><strong>IP</strong><span>${server.ip}:${server.port}</span></div>
      </div>
      <div class="modal-description">${server.description}</div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove() });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.servers-list')) loadServers();
});