const API_BASE_URL = "https://v2.api.noroff.dev/online-shop";

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.discountedPrice, 
            imageUrl: product.image.url,
            quantity: 1
        });
    }
    
    saveCart(cart);
    alert(`${product.title} ble lagt til i handlekurven!`);
    
    if (typeof updateCartCounter === 'function') {
        updateCartCounter(); 
    }
}

function renderProductRatingAndReviews(product) {
    const reviews = product.reviews || []; 
    
    let ratingHtml = `
        <div class="product-rating-summary">
            <span class="rating-value">${product.rating.toFixed(1)} / 5.0</span>
            <span class="review-count">(${reviews.length} omtaler)</span>
        </div>
    `;
    
    let reviewsHtml = `<h3>Kundeomtaler</h3>`;

    if (reviews.length > 0) {
        reviewsHtml += '<div class="review-list">';
        reviews.forEach(review => {
            reviewsHtml += `
                <div class="review-item">
                    <div class="review-header">
                        <strong>${review.username}</strong>
                        <span class="review-score">${review.rating} / 5</span>
                    </div>
                    <p>${review.description || 'Ingen kommentar.'}</p>
                </div>
            `;
        });
        reviewsHtml += '</div>';
    } else {
        reviewsHtml += '<p>Ingen omtaler enda. Bli den første!</p>';
    }

    const container = document.getElementById("ratings-reviews-container");
    if (container) {
        container.innerHTML = ratingHtml + reviewsHtml;
    }
}

function renderProductTags(product) {
    const tags = product.tags || []; 
    const container = document.getElementById("product-tags-container");
    if (!container) return;
    
    if (tags.length > 0) {
        const tagsHtml = tags.map(tag => 
            `<span class="tag-chip">${tag}</span>`
        ).join('');
        container.innerHTML = `<strong>Tags:</strong> ${tagsHtml}`;
    } else {
        container.innerHTML = '';
    }
}

function setupShareButton(productId) {
    const shareButton = document.getElementById("share-button");
    if (!shareButton) return;

    shareButton.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}/html/product.html?id=${productId}`;
        
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert(`Lenken ble kopiert til utklippstavlen: ${shareUrl}`);
            }).catch(() => {
                alert(`Kopiering mislyktes. Lenke: ${shareUrl}`);
            });
        }
    });
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.querySelector(".product-details").innerHTML = "<p>Mangler produkt-ID i URL.</p>";
}

async function getProductDetails() {
  const container = document.querySelector(".product-details");
  if (!container) return; 
  
  container.innerHTML = `<p class="loading-message">Laster produkt...</p>`;
  let productData = null; 

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const json = await response.json();
    productData = json.data;

    if (!productData) {
      container.innerHTML = `<p class="error-message">Fant ikke produktet med ID ${id}.</p>`;
      return;
    }

    const priceDisplay = productData.price !== productData.discountedPrice
        ? `<span class="original-price">$${productData.price.toFixed(2)}</span> <span class="discount-price">$${productData.discountedPrice.toFixed(2)} NOK</span>`
        : `<span class="price">$${productData.discountedPrice.toFixed(2)} NOK</span>`;
    
    const mainProductHtml = `
      <section class="product-page-main-content">
        <div class="product-container">
          <img src="${productData.image.url}" alt="${productData.image.alt || productData.title}" class="product-image" />
          <div class="product-info">
            <h2>${productData.title}</h2>
            
            <div class="price-section">
                ${priceDisplay}
            </div>

            <p class="product-description">${productData.description}</p>
            
            <div id="product-tags-container"></div>
            
            <div class="action-buttons">
                <button class="add-to-cart-btn" id="addToCartBtn">Legg i handlekurv</button>
                <button class="share-btn" id="share-button">Del</button>
            </div>
          </div>
        </div>
      </section>
    `;

    const reviewsHtml = `
      <section class="reviews-section" id="ratings-reviews-container">
          </section>
    `;
    
    container.innerHTML = mainProductHtml + reviewsHtml;
    
    document.getElementById("addToCartBtn").addEventListener("click", () => {
        addToCart(productData);
    });
    
    renderProductRatingAndReviews(productData);
    renderProductTags(productData);
    setupShareButton(productData.id);

  } catch (error) {
    console.error("Feil ved lasting av produkt:", error);
    container.innerHTML = `<p class="error-message">Kunne ikke laste produktet. Vennligst sjekk nettverket.</p>`;
  }
}

getProductDetails();