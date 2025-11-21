const API_URL = "https://v2.api.noroff.dev/online-shop";

async function getProducts() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    const products = json.data;

    if (!products) {
      console.error("Ingen produkter funnet");
      return;
    }

    renderCarousel(products.slice(0, 3));
    renderGrid(products.slice(0, 12));
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
  }
}

function renderCarousel(products) {
  const track = document.getElementById("carousel-track");
  const dotsContainer = document.getElementById("carousel-dots");

  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  products.forEach((product, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.innerHTML = `
      <img class="slide-image" src="${product.image.url}" alt="${product.image.alt || product.title}" />
      <div class="slide-content">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <a class="btn" href="html/product.html?id=${product.id}">Se produkt</a>
      </div>
    `;
    track.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "carousel-dot" + (index === 0 ? " active" : "");
    dotsContainer.appendChild(dot);
  });

  let index = 0;
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");

  function showSlide(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle("active", idx === index));
  }

  document.getElementById("carousel-next").addEventListener("click", () => showSlide(index + 1));
  document.getElementById("carousel-prev").addEventListener("click", () => showSlide(index - 1));

  dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));
}

function renderGrid(products) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("a");
    card.href = `html/product.html?id=${product.id}`;
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

getProducts();