document.addEventListener("DOMContentLoaded", () => {
  const orderItems = [];

  const modalBtns = document.getElementsByClassName("image-button");
  const closeBtn = document.getElementsByClassName("closeBtn")[0];
  const modal = document.querySelector(".modal");
  const modalImage = modal.querySelector(".modal-item-image");
  const modalName = modal.querySelector(".modal-name");
  const modalDescription = modal.querySelector(".modal-description");
  const modalPrice = modal.querySelector(".modal-price");

  const openModal = (imageUrl, name, description, price) => {
    modalImage.src = imageUrl;
    modalName.textContent = `Name: ${name}`;
    modalDescription.textContent = `Description: ${description}`;
    modalPrice.textContent = `Price: ${price}`;
    modal.style.display = "block";
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  const updateBasketCount = () => {
    document.querySelector(".basket-count").textContent = orderItems.length;
    document.getElementById("orderItemsSize").value = orderItems.length;
  };

  const addItemToBasket = () => {
    const item = {
      name: modalName.textContent.split(": ")[1],
      price: modalPrice.textContent.split(": ")[1],
    };
    orderItems.push(item);
    updateBasketCount();
    closeModal();
  };

  const updateOrderItemsInput = () => {
    const orderItemsInput = document.getElementById("orderItems");
    orderItemsInput.value = JSON.stringify(orderItems);
    console.log("test" + orderItems);
  };

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
    .addEventListener("click", () => {
      addItemToBasket();
      updateOrderItemsInput();
    });

  document.getElementById("shopping-basket").addEventListener("click", () => {
    document.getElementById("orderForm").submit();
  });
});
