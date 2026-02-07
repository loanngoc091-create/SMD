// js/auth.js
export function getToken() {
  return localStorage.getItem("access_token");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

export function requireLogin(allowedRoles = []) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    alert("Bạn không có quyền truy cập");
    logout();
  }
}
