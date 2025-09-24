document.addEventListener('DOMContentLoaded', function() {
    loadAllBusRoutes();
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name || 'Student';
    }
});

function loadAllBusRoutes() {
    const routeListContainer = document.getElementById('routeList');
    if (!routeListContainer) {
        console.error("Error: Could not find the 'routeList' container in the HTML.");
        return;
    }

    // Ensure busRoutesData is available from common-data.js
    const routes = window.busRoutesData || [];

    if (routes.length === 0) {
        routeListContainer.innerHTML = '<p class="no-results">No bus routes information is available at this time.</p>';
        return;
    }

    const allRoutesHTML = routes.map(route => {
        const stopsHTML = route.stops.map(stop => `
            <tr>
                <td>${stop.pickup}</td>
                <td>${stop.time}</td>
            </tr>
        `).join('');

        return `
            <div class="route-card card">
                <h3>Route ${route.number}</h3>
                <table class="route-table">
                    <thead>
                        <tr>
                            <th>Pickup Point</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stopsHTML}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');

    routeListContainer.innerHTML = allRoutesHTML;
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}
