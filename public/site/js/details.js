import { getCafe, listReviews, toggleRow, getUser, db, escapeHtml, friendlyError } from "./backend.js";

const id = Number(new URLSearchParams(window.location.search).get("id") || 1);

async function load() {
    if (!Number.isInteger(id) || id < 1) return;
    const cafe = await getCafe(id);
    if (!cafe) { document.getElementById("cafeName").textContent = "Café not found"; return; }

    document.querySelector(".details-image").textContent = cafe.icon;
    const info = document.querySelector(".details-info");
    info.innerHTML = `
        <h1 id="cafeName">${escapeHtml(cafe.name)}</h1>
        <p>📍 ${escapeHtml(cafe.location)}</p>
        <p>📶 Wi-Fi: ${cafe.wifi ? "Available" : "Not available"}</p>
        <p>⭐ Aesthetic Rating: ${cafe.rating}/5</p>
        <p>${escapeHtml(cafe.description)}</p>
        <p>
            <a href="#" class="btn" id="favBtn">❤️ Favourite</a>
            <a href="#" class="btn" id="visitBtn">📍 Mark Visited</a>
        </p>`;

    document.querySelector(".drink-container").innerHTML = cafe.drinks
        .sort((a, b) => a.price - b.price)
        .map((d) => `<div class="card"><h3>${escapeHtml(d.icon)} ${escapeHtml(d.name)}</h3><p>₹${d.price}</p></div>`)
        .join("");

    const reviews = await listReviews(cafe.name);
    const reviewCard = document.querySelector(".review-card");
    if (reviews.length && reviewCard) {
        const html = reviews.map((r) => `
            <div class="card review-card">
                <h3>Student Review · ${escapeHtml(r.item)}</h3>
                <p>${"⭐".repeat(r.rating)}</p>
                <p>${escapeHtml(r.body)}</p>
            </div>`).join("<br>");
        reviewCard.outerHTML = html;
    }

    const user = await getUser();
    const setLabels = async () => {
        if (!user) return;
        const [f, v] = await Promise.all([
            db.from("favorites").select("cafe_id").eq("cafe_id", id),
            db.from("visits").select("cafe_id").eq("cafe_id", id),
        ]);
        document.getElementById("favBtn").textContent = f.data && f.data.length ? "❤️ Favourited" : "❤️ Favourite";
        document.getElementById("visitBtn").textContent = v.data && v.data.length ? "📍 Visited" : "📍 Mark Visited";
    };
    await setLabels();

    for (const [btn, table] of [["favBtn", "favorites"], ["visitBtn", "visits"]]) {
        document.getElementById(btn).addEventListener("click", async (e) => {
            e.preventDefault();
            try { await toggleRow(table, id); await setLabels(); }
            catch (error) { alert(friendlyError(error)); }
        });
    }
}

load().catch((error) => console.error("Could not load café details.", error));
