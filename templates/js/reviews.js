const reviewForm = document.getElementById("reviewForm");

reviewForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const cafe = document.getElementById("cafe").value;
    const item = document.getElementById("item").value;
    const outlet = document.getElementById("outlet").value;
    const rating = document.getElementById("rating").value;
    const review = document.getElementById("review").value;

    if (cafe === "") {
        alert("Please select a café.");
        return;
    }

    if (item === "") {
        alert("Please select a food or drink.");
        return;
    }

    if (outlet === "") {
        alert("Please select outlet availability.");
        return;
    }

    if (rating === "") {
        alert("Please select a rating.");
        return;
    }

    if (review.trim() === "") {
        alert("Please write your review.");
        return;
    }

    alert(
        "Review submitted successfully!\n\n" +
        "Café: " + cafe +
        "\nItem: " + item +
        "\nRating: " + rating + "/5"
    );

    reviewForm.reset();
});