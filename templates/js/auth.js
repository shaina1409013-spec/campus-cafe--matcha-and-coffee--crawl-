const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (name.trim() === "") {

            alert("Please enter your name.");
            return;

        }


        if (email.trim() === "") {

            alert("Please enter your email.");
            return;

        }


        if (password.length < 6) {

            alert("Password must be at least 6 characters.");
            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }


        alert("Account created successfully!");

        signupForm.reset();

    });

}


const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        if (email.trim() === "") {

            alert("Please enter email.");
            return;

        }


        if (password.trim() === "") {

            alert("Please enter password.");
            return;

        }


        alert("Login successful!");

        window.location.href =
            "dashboard.html";

    });

}