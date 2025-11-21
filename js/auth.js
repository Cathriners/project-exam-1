const BASE_URL = "https://v2.api.noroff.dev/auth";

function getAuthToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return getAuthToken() !== null;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Du er logget ut!");
    updateUIBasedOnLoginStatus();
    window.location.href = "index.html";
}

function updateUIBasedOnLoginStatus() {
    const loginLink = document.getElementById("login-link");
    const mainNav = document.getElementById("main-nav");
    
    if (!loginLink || !mainNav) return; 

    if (isLoggedIn()) {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userName = userData && userData.name ? userData.name : "PROFILE";
        
        loginLink.href = "/html/profile.html"; 
        loginLink.textContent = userName.toUpperCase(); 

        if (!document.getElementById("logout-link")) {
            const logoutLink = document.createElement("a");
            logoutLink.href = "#"; 
            logoutLink.textContent = "LOG OUT";
            logoutLink.id = "logout-link";
            logoutLink.addEventListener("click", logout);
            
            const cartIcon = document.querySelector(".cart-icon");
            
            if (cartIcon) {
                mainNav.insertBefore(logoutLink, cartIcon);
            } else {
                 mainNav.appendChild(logoutLink);
            }
        }

    } else {
        loginLink.href = "/html/login.html";
        loginLink.textContent = "LOG IN";
        
        const logoutLink = document.getElementById("logout-link");
        if (logoutLink) {
            logoutLink.remove();
        }
    }
}

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function updateCartCounter() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');

    if (!countEl) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    countEl.textContent = totalItems;

    if (totalItems > 0) {
        countEl.classList.add('visible');
    } else {
        countEl.classList.remove('visible');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    updateUIBasedOnLoginStatus(); 
    updateCartCounter(); 

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (password !== confirmPassword) {
                alert("Passordene stemmer ikke overens!");
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Konto opprettet! Du kan nå logge inn.");
                    window.location.href = "html/login.html";
                } else {
                    console.error("API Error:", result);
                    alert(result.errors ? result.errors[0].message : "Noe gikk galt under registrering. Sjekk e-postdomene og passordlengde.");
                }
            } catch (error) {
                console.error(error);
                alert("En nettverksfeil oppstod ved registrering.");
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();

            try {
                const response = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", result.data.accessToken);
                    localStorage.setItem("user", JSON.stringify(result.data));
                    
                    updateUIBasedOnLoginStatus();

                    alert("Du er logget inn!");
                    window.location.href = "index.html";
                } else {
                    alert(result.message || "Feil e-post eller passord.");
                }
            } catch (error) {
                console.error(error);
                alert("En nettverksfeil oppstod ved innlogging.");
            }
        });
    }
});