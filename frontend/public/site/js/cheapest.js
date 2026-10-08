import { cheapestCoffee, escapeHtml } from "./backend.js";

cheapestCoffee("Iced Coffee").then(function (coffees) {
    if (!coffees.length) return;
    const list = document.getElementById("coffeeList");
    list.innerHTML = coffees.map(function (coffee, index) {
        return `
        <div class="card" style="margin-bottom:15px">
            <h2>${index + 1}. ${escapeHtml(coffee.cafe)}</h2>
            <p>Iced Coffee: <strong>₹${coffee.price}</strong></p>
        </div>`;
    }).join("");
}).catch(function (error) {
    console.error("Could not load prices, showing built-in list.", error);
});
