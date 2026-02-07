/* =======================
   CONFIG
======================= */
const API_SYLLABUS_LIST = "http://localhost:9999/syllabus/list";
const API_FINAL_APPROVAL = "http://localhost:9999/principal/final-approval";
const token = localStorage.getItem("access_token");

/* =======================
   AUTH CHECK
======================= */
if (!token) {
  alert("Bạn chưa đăng nhập");
  window.location.href = "login.html";
}

/* =======================
   SECTION SWITCH
======================= */
window.showSection = function (id) {
  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.remove("active"));

  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  // ✅ Chỉ load khi mở tab Phê duyệt
  if (id === "section-approval") {
    loadApproveList();
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
   LOAD SYLLABUS (PRINCIPAL)
======================= */
async function loadApproveList() {
  console.log("LOAD APPROVE LIST CALLED");

  const tbody = document.getElementById("approvalTable");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4">⏳ Đang tải...</td>
    </tr>
  `;

  try {
    const res = await fetch(API_SYLLABUS_LIST, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Không thể tải danh sách");

    const data = await res.json();
    console.log("API RESPONSE:", data);

    // ✅ chỉ lấy đề cương đã được Academic duyệt
    const list = data.filter(item => item.status === "AcademicApproved");

    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">📭 Không có đề cương chờ Hiệu trưởng duyệt</td>
        </tr>
      `;
      return;
    }

    list.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.course_name}</td>
        <td>Đề cương</td>
        <td>
          <div class="action-buttons">
            <button class="btn-approve" data-id="${item.id}">
              ✔ Duyệt
            </button>
            <button class="btn-reject" data-id="${item.id}">
              ✖ Từ chối
            </button>
          </div>
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

/* =======================
   APPROVE / REJECT
======================= */
document.addEventListener("click", async (e) => {
  const approveBtn = e.target.closest(".btn-approve");
  const rejectBtn  = e.target.closest(".btn-reject");

  if (!approveBtn && !rejectBtn) return;

  const syllabusId = (approveBtn || rejectBtn).dataset.id;
  const decision = approveBtn ? "APPROVED" : "REJECTED";

  const confirmMsg =
    decision === "APPROVED"
      ? "Bạn chắc chắn PHÊ DUYỆT đề cương này?"
      : "Bạn chắc chắn TỪ CHỐI đề cương này?";

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(API_FINAL_APPROVAL, {
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

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Duyệt thất bại");
    }

    // ✅ Update UI ngay sau khi duyệt
    const row = (approveBtn || rejectBtn).closest("tr");
    row.querySelector(".action-buttons").innerHTML = `
      <span class="status-badge ${decision === "APPROVED" ? "approved" : "rejected"}">
        ${decision === "APPROVED"
          ? "✔ Đã duyệt"
          : "✖ Từ chối"}
      </span>
    `;

  } catch (err) {
    alert("❌ " + err.message);
  }
});

/* =======================
   LOGOUT
======================= */
window.logout = () => {
  localStorage.clear();
  window.location.href = "login.html";
};
