const API_URL = "https://v2.api.noroff.dev/online-shop";

let allProducts = [];

// Hent produkter
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    allProducts = json.data;
    renderProducts(allProducts);
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
    document.getElementById("productsGrid").innerHTML = "<p>Kunne ikke laste produkter.</p>";
  }
}

// Vis produkter i grid
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = "<p>Ingen produkter funnet.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("a");
    card.href = `product.html?id=${product.id}`;
    card.className = "card";
    card.innerHTML = `
      <img src="${product.image.url}" alt="${product.image.alt || product.title}" />
      <div class="card-body">
        <h4>${product.title}</h4>
        <p class="price">${product.discountedPrice} NOK</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Filtrer etter søk
document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p => p.title.toLowerCase().includes(term));
  renderProducts(filtered);
});

// Sorter etter pris
document.getElementById("sortSelect").addEventListener("change", (e) => {
  const value = e.target.value;
  let sorted = [...allProducts];

  if (value === "low-high") {
    sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
  } else if (value === "high-low") {
    sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
  }

  renderProducts(sorted);
});

fetchProducts();
