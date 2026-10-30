# JavaScript Project — Point of Sale (POS) System

## 1. Project Overview

This project is a simple Point of Sale (POS) system designed for a supermarket or retail store.

It provides an interactive cashier interface that allows users to browse products, add items to a customer's order, adjust quantities, remove products, and calculate the total amount to be paid.

The main goal of this project is to practice JavaScript fundamentals, DOM manipulation, and event handling.

## 2. Technologies Used

- **HTML5** — Structure of the POS interface.
- **CSS3** — Styling and responsive layout.
- **Vanilla JavaScript** — Application logic, product management, event handling, and price calculations.

## 3. Functional Features

### A. Product Selection
- Display available products with their images, names, and prices.
- Add products to the current order.
- Automatically increase the quantity when an existing product is added again.

### B. Current Order Management
- Display selected products in a separate order summary section.
- Show each product's name, unit price, quantity, and total price.
- Increase or decrease product quantities.
- Remove individual products from the order.
- Clear the current order.
- Display a message when no products have been selected.

### C. Price Calculations
- Automatically calculate the subtotal.
- Calculate the total amount based on selected products and quantities.

### D. Payment and Receipt
- Complete a sale using the Pay button.
- Generate a receipt showing purchased products, quantities, prices, and the final total.
- Display the current date and time on the receipt.
- Start a new order for the next customer.

### E. Additional Features (Bonus)
- **Product Search:** Search for products by name.
- **Date and Time:** Display the current date and time on the receipt.

## 4. Project Structure

```text
POS-System/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── images/
    ├── Apple.png
    ├── bread.png
    ├── milk.png
    ├── rice.png
    └── ...
```

## 5. How to Run the Project

1. Download or clone the project.
2. Open the project folder in Visual Studio Code.
3. Make sure the images folder is available.
4. Open `index.html` in your browser.
5. Start adding products and managing customer orders.

## 6. Project Scope and Limitations

This project focuses on the cashier's main POS screen and JavaScript fundamentals.

- No backend or database integration.
- No user authentication.
- No inventory management.
- No real payment gateway integration.
- Order data is not retained after refreshing the page.


---

**Project:** Point of Sale (POS) System  
**Technologies:** HTML5, CSS3, Vanilla JavaScript
