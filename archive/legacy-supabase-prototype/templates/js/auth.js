const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const authDestination = new URLSearchParams(window.location.search).get("next") === "review.html"
    ? "review.html"
    : "dashboard.html";

const signupLink = document.getElementById("signupLink");
if (signupLink && authDestination === "review.html") {
    signupLink.href = "signup.html?next=review.html";
}

const loginLink = document.getElementById("loginLink");
if (loginLink && authDestination === "review.html") {
    loginLink.href = "login.html?next=review.html";
}

function showAuthMessage(message) {
    authMessage.textContent = message;
    authMessage.hidden = false;
}

function setFormBusy(form, busy) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = busy;
}

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            showAuthMessage("Passwords do not match.");
            return;
        }

        setFormBusy(signupForm, true);
        authMessage.hidden = true;

        try {
            const supabase = getCampusCafeSupabase();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: name }
                }
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                window.location.href = authDestination;
                return;
            }

            showAuthMessage("Account created. Check your email to confirm your address, then log in using the link below.");
        } catch (error) {
            showAuthMessage(error.message || "Sign up failed. Please try again.");
        } finally {
            setFormBusy(signupForm, false);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        setFormBusy(loginForm, true);
        authMessage.hidden = true;

        try {
            const supabase = getCampusCafeSupabase();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            window.location.href = authDestination;
        } catch (error) {
            showAuthMessage(error.message || "Login failed. Please try again.");
            setFormBusy(loginForm, false);
        }
    });
}
