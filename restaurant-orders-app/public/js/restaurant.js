const orderNowBtn = document.getElementById("order-now-button");

const targetDiv = document.getElementsByClassName("menu-container");

orderNowBtn.addEventListener("click", () => {
  console.log("scrolling to menu");
  targetDiv[0].scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", () => {
  const modalBtns = document.getElementsByClassName("image-button");
  const closeBtn = document.getElementsByClassName("closeBtn")[0];
  const modal = document.querySelector(".modal");
  const modalImage = modal.querySelector(".modal-item-image");
  const modalName = modal.querySelector(".modal-name"); // Add this line
  const modalDescription = modal.querySelector(".modal-description");
  const modalPrice = modal.querySelector(".modal-price");

  const openModal = (imageUrl, name, description, price) => {
    modalImage.src = imageUrl;
    modalName.textContent = `Name: ${name}`; // Set the text content for modal-name
    modalDescription.textContent = `Description: ${description}`;
    modalPrice.textContent = `Price: ${price}`;
    modal.style.display = "block";
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  const updateBasketCount = () => {
    document.querySelector(".basket-count").textContent = basketCount;
    document.getElementById("orderItemsSize").value = basketCount;
  };

  const addItemToBasket = () => {
    basketCount++;
    updateBasketCount();
    const itemName = modalName.textContent.split(": ")[1];
    const itemPrice = modalPrice.textContent.split(": ")[1];
    const itemDetails = { name: itemName, price: itemPrice };
    updateOrderItems(itemDetails);
    closeModal();
  };

  const updateOrderItems = (itemDetails) => {
    const orderItemsInput = document.getElementById("orderItems");
    const currentItemsValue = orderItemsInput.value;
    let currentItemsArray = [];
    if (currentItemsValue !== "") {
      currentItemsArray = JSON.parse(currentItemsValue);
    }
    currentItemsArray.push(itemDetails);
    orderItemsInput.value = JSON.stringify(currentItemsArray);
  };

  let basketCount = 0;

  for (let i = 0; i < modalBtns.length; i++) {
    modalBtns[i].addEventListener("click", function () {
      const name = this.getAttribute("data-name");
      const imageUrl = this.getAttribute("data-image");
      const description = this.getAttribute("data-description");
      const price = this.getAttribute("data-price");
      openModal(imageUrl, name, description, price);
    });
  }

  closeBtn.addEventListener("click", closeModal);

  document
    .querySelector(".add-item-button")
    .addEventListener("click", addItemToBasket);

  document.getElementById("shopping-basket").addEventListener("click", () => {
    document.getElementById("orderForm").submit();
  });
});
