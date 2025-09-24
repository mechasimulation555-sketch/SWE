// Admin Dashboard JavaScript
// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
	// simple auth check placeholder (optional)
	document.querySelector('.sidebar').addEventListener('click', handleSidebarNav);
	initSections();
});

const SECTION_IDS = {
	Buses: 'section-buses',
	Routes: 'section-routes',
	Drivers: 'section-drivers',
	Users: 'section-users',
	Reports: 'section-reports',
	Notifications: 'section-notifications'
};

function initSections() {
	document.querySelectorAll('.content-section').forEach(sec => {
		sec.style.display = 'none';
		sec.classList.remove('active');
		sec.style.transition = 'opacity 220ms ease-in-out, transform 220ms ease-in-out';
		sec.style.opacity = 0;
		sec.style.transform = 'translateY(6px)';
		sec.setAttribute('aria-hidden', 'true');
	});
	showSection('Buses');
	// set active link
	document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
	const homeLink = Array.from(document.querySelectorAll('.sidebar-link')).find(l => {
		const s = l.querySelectorAll('span')[1];
		return s && s.textContent.trim() === 'Buses';
	});
	if (homeLink) homeLink.classList.add('active');
}

function handleSidebarNav(e) {
	const link = e.target.closest('.sidebar-link');
	if (!link) return;
	e.preventDefault();
	document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
	link.classList.add('active');
	const labelSpan = link.querySelectorAll('span')[1];
	const label = labelSpan ? labelSpan.textContent.trim() : link.textContent.trim();
	showSection(label);
}

function showSection(label) {
	const targetId = SECTION_IDS[label];
	if (!targetId) return;
	document.querySelectorAll('.content-section').forEach(sec => {
		if (sec.id === targetId) return;
		sec.style.opacity = 0;
		sec.style.transform = 'translateY(6px)';
		setTimeout(() => sec.style.display = 'none', 220);
		sec.classList.remove('active');
		sec.setAttribute('aria-hidden', 'true');
	});
	const target = document.getElementById(targetId);
	if (!target) return;
	target.style.display = '';
	requestAnimationFrame(() => {
		target.style.opacity = 1;
		target.style.transform = 'translateY(0)';
		target.classList.add('active');
	});
	target.setAttribute('aria-hidden', 'false');
}
