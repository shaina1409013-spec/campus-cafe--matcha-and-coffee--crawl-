const dashboardName = document.getElementById("dashboardName");
const dashboardMessage = document.getElementById("dashboardMessage");
const logoutButton = document.getElementById("logoutButton");
const dashboardContent = document.getElementById("dashboardContent");

async function loadDashboard() {
    try {
        const supabase = getCampusCafeSupabase();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data.session) {
            window.location.replace("login.html");
            return;
        }

        dashboardName.textContent =
            data.session.user.user_metadata.display_name ||
            data.session.user.email;
        dashboardContent.hidden = false;
    } catch (error) {
        dashboardMessage.textContent = error.message || "Could not load your account.";
        logoutButton.hidden = true;
    }
}

logoutButton.addEventListener("click", async function() {
    logoutButton.disabled = true;

    try {
        const supabase = getCampusCafeSupabase();
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        window.location.replace("login.html");
    } catch (error) {
        dashboardMessage.textContent = error.message || "Could not log out. Please try again.";
        logoutButton.disabled = false;
    }
});

loadDashboard();