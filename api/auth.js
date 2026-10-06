import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, hasDbConfig } from "./_db.js";

const JWT_SECRET = process.env.JWT_SECRET || "campus_cafe_jwt_secret_production_key_2026";

function json(res, status, body) {
    res.status(status).json(body);
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();

    const action = req.query.action; // ?action=signup | login | logout

    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

    // ── SIGNUP ────────────────────────────────────────────────────────────────
    if (action === "signup") {
        const { name, email, password, confirmPassword } = req.body ?? {};

        if (!name?.trim())                    return json(res, 400, { error: "Name is required." });
        if (!email?.trim())                   return json(res, 400, { error: "Email is required." });
        if (!password || password.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
        if (confirmPassword && password !== confirmPassword) return json(res, 400, { error: "Passwords do not match." });

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        if (hasDbConfig()) {
            try {
                const existing = await query("SELECT user_id FROM users WHERE LOWER(email) = ?", [cleanEmail]);
                if (existing.length) return json(res, 409, { error: "An account with this email already exists." });

                const hash = await bcrypt.hash(password, 10);
                const result = await query(
                    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                    [cleanName, cleanEmail, hash]
                );

                const user = { user_id: result.insertId, name: cleanName, email: cleanEmail };
                const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
                return json(res, 201, { message: "Account created successfully!", token, user });
            } catch (err) {
                console.error("Signup DB error:", err);
                return json(res, 500, { error: "Database error during signup. " + err.message });
            }
        }

        // Demo fallback when MySQL credentials are not yet entered on Vercel
        const user = { user_id: Date.now(), name: cleanName, email: cleanEmail };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
        return json(res, 201, { message: "Account created successfully!", token, user });
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    if (action === "login") {
        const { email, password } = req.body ?? {};

        if (!email?.trim()) return json(res, 400, { error: "Please enter email." });
        if (!password)      return json(res, 400, { error: "Please enter password." });

        const cleanEmail = email.trim().toLowerCase();

        if (hasDbConfig()) {
            try {
                const rows = await query("SELECT * FROM users WHERE LOWER(email) = ?", [cleanEmail]);
                if (!rows.length) return json(res, 401, { error: "Incorrect email or password." });

                const userRow = rows[0];
                let match = false;
                if (userRow.password.startsWith("$2")) {
                    match = await bcrypt.compare(password, userRow.password);
                } else {
                    // Plain text fallback from initial seed dump
                    match = userRow.password === password;
                }

                if (!match) return json(res, 401, { error: "Incorrect email or password." });

                const user = { user_id: userRow.user_id, name: userRow.name, email: userRow.email };
                const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
                return json(res, 200, { message: "Login successful!", token, user });
            } catch (err) {
                console.error("Login DB error:", err);
                return json(res, 500, { error: "Database error during login. " + err.message });
            }
        }

        // Demo fallback
        const user = { user_id: 1, name: cleanEmail.split("@")[0], email: cleanEmail };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
        return json(res, 200, { message: "Login successful!", token, user });
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    if (action === "logout") {
        return json(res, 200, { message: "Logged out." });
    }

    return json(res, 400, { error: "Unknown action. Use ?action=signup|login|logout" });
}
