const reviewForm = document.getElementById("reviewForm");
const reviewMessage = document.getElementById("reviewMessage");
const reviewFormCard = document.getElementById("reviewFormCard");
const reviewAccessMessage = document.getElementById("reviewAccessMessage");
const reviewsList = document.getElementById("reviewsList");
const reviewsMessage = document.getElementById("reviewsMessage");
const reviewSubmittedMessage = document.getElementById("reviewSubmittedMessage");

function showMessage(element, message) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.hidden = false;
}

function renderReview(review) {
    const article = document.createElement("article");
    article.className = "card submitted-review";

    const heading = document.createElement("h2");
    heading.textContent = review.cafe;

    const author = document.createElement("p");
    author.className = "review-author";
    author.textContent = `By ${review.author_name}`;

    const score = document.createElement("p");
    score.className = "review-rating";
    score.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    score.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)`;

    const details = document.createElement("p");
    details.textContent = `${review.item} · Charging outlet: ${review.outlet_available ? "Yes" : "No"}`;

    const body = document.createElement("p");
    body.textContent = review.review;

    const date = document.createElement("time");
    date.dateTime = review.created_at;
    date.textContent = new Date(review.created_at).toLocaleDateString();

    article.append(heading, author, score, details, body, date);
    return article;
}

async function loadReviews() {
    try {
        const supabase = getCampusCafeSupabase();
        const { data, error } = await supabase
            .from("cafe_reviews")
            .select("id, cafe, item, outlet_available, rating, review, author_name, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        reviewsList.replaceChildren();
        if (data.length === 0) {
            showMessage(reviewsMessage, "No reviews yet. Be the first to share a rating.");
            return;
        }

        reviewsMessage.hidden = true;
        data.forEach(function(review) {
            reviewsList.append(renderReview(review));
        });
    } catch (error) {
        showMessage(reviewsMessage, error.message || "Reviews could not be loaded. Please try again.");
    }
}

async function checkReviewAccess() {
    try {
        const supabase = getCampusCafeSupabase();
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }

        if (!data.session) {
            window.location.replace("login.html?next=review.html");
            return;
        }

        reviewAccessMessage.hidden = true;
        reviewFormCard.hidden = false;
    } catch (error) {
        showMessage(reviewAccessMessage, error.message || "Could not verify your sign-in. Please try again.");
    }
}

if (reviewForm) {
    reviewForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        reviewMessage.hidden = true;

        const submitButton = reviewForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const supabase = getCampusCafeSupabase();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                throw userError;
            }
            if (!user) {
                showMessage(reviewMessage, "Please log in to submit a review.");
                return;
            }

            const { error } = await supabase.from("cafe_reviews").insert({
                user_id: user.id,
                cafe: document.getElementById("cafe").value,
                item: document.getElementById("item").value,
                outlet_available: document.getElementById("outlet").value === "Yes",
                rating: Number(document.getElementById("rating").value),
                review: document.getElementById("review").value.trim()
            });

            if (error) {
                throw error;
            }

            reviewForm.reset();
            window.location.replace("reviews.html?submitted=1");
        } catch (error) {
            showMessage(reviewMessage, error.message || "Your review could not be submitted. Please try again.");
        } finally {
            submitButton.disabled = false;
        }
    });

    checkReviewAccess();
}

if (reviewsList && reviewsMessage) {
    if (reviewSubmittedMessage && new URLSearchParams(window.location.search).get("submitted") === "1") {
        reviewSubmittedMessage.hidden = false;
    }
    loadReviews();
}