import { requireUser, dashboardStats, db, escapeHtml } from "./backend.js";

async function load() {
    const user = await requireUser();
    if (!user) return;
    const stats = await dashboardStats(user.id);

    const title = document.querySelector(".section-title");
    if (title) title.innerHTML = `Welcome${stats.name ? ", " + escapeHtml(stats.name) : ""} to Your Dashboard 👋`;

    const values = [
        `${stats.reviews} Review${stats.reviews === 1 ? "" : "s"}`,
        `${stats.favorites} Café${stats.favorites === 1 ? "" : "s"}`,
        `${stats.visits} Café${stats.visits === 1 ? "" : "s"}`,
    ];
    document.querySelectorAll(".feature-container .card p").forEach((p, i) => {
        if (values[i]) p.textContent = values[i];
    });

    const nav = document.querySelector(".nav-links");
    if (nav) {
        const li = document.createElement("li");
        li.innerHTML = '<a href="#" id="logoutLink">Logout</a>';
        nav.appendChild(li);
        document.getElementById("logoutLink").addEventListener("click", async (e) => {
            e.preventDefault();
            await db.auth.signOut();
            window.location.href = "login.html";
        });
    }
}

load().catch((error) => console.error("Could not load dashboard.", error));
