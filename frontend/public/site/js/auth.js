import { db, EMAIL_RE, friendlyError } from "./backend.js";

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (name === "") { alert("Please enter your name."); return; }
        if (name.length > 100) { alert("Name must be under 100 characters."); return; }
        if (email === "" || !EMAIL_RE.test(email)) { alert("Please enter a valid email."); return; }
        if (password.length < 6) { alert("Password must be at least 6 characters."); return; }
        if (password !== confirmPassword) { alert("Passwords do not match."); return; }

        const { data, error } = await db.auth.signUp({
            email,
            password,
            options: { data: { name }, emailRedirectTo: window.location.origin + "/site/login.html" },
        });
        if (error) { alert(friendlyError(error)); return; }

        signupForm.reset();
        if (data.session) {
            alert("Account created successfully!");
            window.location.href = "dashboard.html";
        } else {
            alert("Account created successfully! Please check your email to confirm, then log in.");
            window.location.href = "login.html";
        }
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (email === "") { alert("Please enter email."); return; }
        if (password.trim() === "") { alert("Please enter password."); return; }

        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) { alert(friendlyError(error)); return; }

        alert("Login successful!");
        window.location.href = "dashboard.html";
    });
}
