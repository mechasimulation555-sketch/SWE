// Student Dashboard JavaScript

// --- Data & State ---
const API_BASE = window.API_BASE || '/api';
let favoriteStops = JSON.parse(localStorage.getItem('favoriteStops') || '[]');
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')); // busData is now loaded from common-data.js
let busData = []; // Initialize as an empty array. It will be populated by the API call.
let notificationData = window.notificationData || [];
let searchDebounceTimeout = null;
let lastSearchQuery = '';

// --- Utility Functions ---
function showToast(message, type = 'info') {
  if (window.CommonUtils && typeof CommonUtils.showNotification === 'function') {
    return CommonUtils.showNotification(message, type);
  }
  // Fallback simple implementation
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showSkeleton(container, count = 3) {
  container.innerHTML = Array(count).fill('<div class="skeleton-card"></div>').join('');
}

function debounce(fn, delay) {
  return function(...args) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
  if (!currentUser || currentUser.role !== 'student') {
    window.location.href = '../index.html';
    return;
  }
  document.getElementById('profileName').textContent = currentUser.name || 'Student';
  document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name || 'Student'}!`;
  loadFavoriteStops();
  populateRouteFilter();
  loadNotifications();

  // Search
  document.getElementById('busNumberInput').addEventListener('input', debounce(handleSearchInput, 300));
  document.getElementById('searchBtn').addEventListener('click', () => searchBuses('auto'));
  // Filters
  document.getElementById('routeFilter').addEventListener('change', () => searchBuses('auto'));
  document.getElementById('statusFilter').addEventListener('change', () => searchBuses('auto'));
  document.getElementById('sortBy').addEventListener('change', () => searchBuses('auto'));
  // Auto-refresh every 30 seconds
  setInterval(refreshBusData, 30000);
});

// --- Search & Autocomplete ---
function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  lastSearchQuery = query;
  updateAutocomplete(query);
  searchBuses('auto');
}

function updateAutocomplete(query) {
  const suggestions = [];
  if (query.length > 1) {
    busData.forEach(bus => {
      if (bus.number.toLowerCase().includes(query) && !suggestions.includes(bus.number)) suggestions.push(bus.number);
      if (bus.route.toLowerCase().includes(query) && !suggestions.includes(bus.route)) suggestions.push(bus.route);
      if (bus.currentStop.toLowerCase().includes(query) && !suggestions.includes(bus.currentStop)) suggestions.push(bus.currentStop);
      if (bus.nextStop.toLowerCase().includes(query) && !suggestions.includes(bus.nextStop)) suggestions.push(bus.nextStop);
    });
  }
  const list = document.getElementById('autocompleteSuggestions');
  if (suggestions.length) {
    list.innerHTML = suggestions.map(s => `<div tabindex="0">${s}</div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('div').forEach(div => {
      div.onclick = () => {
        document.getElementById('busNumberInput').value = div.textContent;
        list.classList.remove('show');
        searchBuses('auto');
      };
      div.onkeydown = e => {
        if (e.key === 'Enter') div.click();
      };
    });
  } else {
    list.innerHTML = '';
    list.classList.remove('show');
  }
}

function searchBuses(searchType) {
  const query = document.getElementById('busNumberInput').value.trim().toLowerCase();
  const route = document.getElementById('routeFilter').value;
  const status = document.getElementById('statusFilter').value;
  const sortBy = document.getElementById('sortBy').value;
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (route) params.set('route', route);
  if (status) params.set('status', status);
  if (sortBy) params.set('sort', sortBy);
  fetch(`${API_BASE}/buses?${params.toString()}`)
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(data => {
      if (Array.isArray(data)) displaySearchResults(data.map(normalizeBus));
      else displaySearchResults([]);
    })
    .catch((err) => {
      console.error('Failed to search buses:', err);
      showToast('Could not fetch bus data from server.', 'error');
      const resultsContainer = document.getElementById('searchResults');
      resultsContainer.innerHTML = `<div class="no-results">Error loading search results. Please try again.</div>`;
    });
}

