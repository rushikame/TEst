// ====== Continue with Google (redirects to Google's sign-in page) ======
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Create an "OAuth client ID" (type: Web application)
// 3. Under "Authorized redirect URIs" add the full address of login.html,
//    e.g. http://localhost:5500/login.html
// 4. Paste the client ID below
const GOOGLE_CLIENT_ID = "PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com";
const AFTER_LOGIN_PAGE = "index.html";

(function () {
    // Google sends the user back to login.html, from either page
    const REDIRECT_URI = new URL("login.html", location.href).href;

    const btn = document.getElementById("google-btn");
    let msg = null;
    if (btn) {
        msg = document.createElement("p");
        msg.setAttribute("role", "alert");
        msg.style.cssText = "margin:0.6rem 0 0;font-size:0.65rem;text-align:center;color:#c0392b;min-height:1em;";
        btn.insertAdjacentElement("afterend", msg);
    }
    function showError(text) { if (msg) msg.textContent = text; }

    // ----- Step 2: Google sent us back with a token in the URL -----
    async function handleReturn() {
        const hash = new URLSearchParams(location.hash.slice(1));
        const query = new URLSearchParams(location.search);

        if (query.get("error")) {
            showError("Google sign-in was cancelled or failed.");
            return;
        }
        const token = hash.get("access_token");
        if (!token) return;

        // Remove the token from the address bar right away
        history.replaceState(null, "", location.pathname);

        if (hash.get("state") !== sessionStorage.getItem("google_state")) {
            showError("Sign-in could not be verified. Please try again.");
            return;
        }
        sessionStorage.removeItem("google_state");

        try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) throw new Error("userinfo failed");
            const info = await res.json();

            localStorage.setItem("google_user", JSON.stringify({
                name: info.name || "",
                email: info.email || "",
                picture: info.picture || "",
                provider: "google"
            }));
            window.location.href = AFTER_LOGIN_PAGE;
        } catch (err) {
            showError("Could not get your Google profile. Try again.");
        }
    }

    // ----- Step 1: button click goes to Google's connect page -----
    if (btn) {
        btn.addEventListener("click", function () {
            showError("");

            if (location.protocol === "file:") {
                showError("Open this page through a local server (http://localhost), not as a file.");
                return;
            }
            if (GOOGLE_CLIENT_ID.indexOf("PASTE_YOUR_CLIENT_ID") === 0) {
                showError("Add your Google Client ID in google-auth.js first.");
                return;
            }

            const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem("google_state", state);

            const params = new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: "token",
                scope: "openid email profile",
                prompt: "select_account",
                state: state
            });
            window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
        });
    }

    handleReturn();
})();
