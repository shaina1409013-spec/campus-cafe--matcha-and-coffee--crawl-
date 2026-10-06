import { query, hasDbConfig, SEED_CAFES, SEED_DRINKS, SEED_REVIEWS } from "./_db.js";

function json(res, status, body) {
    res.status(status).json(body);
}

function cors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const { id } = req.query;

    if (id) {
        const numId = Number(id);
        if (hasDbConfig()) {
            try {
                const cafes = await query("SELECT * FROM cafes WHERE cafe_id = ?", [numId]);
                if (!cafes.length) return json(res, 404, { error: "Café not found." });

                const drinks = await query("SELECT * FROM drinks WHERE cafe_id = ? ORDER BY price ASC", [numId]);
                const ratings = await query(
                    "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE cafe_id = ?",
                    [numId]
                );

                const c = cafes[0];
                return json(res, 200, {
                    id: c.cafe_id,
                    cafe_id: c.cafe_id,
                    name: c.cafe_name,
                    cafe_name: c.cafe_name,
                    location: c.location,
                    description: c.description,
                    image_url: c.image_url,
                    icon: c.image_url?.includes("matcha") ? "🍵" : "☕",
                    wifi: true,
                    rating: ratings[0]?.avg_rating ? Number(ratings[0].avg_rating).toFixed(1) : "4.5",
                    avg_rating: ratings[0]?.avg_rating ? Number(ratings[0].avg_rating).toFixed(1) : "4.5",
                    total_reviews: Number(ratings[0]?.total_reviews || 0),
                    categories: ["all", "coffee", "matcha"],
                    drinks: drinks.map(d => ({
                        id: d.drink_id,
                        drink_id: d.drink_id,
                        name: d.drink_name,
                        drink_name: d.drink_name,
                        price: Number(d.price),
                        category: d.category,
                        icon: d.category === "Matcha" ? "🍵" : "☕"
                    }))
                });
            } catch (err) {
                console.error("Single cafe query error:", err);
            }
        }

        // Fallback
        const c = SEED_CAFES.find(x => x.cafe_id === numId) || SEED_CAFES[0];
        const drinks = SEED_DRINKS.filter(d => d.cafe_id === c.cafe_id).map(d => ({
            id: d.drink_id,
            drink_id: d.drink_id,
            name: d.drink_name,
            drink_name: d.drink_name,
            price: Number(d.price),
            category: d.category,
            icon: d.category === "Matcha" ? "🍵" : "☕"
        }));

        return json(res, 200, {
            id: c.cafe_id,
            cafe_id: c.cafe_id,
            name: c.cafe_name,
            cafe_name: c.cafe_name,
            location: c.location,
            description: c.description,
            image_url: c.image_url,
            icon: c.image_url?.includes("matcha") ? "🍵" : "☕",
            wifi: true,
            rating: c.avg_rating,
            avg_rating: c.avg_rating,
            total_reviews: c.total_reviews,
            categories: ["all", "coffee", "matcha"],
            drinks
        });
    }

    // List all cafes
    if (hasDbConfig()) {
        try {
            const cafes = await query(`
                SELECT c.*,
                       ROUND(AVG(r.rating), 1) AS avg_rating,
                       COUNT(r.review_id)      AS total_reviews
                FROM cafes c
                LEFT JOIN reviews r ON r.cafe_id = c.cafe_id
                GROUP BY c.cafe_id
                ORDER BY c.cafe_id
            `);

            return json(res, 200, cafes.map(c => ({
                id: c.cafe_id,
                cafe_id: c.cafe_id,
                name: c.cafe_name,
                cafe_name: c.cafe_name,
                location: c.location,
                description: c.description,
                image_url: c.image_url,
                icon: c.image_url?.includes("matcha") ? "🍵" : "☕",
                wifi: true,
                rating: c.avg_rating || "4.5",
                avg_rating: c.avg_rating || "4.5",
                total_reviews: Number(c.total_reviews || 0),
                categories: ["all", "coffee", "matcha"]
            })));
        } catch (err) {
            console.error("Cafes query error:", err);
        }
    }

    // Fallback
    return json(res, 200, SEED_CAFES.map(c => ({
        id: c.cafe_id,
        cafe_id: c.cafe_id,
        name: c.cafe_name,
        cafe_name: c.cafe_name,
        location: c.location,
        description: c.description,
        image_url: c.image_url,
        icon: c.image_url?.includes("matcha") ? "🍵" : "☕",
        wifi: true,
        rating: c.avg_rating,
        avg_rating: c.avg_rating,
        total_reviews: c.total_reviews,
        categories: ["all", "coffee", "matcha"]
    })));
}