function displaySearchResults(buses) {
  const resultsContainer = document.getElementById('searchResults');
  if (!buses.length) {
    resultsContainer.innerHTML = `<div class="no-results"><img src="../img/empty-state.svg" alt="No results" style="width:120px;opacity:.7;"><br>No buses found matching your search.</div>`;
    return;
  }
  resultsContainer.innerHTML = buses.map(bus => createBusCard(bus)).join('');
}

function normalizeBus(raw) {
  if (!raw) {
    console.warn('normalizeBus received null/undefined data');
    return null;
  }
  try {
    const etaMin = Number.isFinite(raw.eta_minutes) ? raw.eta_minutes : 0;
    const delayMin = Number.isFinite(raw.delay_minutes) ? raw.delay_minutes : 0;
    return {
      id: raw.id ?? null,
      number: raw.number ?? '',
      route: raw.route ?? '',
      driver: raw.driver_name ?? 'N/A',
      driverPhone: raw.driver_phone ?? '',
      currentStop: raw.current_stop ?? 'Unknown',
      nextStop: raw.next_stop ?? 'Unknown',
      eta: `${etaMin} minutes`,
      etaMinutes: etaMin,
      delay: delayMin,
      occupancy: raw.occupancy ?? 0,
      capacity: raw.capacity ?? 40,
      status: raw.status ?? 'on-time',
      lastUpdate: raw.last_update ? new Date(raw.last_update).toLocaleString() : new Date().toLocaleString()
    };
  } catch (error) {
    console.error('Error normalizing bus data:', raw, error);
    return null;
  }
}

function createBusCard(bus) {
  const isFavorite = favoriteStops.includes(bus.nextStop);
  const occupancyPercent = Math.round((bus.occupancy / bus.capacity) * 100);
  return `
    <div class="bus-card" tabindex="0" aria-label="Bus ${bus.number}, status ${bus.status}">
      <div class="bus-header">
        <div class="bus-number">${bus.number}</div>
        <span class="bus-status status-${bus.status}">${bus.status.replace('-', ' ').toUpperCase()}</span>
        <button class="favorite-btn${isFavorite ? ' active' : ''}" aria-label="Toggle favorite for ${bus.nextStop}" onclick="toggleFavoriteStop('${bus.nextStop}')">⭐</button>
      </div>
      <div class="bus-info">
        <p><strong>Route:</strong> ${bus.route}</p>
        <p><strong>Current Location:</strong> ${bus.currentStop}</p>
        <p><strong>Next Stop:</strong> ${bus.nextStop}</p>
        <p><strong>ETA:</strong> ${bus.eta}</p>
        ${bus.delay > 0 ? `<p><strong>Delay:</strong> ${bus.delay} minutes</p>` : ''}
        <p><strong>Driver:</strong> ${bus.driver}</p>
        <p><strong>Occupancy:</strong> ${bus.occupancy}/${bus.capacity} passengers</p>
        <div class="occupancy-bar" aria-label="Occupancy">
          <div class="occupancy-bar-inner" style="width:${occupancyPercent}%;background:${occupancyPercent>90?'#EF4444':occupancyPercent>70?'#F59E0B':'#10B981'}"></div>
        </div>
        <p><small>Last updated: ${bus.lastUpdate}</small></p>
      </div>
      <div style="margin-top: 10px;display:flex;gap:8px;">
        <button class="btn btn-sm btn-outline" onclick="trackBus('${bus.number}')">📍 Track Bus</button>
        <button class="btn btn-sm btn-secondary" onclick="setNotification('${bus.number}')">🔔 Set Alert</button>
      </div>
    </div>
  `;
}

