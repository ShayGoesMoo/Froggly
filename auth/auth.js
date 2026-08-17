document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        document.getElementById("login-form").style.display = tab.dataset.tab === "login" ? "flex" : "none";
        document.getElementById("register-form").style.display = tab.dataset.tab === "register" ? "flex" : "none";
    });
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginForm = document.getElementById("login-form");
    loginUser(loginForm);
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const registerForm = document.getElementById("register-form");
    registerUser(registerForm);
})

async function loginUser(loginForm) {
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    let email = identifier;

    // if it doesn't look like an email, treat it as a username and fetch the corresponding email from the database
    if (!identifier.includes("@")) {
        const { data: userRow, error: lookupError } = await supabaseClient
            .from("public_lookup")
            .select("email_address")
            .eq("username", identifier)
            .single();
        
        if (lookupError || !userRow) {
            alert("No account found with that username.");
            return;
        }

        email = userRow.email_address;
    }

    // sign in with whichever email we resolved
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    window.location.href = "/dashboard/";
}

async function registerUser(registerForm) {
    // --- Step 1: run all format validations ---
    const usernameValid = validateUsername();
    const passwordValid = validatePassword();
    const confirmValid = validateConfirmPassword();

    if (!usernameValid || !passwordValid || !confirmValid) {
        return; // hints are already showing the specific problem, nothing more to do
    }

    const username = usernameInput.value;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // --- Step 2: final authoritative availability check right before signup ---
    const { data: existingUsername } = await supabaseClient
        .from("users")
        .select("username")
        .ilike("username", username)
        .maybeSingle();

    if (existingUsername) {
        setState(usernameInput, usernameHint, false, "That username is already taken");
        return;
    }

    const { data: existingEmail } = await supabaseClient
        .from("users")
        .select("email_address")
        .ilike("email_address", email)
        .maybeSingle();

    if (existingEmail) {
        setState(emailInput, emailHint, false, "An account with this email already exists");
        return;
    }

    // --- Step 3: create the auth user ---
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        if (error.message.includes("already registered") || error.status === 422) {
            alert("This email is already registered. Please log in or use a different email.", "error");
        } else {
            alert("Error creating account: " + error.message, "error");
        }
        return;
    }

    // --- Step 4: insert the user into the users table ---
    const { error: insertError } = await supabaseClient.from("users").insert([
        {
            id: data.user.id,
            username: username,
            email_address: email,
        },
    ]);

    if (insertError) {
        alert("Account created, but user save failed: " + insertError.message, "error");
        return;
    }

    window.location.href = "/dashboard/";
}