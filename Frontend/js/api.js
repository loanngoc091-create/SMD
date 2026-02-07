// js/api.js
import { getToken } from "./auth.js";

const BASE_URL = "http://127.0.0.1:9999";

export async function apiFetch(url, options = {}) {
  const token = getToken();

  const res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    alert("Phiên đăng nhập hết hạn");
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }

  return res.json();
}