async function populateRouteFilter() {
  const routeFilter = document.getElementById('routeFilter');
  if (!routeFilter) return;

  try {
    const res = await fetch(`${API_BASE}/buses`);
    if (res.ok) {
      const allBuses = await res.json();
      const uniqueRoutes = [...new Set(allBuses.map(bus => bus.route))];
      routeFilter.innerHTML = '<option value="">All Routes</option>' + uniqueRoutes.map(route => `<option value="${route}">${route}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to populate route filters:', err);
  }
}

function renderFavoriteStopsHTML(stops) {
  if (!stops || !stops.length) return '<div class="no-results"><img src="../img/empty-fav.svg" alt="No favorites" style="width:80px;opacity:.7;"><br>No favorite stops added yet.</div>';
  return stops.map(stop => `
    <div class="favorite-stop" tabindex="0" onclick="searchByStop('${stop}')">
      <span>📍 ${stop}</span>
      <button class="btn btn-sm btn-danger" onclick="removeFavoriteStop('${stop}', event)">✕</button>
    </div>
  `).join('');
}

function loadFavoriteStops() {
  const favoriteContainerStandalone = document.getElementById('favoriteStopsStandalone');
  favoriteStops = JSON.parse(localStorage.getItem('favoriteStops') || '[]');
  const content = renderFavoriteStopsHTML(favoriteStops);
  if (favoriteContainerStandalone) favoriteContainerStandalone.innerHTML = content;
}

function toggleFavoriteStop(stopName) {
  const wasFav = favoriteStops.includes(stopName);
  if (wasFav) favoriteStops = favoriteStops.filter(stop => stop !== stopName);
  else favoriteStops.push(stopName);
  localStorage.setItem('favoriteStops', JSON.stringify(favoriteStops));
  loadFavoriteStops();
}

function removeFavoriteStop(stopName, event) {
  event.stopPropagation();
  favoriteStops = favoriteStops.filter(stop => stop !== stopName);
  localStorage.setItem('favoriteStops', JSON.stringify(favoriteStops));
  loadFavoriteStops();
}

function searchByStop(stopName) {
  document.getElementById('busNumberInput').value = stopName;
  searchBuses('auto');
}

function trackBus(busNumber) {
  const bus = busData.find(b => b.number === busNumber);
  if (bus) {
    showToast(`🚌 ${busNumber} is currently at ${bus.currentStop}. ETA to ${bus.nextStop}: ${bus.eta}`);
  }
}

function setNotification(busNumber) {
  const bus = busData.find(b => b.number === busNumber);
  if (bus) {
    showToast(`🔔 Alert set for ${busNumber}! You'll be notified 5 minutes before arrival at ${bus.nextStop}.`, 'success');
    let notifications = JSON.parse(localStorage.getItem('busNotifications') || '[]');
    notifications.push({ busNumber, stopName: bus.nextStop, timestamp: new Date().toISOString() });
    localStorage.setItem('busNotifications', JSON.stringify(notifications));
  }
}

function loadNotifications() {
  const notificationList = document.getElementById('notificationList');
  const notifications = notificationData.filter(n => n.userType === 'student').slice(0, 5);
  if (!notificationList) return;
  if (!notifications.length) {
    notificationList.innerHTML = '<div class="no-results"><img src="../img/empty-notify.svg" alt="No notifications" style="width:80px;opacity:.7;"><br>No notifications yet.</div>';
    return;
  }
  notificationList.innerHTML = notifications.map(notification => `
    <div class="notification-item" style="padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px;">
      <div style="font-weight: 600;">${notification.title}</div>
      <div style="font-size: 14px; color: #666;">${notification.message}</div>
      <div style="font-size: 12px; color: #999;">${notification.timestamp}</div>
    </div>
  `).join('');
}

function refreshBusData() {
  console.log('Refreshing bus data...');
  searchBuses('auto');
}

function showAllStops() {
  const allStops = [...new Set(busData.flatMap(bus => [bus.currentStop, bus.nextStop]))];
  const stopList = allStops.map(stop => `
    <button class="btn btn-outline btn-sm" onclick="toggleFavoriteStop('${stop}')" style="margin: 5px;">
      ${favoriteStops.includes(stop) ? '⭐' : '📍'} ${stop}
    </button>
  `).join('');
  
  const modal = document.createElement('div');
  modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;
  
  modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; max-height: 70vh; overflow-y: auto;">
          <h3>Select Favorite Stops</h3>
          <div style="margin: 20px 0;">
              ${stopList}
          </div>
          <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
      </div>
  `;
  modal.className = 'modal';

  
  document.body.appendChild(modal);
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}
