// ========================
// CONFIG
// ========================
const API_CLO_LIST = "http://localhost:9999/syllabus/api/clo";
const API_SYLLABUS_LIST = "http://localhost:9999/syllabus/list";
const API_SYLLABUS_APPROVE = "http://localhost:9999/syllabus/approve";

// ========================
// HELPER
// ========================
function getTokenOrRedirect() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Phiên đăng nhập hết hạn");
    window.location.href = "login.html";
    return null;
  }
  return token;
}

// ========================
// HIỂN THỊ SECTION (TRUNG TÂM ĐIỀU KHIỂN)
// ========================
window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(sec =>
    sec.classList.remove("active")
  );

  const section = document.getElementById(id);
  if (!section) return;
  section.classList.add("active");

  // 🔑 Mỗi section chỉ load đúng 1 thứ
  if (id === "section-approve") loadPendingSyllabuses();
  if (id === "section-program") loadCLO();
};

// ========================
// LOAD CLO
// ========================
async function loadCLO() {
  const token = getTokenOrRedirect();
  if (!token) return;

  const tbody = document.getElementById("cloTable");
  const thead = document.getElementById("cloThead");
  if (!tbody || !thead) return;

  thead.style.display = "none";
  tbody.innerHTML = `
    <tr>
      <td colspan="4">⏳ Đang tải danh sách CLO...</td>
    </tr>
  `;

  try {
    const res = await fetch(API_CLO_LIST, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ❌ API trả HTML → bắt ngay
    if (!res.ok) {
      const text = await res.text();
      throw new Error("API lỗi: " + text);
    }

    const data = await res.json();
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">📭 Chưa có CLO nào</td>
        </tr>
      `;
      return;
    }

    thead.style.display = "table-header-group";

    data.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.clo_id}</td>
        <td><strong>${c.clo_code}</strong></td>
        <td>${c.description || ""}</td>
        <td>
          <button class="btn success">
            🔍 Rà soát
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4">❌ ${err.message}</td>
      </tr>
    `;
  }
}

// ========================
// LOAD ĐỀ CƯƠNG CHỜ HOD
// ========================
async function loadPendingSyllabuses() {
  const token = getTokenOrRedirect();
  if (!token) return;

  const tbody = document.getElementById("approveTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6">⏳ Đang tải danh sách đề cương...</td>
    </tr>
  `;

  try {
    const res = await fetch(API_SYLLABUS_LIST, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Không gọi được API");

    const data = await res.json();
    const pending = data.filter(
      i => i.status?.toLowerCase() === "pendingreview"
    );

    tbody.innerHTML = "";

    if (pending.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">📭 Không có đề cương chờ duyệt</td>
        </tr>
      `;
      return;
    }

    pending.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i.id}</td>
        <td>${i.course_code}</td>
        <td>${i.course_name}</td>
        <td>${i.version}</td>
        <td>${i.status}</td>
        <td>
          <button class="btn success" onclick="approveSyllabus(${i.id})">✔</button>
          <button class="btn danger" onclick="rejectSyllabus(${i.id})">✖</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6">❌ Lỗi tải dữ liệu</td>
      </tr>
    `;
  }
}

// ========================
// APPROVE / REJECT
// ========================
async function approveSyllabus(id) {
  const token = getTokenOrRedirect();
  if (!token) return;

  await fetch(API_SYLLABUS_APPROVE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ syllabus_id: id, decision: "APPROVED" })
  });

  loadPendingSyllabuses();
}

async function rejectSyllabus(id) {
  const reason = prompt("Nhập lý do:");
  if (!reason) return;

  const token = getTokenOrRedirect();
  if (!token) return;

  await fetch(API_SYLLABUS_APPROVE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      syllabus_id: id,
      decision: "REJECTED",
      reason
    })
  });

  loadPendingSyllabuses();
}

// ========================
// DASHBOARD CLICK
// ========================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card[data-target]").forEach(card => {
    card.onclick = () => showSection(card.dataset.target);
  });
});

// ========================
// LOGOUT
// ========================
window.logout = function () {
  localStorage.clear();
  location.href = "login.html";
};

// expose
window.approveSyllabus = approveSyllabus;
window.rejectSyllabus = rejectSyllabus;
