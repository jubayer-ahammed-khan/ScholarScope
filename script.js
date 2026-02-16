// Check if user is already logged in
if (localStorage.getItem("isLoggedIn") === "true") {
  // redirect to index.html
  window.location.href = "index.html";
}

// Form submit
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Simple simulation: accept any email/password
  if(email && password) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    alert("Login successful!");
    window.location.href = "index.html";
  }
});
