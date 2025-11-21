const SHIPPING_COST = 9.99;

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function changeQuantity(id, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            removeItem(id);
            return;
        }

        saveCart(cart);
        renderOrderSummary(); 

        if (typeof updateCartCounter === 'function') {
            updateCartCounter();
        }
    }
}

function removeItem(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);

    saveCart(cart);
    renderOrderSummary(); 

    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
}

function renderOrderSummary() {
    const cart = getCart();
    const container = document.getElementById('cart-items'); 
    
    if (!container) return; 

    if (cart.length === 0) {
        container.innerHTML = '<div class="error-message">Handlekurven er tom. Vennligst legg til varer før utsjekking.</div>';
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    
    const productHtml = cart.map(product => {
        const totalProductPrice = product.price * product.quantity; 
        subtotal += totalProductPrice;

 return `
            <div class="cart-item" data-product-id="${product.id}"> 
            <div class="item-details-left">
                    <img class="item-image-thumbnail" src="${product.imageUrl}" alt="${product.title}">
                    <div class="item-info">
                        <strong>${product.title}</strong>
                        <p class="item-price-mobile">$${product.price.toFixed(2)}</p>
                    </div>
                </div>

                <div class="item-quantity-control">
                    <button class="qty-btn remove-one-btn" data-id="${product.id}">-</button>
                    <input type="number" class="qty-input" value="${product.quantity}" min="1" disabled>
                    <button class="qty-btn add-one-btn" data-id="${product.id}">+</button>
                </div>
                
                <div class="item-total-price">
                    $${totalProductPrice.toFixed(2)}
                </div>

                <button class="remove-all-btn empty-cart-btn" data-id="${product.id}">X</button> 
                </div>
        `;
    }).join('');

    container.innerHTML = productHtml;

    updateTotals(subtotal);
    
    addCartButtonListeners();
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

function addCartButtonListeners() {
    document.querySelectorAll('.add-one-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            changeQuantity(id, 1);
        });
    });

    document.querySelectorAll('.remove-one-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            changeQuantity(id, -1);
        });
    });

    document.querySelectorAll('.remove-all-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            removeItem(id);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();
});