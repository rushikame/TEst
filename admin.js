// Admin login for the shop (needs auth.js loaded first, for hashPassword).
// The admin password is saved in this browser. Fine for testing; a real shop
// needs a server to protect the admin pages.
const ADMIN_HASH_KEY = "elevn_admin_hash";
const ADMIN_SESSION_KEY = "elevn_admin_session";

function hasAdminPassword() {
    return !!localStorage.getItem(ADMIN_HASH_KEY);
}

async function setAdminPassword(password) {
    localStorage.setItem(ADMIN_HASH_KEY, await hashPassword(password));
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
}

async function adminLogin(password) {
    const hash = await hashPassword(password);
    if (hash !== localStorage.getItem(ADMIN_HASH_KEY)) {
        return { ok: false, error: "Wrong admin password." };
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    return { ok: true };
}

function adminLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// Logged in as admin (ends when the tab is closed)
function isAdmin() {
    return hasAdminPassword() && sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}