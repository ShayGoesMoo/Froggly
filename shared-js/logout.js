async function updateAuthButton() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const authBtn = document.getElementById("tab-preferences");

    if (session) {
        authBtn.textContent = "Logout";
        authBtn.onclick = handleLogout;
    } else {
        authBtn.textContent = "Login";
        authBtn.onclick = () => {
            window.location.href = "/auth/";
        };
    }
}

async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showToast("Error logging out: " + error.message, "error");
        return;
    }

    window.location.href = "/auth/";
}

updateAuthButton();

supabaseClient.auth.onAuthStateChange((event, session) => {
    updateAuthButton();
});