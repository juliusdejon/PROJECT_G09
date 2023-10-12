document.addEventListener('DOMContentLoaded', function() {
    let originalTotal = parseFloat(document.getElementById("total").innerHTML);

    const calculateTotal = () => {
        let tipPercentage = document.getElementById("tipPercentage").value;

        if (tipPercentage === "N/A") {
            tipPercentage = 0;
        }

        let tipCalculate = parseFloat(tipPercentage);

        let newTotal = (originalTotal + (originalTotal * tipCalculate)).toFixed(2);

        document.getElementById("total").innerHTML = newTotal;
        document.querySelector('input[name="orderTotal"]').value = newTotal;
    }

    document.getElementById("tipPercentage").addEventListener("change", calculateTotal);
});
