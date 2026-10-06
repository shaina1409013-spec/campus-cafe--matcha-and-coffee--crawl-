import { query, hasDbConfig } from "./_db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "campus_cafe_jwt_secret_production_key_2026";

function json(res, status, body) {
    res.status(status).json(body);
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

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();

    const user = getTokenUser(req);
    const userId = user?.user_id || 1;
    const { table, cafe_id } = req.query;

    const safeTable = table === "visits" ? "visits" : "favorites";
    const cafeId = Number(cafe_id);

    if (req.method === "GET") {
        if (hasDbConfig()) {
            try {
                const rows = await query(`SELECT cafe_id FROM ${safeTable} WHERE user_id = ?`, [userId]);
                return json(res, 200, rows);
            } catch (e) {
                console.error("Interactions query error:", e);
            }
        }
        return json(res, 200, [{ cafe_id: 1 }]);
    }

    if (req.method === "POST") {
        if (hasDbConfig()) {
            try {
                const existing = await query(`SELECT * FROM ${safeTable} WHERE user_id = ? AND cafe_id = ?`, [userId, cafeId]);
                if (existing.length) {
                    await query(`DELETE FROM ${safeTable} WHERE user_id = ? AND cafe_id = ?`, [userId, cafeId]);
                    return json(res, 200, { active: false });
                } else {
                    await query(`INSERT INTO ${safeTable} (user_id, cafe_id) VALUES (?, ?)`, [userId, cafeId]);
                    return json(res, 200, { active: true });
                }
            } catch (e) {
                console.error("Interactions toggle error:", e);
            }
        }
        return json(res, 200, { active: true });
    }

    return json(res, 405, { error: "Method not allowed" });
}
