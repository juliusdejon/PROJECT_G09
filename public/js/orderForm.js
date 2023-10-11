document.addEventListener("DOMContentLoaded", () => {
  const tipButtons = document.querySelectorAll(".tip-button");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const taxElement = document.getElementById("tax");
  const totalInput = document.getElementById("orderTotal");


  const taxRate = 0.13;
  const serviceFee = 2;
  let selectedTipPercentage = 0;
  let subtotalValue;
  let deliveryFee;

  document.addEventListener("updateSubtotalAndDeliveryFee", () => {
    subtotalValue = parseFloat(
      subtotalElement.textContent.replace("Subtotal: $", "")
    );
    deliveryFee = 0.99;
  });

  document.dispatchEvent(new Event("updateSubtotalAndDeliveryFee"));

  tipButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isSelected = button.classList.contains("selected");

      tipButtons.forEach((btn) => btn.classList.remove("selected"));

      if (!isSelected) {
        button.classList.add("selected");
      }

      selectedTipPercentage = isSelected
        ? 0
        : parseFloat(button.getAttribute("data-tip"));
   
      const tax = (subtotalValue + deliveryFee + serviceFee) * 0.13;
      const total =
        (subtotalValue + deliveryFee + tax) * (selectedTipPercentage + 1);

      totalElement.innerHTML = `Total: $${total.toFixed(2)}`;
      taxElement.innerHTML = `Taxes & Other Fees: $${tax.toFixed(2)}`;
    });
  });

  taxElement.innerHTML = `Taxes & Other Fees: $${(
    (subtotalValue + deliveryFee + serviceFee) *
    taxRate
  ).toFixed(2)}`;
  totalElement.innerHTML = `Total: $${(
    (subtotalValue + deliveryFee) *
    1.13
  ).toFixed(2)}`;


  totalInput.value = (((subtotalValue + deliveryFee) * 1.13) * (selectedTipPercentage + 1)).toFixed(2);
  
});
