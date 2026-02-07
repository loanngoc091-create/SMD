/* =======================
   CONFIG
======================= */
const API_SYLLABUS_LIST = "http://localhost:9999/syllabus/list";
const API_VERIFY = "http://localhost:9999/syllabus/verify";
const API_PUBLISH = "http://localhost:9999/api/publish";
const API_PUBLISH_LIST = "http://localhost:9999/api/publish/list";
const API_PLO_LIST = "http://localhost:9999/syllabus/api/plo";


const token = localStorage.getItem("access_token");

/* =======================
   AUTH CHECK
======================= */
if (!token) {
  alert("⚠️ Bạn chưa đăng nhập");
  window.location.href = "login.html";
}

/* =======================
   SECTION SWITCH
======================= */
window.showSection = function (id) {
  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.remove("active"));

  const target = document.getElementById(id);
  if (!target) return;

  target.classList.add("active");

  // 🔥 LOAD DATA ĐÚNG SECTION
  if (id === "section-approve") {
    loadApproveList();
  }

  if (id === "section-publish") {
    loadPublishList();
  }
};

/* =======================
   CARD CLICK
======================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const target = card.dataset.target;
      if (target) showSection(target);
    });
  });
});

/* =======================
   LOAD APPROVE LIST (AA)
======================= */
async function loadApproveList() {
  const tbody = document.getElementById("approveTable");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4">⏳ Đang tải...</td></tr>`;

  try {
    const res = await fetch(API_SYLLABUS_LIST, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không tải được dữ liệu");

    // 🔥 chỉ lấy đề cương đã HoD duyệt
    const list = data.filter(s => s.status === "HodApproved");

    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML =
        `<tr><td colspan="4">📭 Không có đề cương cần phê duyệt</td></tr>`;
      return;
    }

    list.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.course_name}</td>
          <td><span class="status-pending">Chờ AA</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-approve" data-id="${s.id}">✔ Duyệt</button>
              <button class="btn-reject" data-id="${s.id}">✖ Trả lại</button>
            </div>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    tbody.innerHTML =
      `<tr><td colspan="4">❌ ${err.message}</td></tr>`;
  }
}

/* =======================
   APPROVE / REJECT (AA)
======================= */
document.addEventListener("click", async (e) => {
  const approveBtn = e.target.closest(".btn-approve");
  const rejectBtn  = e.target.closest(".btn-reject");

  if (!approveBtn && !rejectBtn) return;

  const syllabusId = (approveBtn || rejectBtn).dataset.id;
  const decision = approveBtn ? "Approved" : "Rejected";

  try {
    const res = await fetch(API_VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        syllabus_id: syllabusId,
        decision: decision
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verify failed");

    // ✅ Update UI
    const row = (approveBtn || rejectBtn).closest("tr");
    row.querySelector(".action-buttons").innerHTML = `
      <span class="status-badge ${decision === "Approved" ? "approved" : "rejected"}">
        ${decision === "Approved" ? "✔ AA Đã duyệt" : "✖ AA Trả lại"}
      </span>
    `;

  } catch (err) {
    alert("❌ " + err.message);
  }
});

/* =======================
   LOAD PUBLISH LIST (AA)
======================= */
async function loadPublishList() {
  
  console.log("🔥 CALLING:", API_PUBLISH_LIST);
  const tbody = document.getElementById("publishTable");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4">⏳ Đang tải...</td></tr>`;

  try {
    const res = await fetch(API_PUBLISH_LIST, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const text = await res.text();
    console.log("RAW PUBLISH RESPONSE:", text);

    if (!res.ok) throw new Error("API publish list failed");

    const data = JSON.parse(text);

    // ✅ TỰ ĐỘNG NHẬN DẠNG FORMAT
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
        ? data.data
        : [];

    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML =
        `<tr><td colspan="4">📭 Không có đề cương chờ publish</td></tr>`;
      return;
    }

    list.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.course_name}</td>
          <td>${s.status}</td>
          <td>
            <button class="btn success" onclick="publishSyllabus(${s.id})">
              📢 Publish
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("LOAD PUBLISH ERROR:", err);
    tbody.innerHTML =
      `<tr><td colspan="4">❌ Không tải được danh sách publish</td></tr>`;
  }
}


/* =======================
   PUBLISH SYLLABUS
======================= */
window.publishSyllabus = async function (id) {
  if (!confirm("Bạn chắc chắn muốn publish đề cương này?")) return;

  try {
    const res = await fetch(API_PUBLISH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ syllabus_id: id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Publish failed");

    alert("✅ Publish thành công");
    loadPublishList();

  } catch (err) {
    alert("❌ " + err.message);
  }
};

/* =======================
   PLACEHOLDER
======================= */
window.loadPLO = async function () {
  const tbody = document.getElementById("ploTable");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4">⏳ Đang tải danh sách PLO...</td>
    </tr>
  `;

  try {
    const res = await fetch(API_PLO_LIST, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không tải được PLO");

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">📭 Chưa có PLO nào</td>
        </tr>
      `;
      return;
    }

    data.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <!-- ID -->
          <td style="
            vertical-align: top;
            padding-left: 16px;
            white-space: nowrap;
          ">
            ${p.plo_id}
          </td>

          <!-- Mã PLO -->
          <td style="
            vertical-align: top;
            padding-left: 16px;
            white-space: nowrap;
          ">
            <strong>${p.plo_code}</strong>
          </td>

          <!-- Mô tả -->
          <td style="
            vertical-align: top;
            padding-left: 16px;
            padding-right: 20px;
          ">
            <div style="
              line-height: 1.7;
              text-align: justify;
              word-break: break-word;
            ">
              ${p.description || ""}
            </div>
          </td>

          <!-- Thao tác -->
          <td style="
            vertical-align: top;
            padding-left: 16px;
          ">
            <div style="
              display: flex;
              gap: 10px;
              align-items: center;
            ">
              <button class="btn success" onclick="editPLO(${p.plo_id})">
                ✏️ Sửa
              </button>
              <button class="btn danger" onclick="deletePLO(${p.plo_id})">
                🗑 Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">❌ ${err.message}</td>
      </tr>
    `;
  }
};


window.loadPrograms = function () {
  const container = document.getElementById("programResult");

  // ✅ FIX TRIỆT ĐỂ
  if (!container) {
    console.warn("programResult not found – skip loadPrograms()");
    return;
  }

  container.innerHTML = `
    <p>📌 Chức năng CTĐT sẽ bổ sung sau</p>
  `;
};

window.searchSyllabus = () => {
  const key = document.getElementById("searchKey").value;
  document.getElementById("searchResult").innerHTML =
    `<p>🔍 Kết quả tìm cho: <b>${key}</b></p>`;
};

window.logout = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", () => {
  loadApproveList();
});
