// ================== CONFIG ==================
const API_BASE = "http://localhost:9999";
const TOKEN = localStorage.getItem("access_token");

let currentSyllabusId = null;

// ================== COMMON ==================
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + TOKEN
  };
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec =>
    sec.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
}


// ================== LOAD SYLLABUS BY COURSE ==================
async function loadMyCourses() {
  try {
    const res = await fetch(
      `${API_BASE}/student/syllabus/list`,
      { headers: authHeaders() }
    );

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    renderCourseList(data);

  } catch (err) {
    alert("❌ Không tải được danh sách đề cương");
    console.error(err);
  }
}

function renderCourseList(list) {
  const container = document.getElementById("courseList");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = "<p>📭 Chưa có môn học nào.</p>";
    return;
  }

  const colors = ["green", "red", "blue", "purple", "orange"];

  list.forEach((item, index) => {
    const card = document.createElement("div");

    // 👉 dùng class card + màu có sẵn trong CSS
    card.className = `card ${colors[index % colors.length]}`;

    card.innerHTML = `
      <div class="card-header"></div>

      <div class="card-body">
        <div class="code">${item.course_code}</div>
        <h3>${item.course_name}</h3>
        <p>Trạng thái: 
          <span class="status approved">${item.status}</span>
        </p>
      </div>
    `;

    card.onclick = () => {
      openSyllabus(item.syllabus_id, item.course_name);
    };

    container.appendChild(card);
  });
}


// ================== SYLLABUS DETAIL ==================
function openSyllabus(syllabusId, courseName) {
  currentSyllabusId = syllabusId;

  showSection("section-syllabus");
  document.getElementById("courseName").innerText = courseName;

  fetch(`${API_BASE}/student/syllabus/${syllabusId}`, {
    headers: {
      "Authorization": "Bearer " + TOKEN
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then(data => {
      console.log("SYLLABUS DATA:", data);

      // ✅ QUAN TRỌNG: render file ở đây
      renderSyllabusFile(data.file_path);
    })
    .catch(err => {
      alert("❌ Không tải được đề cương");
      console.error(err);
    });
}

function renderSyllabusFile(filePath) {
  const container = document.getElementById("syllabusFile");

  if (!filePath) {
    container.innerHTML = "<em>Chưa có đề cương</em>";
    return;
  }

  const url = `http://localhost:9999/${filePath}`;
  const ext = filePath.split(".").pop().toUpperCase();

  if (filePath.endsWith(".pdf")) {
    container.innerHTML = `
      <iframe
        src="${url}"
        width="100%"
        height="550px"
        style="border:1px solid #ddd; border-radius:8px;"
      ></iframe>
    `;
  } else {
    container.innerHTML = `
      <p><b>📄 File đề cương (${ext})</b></p>

      <div style="margin-top:10px">
        <a href="${url}" target="_blank" class="btn primary">
          ⬇ Tải đề cương
        </a>
      </div>
    `;
  }
}


// ================== SEARCH ==================
// ================== SEARCH ==================
async function searchSyllabus() {
  const keyword = document.getElementById("keyword").value.trim();

  // Không nhập → load lại danh sách ban đầu
  if (!keyword) {
    loadMyCourses();
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/student/syllabus/syllabus/search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          "Authorization": "Bearer " + TOKEN
        }
      }
    );

    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    renderCourseList(data);

  } catch (err) {
    alert("❌ Lỗi tìm kiếm đề cương");
    console.error(err);
  }
}

// ================== SUBSCRIBE ==================
async function followSyllabus() {
  if (!currentSyllabusId) {
    alert("❗ Chưa chọn đề cương");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/student/syllabus/subscribe`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          syllabus_id: currentSyllabusId
        })
      }
    );

    if (!res.ok) throw new Error();

    alert("⭐ Đã theo dõi đề cương");

  } catch (err) {
    alert("❌ Theo dõi thất bại");
    console.error(err);
  }
}

// ================== FEEDBACK ==================
async function sendFeedback() {
  const content = document.getElementById("feedbackText").value.trim();

  if (!currentSyllabusId || !content) {
    alert("❗ Thiếu nội dung phản hồi");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/student/syllabus/feedback`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          syllabus_id: currentSyllabusId,
          content: content
        })
      }
    );

    if (!res.ok) throw new Error();

    alert("✅ Gửi phản hồi thành công");
    document.getElementById("feedbackText").value = "";

  } catch (err) {
    alert("❌ Gửi phản hồi thất bại");
    console.error(err);
  }
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  if (!TOKEN) {
    alert("⚠️ Vui lòng đăng nhập");
    window.location.href = "login.html";
    return;
  }
  loadMyCourses();
});

// ================== LOGOUT ==================
function logout() {

  // Xóa token
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Chuyển về trang login
  window.location.href = "login.html";
}

