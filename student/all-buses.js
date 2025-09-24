document.addEventListener('DOMContentLoaded', function() {
    loadAllBuses();
});

function createBusCard(bus) {
  const occupancyPercent = Math.round((bus.occupancy / bus.capacity) * 100);
  return `
    <div class="bus-card" tabindex="0" aria-label="Bus ${bus.number}, status ${bus.status}">
      <div class="bus-header">
        <div class="bus-number">${bus.number}</div>
        <span class="bus-status status-${bus.status}">${bus.status.replace('-', ' ').toUpperCase()}</span>
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
    </div>
  `;
}

async function loadAllBuses() {
  const busList = document.getElementById('busList');
  if (!busList) return;

  const localBusData = window.busData || [];
  busData = localBusData;

  try {
        busList.innerHTML = busData.map(bus => createBusCard(bus)).join('');
    } catch (error) {
        console.error("Error loading all buses:", error);
    }
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}