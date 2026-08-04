async function logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Error logging out: " + error.message);
        return;
    }

    window.location.href = "../html/login.html";
}

document.getElementById("logout-btn").addEventListener("click", logout);