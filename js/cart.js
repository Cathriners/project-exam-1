// js/cart.js
console.log("Hei! Denne filen lastes og kjører!");
const API_URL = "https://v2.api.noroff.dev/online-shop";
const SHIPPING_COST = 9.99; // Hardkodet fra designet

// Simulerer at dette produktet er i kurven
const SIMULATED_PRODUCT_ID = "665c825807530691506b12d5"; // Ny, stabil ID (f.eks. Vanilla Perfume)
const SIMULATED_QUANTITY = 1;

/**
 * Henter produktet fra API'et basert på ID og rendrer handlekurven.
 */
async function fetchAndRenderCartItem(id) {
    const cartItemContainer = document.querySelector('.cart-item');
    const shippingValueEl = document.getElementById('shipping-value');
    
    // Vis laste-status
    cartItemContainer.innerHTML = '<div class="loading-message">Laster handlekurv...</div>';
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            // Hvis ID er ugyldig, fanges den her
            throw new Error(`Klarte ikke hente produkt. Status: ${response.status}`);
        }
        const result = await response.json();
        const product = result.data;
        
        // --- START PÅ KORRIGERT HTML INNSETTING ---
        // VIKTIG: Bruk product.discountedPrice her for å unngå 'null' feil.
        cartItemContainer.innerHTML = `
            <div class="item-details">
                <img src="${product.image.url}" alt="${product.title}" class="item-image-actual">
                <div class="item-description">
                    ${product.title}. ${product.description}
                </div>
            </div>
            <div class="item-quantity">
                <button class="qty-btn minus-btn" data-sku="${id}">-</button>
                <input type="number" value="${SIMULATED_QUANTITY}" min="1" class="qty-input" data-sku="${id}" data-unit-price="${product.discountedPrice}">
                <button class="qty-btn plus-btn" data-sku="${id}">+</button>
            </div>
            <div class="item-price">
                <span class="price-value">$${product.discountedPrice.toFixed(2)}</span>
                <button class="remove-btn">&#128465;</button>
            </div>
            <button class="empty-cart-btn">Empty cart</button>
        `;
        // --- SLUTT PÅ KORRIGERT HTML INNSETTING ---
        
        // 2. Oppdater fraktkostnaden
        shippingValueEl.textContent = `$${SHIPPING_COST.toFixed(2)}`;

        // 3. Oppdater lyttere og totaler - MÅ kalles ETTER innerHTML
        setupEventListeners();
        updateCartTotal(); 
        
    } catch (error) {
        console.error("Feil ved lasting av handlekurv:", error);
        // Sender feilmeldingen til DOM
        cartItemContainer.innerHTML = '<div class="error-message">Kunne ikke laste produktinformasjon.</div>';
    }
}

/**
 * Beregner og oppdaterer subtotal og total i DOM.
 */
function updateCartTotal() {
    const qtyInput = document.querySelector('.cart-item .qty-input');
    const unitPriceElement = document.querySelector('.cart-item .price-value');
    const subtotalValueEl = document.getElementById('subtotal-value');
    const totalValueEl = document.getElementById('total-value');

    if (!qtyInput || !unitPriceElement || !subtotalValueEl || !totalValueEl) return;

    const quantity = parseInt(qtyInput.value) || 0;
    
    // unitPrice hentes nå fra data-unit-price satt med discountedPrice
    const unitPrice = parseFloat(qtyInput.dataset.unitPrice) || 0; 

    const subtotal = quantity * unitPrice;
    const total = subtotal + SHIPPING_COST;

    // Prisen i handlekurven oppdateres basert på data-unit-price
    unitPriceElement.textContent = `$${unitPrice.toFixed(2)}`;
    subtotalValueEl.textContent = `$${subtotal.toFixed(2)}`;
    totalValueEl.textContent = `$${total.toFixed(2)}`;
}

// ... resten av setupEventListeners() er den samme ...

function setupEventListeners() {
    const cartItemContainer = document.querySelector('.cart-item');
    const qtyInput = cartItemContainer.querySelector('.qty-input');
    const minusBtn = cartItemContainer.querySelector('.minus-btn');
    const plusBtn = cartItemContainer.querySelector('.plus-btn');
    const removeBtn = cartItemContainer.querySelector('.remove-btn');
    const emptyCartBtn = cartItemContainer.querySelector('.empty-cart-btn');

    if (!qtyInput || !minusBtn || !plusBtn) return;
    
    // Lytter for +/- knapper
    [plusBtn, minusBtn].forEach(button => {
        button.addEventListener('click', (event) => {
            const isPlus = event.target.classList.contains('plus-btn');
            let currentValue = parseInt(qtyInput.value);

            if (isPlus) {
                qtyInput.value = currentValue + 1;
            } else if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
            }
            updateCartTotal();
        });
    });
    
    // Lytter for manuell inndata
    qtyInput.addEventListener('input', () => {
        if (parseInt(qtyInput.value) < 1 || isNaN(parseInt(qtyInput.value))) {
            qtyInput.value = 1;
        }
        updateCartTotal();
    });
    
    // Lytter for "Empty cart" og "Remove" knapper
    [removeBtn, emptyCartBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.cart-page-content').innerHTML = `
                <h1 class="cart-title">CART PAGE</h1>
                <div class="empty-cart-message">Din handlekurv er tom.</div>
                <div class="cart-total-summary">
                    <div class="summary-line"><span>SUBTOTAL</span><span>$0.00</span></div>
                    <div class="summary-line"><span>SHIPPING</span><span id="shipping-value">$${SHIPPING_COST.toFixed(2)}</span></div>
                    <div class="summary-line total-line"><span>TOTAL</span><span id="total-value">$${SHIPPING_COST.toFixed(2)}</span></div>
                    <button class="checkout-btn" disabled>Proceed to checkout</button>
                </div>
            `;
        });
    });
}

// Start lasting av handlekurven ved lasting av DOM
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderCartItem(SIMULATED_PRODUCT_ID);
});