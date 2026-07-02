function filterProducts() {
  const input = document.querySelector(".search-bar input");
  const filter = input.value.toUpperCase();
  const products = document.querySelectorAll(".product");

  products.forEach((product) => {
    const name = product.getAttribute("data-name").toUpperCase();
    if (name.includes(filter)) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}
