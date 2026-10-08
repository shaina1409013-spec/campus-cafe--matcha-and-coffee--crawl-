const searchInput = document.getElementById("searchCafe");

searchInput.addEventListener("keyup", function () {

    const searchValue =
        searchInput.value.toLowerCase();

    const cafes =
        document.querySelectorAll(".cafe-card");

    cafes.forEach(function (cafe) {

        const name =
            cafe.dataset.name.toLowerCase();

        if (name.includes(searchValue)) {
            cafe.style.display = "block";
        } else {
            cafe.style.display = "none";
        }

    });

});


function filterCafes(category) {

    const cafes =
        document.querySelectorAll(".cafe-card");

    cafes.forEach(function (cafe) {

        const categories =
            cafe.dataset.category;

        if (
            category === "all" ||
            categories.includes(category)
        ) {

            cafe.style.display = "block";

        } else {

            cafe.style.display = "none";

        }

    });

}