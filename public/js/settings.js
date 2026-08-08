let currentUser = null;

async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    currentUser = session.user;

    const { data: userRow, error } = await supabaseClient
        .from("users")
        .select("display_name, username, avatar_url")
        .eq("id", currentUser.id)
        .single();

    if (error) {
        console.error("Failed to load user data:", error);
        return;
    }

    document.getElementById("display-name-input").value = userRow.display_name || "";
    document.getElementById("username-input").value = userRow.username || "";

    if (userRow.avatar_url) {
        document.getElementById("current-avatar").src = userRow.avatar_url;
    }
}

// --- Display name ---
document.getElementById("display-name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = document.getElementById("display-name-input").value.trim();

    const { error } = await supabaseClient
        .from("users")
        .update({ display_name: newName })
        .eq("id", currentUser.id);

    if (error) {
        alert("Failed to update display name: " + error.message);
        return;
    }

    alert("Display name updated.");
});

// --- Username ---
document.getElementById("username-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("username-input").value.trim();
    const statusEl = document.getElementById("username-status");

    const { error } = await supabaseClient
        .from("users")
        .update({ username: newUsername })
        .eq("id", currentUser.id);

    if (error) {
        // unique constraint violation shows up as a specific error code
        if (error.code === "23505") {
            statusEl.textContent = "That username is already taken.";
        } else {
            statusEl.textContent = "Failed to update username: " + error.message;
        }
        return;
    }

    statusEl.textContent = "Username updated.";
});

// --- Password ---
document.getElementById("password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("new-password-input").value;
    const confirmPassword = document.getElementById("confirm-password-input").value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
        alert("Failed to update password: " + error.message);
        return;
    }

    alert("Password updated.");
    e.target.reset();
});

// --- Profile picture ---
document.getElementById("avatar-btn").addEventListener("click", () => {
    document.getElementById("avatar-input").click();
});

document.getElementById("avatar-input").addEventListener("change", async () => {
    const file = document.getElementById("avatar-input").files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB.");
        return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${currentUser.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        alert("Failed to upload picture: " + uploadError.message);
        return;
    }

    const { data: urlData } = supabaseClient.storage
        .from("avatars")
        .getPublicUrl(filePath);

    // cache-bust so the new image shows immediately instead of a stale cached version
    const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabaseClient
        .from("users")
        .update({ avatar_url: freshUrl })
        .eq("id", currentUser.id);

    if (updateError) {
        alert("Failed to save picture: " + updateError.message);
        return;
    }

    document.getElementById("current-avatar").src = freshUrl;
});

// --- Delete account ---
document.getElementById("delete-account-btn").addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to permanently delete your account? This cannot be undone.");
    if (!confirmed) return;

    const doubleConfirmed = confirm("This is your last chance. Delete your account and all your posts permanently?");
    if (!doubleConfirmed) return;

    // NOTE: deleting the actual auth.users entry requires elevated (service_role) permissions,
    // which should never be exposed client-side. See note below.
    alert("Account deletion needs to go through a secure server-side step — see the note in your code for setup.");
});

init();
