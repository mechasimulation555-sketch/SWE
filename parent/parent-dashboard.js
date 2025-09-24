// Parent Dashboard JavaScript

let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
let children = [];
try {
    const storedChildren = localStorage.getItem('parentChildren');
    if (storedChildren) {
        children = JSON.parse(storedChildren);
        if (!Array.isArray(children)) children = [];
    }
} catch (e) {
    children = [];
    localStorage.removeItem('parentChildren');
    showNotification && showNotification('Unable to load children data. Please refresh the page.');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser || currentUser.role !== 'parent') {
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}!`;
    showChildrenSkeleton();
    setTimeout(() => {
        loadChildren();
        loadNotificationHistory();
        checkEmergencyAlerts();
    }, 600); // Simulate loading delay for skeleton
    // Auto-refresh every 20 seconds (debounced)
    let refreshTimeout;
    setInterval(() => {
        if (refreshTimeout) clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(refreshChildrenStatus, 200);
    }, 20000);
// Show skeleton loader for children list
function showChildrenSkeleton() {
    const childrenContainer = document.getElementById('childrenList');
    if (!childrenContainer) return;
    let skeletons = '';
    for (let i = 0; i < 2; i++) {
        skeletons += `
            <div class="child-card skeleton-card">
                <div class="child-header">
                    <div class="child-name skeleton-box" style="width: 120px; height: 20px;"></div>
                    <div class="child-actions">
                        <div class="skeleton-box" style="width: 80px; height: 32px;"></div>
                    </div>
                </div>
                <div class="safety-status">
                    <div class="status-indicator skeleton-box" style="width: 16px; height: 16px;"></div>
                    <span class="skeleton-box" style="width: 100px; height: 16px;"></span>
                </div>
                <div class="child-info">
                    <div class="skeleton-box" style="width: 80%; height: 14px;"></div>
                    <div class="skeleton-box" style="width: 60%; height: 14px;"></div>
                    <div class="skeleton-box" style="width: 70%; height: 14px;"></div>
                </div>
                <div style="margin-top: 15px;">
                    <div class="skeleton-box" style="width: 90px; height: 28px; display: inline-block; margin-right: 8px;"></div>
                    <div class="skeleton-box" style="width: 110px; height: 28px; display: inline-block;"></div>
                </div>
            </div>
        `;
    }
    childrenContainer.innerHTML = skeletons;
}
});

// --- Section Navigation for Parent Dashboard ---

// All sections are now visible by default in single-page layout. No section collapsing.

// --- Parent-specific small helpers for new sections ---
function populateTrackingSelect() {
    const sel = document.getElementById('trackChildSelect');
    if (!sel) return;
    sel.innerHTML = children.map(c => `<option value="${c.id}">${c.name} — ${c.busNumber}</option>`).join('');
    sel.onchange = () => updateTrackingInfo(parseInt(sel.value, 10));
    if (children.length) updateTrackingInfo(children[0].id);
}

function updateTrackingInfo(childId) {
    const child = children.find(c => c.id === childId);
    const info = document.getElementById('trackingInfo');
    if (!child || !info) return;
    const bus = busData.find(b => b.number === child.busNumber) || {};
    info.innerHTML = `
        <p><strong>Bus:</strong> ${bus.number || 'N/A'}</p>
        <p><strong>Route:</strong> ${bus.route || 'N/A'}</p>
        <p><strong>Current Location:</strong> ${bus.currentStop || 'Unknown'}</p>
        <p><strong>ETA:</strong> ${bus.eta || '-'}</p>
    `;
}

function populateHistoryTable() {
    const tbody = document.querySelector('#historyTable tbody');
    if (!tbody) return;
    // mock history
    const rows = [];
    children.forEach(child => {
        const history = [
            { date: '2025-09-18', departure: '08:30', arrival: '09:15', status: 'On Time' },
            { date: '2025-09-17', departure: '08:35', arrival: '09:20', status: '5 min delay' }
        ];
        history.forEach(h => rows.push(`<tr><td>${h.date}</td><td>${h.departure}</td><td>${h.arrival}</td><td>${h.status}</td></tr>`));
    });
    tbody.innerHTML = rows.join('');
}

function setupSettingsForm() {
    const display = document.getElementById('parentDisplayName');
    const notifyArrival = document.getElementById('notifyArrival');
    const notifyDelay = document.getElementById('notifyDelay');
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (display) display.value = currentUser.name || '';
    const stored = JSON.parse(localStorage.getItem('parentSettings') || '{}');
    if (notifyArrival) notifyArrival.checked = stored.notifyArrival || false;
    if (notifyDelay) notifyDelay.checked = stored.notifyDelay || false;
    if (saveBtn) saveBtn.onclick = () => {
        const settings = { notifyArrival: !!(notifyArrival && notifyArrival.checked), notifyDelay: !!(notifyDelay && notifyDelay.checked), displayName: (display && display.value) || '' };
        localStorage.setItem('parentSettings', JSON.stringify(settings));
        showNotification && showNotification('Settings saved', 'success');
    };
}

// Provide a clear initialization sequence instead of reassigning functions
function initializeDashboard() {
    loadChildren();
    populateTrackingSelect();
    populateHistoryTable();
    setupSettingsForm();
}

function loadChildren() {
    const childrenContainer = document.getElementById('childrenList');
    
    if (children.length === 0) {
        // Add demo children for testing
        children = [
            {
                id: 1,
                name: 'Rahul Kumar',
                busNumber: 'VIT-101',
                studentId: 'VIT2023001',
                class: 'B.Tech CSE 2nd Year',
                emergencyContact: currentUser.mobile
            },
            {
                id: 2,
                name: 'Priya Kumar',
                busNumber: 'VIT-303',
                studentId: 'VIT2024001',
                class: 'B.Tech ECE 1st Year',
                emergencyContact: currentUser.mobile
            }
        ];
                try {
                    localStorage.setItem('parentChildren', JSON.stringify(children));
                } catch (e) {
                    showNotification('Unable to save children data.');
                }
    }
    
    childrenContainer.innerHTML = children.map(child => createChildCard(child)).join('');
}

// --- Client-side search and sort for children ---
function filterChildren() {
    const queryEl = document.getElementById('childSearchInput');
    const sortEl = document.getElementById('childSortSelect');
    const q = queryEl ? (queryEl.value || '').toLowerCase().trim() : '';
    const sortBy = sortEl ? sortEl.value : 'name';

    let list = children.slice();
    if (q) {
        list = list.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.studentId && c.studentId.toLowerCase().includes(q)) || (c.busNumber && c.busNumber.toLowerCase().includes(q)));
    }

    if (sortBy === 'name') {
        list.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    } else if (sortBy === 'bus') {
        list.sort((a,b) => (a.busNumber||'').localeCompare(b.busNumber||''));
    } else if (sortBy === 'status') {
        list.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    }

    const container = document.getElementById('childrenList');
    if (container) container.innerHTML = list.map(child => createChildCard(child)).join('');
}

// Attach event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('childSearchInput');
    const searchBtn = document.getElementById('childSearchBtn');
    const sortSelect = document.getElementById('childSortSelect');

    if (searchInput) searchInput.addEventListener('input', () => filterChildren());
    if (searchBtn) searchBtn.addEventListener('click', () => filterChildren());
    if (sortSelect) sortSelect.addEventListener('change', () => filterChildren());
});

function createChildCard(child) {
    const bus = busData.find(b => b.number === child.busNumber);
    const safetyStatus = getSafetyStatus(bus);
    
    return `
        <div class="child-card">
            <div class="child-header">
                <div class="child-name">👦 ${child.name}</div>
                <div class="child-actions">
                    <button class="track-button" onclick="trackChild(${child.id})">📍 Track Now</button>
                    <button class="btn btn-sm btn-danger" title="Remove Child" onclick="removeChild(${child.id})">🗑️</button>
                </div>
            </div>
            <div class="safety-status">
                <div class="status-indicator ${safetyStatus.class}"></div>
                <span><strong>Status:</strong> ${safetyStatus.message}</span>
            </div>
            <div class="child-info">
                <p><strong>Student ID:</strong> ${child.studentId}</p>
                <p><strong>Class:</strong> ${child.class}</p>
                <p><strong>Bus:</strong> ${child.busNumber}</p>
                ${bus ? `
                    <p><strong>Current Location:</strong> ${bus.currentStop}</p>
                    <p><strong>Next Stop:</strong> ${bus.nextStop}</p>
                    <p><strong>ETA:</strong> ${bus.eta}</p>
                    <p><strong>Driver:</strong> ${bus.driver}</p>
                    ${bus.delay > 0 ? `<p><strong>⚠️ Delay:</strong> ${bus.delay} minutes</p>` : ''}
                ` : '<p class="text-danger">❌ Bus information not available</p>'}
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-sm" onclick="setArrivalAlert(${child.id})">🔔 Arrival Alert</button>
                <button class="btn btn-sm btn-outline" onclick="viewHistory(${child.id})">📊 Travel History</button>
                <button class="btn btn-sm btn-outline" onclick="contactDriver('${child.busNumber}')">📞 Contact Driver</button>
            </div>
        </div>
    `;

// Remove child with confirmation
}

function removeChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) {
        showNotification('❌ Child not found.');
        return;
    }
    showConfirmationModal(
        'Remove Child',
        `Are you sure you want to remove <strong>${child.name}</strong> from your tracking list? This action cannot be undone.`,
        () => {
            children = children.filter(c => c.id !== childId);
                        try {
                            localStorage.setItem('parentChildren', JSON.stringify(children));
                        } catch (e) {
                            showNotification('Unable to save children data.');
                        }
            loadChildren();
            showNotification(`🗑️ ${child.name} has been removed from your tracking list.`);
        }
    );
}

function getSafetyStatus(bus) {
    if (!bus) {
        return { class: 'danger', message: 'Bus not tracked' };
    }
    
    if (bus.status === 'emergency') {
        return { class: 'danger', message: 'Emergency Alert' };
    }
    
    if (bus.delay > 15) {
        return { class: 'warning', message: 'Significantly Delayed' };
    }
    
    if (bus.delay > 5) {
        return { class: 'warning', message: 'Minor Delay' };
    }
    
    return { class: '', message: 'On Schedule' };
}

function trackChild(childId) {
    const child = children.find(c => c.id === childId);
    const bus = busData.find(b => b.number === child.busNumber);
    
    if (bus) {
        showTrackingModal(child, bus);
    } else {
        showNotification('❌ Unable to track bus at this time. Please try again later.');
    }
}

function showTrackingModal(child, bus) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-content" role="document">
            <h3>🚌 Tracking ${child.name}</h3>
            <div class="modal-section">
                <p><strong>Bus:</strong> ${bus.number}</p>
                <p><strong>Route:</strong> ${bus.route}</p>
                <p><strong>Current Location:</strong> ${bus.currentStop}</p>
                <p><strong>Next Stop:</strong> ${bus.nextStop}</p>
                <p><strong>ETA:</strong> ${bus.eta}</p>
                <p><strong>Driver:</strong> ${bus.driver}</p>
                <p><strong>Status:</strong> <span class="status-${bus.status}">${bus.status.toUpperCase()}</span></p>
                <p><strong>Last Update:</strong> ${bus.lastUpdate}</p>
                ${bus.delay > 0 ? `<p><strong>⚠️ Delay:</strong> ${bus.delay} minutes</p>` : ''}
            </div>
            <div class="modal-actions">
                <button class="btn" onclick="setArrivalAlert(${child.id})">🔔 Set Arrival Alert</button>
                <button class="btn btn-outline" id="closeTrackingModal">Close</button>
            </div>
        </div>
    `;
    // Focus management
    setTimeout(() => {
        const closeBtn = modal.querySelector('#closeTrackingModal');
        if (closeBtn) closeBtn.focus();
    }, 100);
    // Keyboard accessibility: trap focus inside modal
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
        // Trap focus
        const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });
    modal.querySelector('#closeTrackingModal').onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function setArrivalAlert(childId) {
    const child = children.find(c => c.id === childId);
    const bus = busData.find(b => b.number === child.busNumber);
    
    if (bus) {
        showNotification(`🔔 Arrival alert set for ${child.name}! You'll be notified when ${bus.number} reaches ${bus.nextStop}.`);
        
        // Store alert preference
                let alerts = [];
                try {
                    const storedAlerts = localStorage.getItem('parentAlerts');
                    if (storedAlerts) {
                        alerts = JSON.parse(storedAlerts);
                        if (!Array.isArray(alerts)) alerts = [];
                    }
                } catch (e) {
                    alerts = [];
                    localStorage.removeItem('parentAlerts');
                    showNotification && showNotification('Unable to load alerts data.');
                }
        alerts.push({
            childId: childId,
            childName: child.name,
            busNumber: bus.number,
            stopName: bus.nextStop,
            timestamp: new Date().toISOString()
        });
                try {
                    localStorage.setItem('parentAlerts', JSON.stringify(alerts));
                } catch (e) {
                    showNotification('Unable to save alerts data.');
                }
    }
}

