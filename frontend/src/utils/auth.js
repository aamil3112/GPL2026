export function isAdminLoggedIn() {
  return Boolean(localStorage.getItem("sss_admin_token"));
}

export function setAdminSession(token, username) {
  localStorage.setItem("sss_admin_token", token);
  localStorage.setItem("sss_admin_username", username);
}

export function clearAdminSession() {
  localStorage.removeItem("sss_admin_token");
  localStorage.removeItem("sss_admin_username");
}

export function getAdminUsername() {
  return localStorage.getItem("sss_admin_username") || "Admin";
}
