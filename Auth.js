// Simple login system saved in the browser (localStorage).
// Fine for learning or testing. A real shop needs a server for accounts.
const USERS_KEY = "elevn_users";
const SESSION_KEY = "elevn_session";

async function hashPassword(password) {
    if (window.crypto && window.crypto.subtle) {
        const data = new TextEncoder().encode(password);
        const buf = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(buf))
            .map(function (b) { return b.toString(16).padStart(2, "0"); })
            .join("");
    }
    // fallback if the browser blocks crypto (plain http pages)
    let h = 5381;
    for (let i = 0; i < password.length; i++) {
        h = ((h << 5) + h + password.charCodeAt(i)) | 0;
    }
    return "s" + h;
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

async function signUp(name, email, password) {
    email = email.trim().toLowerCase();
    const users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
        return { ok: false, error: "An account with this email already exists. Please log in." };
    }
    users.push({ name: name.trim(), email: email, hash: await hashPassword(password) });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true };
}

async function logIn(email, password) {
    email = email.trim().toLowerCase();
    const hash = await hashPassword(password);
    const user = getUsers().find(function (u) { return u.email === email && u.hash === hash; });
    if (!user) {
        return { ok: false, error: "Wrong email or password." };
    }
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true };
}

function logOut() {
    localStorage.removeItem(SESSION_KEY);
}

function currentUser() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return getUsers().find(function (u) { return u.email === email; }) || null;
}