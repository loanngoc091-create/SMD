document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:9999/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ✅ KIỂM TRA DATA
    if (!data.access_token || !data.user || !data.user.role) {
      console.error("Invalid login response", data);
      alert("Login response không hợp lệ");
      return;
    }

    const role = data.user.role;

    // ✅ LƯU LOCALSTORAGE
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("role", role);

    console.log("SAVED ROLE:", localStorage.getItem("role"));

    const roleRedirectMap = {
      "STUDENT": "student.html",
      "LECTURER": "lecturer.html",
      "HOD": "hod.html",
      "ACADEMIC_AFFAIRS": "academic_affairs.html",
      "PRINCIPAL": "principal.html"
    };

    const redirectPage = roleRedirectMap[role];

    if (!redirectPage) {
      alert("Không có quyền với role: " + role);
      return;
    }

    window.location.href = redirectPage;

  } catch (err) {
    console.error(err);
    alert("Cannot connect to server");
  }
});