function contactDriver(busNumber) {
    const bus = busData.find(b => b.number === busNumber);
    if (bus) {
                const content = document.createElement('div');
                content.innerHTML = `
                    <p><strong>Bus:</strong> ${busNumber}</p>
                    <p><strong>Driver:</strong> ${bus.driver}</p>
                    <p><strong>Phone:</strong> +91-9876543210</p>
                    <p><em>Note: Only contact in case of emergency.</em></p>
                `;
                if (window.CommonUtils && typeof CommonUtils.showModal === 'function') {
                    CommonUtils.showModal(content);
                } else {
                    alert(`📞 Contact Driver\n\nBus: ${busNumber}\nDriver: ${bus.driver}\nPhone: +91-9876543210\n\nNote: Only contact in case of emergency.`);
                }
    }
}

function viewHistory(childId) {
    const child = children.find(c => c.id === childId);
    
    // Mock travel history data
    const history = [
        { date: '2025-09-18', departure: '08:30', arrival: '09:15', status: 'On Time' },
        { date: '2025-09-17', departure: '08:35', arrival: '09:20', status: '5 min delay' },
        { date: '2025-09-16', departure: '08:30', arrival: '09:12', status: 'On Time' },
        { date: '2025-09-15', departure: '08:45', arrival: '09:30', status: '15 min delay' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-content" role="document" style="max-width:600px;max-height:80vh;overflow-y:auto;">
            <h3>📊 Travel History - ${child.name}</h3>
            <table class="table" style="margin: 20px 0;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(record => `
                        <tr>
                            <td>${record.date}</td>
                            <td>${record.departure}</td>
                            <td>${record.arrival}</td>
                            <td>${record.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="btn" id="closeHistoryModal">Close</button>
        </div>
    `;
    // Focus management
    setTimeout(() => {
        const closeBtn = modal.querySelector('#closeHistoryModal');
        if (closeBtn) closeBtn.focus();
    }, 100);
    // Keyboard accessibility: trap focus inside modal
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
        // Trap focus
        const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });
    modal.querySelector('#closeHistoryModal').onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function loadNotificationHistory() {
    const historyContainer = document.getElementById('notificationHistory');
    const notifications = notificationData.filter(n => n.userType === 'parent').slice(0, 5);
    
    historyContainer.innerHTML = notifications.map(notification => `
        <div class="notification-item" style="padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
            <div style="font-weight: 600; color: #333;">${notification.title}</div>
            <div style="margin: 5px 0; color: #666;">${notification.message}</div>
            <div style="font-size: 12px; color: #999;">${notification.timestamp}</div>
        </div>
    `).join('');
}

function checkEmergencyAlerts() {
    // Check for emergency situations
    const emergencyBuses = busData.filter(bus => bus.status === 'emergency' || bus.delay > 30);
    
    if (emergencyBuses.length > 0) {
        const alertsContainer = document.getElementById('emergencyAlerts');
        const alertsList = document.getElementById('alertsList');
        
        alertsList.innerHTML = emergencyBuses.map(bus => `
            <div class="alert-item">
                <strong>🚨 ${bus.number}</strong> - ${bus.status === 'emergency' ? 'Emergency Alert' : `Severe Delay (${bus.delay} min)`}
                <div>Location: ${bus.currentStop}</div>
                <div>Driver: ${bus.driver}</div>
            </div>
        `).join('');
        alertsContainer.style.display = '';
        alertsContainer.setAttribute('aria-hidden', 'false');
        // move focus to alerts to notify screen readers
        alertsContainer.setAttribute('tabindex', '-1');
        alertsContainer.focus && alertsContainer.focus();
        // also ensure notifications section reflects this
        const notifSection = document.getElementById('section-notifications');
        if (notifSection) notifSection.classList.add('has-emergency');
    }
    else {
        const alertsContainer = document.getElementById('emergencyAlerts');
        if (alertsContainer) {
            alertsContainer.style.display = 'none';
            alertsContainer.setAttribute('aria-hidden', 'true');
        }
        const notifSection = document.getElementById('section-notifications');
        if (notifSection) notifSection.classList.remove('has-emergency');
    }
}

function addChild() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-content" role="document">
            <h3>👦 Add Child</h3>
            <form onsubmit="saveChild(event)">
                <div class="form-group">
                    <label for="childName">Child Name:</label>
                    <input type="text" id="childName" class="form-input" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="studentId">Student ID:</label>
                    <input type="text" id="studentId" class="form-input" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="childClass">Class:</label>
                    <input type="text" id="childClass" class="form-input" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="busNumber">Bus Number:</label>
                    <select id="busNumber" class="form-input" required>
                        <option value="">Select Bus</option>
                        ${busData.map(bus => `<option value="${bus.number}">${bus.number} - ${bus.route}</option>`).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn">Add Child</button>
                    <button type="button" class="btn btn-outline" id="cancelAddChild">Cancel</button>
                </div>
            </form>
        </div>
    `;
    // Focus management
    setTimeout(() => {
        const nameInput = modal.querySelector('#childName');
        if (nameInput) nameInput.focus();
    }, 100);
    // Keyboard accessibility: trap focus inside modal
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
        // Trap focus
        const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, select');
        if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });
    modal.querySelector('#cancelAddChild').onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function saveChild(event) {
    event.preventDefault();
    let name = document.getElementById('childName').value.trim();
    let studentId = document.getElementById('studentId').value.trim();
    let childClass = document.getElementById('childClass').value.trim();
    let busNumber = document.getElementById('busNumber').value;
    // Input validation
    if (!name || !studentId || !childClass || !busNumber) {
        showNotification('❌ Please fill in all fields to add a child.');
        return;
    }
    // Sanitize inputs (remove < > and trim)
    [name, studentId, childClass, busNumber] = [name, studentId, childClass, busNumber].map(val => val.replace(/[<>]/g, '').trim());
    // Additional validation: length and format
    if (name.length < 2 || name.length > 50) {
        showNotification('❌ Child name must be 2-50 characters.');
        return;
    }
    if (!/^VIT\d{7}$/.test(studentId)) {
        showNotification('❌ Student ID must be in format VIT#######.');
        return;
    }
    if (childClass.length < 2 || childClass.length > 50) {
        showNotification('❌ Class must be 2-50 characters.');
        return;
    }
    // Confirmation dialog
    showConfirmationModal(
        `Add Child`,
        `Are you sure you want to add <strong>${name}</strong> to your tracking list?`,
        () => {
            const newChild = {
                id: Date.now(),
                name,
                studentId,
                class: childClass,
                busNumber,
                emergencyContact: currentUser.mobile
            };
            children.push(newChild);
            try {
                localStorage.setItem('parentChildren', JSON.stringify(children));
            } catch (e) {
                showNotification('Unable to save children data.');
            }
            loadChildren();
            document.querySelector('.modal-overlay').remove();
            showNotification(`✅ ${newChild.name} has been added to your tracking list.`);
        }
    );
}

// Accessible confirmation modal
function showConfirmationModal(title, message, onConfirm) {
    if (window.CommonUtils && typeof CommonUtils.showConfirmationModal === 'function') {
        return CommonUtils.showConfirmationModal({ title, message, onConfirm, confirmText: 'Confirm', cancelText: 'Cancel' });
    }
    // Fallback: simple modal if CommonUtils isn't loaded
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-content" role="document">
            <h3>${title}</h3>
            <div class="modal-section">${message}</div>
            <div class="modal-actions">
                <button class="btn" id="confirmBtn">Confirm</button>
                <button class="btn btn-outline" id="cancelBtn">Cancel</button>
            </div>
        </div>
    `;
    setTimeout(() => {
        const confirmBtn = modal.querySelector('#confirmBtn');
        if (confirmBtn) confirmBtn.focus();
    }, 100);
    modal.querySelector('#confirmBtn').onclick = () => {
        modal.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };
    modal.querySelector('#cancelBtn').onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function refreshChildrenStatus() {
    loadChildren();
    checkEmergencyAlerts();
}

function toggleNotifications() {
    loadNotificationHistory();
}

function showNotification(message, type = 'info', duration = 3000) {
    if (window.CommonUtils && typeof CommonUtils.showNotification === 'function') {
        return CommonUtils.showNotification(message, type, duration);
    }
    // Fallback simple notification
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.tabIndex = 0;
    notification.textContent = message;
    document.body.appendChild(notification);
    notification.focus();
    // Keyboard dismiss
    notification.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            notification.remove();
        }
    });
    setTimeout(() => {
        notification.classList.add('toast-hide');
        setTimeout(() => notification.remove(), 300);
    }, duration + 1000);
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}
