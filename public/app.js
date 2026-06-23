const API = window.location.origin;
const views = document.getElementById("views");
const toast = document.getElementById("toast");

const storage = {
  get token() {
    return localStorage.getItem("ss_token");
  },
  set token(value) {
    if (value) localStorage.setItem("ss_token", value);
    else localStorage.removeItem("ss_token");
  },
};

const showToast = (message) => {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2500);
};

const request = async (path, options = {}) => {
  const headers = options.headers || {};
  if (storage.token) headers["Authorization"] = `Bearer ${storage.token}`;
  headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const render = (html) => {
  views.innerHTML = html;
};

let currentUserData = null;
let currentSkills = [];

const renderSkillCards = (skills, user) => skills.map(
  (skill) => `
    <div class="card">
      <h3>${skill.title}</h3>
      <p>${skill.description}</p>
      <p class="small">Posted by ${skill.owner.name} • ${skill.tags.join(", ")}</p>
      <div class="horizontal">
        <button class="detailsBtn" data-id="${skill._id}">View details</button>
        ${String(skill.owner._id) === String(user._id)
          ? `<button class="deleteBtn" data-id="${skill._id}">Delete</button>`
          : `<button class="requestBtn" data-id="${skill._id}">Request this skill</button>`}
      </div>
    </div>
  `
).join("");

const updateSkillList = () => {
  const query = document.getElementById("skillSearch").value.trim().toLowerCase();
  const container = document.getElementById("skillList");
  const filteredSkills = currentSkills.filter((skill) => {
    return [skill.title, skill.description, skill.location, ...(skill.tags || [])]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  container.innerHTML = filteredSkills.length === 0
    ? `<p class="small">No skills match your search.</p>`
    : renderSkillCards(filteredSkills, currentUserData);

  container.querySelectorAll(".detailsBtn").forEach((btn) => {
    btn.onclick = () => navigate(`skill/${btn.dataset.id}`);
  });
  container.querySelectorAll(".requestBtn").forEach((btn) => {
    btn.onclick = () => createRequest(btn.dataset.id);
  });
  container.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = () => deleteSkill(btn.dataset.id);
  });
};

const navigate = async (view) => {
  const hash = `#${view}`;
  if (window.location.hash === hash) {
    return route();
  }
  window.location.hash = view;
};

const renderLogin = () => {
  render(`
    <section class="card">
      <h2>Login</h2>
      <label>Email</label><input id="email" type="email" />
      <label>Password</label><input id="password" type="password" />
      <button id="loginBtn">Login</button>
      <p class="small">Don’t have an account? <a href="#register">Register</a></p>
    </section>
  `);
  document.getElementById("loginBtn").onclick = login;
};

const renderRegister = () => {
  render(`
    <section class="card">
      <h2>Register</h2>
      <label>Name</label><input id="name" type="text" />
      <label>Email</label><input id="email" type="email" />
      <label>Password</label><input id="password" type="password" />
      <button id="registerBtn">Register</button>
      <p class="small">Already have an account? <a href="#login">Login</a></p>
    </section>
  `);
  document.getElementById("registerBtn").onclick = register;
};

const renderDashboard = async () => {
  const user = await request("/api/auth/me");
  const skills = await request("/api/skills");
  const receivedRequests = await request("/api/requests/received");
  const myRequests = await request("/api/requests/mine");

  currentUserData = user;
  currentSkills = skills;

  render(`
    <section class="card">
      <div class="horizontal">
        <div>
          <h2>Welcome, ${user.name}</h2>
          <p class="small">${user.email}</p>
        </div>
        <div class="horizontal">
          <button id="profileBtn">Edit profile</button>
          <button id="mySkillsBtn">My skills</button>
          <button id="historyBtn">Request history</button>
          <button id="logoutBtn">Logout</button>
        </div>
      </div>
    </section>
    <section class="card">
      <h2>Create Skill</h2>
      <label>Title</label><input id="skillTitle" type="text" />
      <label>Description</label><textarea id="skillDescription"></textarea>
      <label>Tags (comma separated)</label><input id="skillTags" type="text" />
      <label>Location</label><input id="skillLocation" type="text" />
      <button id="createSkillBtn">Post Skill</button>
    </section>
    <section class="card">
      <h2>Available Skills</h2>
      <label>Search skills</label>
      <input id="skillSearch" type="search" placeholder="Search by title, tags, or location" />
      <div id="skillList">
        ${skills.length === 0 ? `<p class="small">No skills available yet.</p>` : renderSkillCards(skills, user)}
      </div>
    </section>
    <section class="card">
      <h2>Your Requests</h2>
      ${myRequests.length === 0 ? `<p class="small">You have not sent any requests yet.</p>` : myRequests.map(req => `
        <div class="card">
          <h3>${req.skill.title}</h3>
          ${req.message ? `<p>${req.message}</p>` : ''}
          <p class="small">Status: ${req.status}</p>
        </div>
      `).join("")}
    </section>
    <section class="card">
      <h2>Received Requests</h2>
      ${receivedRequests.length === 0 ? `<p class="small">No requests received yet.</p>` : receivedRequests.map(req => `
        <div class="card">
          <h3>${req.skill.title}</h3>
          <p class="small">From: ${req.requester.name} • ${req.requester.email}</p>
          ${req.message ? `<p>${req.message}</p>` : ''}
          <p class="small">Status: ${req.status}</p>
          <div class="horizontal">
            <button class="acceptBtn" data-id="${req._id}">Accept</button>
            <button class="rejectBtn" data-id="${req._id}">Reject</button>
          </div>
        </div>
      `).join("")}
    </section>
  `);

  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("profileBtn").onclick = () => navigate("profile");
  document.getElementById("mySkillsBtn").onclick = () => navigate("my-skills");
  document.getElementById("historyBtn").onclick = () => navigate("history");
  document.getElementById("createSkillBtn").onclick = createSkill;
  document.getElementById("skillSearch").addEventListener("input", updateSkillList);
  document.querySelectorAll(".detailsBtn").forEach((btn) => {
    btn.onclick = () => navigate(`skill/${btn.dataset.id}`);
  });
  document.querySelectorAll(".requestBtn").forEach((btn) => {
    btn.onclick = () => createRequest(btn.dataset.id);
  });
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = () => deleteSkill(btn.dataset.id);
  });
  document.querySelectorAll('.acceptBtn').forEach(btn => btn.onclick = () => updateRequestStatus(btn.dataset.id, 'accepted'));
  document.querySelectorAll('.rejectBtn').forEach(btn => btn.onclick = () => updateRequestStatus(btn.dataset.id, 'rejected'));
};

