import { query, hasDbConfig, SEED_DRINKS } from "./_db.js";

function json(res, status, body) {
    res.status(status).json(body);
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const { cafe_id, cheapest, name } = req.query;

    // Cheapest drink comparison
    if (cheapest !== undefined || name) {
        const drinkName = name || "Iced Coffee";
        if (hasDbConfig()) {
            try {
                const rows = await query(
                    `SELECT d.drink_name, d.price, c.cafe_name AS cafe, c.location
                     FROM drinks d
                     JOIN cafes c ON c.cafe_id = d.cafe_id
                     WHERE d.drink_name LIKE ?
                     ORDER BY d.price ASC`,
                    [`%${drinkName}%`]
                );

                if (rows.length) return json(res, 200, rows);

                // Fallback to all drinks sorted by price if specific name didn't match
                const all = await query(
                    `SELECT d.drink_name, d.price, c.cafe_name AS cafe, c.location
                     FROM drinks d
                     JOIN cafes c ON c.cafe_id = d.cafe_id
                     ORDER BY d.price ASC`
                );
                return json(res, 200, all);
            } catch (err) {
                console.error("Cheapest drinks query error:", err);
            }
        }

        // Fallback
        const matches = SEED_DRINKS
            .filter(d => d.drink_name.toLowerCase().includes(drinkName.toLowerCase()))
            .map(d => ({ drink_name: d.drink_name, price: d.price, cafe: d.cafe_name, location: "Campus" }))
            .sort((a, b) => a.price - b.price);

        if (matches.length) return json(res, 200, matches);

        return json(res, 200, SEED_DRINKS.map(d => ({
            drink_name: d.drink_name,
            price: d.price,
            cafe: d.cafe_name,
            location: "Campus"
        })).sort((a, b) => a.price - b.price));
    }

    if (cafe_id) {
        if (hasDbConfig()) {
            try {
                const drinks = await query(
                    "SELECT * FROM drinks WHERE cafe_id = ? ORDER BY price ASC",
                    [Number(cafe_id)]
                );
                return json(res, 200, drinks);
            } catch (err) {
                console.error("Cafe drinks query error:", err);
            }
        }
        return json(res, 200, SEED_DRINKS.filter(d => d.cafe_id === Number(cafe_id)));
    }

    if (hasDbConfig()) {
        try {
            const drinks = await query(
                `SELECT d.*, c.cafe_name
                 FROM drinks d
                 JOIN cafes c ON c.cafe_id = d.cafe_id
                 ORDER BY d.cafe_id, d.price ASC`
            );
            return json(res, 200, drinks);
        } catch (err) {
            console.error("Drinks query error:", err);
        }
    }

    return json(res, 200, SEED_DRINKS);
}
