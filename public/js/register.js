document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault(); //stops the page from reloading

    const name = document.getElementById("display_name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email_address").value;
    const password = document.getElementById("user_password").value;
    const confirmPassword = document.getElementById("confirm_user_password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // create the auth user
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    // NOTE TO SELF: DO NOT LET THE USER SEE CRITICAL ERRORS ON THE FRONT END
    if (error) {
        if (error.message.includes("already registered") || error.status === 422) {
            alert("This email is already registered. Please log in or use a different email.");
        } else {
            alert("Error creating account: " + error.message);
        }
        return;
    }

    // insert the user into the users table
    const { error: insertError } = await supabaseClient.from("users").insert([
        {
            id: data.user.id,
            display_name: name,
            username: username,
            email_address: email,
        },
    ]);

    if (insertError) {
        alert("Account created, but user save failed: " + insertError.message);
        return;
    }

    alert("Registration successful!");
    window.location.href = "../html/index.html"; // redirect to the index page after successful registration
});