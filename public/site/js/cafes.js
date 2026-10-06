import { listCafes, escapeHtml } from "./backend.js";

const searchInput = document.getElementById("searchCafe");
const container = document.getElementById("cafeContainer");

function applySearch() {
    const searchValue = searchInput.value.toLowerCase();
    document.querySelectorAll(".cafe-card").forEach(function (cafe) {
        const name = cafe.dataset.name.toLowerCase();
        cafe.style.display = name.includes(searchValue) ? "block" : "none";
    });
}

searchInput.addEventListener("keyup", applySearch);

window.filterCafes = function (category) {
    document.querySelectorAll(".cafe-card").forEach(function (cafe) {
        const categories = cafe.dataset.category;
        cafe.style.display = (category === "all" || categories.includes(category)) ? "block" : "none";
    });
};

// Load cafés from the database, keeping the exact same card markup.
listCafes().then(function (cafes) {
    container.innerHTML = cafes.map(function (c) {
        return `
        <div class="card cafe-card"
             data-name="${escapeHtml(c.name)}"
             data-category="${escapeHtml(c.categories.join(" "))}">
            <div class="cafe-image">${escapeHtml(c.icon)}</div>
            <h3>${escapeHtml(c.name)}</h3>
            <p>📍 ${escapeHtml(c.location)}</p>
            <p>📶 ${c.wifi ? "Wi-Fi Available" : "No Wi-Fi"}</p>
            <p>⭐ ${c.rating}/5</p>
            <a href="cafe-details.html?id=${c.id}" class="btn">View Details</a>
        </div>`;
    }).join("");
    applySearch();
}).catch(function (error) {
    console.error("Could not load cafés, showing built-in list.", error);
});
