//Stores the products and their prices.

const products = [
    { id: 1, name: "Apple", price: 2.00, image: "images/Apple.png" },
    { id: 2, name: "Bread", price: 3.00, image: "images/bread.png" },
    { id: 3, name: "Milk", price: 4.00, image: "images/milk.png" },
    { id: 4, name: "Rice", price: 5.00, image: "images/rice.png" },
    { id: 5, name: "Orange Juice", price: 3.50, image: "images/orange-juice.png" },
    { id: 6, name: "Eggs", price: 6.00, image: "images/eggs.png" },
    { id: 7, name: "Cheese", price: 4.50, image: "images/cheese.png" },
    { id: 8, name: "Water", price: 1.00, image: "images/water.png" },
    { id: 9, name: "Chocolate", price: 2.50, image: "images/chocolate.png" },
    { id: 10, name: "Coffee", price: 7.00, image: "images/coffee.png" },
    { id: 11, name: "Pasta", price: 2.75, image: "images/pasta.png" },
    { id: 12, name: "Cooking Oil", price: 8.00, image: "images/cooking-oil.png" }
];

let order = [];
//We use let because the order changes when customers add or remove product

// Select HTML elements
const productsContainer = document.querySelector("#products");
const orderContainer = document.querySelector("#order");
const itemCount = document.querySelector("#item-count");
const subtotalElement = document.querySelector("#subtotal");
const totalElement = document.querySelector("#total");
const receiptContainer = document.querySelector("#receipt");
const clearButton = document.querySelector("#clear-order");
const completeButton = document.querySelector("#complete-sale");
const searchInput = document.querySelector("#product-search");

// Display and search products
function displayProducts(searchText = "") {
    //accesses the HTML content inside the selected element. clear the container before displaying products again
    productsContainer.innerHTML = "";

    let foundProducts = 0;
    const searchValue = searchText.trim().toLowerCase();   //trim() removes spaces from the beginning and end. toLowerCase() converts the text to lowercase. The result is stored in searchValue.

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        if (!product.name.toLowerCase().includes(searchValue)) {
            continue;
        }

        foundProducts++;


        //Building the product card for the search// product.price.toFixed(2) formats the price to two decimal places, such as 2.00.
        productsContainer.innerHTML += `
            <div class="product-card">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="product-image"
                >

                <h3>${product.name}</h3>

                <p class="product-price">
                    $${product.price.toFixed(2)}
                </p>

                <button class="add-button" data-id="${product.id}">
                    Add
                </button>
            </div>
        `;
    }

    if (foundProducts === 0) {
        productsContainer.innerHTML =
            '<p class="empty-message">No products found.</p>';
    }
}

// Making the search work while typing
searchInput.addEventListener("input", function () {
    displayProducts(searchInput.value);


});

// Add a product to the order
function addProduct(productId) {
    let selectedProduct = null;

    for (let i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            selectedProduct = products[i];
            break;
        }
    }

    // If no product was found, return stops the function.
    if (selectedProduct === null) {
        return;
    }

    // Checking whether the product is already in the order. It starts as false
    //For example, if Apple is already in the order with quantity 1, clicking Add changes it to quantity 2.
    let found = false;

    for (let i = 0; i < order.length; i++) {
        if (order[i].id === productId) {
            order[i].quantity++;
            found = true;
            break;
        }
    }
    ;

    if (found === false) {
        order.push({
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: 1
        });
    }

    receiptContainer.innerHTML = "";
    displayOrder();
}

// Display order and calculate prices
function displayOrder() {
    orderContainer.innerHTML = "";

    if (order.length === 0) {
        orderContainer.innerHTML =
            '<p class="empty-message">No products selected.</p>';
    }

    let subtotal = 0;
    let totalItems = 0;

    for (let i = 0; i < order.length; i++) {
        const item = order[i];
        const itemTotal = item.price * item.quantity;

        subtotal += itemTotal;
        totalItems += item.quantity;

        orderContainer.innerHTML += `
            <div class="order-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>Unit price: $${item.price.toFixed(2)}</p>
                    <p>Item total: $${itemTotal.toFixed(2)}</p>

                    <div class="quantity-controls">
                        <button data-action="decrease" data-id="${item.id}">
                            -
                        </button>

                        <span>${item.quantity}</span>

                        <button data-action="increase" data-id="${item.id}">
                            +
                        </button>
                    </div>
                </div>

                <button class="remove-button"
                    data-action="remove" data-id="${item.id}">
                    Remove
                </button>
            </div>
        `;
    }

    itemCount.textContent = totalItems;
    subtotalElement.textContent = subtotal.toFixed(2);
    totalElement.textContent = subtotal.toFixed(2);
}

// Handle Add buttons
productsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-button")) {
        const productId = Number(event.target.dataset.id);
        addProduct(productId);
    }
});






// Handle quantity and Remove buttons
orderContainer.addEventListener("click", function (event) {
    const action = event.target.dataset.action;
    const productId = Number(event.target.dataset.id);

    if (!action) {
        return;
    }

    for (let i = 0; i < order.length; i++) {
        if (order[i].id === productId) {
            if (action === "increase") {
                order[i].quantity++;
            }

            if (action === "decrease") {
                order[i].quantity--;

                if (order[i].quantity === 0) {
                    order.splice(i, 1);
                }
            }

            if (action === "remove") {
                order.splice(i, 1);
            }

            break;
        }
    }

    receiptContainer.innerHTML = "";
    displayOrder();
});

// Clear the order
clearButton.addEventListener("click", function () {
    order = [];
    receiptContainer.innerHTML = "";
    displayOrder();
});

// Complete the sale and display a receipt
completeButton.addEventListener("click", function () {
    if (order.length === 0) {
        alert("Please add products before completing the sale.");
        return;
    }

    let receiptItems = "";
    let finalTotal = 0;

    for (let i = 0; i < order.length; i++) {
        const item = order[i];
        const itemTotal = item.price * item.quantity;

        finalTotal += itemTotal;

        receiptItems += `
            <p>
                ${item.name} x ${item.quantity}
                — $${itemTotal.toFixed(2)}
            </p>
        `;
    }

    receiptContainer.innerHTML = `
        <div class="receipt-box">
            <h3>Sale Completed!</h3>
            ${receiptItems}
            <hr>
            <h3>Total Paid: $${finalTotal.toFixed(2)}</h3>
            <p>Thank you for shopping with us!</p>
        </div>
    `;

    order = [];
    displayOrder();
});

// Start the POS system
displayProducts();
displayOrder();
