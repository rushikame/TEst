// Shared helpers: products are saved in the browser (localStorage)
const PRODUCTS_KEY = "elevn_products";

function getProducts() {
    try {
        return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveProducts(list) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

function formatPrice(price) {
    return "$" + Number(price).toFixed(2);
}