// Authentication and login management
let currentRole = null;

function selectRole(role) {
    // Remove active class from all role buttons
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    // Add active class to the role button by matching its text content
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        const label = (btn.textContent || '').toLowerCase();
        if (label.includes(role)) {
            btn.classList.add('active');
        }
    });

    // Hide all login forms
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    // Show selected login form
    const targetForm = document.getElementById(role + 'Login');
    if (targetForm) targetForm.classList.add('active');

    currentRole = role;
}

async function login(role) {
    // Dependency check to prevent race conditions on page load
    if (typeof CommonUtils === 'undefined' || !CommonUtils.showNotification) {
        alert('Login system is not ready. Please wait a moment and try again.');
        return;
    }

    const idInput = document.getElementById(`${role}Id`);
    const passwordInput = document.getElementById(`${role}Password`);

    const id = idInput ? idInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!id || !password) {
        CommonUtils.showNotification('Please enter both ID and password.', 'error');
        return;
    }

    // --- FRONTEND-ONLY LOGIN SIMULATION ---
    // Create a dummy user object for demonstration purposes.
    const dummyUser = {
        role: role,
        id: `${role}123`, // e.g., 'student123'
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}` // e.g., 'Demo Student'
    };

    // Set current user
    currentUser = dummyUser;

    // Store in sessionStorage to maintain state across pages
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    CommonUtils.showNotification(`Welcome, ${currentUser.name}! Redirecting...`, 'success');
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
        redirectToDashboard(role);
    }, 1000);
}

function redirectToDashboard(role) {
    const dashboardUrls = {
        'student': 'student/student-dashboard.html',
        'parent': 'parent/parent-dashboard.html',
        'driver': 'driver/driver-dashboard.html',
        'admin': 'admin/admin-dashboard.html'
    };
    
    window.location.href = dashboardUrls[role];
}

function logout() {
    // Clear session
    sessionStorage.removeItem('currentUser');
    // Remove any role-specific demo keys
    sessionStorage.removeItem('currentDriver');
    sessionStorage.removeItem('currentAdmin');
    sessionStorage.removeItem('currentStudent');
    sessionStorage.removeItem('currentParent');
    currentUser = null;
    currentRole = null;
    
    // Redirect to login page
    window.location.href = '../Index.html';
}

function checkAuthentication() {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        return true;
    }
    return false;
}

function requireAuth(requiredRole = null) {
    if (!checkAuthentication()) {
        window.location.href = '../Index.html';
        return false;
    }
    
    if (requiredRole && currentUser.role !== requiredRole) {
        CommonUtils.showNotification('Access denied. Redirecting...', 'error');
        setTimeout(() => {
            window.location.href = '../Index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // If we're not on the login page, check authentication
    const path = window.location.pathname;
    const isIndex = /(^|\/)index\.html$/i.test(path) || /(^|\/)Index\.html$/i.test(path) || path.endsWith('/');
    if (!isIndex) {
        const pathSegments = window.location.pathname.split('/');
        const folder = pathSegments[pathSegments.length - 2]; // Get folder name
        
        // Map folder names to roles
        const folderRoleMap = {
            'student': 'student',
            'parent': 'parent',
            'driver': 'driver',
            'admin': 'admin'
        };
        
        const requiredRole = folderRoleMap[folder];
        requireAuth(requiredRole);
    }
});
