// ================== CONFIG ==================
const API_BASE = "http://localhost:9999";

/* =========================
   SECTION CONTROL
========================= */
window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
    sec.style.display = "none";
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    target.style.display = "block";
  }

   if (id === "section-manage") {
    loadManageSyllabus();
  }
};

/* =========================
   UPLOAD SYLLABUS
========================= */
window.uploadSyllabus = async function () {
  const courseId = document.getElementById("course_id").value;
  const fileInput = document.getElementById("file");

  if (!courseId || fileInput.files.length === 0) {
    alert("⚠️ Thiếu Course ID hoặc file");
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("❌ Chưa đăng nhập");
    return;
  }

  const formData = new FormData();
  formData.append("course_id", courseId);
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/syllabus/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "❌ Upload thất bại");
      return;
    }

    // set syllabus_id
    document.getElementById("syllabus_id").value = data.syllabus_id;

    // 👉 ĐÚNG ID
    document.getElementById("submit-area").style.display = "block";

    alert("✅ Upload thành công");
  } catch (err) {
    console.error(err);
    alert("❌ Không kết nối được server");
  }
};

/* =========================
   SUBMIT
========================= */
window.submitSyllabus = async function () {
  const syllabusId = document.getElementById("syllabus_id").value;
  const token = localStorage.getItem("access_token");

  if (!syllabusId) {
    alert("⚠️ Chưa có syllabus_id");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/syllabus/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ syllabus_id: syllabusId })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "❌ Submit thất bại");
      return;
    }

    alert("🚀 Submit thành công");
    showSection("dashboard");
  } catch (err) {
    console.error(err);
    alert("❌ Không kết nối được server");
  }
};

/* =========================
   UPDATE SYLLABUS
========================= */
window.updateSyllabus = async function () {
  const courseId = document.getElementById("course_id_update").value;
  const fileInput = document.getElementById("file_update");
  const token = localStorage.getItem("access_token");

  if (!courseId || fileInput.files.length === 0) {
    alert("⚠️ Thiếu Course ID hoặc file");
    return;
  }

  const formData = new FormData();
  formData.append("course_id", courseId);
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/syllabus/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "❌ Update thất bại");
      return;
    }

    document.getElementById("resubmitBox").style.display = "block";
    alert("✅ Update thành công");
  } catch (err) {
    console.error(err);
    alert("❌ Không kết nối được server");
  }
};

/* =========================
   RESUBMIT
========================= */
window.resubmitSyllabus = async function () {
  const syllabusId = document.getElementById("syllabus_id_update").value;
  const token = localStorage.getItem("access_token");

  if (!syllabusId) {
    alert("⚠️ Thiếu syllabus_id");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/syllabus/resubmit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ syllabus_id: syllabusId })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "❌ Resubmit thất bại");
      return;
    }

    alert("🔁 Resubmit thành công");
    showSection("dashboard");
  } catch (err) {
    console.error(err);
    alert("❌ Không kết nối được server");
  }
};

window.loadManageSyllabus = async function () {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("❌ Chưa đăng nhập");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/syllabus/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "❌ Không lấy được danh sách đề cương");
      return;
    }

    const tbody = document.getElementById("syllabusTableBody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;">
            📭 Chưa có đề cương nào
          </td>
        </tr>
      `;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.course_code}</td>
        <td>${item.course_name}</td>
        <td>${item.version}</td>
        <td>
          <span class="status ${item.status.toLowerCase()}">
            ${item.status}
          </span>
        </td>
        <td>${item.created_at}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert("❌ Lỗi kết nối server");
  }
};

/* =========================
   LOGOUT
========================= */
window.logout = function () {
  localStorage.clear();
  window.location.href = "login.html";
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");

  document.querySelectorAll(".card[data-target]").forEach(card => {
    card.addEventListener("click", () => {
      showSection(card.dataset.target);
    });
  });
});
