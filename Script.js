// @ts-nocheck
const publicView = document.getElementById("publicView");
const authView = document.getElementById("authView");
const systemView = document.getElementById("systemView");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const menuBtn = document.getElementById("menuBtn");

let activeFilter = "all";

function showPublicPage(page) {
  document.querySelectorAll(".public-page").forEach(p => p.classList.remove("active-page"));
  const target = document.getElementById(page + "Page");
  if (target) target.classList.add("active-page");

  document.querySelectorAll(".public-nav .nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });
  if (menuBtn) menuBtn.parentElement.classList.remove("menu-open");
  window.scrollTo({top:0, behavior:"smooth"});
}

function openAuth(type = "login") {
  publicView.classList.add("hidden");
  authView.classList.remove("hidden");
  loginForm.classList.toggle("hidden", type !== "login");
  signupForm.classList.toggle("hidden", type !== "signup");
  clearMessages();
  window.scrollTo(0,0);
}

function backHome() {
  authView.classList.add("hidden");
  publicView.classList.remove("hidden");
  showPublicPage("home");
}

function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  loginMessage.className = "form-message";
  signupMessage.className = "form-message";
}

document.querySelectorAll("[data-page]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    showPublicPage(el.dataset.page);
  });
});

document.querySelectorAll(".login-btn").forEach(btn => btn.addEventListener("click", () => openAuth("login")));
document.querySelectorAll(".signup-btn").forEach(btn => btn.addEventListener("click", () => openAuth("signup")));

document.getElementById("toSignup").addEventListener("click", () => openAuth("signup"));
document.getElementById("toLogin").addEventListener("click", () => openAuth("login"));
document.getElementById("backHome").addEventListener("click", e => {e.preventDefault(); backHome();});
document.querySelector(".home-auth").addEventListener("click", backHome);
document.querySelector(".about-auth").addEventListener("click", () => {
  authView.classList.add("hidden");
  publicView.classList.remove("hidden");
  showPublicPage("about");
});
menuBtn.addEventListener("click", () => menuBtn.parentElement.classList.toggle("menu-open"));

document.querySelectorAll(".eye-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
    btn.textContent = input.type === "password" ? "◉" : "◉";
  });
});

function getAccounts() {
  try { return JSON.parse(localStorage.getItem("finditAccounts") || "[]"); }
  catch { return []; }
}

signupForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (password !== confirm) {
    signupMessage.textContent = "Passwords do not match.";
    signupMessage.classList.add("error");
    return;
  }

  const accounts = getAccounts();
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    signupMessage.textContent = "An account with this email already exists.";
    signupMessage.classList.add("error");
    return;
  }

  accounts.push({name,email,password});
  localStorage.setItem("finditAccounts", JSON.stringify(accounts));
  signupMessage.textContent = "Account created! You can now log in.";
  signupMessage.classList.add("success");
  signupForm.reset();
  setTimeout(() => openAuth("login"), 700);
});

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const accounts = getAccounts();

  // Demo behavior: if no account exists, any non-empty email/password can enter.
  const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
  if (found || (email && password)) {
    const user = found || {name: email.split("@")[0], email};
    localStorage.setItem("finditLoggedIn", "true");
    localStorage.setItem("finditUser", JSON.stringify(user));
    showSystem(user);
  } else {
    loginMessage.textContent = "Please enter your school email and password.";
    loginMessage.classList.add("error");
  }
});

function showSystem(user) {
  publicView.classList.add("hidden");
  authView.classList.add("hidden");
  systemView.classList.remove("hidden");
  document.getElementById("profileName").textContent = user.name || "FindIt User";
  document.getElementById("profileEmail").textContent = user.email || "user@icct.edu.ph";
  document.getElementById("profileInitial").textContent = (user.name || "F").charAt(0).toUpperCase();
  showSystemSection("dashboard");
}

function showSystemSection(section) {
  document.querySelectorAll(".system-section").forEach(s => s.classList.remove("active-section"));
  const target = document.getElementById(section + "Section");
  if (target) target.classList.add("active-section");

  document.querySelectorAll(".side-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });

  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("open");
}

document.querySelectorAll(".side-link").forEach(btn => {
  btn.addEventListener("click", () => showSystemSection(btn.dataset.section));
});
document.querySelectorAll("[data-section-go]").forEach(btn => {
  btn.addEventListener("click", () => showSystemSection(btn.dataset.sectionGo));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("finditLoggedIn");
  localStorage.removeItem("finditUser");
  systemView.classList.add("hidden");
  publicView.classList.remove("hidden");
  showPublicPage("home");
});

document.getElementById("sideToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

const searchInput = document.getElementById("itemSearch");
const clearSearch = document.getElementById("clearSearch");
const noResults = document.getElementById("noResults");

function filterItems() {
  const query = searchInput.value.toLowerCase().trim();
  let visible = 0;

  document.querySelectorAll(".searchable").forEach(card => {
    const matchesText = !query || card.dataset.text.includes(query);
    const matchesFilter = activeFilter === "all" || card.dataset.status === activeFilter;
    const show = matchesText && matchesFilter;
    card.style.display = show ? "" : "block";
    if (!show) card.style.display = "none";
    if (show) visible++;
  });

  noResults.classList.toggle("hidden", visible !== 0);
}

searchInput.addEventListener("input", filterItems);
clearSearch.addEventListener("click", () => {searchInput.value = ""; filterItems();});

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    filterItems();
  });
});

// Keep the user on the public homepage when opening the project.
// Uncomment the block below if you want the browser to remember the last login.
// if (localStorage.getItem("finditLoggedIn") === "true") {
//   showSystem(JSON.parse(localStorage.getItem("finditUser") || "{}"));
// }
