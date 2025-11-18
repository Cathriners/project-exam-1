// js/auth.js

const BASE_URL = "https://v2.api.noroff.dev/auth";

// --- Hjelpefunksjoner for Autentisering ---

/**
 * Henter accessToken fra localStorage.
 * @returns {string | null} JWT token
 */
function getAuthToken() {
    return localStorage.getItem("token");
}

/**
 * Sjekker om brukeren er logget inn ved å se etter token.
 * @returns {boolean}
 */
function isLoggedIn() {
    return getAuthToken() !== null;
}

/**
 * Funksjon for å logge ut brukeren
 */
function logout() {
    // Fjern token og brukerdata
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Du er logget ut!");
    
    // Oppdater UI og omdiriger til hjemmesiden
    updateUIBasedOnLoginStatus();
    window.location.href = "/index.html"; 
}

// --- UI-funksjon (Kjernen for synlig innlogging) ---

/**
 * Oppdaterer navigasjonsmenyen basert på innloggingsstatus.
 * Kalles når siden lastes og etter vellykket inn-/utlogging.
 */
function updateUIBasedOnLoginStatus() {
    // VIKTIG: Gi nav-taggen og LOG IN-lenken ID-er i HTML:
    // <nav class="nav-right" id="main-nav">
    // <a href="/html/login.html" id="login-link">LOG IN</a>
    const loginLink = document.getElementById("login-link");
    const mainNav = document.getElementById("main-nav");
    
    if (!loginLink || !mainNav) return; 

    if (isLoggedIn()) {
        const userData = JSON.parse(localStorage.getItem("user"));
        // Bruk navn, eller fall tilbake til "PROFILE"
        const userName = userData && userData.name ? userData.name : "PROFILE";
        
        // 1. Endre "LOG IN" til brukernavn/profil
        loginLink.href = "/html/profile.html"; // Antatt profilside
        loginLink.textContent = userName.toUpperCase(); 

        // 2. Legg til LOG OUT-knapp/lenke hvis den ikke finnes
        if (!document.getElementById("logout-link")) {
            const logoutLink = document.createElement("a");
            logoutLink.href = "#"; 
            logoutLink.textContent = "LOG OUT";
            logoutLink.id = "logout-link";
            logoutLink.addEventListener("click", logout);
            
            // Finn handlekurv-ikonet for å sette LOG OUT før det
            const cartIcon = document.querySelector(".cart-icon");
            
            // Hvis cartIcon finnes, sett inn før den, ellers bare legg til på slutten
            if (cartIcon) {
                mainNav.insertBefore(logoutLink, cartIcon);
            } else {
                 mainNav.appendChild(logoutLink);
            }
        }

    } else {
        // Hvis ikke logget inn, sørg for at lenken er "LOG IN"
        loginLink.href = "/html/login.html";
        loginLink.textContent = "LOG IN";
        
        // Fjern LOG OUT-lenken hvis den finnes
        const logoutLink = document.getElementById("logout-link");
        if (logoutLink) {
            logoutLink.remove();
        }
    }
}


// --- Hovedlogikk (DOM Loaded) ---

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // KJØR UI-OPPDATERINGEN VED SIDELASTING
    updateUIBasedOnLoginStatus(); 

    // REGISTRERING
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Sørg for at du har ID-ene: id="name", id="email", id="password", id="confirm-password" i register.html
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
                    // FIX: Denne alerten og omdirigeringen manglet i din forrige kode!
                    alert("Konto opprettet! Du kan nå logge inn.");
                    window.location.href = "login.html";
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

    // INNLOGGING
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Sørg for at du har ID-ene: id="login-email", id="login-password" i login.html
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
                    
                    // VIKTIG: Oppdater UI etter vellykket innlogging
                    updateUIBasedOnLoginStatus(); 
                    
                    alert("Du er logget inn!");
                    window.location.href = "/index.html";
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