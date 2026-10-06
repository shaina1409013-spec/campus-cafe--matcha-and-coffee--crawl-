import { query, hasDbConfig, SEED_REVIEWS } from "./_db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "campus_cafe_jwt_secret_production_key_2026";

function json(res, status, body) {
    res.status(status).json(body);
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return json(res, 401, { error: "Please log in." });

    let user;
    try {
        user = jwt.verify(token, JWT_SECRET);
    } catch {
        return json(res, 401, { error: "Session expired. Please log in again." });
    }

    let reviewCount = 1;
    let favCount = 2;
    let visitCount = 1;

    if (hasDbConfig()) {
        try {
            const [revRows] = await query("SELECT COUNT(*) AS total FROM reviews WHERE user_id = ?", [user.user_id]);
            reviewCount = Number(revRows?.total || 0);

            try {
                const [favRows] = await query("SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?", [user.user_id]);
                favCount = Number(favRows?.total || 0);
            } catch {}

            try {
                const [visRows] = await query("SELECT COUNT(*) AS total FROM visits WHERE user_id = ?", [user.user_id]);
                visitCount = Number(visRows?.total || 0);
            } catch {}
        } catch (err) {
            console.error("Dashboard DB query error:", err);
        }
    }

    return json(res, 200, {
        name:          user.name || "Student",
        email:         user.email,
        reviews:       reviewCount,
        total_reviews: reviewCount,
        favorites:     favCount,
        visits:        visitCount,
    });
}
