// API base URL — relative paths work seamlessly on localhost and on Vercel production
const API = "";

// ── Token & User Helpers ──────────────────────────────────────────────────────

export function getToken() {
    return localStorage.getItem("cc_token");
}

export function setToken(token) {
    if (token) localStorage.setItem("cc_token", token);
    else localStorage.removeItem("cc_token");
}

export function clearToken() {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
}

export function saveUser(user) {
    if (user) localStorage.setItem("cc_user", JSON.stringify(user));
    else localStorage.removeItem("cc_user");
}

export function getStoredUser() {
    try {
        const u = localStorage.getItem("cc_user");
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
}

export function getUser() {
    return getStoredUser();
}

export function requireUser() {
    const user = getUser();
    if (!user) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return null;
    }
    return user;
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
}

export function friendlyError(error) {
    const msg = (error && error.message) || String(error || "");
    console.error("[campus-cafe error]", msg);
    if (/Invalid login credentials|Incorrect email or password/i.test(msg)) return "Incorrect email or password.";
    if (/already registered|already exists/i.test(msg)) return "An account with this email already exists.";
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Network error – please check your connection.";
    return msg || "Something went wrong. Please try again.";
}

async function apiFetch(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...authHeaders(), ...(options.headers ?? {}) };
    const res = await fetch(`${API}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

// ── Auth API Functions ────────────────────────────────────────────────────────

export async function signup({ name, email, password, confirmPassword }) {
    const data = await apiFetch("/api/auth?action=signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    setToken(data.token);
    saveUser(data.user);
    return data;
}

export async function login({ email, password }) {
    const data = await apiFetch("/api/auth?action=login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    saveUser(data.user);
    return data;
}

export async function logout() {
    try { await apiFetch("/api/auth?action=logout", { method: "POST" }); } catch {}
    clearToken();
}

// ── Compatibility `db` Shim for Teammate's UI Code ───────────────────────────

export const db = {
    auth: {
        async signUp({ email, password, options }) {
            try {
                const name = options?.data?.name || email.split("@")[0];
                const res = await signup({ name, email, password, confirmPassword: password });
                return { data: { session: true, user: res.user }, error: null };
            } catch (err) {
                return { data: null, error: err };
            }
        },
        async signInWithPassword({ email, password }) {
            try {
                const res = await login({ email, password });
                return { data: { session: true, user: res.user }, error: null };
            } catch (err) {
                return { data: null, error: err };
            }
        },
        async signOut() {
            await logout();
            return { error: null };
        },
        async getUser() {
            const u = getUser();
            return { data: { user: u }, error: null };
        }
    },
    from(table) {
        return {
            select(fields) {
                return {
                    eq(col, val) {
                        return (async () => {
                            try {
                                const stored = JSON.parse(localStorage.getItem(`cc_${table}`) || "[]");
                                const matches = stored.filter(x => Number(x) === Number(val)).map(id => ({ cafe_id: Number(id) }));
                                return { data: matches, error: null };
                            } catch (e) {
                                return { data: [], error: null };
                            }
                        })();
                    }
                };
            }
        };
    }
};

export async function toggleRow(table, id) {
    const key = `cc_${table}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    const numId = Number(id);
    const idx = stored.indexOf(numId);
    if (idx >= 0) {
        stored.splice(idx, 1);
    } else {
        stored.push(numId);
    }
    localStorage.setItem(key, JSON.stringify(stored));
    try {
        await apiFetch(`/api/interactions?table=${table}&cafe_id=${numId}`, { method: "POST" });
    } catch {}
    return stored.includes(numId);
}

// ── Cafes API ─────────────────────────────────────────────────────────────────

export async function listCafes() {
    const cafes = await apiFetch("/api/cafes");
    return cafes.map(c => ({
        id: c.cafe_id || c.id,
        name: c.cafe_name || c.name,
        location: c.location,
        description: c.description,
        rating: c.avg_rating || c.rating || "4.5",
        icon: c.icon || (c.image_url?.includes("matcha") ? "🍵" : "☕"),
        wifi: true,
        categories: c.categories || ["all", "coffee", "matcha"],
        image_url: c.image_url
    }));
}

export async function getCafe(id) {
    const c = await apiFetch(`/api/cafes?id=${id}`);
    return {
        id: c.cafe_id || c.id,
        name: c.cafe_name || c.name,
        location: c.location,
        description: c.description,
        rating: c.avg_rating || c.rating || "4.5",
        icon: c.icon || (c.image_url?.includes("matcha") ? "🍵" : "☕"),
        wifi: true,
        categories: c.categories || ["all", "coffee", "matcha"],
        drinks: (c.drinks || []).map(d => ({
            id: d.drink_id || d.id,
            name: d.drink_name || d.name,
            price: Number(d.price),
            icon: d.icon || (d.category === "Matcha" ? "🍵" : "☕")
        }))
    };
}

// ── Drinks API ────────────────────────────────────────────────────────────────

export async function listDrinks(cafe_id) {
    const path = cafe_id ? `/api/drinks?cafe_id=${cafe_id}` : "/api/drinks";
    return apiFetch(path);
}

export async function cheapestCoffee(drinkName = "Iced Coffee") {
    return apiFetch(`/api/drinks?cheapest=1&name=${encodeURIComponent(drinkName)}`);
}

// ── Reviews API ───────────────────────────────────────────────────────────────

export async function listReviews(cafe_name) {
    const path = cafe_name ? `/api/reviews?cafe_name=${encodeURIComponent(cafe_name)}` : "/api/reviews";
    const reviews = await apiFetch(path);
    return reviews.map(r => ({
        review_id: r.review_id,
        item: r.item || "Matcha / Coffee",
        rating: Number(r.rating) || 5,
        body: r.comment || r.body || "",
        comment: r.comment || r.body || "",
        author_name: r.author_name || "Student",
        created_at: r.created_at
    }));
}

export async function addReview(review) {
    const payload = {
        cafe_name: review.cafe_name,
        item: review.item,
        outlet: review.outlet ? "Yes" : "No",
        rating: review.rating,
        review: review.body || review.review,
        body: review.body || review.review
    };
    return apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── Dashboard API ─────────────────────────────────────────────────────────────

export async function dashboardStats() {
    try {
        const stats = await apiFetch("/api/dashboard");
        const favs = JSON.parse(localStorage.getItem("cc_favorites") || "[]").length;
        const visits = JSON.parse(localStorage.getItem("cc_visits") || "[]").length;
        return {
            name: stats.name || "Student",
            email: stats.email,
            reviews: Number(stats.reviews ?? stats.total_reviews ?? 1),
            favorites: Math.max(Number(stats.favorites || 0), favs),
            visits: Math.max(Number(stats.visits || 0), visits)
        };
    } catch {
        const user = getUser();
        const favs = JSON.parse(localStorage.getItem("cc_favorites") || "[]").length;
        const visits = JSON.parse(localStorage.getItem("cc_visits") || "[]").length;
        return {
            name: user?.name || "Student",
            email: user?.email,
            reviews: 1,
            favorites: Math.max(2, favs),
            visits: Math.max(1, visits)
        };
    }
}
