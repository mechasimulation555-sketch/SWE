
// Driver Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
	// Sidebar removed: show all sections by default
	showAllSections();
});

const SECTION_IDS = {
	'My Bus': 'section-mybus',
	Delay: 'section-delay',
	Emergency: 'section-emergency',
	Settings: 'section-settings',
	Help: 'section-help'
};

function initSections() {
	// No-op: sections are visible by default in single-page layout
}

function handleSidebarNav(e) {
	// Sidebar navigation removed for single-page layout
}

function showSection(label) {
	// Section toggling removed; all sections remain visible
}

function showAllSections() {
	document.querySelectorAll('.content-section').forEach(sec => {
		sec.style.display = '';
		sec.classList.add('active');
		sec.style.opacity = 1;
		sec.style.transform = 'none';
		sec.setAttribute('aria-hidden', 'false');
	});
}

// --- Driver Dashboard State ---
let driver = JSON.parse(sessionStorage.getItem('currentDriver')) || { name: 'Demo Driver', busNumber: 'VIT-101' };
let tripStarted = false;
let currentDelay = 0;
let emergencyActive = false;

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
	updateStatus('Ready for your trip.');
	document.querySelectorAll('.driver-btn').forEach(btn => {
		btn.addEventListener('click', handleButtonClick);
	});
});

// --- Event Handlers ---
function handleButtonClick(e) {
	const btn = e.currentTarget;
	if (btn.textContent.includes('Start Trip')) {
		startTrip();
	} else if (btn.textContent.includes('Update Delay')) {
		updateDelay();
	} else if (btn.textContent.includes('Emergency')) {
		sendEmergency();
	}
}

function startTrip() {
	if (tripStarted) {
		showToast('Trip already started.');
		return;
	}
	tripStarted = true;
	updateStatus('Trip started! ETA enabled.');
	showToast('🚌 Trip started. Drive safe!');
}

function updateDelay() {
	showPrompt({
		title: 'Update Delay',
		message: 'Enter delay in minutes:',
		type: 'number',
		onSubmit: (delay) => {
			if (delay === null) return;
			currentDelay = parseInt(delay, 10) || 0;
			updateStatus(`Delay updated: ${currentDelay} min.`);
			showToast(`⏱️ Delay set to ${currentDelay} min.`);
		}
	});
}

function sendEmergency() {
	if (emergencyActive) {
		showToast('Emergency already active!');
		return;
	}
	showConfirm({
		title: 'Send Emergency Alert',
		message: 'Are you sure you want to send an emergency alert? This will notify all parents and admins.',
		onConfirm: () => {
			emergencyActive = true;
			updateStatus('🚨 Emergency alert sent!');
			showToast('🚨 Emergency alert sent!');
		}
	});
}

function updateStatus(message) {
	const status = document.getElementById('driverStatus');
	if (status) status.textContent = message;
}

// --- UI Helpers ---
function showToast(message) {
	// Accessible toast notification
	const notification = document.createElement('div');
	notification.className = 'toast-notification';
	notification.setAttribute('role', 'status');
	notification.setAttribute('aria-live', 'polite');
	notification.tabIndex = 0;
	notification.textContent = message;
	document.body.appendChild(notification);
	notification.focus();
	notification.addEventListener('keydown', e => {
		if (e.key === 'Escape') notification.remove();
	});
	setTimeout(() => {
		notification.classList.add('toast-hide');
		setTimeout(() => notification.remove(), 300);
	}, 4000);
}

function showConfirm({ title, message, onConfirm }) {
	// Accessible confirmation modal
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
	modal.addEventListener('keydown', e => {
		if (e.key === 'Escape') modal.remove();
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
	modal.querySelector('#confirmBtn').onclick = () => {
		modal.remove();
		if (typeof onConfirm === 'function') onConfirm();
	};
	modal.querySelector('#cancelBtn').onclick = () => modal.remove();
	document.body.appendChild(modal);
}

function showPrompt({ title, message, type, onSubmit }) {
	// Accessible prompt modal
	const modal = document.createElement('div');
	modal.className = 'modal-overlay';
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-modal', 'true');
	modal.setAttribute('tabindex', '-1');
	modal.innerHTML = `
		<div class="modal-content" role="document">
			<h3>${title}</h3>
			<form id="promptForm">
				<div class="form-group">
					<label for="promptInput">${message}</label>
					<input id="promptInput" type="${type || 'text'}" class="form-input" autocomplete="off" required />
				</div>
				<div class="modal-actions">
					<button type="submit" class="btn">OK</button>
					<button type="button" class="btn btn-outline" id="cancelPrompt">Cancel</button>
				</div>
			</form>
		</div>
	`;
	setTimeout(() => {
		const input = modal.querySelector('#promptInput');
		if (input) input.focus();
	}, 100);
	modal.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			modal.remove();
			if (typeof onSubmit === 'function') onSubmit(null);
		}
		// Trap focus
		const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input');
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
	modal.querySelector('#cancelPrompt').onclick = () => {
		modal.remove();
		if (typeof onSubmit === 'function') onSubmit(null);
	};
	modal.querySelector('#promptForm').onsubmit = (e) => {
		e.preventDefault();
		const value = modal.querySelector('#promptInput').value;
		modal.remove();
		if (typeof onSubmit === 'function') onSubmit(value);
	};
	document.body.appendChild(modal);
}