const updateRequestStatus = async (requestId, status) => {
  try {
    await request(`/api/requests/${requestId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast(`Request ${status}`);
    await navigate('dashboard');
  } catch (error) {
    showToast(error.message);
  }
};

const login = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }

    const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    storage.token = data.token;
    await navigate("dashboard");
    showToast("Logged in successfully");
  } catch (error) {
    showToast(error.message);
  }
};

const register = async () => {
  try {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
      showToast("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    const data = await request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    storage.token = data.token;
    await navigate("dashboard");
    showToast("Account created successfully");
  } catch (error) {
    showToast(error.message);
  }
};

const logout = () => {
  storage.token = null;
  window.location.hash = "login";
  showToast("Logged out");
};

const createSkill = async () => {
  try {
    const title = document.getElementById("skillTitle").value.trim();
    const description = document.getElementById("skillDescription").value.trim();
    const tags = document.getElementById("skillTags").value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const location = document.getElementById("skillLocation").value.trim();

    if (!title || !description) {
      showToast("Title and description are required.");
      return;
    }

    await request("/api/skills", { method: "POST", body: JSON.stringify({ title, description, tags, location }) });
    showToast("Skill posted");
    await navigate("dashboard");
  } catch (error) {
    showToast(error.message);
  }
};

const deleteSkill = async (skillId) => {
  try {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    await request(`/api/skills/${skillId}`, { method: "DELETE" });
    showToast("Skill deleted");
    await navigate("dashboard");
  } catch (error) {
    showToast(error.message);
  }
};

const createRequest = async (skillId) => {
  try {
    if (!storage.token) {
      showToast("Please login to request a skill.");
      window.location.hash = "login";
      return;
    }

    const message = prompt("Enter a message for the skill owner (optional):");
    if (message === null) return;
    const body = { skillId };
    if (message.trim() !== "") body.message = message.trim();

    await request("/api/requests", { method: "POST", body: JSON.stringify(body) });
    showToast("Request sent");
    await navigate("dashboard");
  } catch (error) {
    showToast(error.message);
  }
};

const renderProfile = async () => {
  if (!storage.token) {
    window.location.hash = "login";
    return;
  }

  const user = await request("/api/profile/me");

  render(`
    <section class="card">
      <button id="backBtn">Back to dashboard</button>
      <h2>Edit Profile</h2>
      <label>Name</label><input id="profileName" type="text" value="${user.name}" />
      <label>Email</label><input id="profileEmail" type="email" value="${user.email}" />
      <label>New Password</label><input id="profilePassword" type="password" placeholder="Leave blank to keep current password" />
      <button id="saveProfileBtn">Save changes</button>
    </section>
  `);

  document.getElementById("backBtn").onclick = () => navigate("dashboard");
  document.getElementById("saveProfileBtn").onclick = updateProfile;
};

const renderHistory = async () => {
  if (!storage.token) {
    window.location.hash = "login";
    return;
  }

  const sentRequests = await request("/api/requests/mine");
  const receivedRequests = await request("/api/requests/received");

  render(`
    <section class="card">
      <button id="backBtn">Back to dashboard</button>
      <h2>Request History</h2>
      <h3>Your sent requests</h3>
      ${sentRequests.length === 0 ? `<p class="small">No sent requests yet.</p>` : sentRequests.map((req) => `
        <div class="card">
          <h3>${req.skill.title}</h3>
          ${req.message ? `<p>${req.message}</p>` : ''}
          <p class="small">Status: ${req.status}</p>
          <p class="small">Requested: ${new Date(req.createdAt).toLocaleString()}</p>
        </div>
      `).join("")}
      <h3>Requests received</h3>
      ${receivedRequests.length === 0 ? `<p class="small">No received requests yet.</p>` : receivedRequests.map((req) => `
        <div class="card">
          <h3>${req.skill.title}</h3>
          <p class="small">From: ${req.requester.name} • ${req.requester.email}</p>
          ${req.message ? `<p>${req.message}</p>` : ''}
          <p class="small">Status: ${req.status}</p>
          <p class="small">Received: ${new Date(req.createdAt).toLocaleString()}</p>
        </div>
      `).join("")}
    </section>
  `);

  document.getElementById("backBtn").onclick = () => navigate("dashboard");
};

const updateProfile = async () => {
  try {
    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const password = document.getElementById("profilePassword").value;

    if (!name || !email) {
      showToast("Name and email are required.");
      return;
    }

    if (password && password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    const body = { name, email };
    if (password) body.password = password;

    const data = await request("/api/profile/me", { method: "PUT", body: JSON.stringify(body) });
    if (data.token) {
      storage.token = data.token;
    }

    showToast("Profile updated successfully");
    await navigate("dashboard");
  } catch (error) {
    showToast(error.message);
  }
};

const renderSkillDetails = async (skillId) => {
  try {
    const skill = await request(`/api/skills/${skillId}`);
    let user = null;

    if (storage.token) {
      try {
        user = await request("/api/auth/me");
      } catch {
        user = null;
      }
    }

    const isOwner = user && String(skill.owner._id) === String(user._id);

    render(`
      <section class="card">
        <button id="backBtn">Back to dashboard</button>
        <h2>${skill.title}</h2>
        <p>${skill.description}</p>
        <p class="small">Posted by ${skill.owner.name} • ${skill.tags.join(", ")}</p>
        ${skill.location ? `<p class="small">Location: ${skill.location}</p>` : ""}
        <p class="small">Created: ${new Date(skill.createdAt).toLocaleString()}</p>
        ${isOwner ? `<p class="small">This is your skill.</p>` : user ? `<button id="requestSkillBtn">Request this skill</button>` : `<p class="small">Login to request this skill.</p>`}
      </section>
    `);

    document.getElementById("backBtn").onclick = () => navigate("dashboard");
    const requestButton = document.getElementById("requestSkillBtn");
    if (requestButton) {
      requestButton.onclick = () => createRequest(skillId);
    }
  } catch (error) {
    showToast(error.message);
    window.location.hash = "dashboard";
  }
};

const renderMySkills = async () => {
  if (!storage.token) {
    window.location.hash = "login";
    return;
  }

  const skills = await request("/api/skills/mine");
  const user = await request("/api/auth/me");

  currentUserData = user;
  currentSkills = skills;

  render(`
    <section class="card">
      <div class="horizontal">
        <div>
          <h2>My Skills</h2>
          <p class="small">Manage the skills you've posted.</p>
        </div>
        <div class="horizontal">
          <button id="backBtn">Dashboard</button>
          <button id="createSkillBtn">Create skill</button>
        </div>
      </div>
    </section>
    <section class="card">
      <div id="skillList">
        ${skills.length === 0 ? `<p class="small">You have not posted any skills yet.</p>` : renderSkillCards(skills, user)}
      </div>
    </section>
  `);

  document.getElementById("backBtn").onclick = () => navigate("dashboard");
  document.getElementById("createSkillBtn").onclick = () => navigate("dashboard");
  document.querySelectorAll(".detailsBtn").forEach((btn) => {
    btn.onclick = () => navigate(`skill/${btn.dataset.id}`);
  });
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = () => deleteSkill(btn.dataset.id);
  });
};

const route = async () => {
  const view = window.location.hash.replace("#", "") || "login";
  try {
    if (view === "register") renderRegister();
    else if (view === "dashboard") {
      if (!storage.token) {
        window.location.hash = "login";
        return;
      }
      await renderDashboard();
    } else if (view === "profile") {
      await renderProfile();
    } else if (view === "my-skills") {
      await renderMySkills();
    } else if (view === "history") {
      await renderHistory();
    } else if (view.startsWith("skill/")) {
      const [, skillId] = view.split("/");
      await renderSkillDetails(skillId);
    } else renderLogin();
  } catch (error) {
    storage.token = null;
    window.location.hash = "login";
    showToast(error.message);
  }
};

window.addEventListener("hashchange", route);
window.addEventListener("load", route);
