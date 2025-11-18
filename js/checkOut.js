// js/checkout.js

const API_URL = "https://v2.api.noroff.dev/online-shop";
const SHIPPING_COST = 9.99;

// Simulerer at dette produktet er i kurven
const SIMULATED_PRODUCT_ID = "665c825807530691506b12d5"; 
const SIMULATED_QUANTITY = 1;

/**
 * Henter produktet fra API'et og rendrer det i ordrensammendraget.
 */
async function fetchAndRenderOrderSummary(id, quantity) {
    const container = document.getElementById('product-summary-container');
    
    // Vis laste-status
    container.innerHTML = '<div class="loading-message">Laster ordredetaljer...</div>';
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Klarte ikke hente produkt. Status: ${response.status}`);
        }
        const result = await response.json();
        const product = result.data;
        
        const price = product.discountedPrice;
        const totalProductPrice = price * quantity;
        
        // Rendrer produktinformasjon
        container.innerHTML = `
            <div class="order-product-item">
                <div class="item-details">
                    <div class="item-image-thumbnail">PICTURE</div>
                    <div class="item-info">
                        <strong>${product.title}</strong>
                        <p>${product.description.substring(0, 50)}...</p>
                        <p>Qty: ${quantity}</p>
                    </div>
                </div>
                <div class="item-price">
                    $${totalProductPrice.toFixed(2)}
                </div>
            </div>
        `;
        
        // Oppdater totalene
        updateTotals(totalProductPrice);
        
    } catch (error) {
        console.error("Feil ved lasting av ordreoppsummering:", error);
        container.innerHTML = '<div class="error-message">Kunne ikke laste produktinformasjon.</div>';
    }
}

/**
 * Oppdaterer subtotal og total i ordrensammendraget.
 */
function updateTotals(subtotal) {
    const total = subtotal + SHIPPING_COST;
    
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-shipping').textContent = `$${SHIPPING_COST.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}

// Start lasting av ordrensammendraget ved lasting av DOM
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderOrderSummary(SIMULATED_PRODUCT_ID, SIMULATED_QUANTITY);
});