const SHIPPING_COST = 9.99;

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function renderOrderSummary() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    
    if (!container) return; 

    container.innerHTML = '<div class="loading-message">Laster ordredetaljer...</div>';

    if (cart.length === 0) {
        container.innerHTML = '<div class="error-message">Handlekurven er tom. Kan ikke fortsette utsjekking.</div>';
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    
    const productHtml = cart.map(product => {
        const totalProductPrice = product.price * product.quantity; 
        subtotal += totalProductPrice; 

        return `
            <div class="cart-product-item" data-product-id="${product.id}">
                
                <div class="item-details-left">
                    <img class="item-image-thumbnail" src="${product.imageUrl}" alt="${product.title}">
                    <div class="item-info">
                        <strong>${product.title}</strong>
                    </div>
                </div>

                <div class="item-total-price">
                    ${product.quantity} x $${product.price.toFixed(2)} = $${totalProductPrice.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = productHtml;

    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const total = subtotal + SHIPPING_COST;
    
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');

    const subtotalToDisplay = subtotal > 0 ? subtotal : 0; 

    if (subtotalEl) subtotalEl.textContent = `$${subtotalToDisplay.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${SHIPPING_COST.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();
});