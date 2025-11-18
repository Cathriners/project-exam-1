// Hent produkt-ID fra URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.querySelector(".product-details").innerHTML = "<p>Mangler produkt-ID i URL.</p>";
  throw new Error("Ingen ID i URL");
}

// Hent riktig produkt fra API
async function getProductDetails() {
  const container = document.querySelector(".product-details");
  container.innerHTML = `<p>Laster produkt...</p>`;

  try {
    const response = await fetch(`https://v2.api.noroff.dev/online-shop/${id}`);
    const json = await response.json();
    const product = json.data;

    if (!product) {
      container.innerHTML = `<p>Fant ikke produktet.</p>`;
      return;
    }

    container.innerHTML = `
      <section class="product-page">
        <div class="product-container">
          <img src="${product.image.url}" alt="${product.image.alt || product.title}" />
          <div class="product-info">
            <h2>${product.title}</h2>
            <p class="price">${product.discountedPrice} NOK</p>
            <p>${product.description}</p>
            <button class="add-to-cart-btn">Legg i handlekurv</button>
          </div>
        </div>
      </section>
    `;
  } catch (error) {
    console.error("Feil ved lasting av produkt:", error);
    container.innerHTML = `<p>Kunne ikke laste produktet.</p>`;
  }
}

getProductDetails();
