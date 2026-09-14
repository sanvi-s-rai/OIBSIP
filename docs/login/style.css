// Navigation & View Protection
function showTab(tabName) {
  hideAlert();
  const currentSession = JSON.parse(
    sessionStorage.getItem('activeUser') || 'null'
  );

  // Restrict dashboard access if unauthenticated
  if (tabName === 'dashboard' && !currentSession) {
    showTab('login');
    showAlert('Access restricted. Please log in first.', 'error');
    return;
  }

  document.getElementById('tabRegister').className =
    tabName === 'register' ? 'tab-btn active' : 'tab-btn';

  document.getElementById('tabLogin').className =
    tabName === 'login' ? 'tab-btn active' : 'tab-btn';

  document.getElementById('tabDashboard').className =
    tabName === 'dashboard' ? 'tab-btn active' : 'tab-btn';

  document.getElementById('registerSection').style.display =
    tabName === 'register' ? 'block' : 'none';

  document.getElementById('loginSection').style.display =
    tabName === 'login' ? 'block' : 'none';

  document.getElementById('dashboardSection').style.display =
    tabName === 'dashboard' ? 'block' : 'none';

  if (tabName === 'dashboard' && currentSession) {
    document.getElementById('currentUser').textContent = currentSession;
  }
}

function showAlert(text, type) {
  const alert = document.getElementById('alertMessage');

  alert.className =
    'alert visible ' +
    (type === 'error' ? 'alert-error' : 'alert-success');

  alert.textContent = text;
}

function hideAlert() {
  const alert = document.getElementById('alertMessage');

  alert.className = 'alert';
  alert.textContent = '';
}

// Show / Hide Password
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = 'Hide';
  } else {
    input.type = 'password';
    button.textContent = 'Show';
  }
}

// Registration Handler
function handleRegister(e) {
  e.preventDefault();
  hideAlert();

  const identifier = document.getElementById('regIdentifier').value.trim();
  const password = document.getElementById('regPassword').value;

  // Password Validation: Minimum 8 characters and at least 1 number
  const isLongEnough = password.length >= 8;
  const hasNumber = /\d/.test(password);

  if (!isLongEnough || !hasNumber) {
    showAlert(
      'Password must be at least 8 characters long and contain at least 1 number.',
      'error'
    );
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  // Duplicate Check
  const exists = users.some(
    u => u.identifier.toLowerCase() === identifier.toLowerCase()
  );

  if (exists) {
    showAlert(
      'An account with that username or email already exists.',
      'error'
    );
    return;
  }

  // Store credentials in localStorage
  users.push({ identifier, password });
  localStorage.setItem('users', JSON.stringify(users));

  showAlert(
    'Registration successful. You can now log in.',
    'success'
  );

  document.getElementById('regIdentifier').value = '';
  document.getElementById('regPassword').value = '';

  setTimeout(() => {
    showTab('login');
    document.getElementById('loginIdentifier').value = identifier;
  }, 900);
}

// Login Handler
function handleLogin(e) {
  e.preventDefault();
  hideAlert();

  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const account = users.find(
    u => u.identifier.toLowerCase() === identifier.toLowerCase()
  );

  // Generic error message: Does NOT reveal whether username or password was wrong
  if (!account || account.password !== password) {
    showAlert(
      'Invalid username/email or password.',
      'error'
    );
    return;
  }

  // Set session & transition to protected dashboard
  sessionStorage.setItem(
    'activeUser',
    JSON.stringify(account.identifier)
  );

  document.getElementById('loginIdentifier').value = '';
  document.getElementById('loginPassword').value = '';

  showTab('dashboard');
}

// Logout Handler
function handleLogout() {
  sessionStorage.removeItem('activeUser');
  showTab('login');
  showAlert('You have been logged out.', 'success');
}
