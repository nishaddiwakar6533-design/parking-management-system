// ===============================
// PASSWORD SHOW / HIDE
// ===============================

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "👁";
        }

    });

}


// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const API_BASE_URL =
    "https://parking-management-system-production-7ce8.up.railway.app";

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            passwordInput.value;

        loginMessage.textContent = "";

        // Validation
        if (!username || !password) {

            loginMessage.textContent =
                "Please enter username and password.";

            loginMessage.style.color =
                "#ffdddd";

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                loginMessage.textContent =
                    "Login successful!";

                loginMessage.style.color =
                    "#ffffff";


                // Save login session
                localStorage.setItem(
                    "parkEaseLoggedIn",
                    "true"
                );


                // Save user information
                localStorage.setItem(
                    "parkEaseUser",
                    JSON.stringify(
                        data.user
                    )
                );


                // Open dashboard
                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 700);


            } else {

                loginMessage.textContent =
                    data.message ||
                    "Invalid username or password.";

                loginMessage.style.color =
                    "#ffdddd";

            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "Unable to connect to server.";

            loginMessage.style.color =
                "#ffdddd";

        }

    }
);
// ===============================
// CREATE NEW USER / REGISTER
// ===============================

const registerBtn =
    document.getElementById("registerBtn");

const registerModal =
    document.getElementById("registerModal");

const closeRegister =
    document.getElementById("closeRegister");

const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


// OPEN REGISTER MODAL
if (registerBtn) {

    registerBtn.addEventListener("click", (event) => {

        event.preventDefault();

        registerModal.style.display = "flex";

    });

}


// CLOSE REGISTER MODAL
if (closeRegister) {

    closeRegister.addEventListener("click", () => {

        registerModal.style.display = "none";

        registerForm.reset();

        registerMessage.textContent = "";

    });

}


// CLOSE MODAL WHEN CLICKING OUTSIDE
if (registerModal) {

    registerModal.addEventListener("click", (event) => {

        if (event.target === registerModal) {

            registerModal.style.display = "none";

            registerForm.reset();

            registerMessage.textContent = "";

        }

    });

}


// ===============================
// REGISTER NEW USER
// ===============================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                .value
                .trim();


        const username =
            document
                .getElementById("registerUsername")
                .value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        registerMessage.textContent = "";


        // PASSWORD CHECK
        if (password !== confirmPassword) {

            registerMessage.textContent =
                "Passwords do not match.";

            registerMessage.style.color =
                "#dc2626";

            return;

        }


        // BASIC VALIDATION
        if (!name || !username || !password) {

            registerMessage.textContent =
                "Please fill all fields.";

            registerMessage.style.color =
                "#dc2626";

            return;

        }


        try {

            registerMessage.textContent =
                "Creating account...";

            registerMessage.style.color =
                "#2563eb";


            const response =
                await fetch(
                    `${API_BASE_URL}/api/auth/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            username: username,

                            password: password

                        })

                    }
                );


            const data =
                await response.json();


            if (data.success) {

                registerMessage.textContent =
                    "Account created successfully!";

                registerMessage.style.color =
                    "#16a34a";


                registerForm.reset();


                setTimeout(() => {

                    registerModal.style.display =
                        "none";

                    registerMessage.textContent = "";

                }, 1200);


            } else {

                registerMessage.textContent =
                    data.message ||
                    "Unable to create account.";

                registerMessage.style.color =
                    "#dc2626";

            }


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerMessage.textContent =
                "Unable to connect to server.";

            registerMessage.style.color =
                "#dc2626";

        }

    });

}
