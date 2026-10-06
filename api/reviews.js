import { query, hasDbConfig, SEED_REVIEWS } from "./_db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "campus_cafe_jwt_secret_production_key_2026";

function json(res, status, body) {
    res.status(status).json(body);
}

function cors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getTokenUser(req) {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// In-memory reviews list for demo mode when MySQL isn't connected
const localReviews = [...SEED_REVIEWS];

export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(204).end();

    // ── GET ───────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
        const { cafe_id, cafe_name } = req.query;

        if (hasDbConfig()) {
            try {
                let sql = `
                    SELECT r.review_id, r.cafe_id, r.rating, r.comment,
                           r.cafe_name, r.item, r.outlet_available, r.created_at,
                           COALESCE(u.name, 'Student') AS author_name
                    FROM reviews r
                    LEFT JOIN users u ON u.user_id = r.user_id
                `;
                const params = [];

                if (cafe_id) {
                    sql += " WHERE r.cafe_id = ?";
                    params.push(Number(cafe_id));
                } else if (cafe_name) {
                    sql += " WHERE r.cafe_name = ?";
                    params.push(cafe_name);
                }

                sql += " ORDER BY r.review_id DESC LIMIT 50";

                const reviews = await query(sql, params);
                return json(res, 200, reviews.map(r => ({
                    review_id: r.review_id,
                    cafe_id: r.cafe_id,
                    cafe_name: r.cafe_name,
                    item: r.item || "Coffee / Matcha",
                    outlet_available: Boolean(r.outlet_available),
                    rating: Number(r.rating),
                    comment: r.comment,
                    body: r.comment, // supports both body & comment for frontend
                    author_name: r.author_name || "Student",
                    created_at: r.created_at
                })));
            } catch (err) {
                console.error("Reviews query error:", err);
            }
        }

        // Fallback
        let list = localReviews;
        if (cafe_name) {
            list = list.filter(r => r.cafe_name.toLowerCase() === cafe_name.toLowerCase());
        } else if (cafe_id) {
            list = list.filter(r => r.cafe_id === Number(cafe_id));
        }

        return json(res, 200, list.map(r => ({
            ...r,
            body: r.comment
        })));
    }

    // ── POST ──────────────────────────────────────────────────────────────────
    if (req.method === "POST") {
        const user = getTokenUser(req);
        const { cafe_name, item, outlet, rating, review, body } = req.body ?? {};
        const reviewText = (review || body || "").trim();

        if (!cafe_name)                  return json(res, 400, { error: "Please select a café." });
        if (!item)                       return json(res, 400, { error: "Please select a food or drink." });
        if (outlet === undefined)        return json(res, 400, { error: "Please select outlet availability." });
        if (!rating)                     return json(res, 400, { error: "Please select a rating." });
        if (!reviewText)                 return json(res, 400, { error: "Please write your review." });
        if (reviewText.length > 1000)    return json(res, 400, { error: "Review must be under 1000 characters." });

        const ratingNum = Math.min(5, Math.max(1, Number(rating) || 5));
        const outletVal = (outlet === true || outlet === "Yes" || outlet === "1" || outlet === 1) ? 1 : 0;
        const userId = user?.user_id || 1;
        const authorName = user?.name || "Student";

        if (hasDbConfig()) {
            try {
                const cafes = await query("SELECT cafe_id FROM cafes WHERE cafe_name = ?", [cafe_name]);
                const cafe_id = cafes.length ? cafes[0].cafe_id : null;

                await query(
                    `INSERT INTO reviews (user_id, cafe_id, cafe_name, item, outlet_available, rating, comment, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [userId, cafe_id, cafe_name, item, outletVal, ratingNum, reviewText]
                );

                return json(res, 201, { message: "Review submitted successfully!" });
            } catch (err) {
                console.error("Review insert error:", err);
                return json(res, 500, { error: "Database error while saving review. " + err.message });
            }
        }

        // Fallback in-memory
        localReviews.unshift({
            review_id: Date.now(),
            user_id: userId,
            cafe_id: 1,
            cafe_name,
            item,
            outlet_available: outletVal,
            rating: ratingNum,
            comment: reviewText,
            body: reviewText,
            author_name: authorName,
            created_at: new Date().toISOString()
        });

        return json(res, 201, { message: "Review submitted successfully!" });
    }

    return json(res, 405, { error: "Method not allowed" });
}
