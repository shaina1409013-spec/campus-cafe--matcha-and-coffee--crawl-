import mysql from "mysql2/promise";

let pool = null;

// Built-in seed data matching coffee_crawl_data.sql for instant preview/fallback
export const SEED_CAFES = [
    { cafe_id: 1, cafe_name: "Cafe Matcha", location: "Chandigarh", description: "A cozy cafe serving coffee and matcha.", image_url: "cafe1.jpg", wifi: 1, avg_rating: "4.8", total_reviews: 2 },
    { cafe_id: 2, cafe_name: "The Coffee House", location: "Ludhiana", description: "Popular coffee and snacks cafe.", image_url: "cafe2.jpg", wifi: 1, avg_rating: "4.5", total_reviews: 1 },
    { cafe_id: 3, cafe_name: "Green Cup Cafe", location: "Mohali", description: "Cafe famous for matcha and cold coffee.", image_url: "cafe3.jpg", wifi: 1, avg_rating: "4.7", total_reviews: 1 },
];

export const SEED_DRINKS = [
    { drink_id: 13, cafe_id: 1, drink_name: "Classic Matcha Latte", category: "Matcha", description: "Smooth matcha latte.", price: 180.00, image_url: "matcha1.jpg", cafe_name: "Cafe Matcha" },
    { drink_id: 14, cafe_id: 1, drink_name: "Cold Coffee", category: "Coffee", description: "Creamy chilled coffee.", price: 150.00, image_url: "coffee1.jpg", cafe_name: "Cafe Matcha" },
    { drink_id: 15, cafe_id: 1, drink_name: "Cappuccino", category: "Coffee", description: "Classic cappuccino.", price: 140.00, image_url: "cappuccino.jpg", cafe_name: "Cafe Matcha" },
    { drink_id: 16, cafe_id: 2, drink_name: "Americano", category: "Coffee", description: "Strong black coffee.", price: 120.00, image_url: "americano.jpg", cafe_name: "The Coffee House" },
    { drink_id: 17, cafe_id: 2, drink_name: "Iced Latte", category: "Coffee", description: "Chilled espresso with milk.", price: 160.00, image_url: "icedlatte.jpg", cafe_name: "The Coffee House" },
    { drink_id: 18, cafe_id: 3, drink_name: "Strawberry Matcha", category: "Matcha", description: "Strawberry and matcha drink.", price: 220.00, image_url: "strawberrymatcha.jpg", cafe_name: "Green Cup Cafe" },
];

export const SEED_REVIEWS = [
    { review_id: 5, user_id: 1, cafe_id: 1, cafe_name: "Cafe Matcha", item: "Classic Matcha Latte", outlet_available: 1, rating: 5.0, comment: "Amazing matcha and nice ambience!", author_name: "Nitin", created_at: "2026-10-06 14:00:00" },
    { review_id: 6, user_id: 2, cafe_id: 1, cafe_name: "Cafe Matcha", item: "Cold Coffee", outlet_available: 1, rating: 4.5, comment: "Good coffee and peaceful place.", author_name: "Akash", created_at: "2026-10-06 14:10:00" },
    { review_id: 7, user_id: 3, cafe_id: 2, cafe_name: "The Coffee House", item: "Americano", outlet_available: 0, rating: 4.0, comment: "Coffee was good.", author_name: "Rahul", created_at: "2026-10-06 14:20:00" },
    { review_id: 8, user_id: 1, cafe_id: 3, cafe_name: "Green Cup Cafe", item: "Strawberry Matcha", outlet_available: 1, rating: 5.0, comment: "Best matcha I have tried!", author_name: "Nitin", created_at: "2026-10-06 14:30:00" },
];

export function hasDbConfig() {
    return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);
}

export function getPool() {
    if (!hasDbConfig()) return null;
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD || "",
            database: process.env.MYSQL_DATABASE,
            ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : undefined,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 5000,
        });
    }
    return pool;
}

export async function query(sql, params = []) {
    const p = getPool();
    if (!p) {
        throw new Error("DB_NOT_CONFIGURED");
    }
    const [rows] = await p.execute(sql, params);
    return rows;
}
