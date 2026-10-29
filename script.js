/* ==========================================================================
   TAILWIND CSS CONFIGURATION
   Extends Tailwind CSS theme settings directly in JavaScript.
   ========================================================================== */
tailwind.config = {
    // Theme object contains configuration for fonts, colors, breakpoints, etc.
    theme: {
        // Extend allows adding custom variables without overriding defaults
        extend: {
            // Define global custom font family stack
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            // Custom brand color palette definition
            colors: {
                brand: {
                    50: '#f0f9ff',  // Very light tint
                    100: '#e0f2fe', // Light shade
                    500: '#0ea5e9', // Primary brand color
                    600: '#0284c7', // Darker active state
                    900: '#10182a'  // Deep dark shade for background accents
                }
            }
        }
    }
};

/* ==========================================================================
   STATE MANAGEMENT & GLOBAL VARIABLES
   Holds in-memory application data and tracks UI state across interactions.
   ========================================================================== */

// Master Database: Array of product objects representing store inventory items
const productsDatabase = [
    // Each object contains a unique numerical ID, name, price, category string, and thumbnail image URL
    { id: 1, name: "Gourmet Beef Burger", price: 14.50, category: "Main Course", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80" },
    { id: 2, name: "Crispy French Fries", price: 5.50, category: "Appetizer", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80" },
    { id: 3, name: "Ribeye Steak 300g", price: 28.00, category: "Main Course", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80" },
    { id: 4, name: "Italian Margherita Pizza", price: 16.20, category: "Main Course", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=80" },
    { id: 5, name: "Fresh Iced Green Tea", price: 4.25, category: "Beverages", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80" },
    { id: 6, name: "Creamy Chocolate Cake", price: 7.80, category: "Dessert", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80" },
    { id: 7, name: "Caesar Salad Bowl", price: 11.00, category: "Appetizer", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80" },
    { id: 8, name: "Sparkling Lemon Soda", price: 3.50, category: "Beverages", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80" }
];

// Active Shopping Cart Array: Stores item objects chosen by the cashier for the current order
let currentOrderCart = [];

// Session Transaction History Array: Holds all completed receipt objects during the active counter session
let completedSalesHistory = [];

// Selected Category Filter State: Tracks which category is currently filtered ('All' by default)
let selectedCategory = "All";

// Callback Function Pointer: Stores the function to execute when a user confirms an action in the confirmation modal
let confirmActionCallback = null;

/* ==========================================================================
   INITIALIZATION
   Fires initialization routines automatically once HTML is loaded.
   ========================================================================== */
window.onload = function() {
    // Generate category filter buttons in the top toolbar
    renderCategoryFilters();
    
    // Generate and render initial product cards into the main display grid
    renderProductGrid();
    
    // Render the initial state of the shopping cart sidebar (empty state)
    renderCartSummary();
    
    // Update the live header clock immediately upon page load
    updateLiveClock();
    
    // Set timer to refresh the clock every 1000 milliseconds (1 second)
    setInterval(updateLiveClock, 1000);
    
    // Render Lucide SVG icons across all placeholders in the DOM
    lucide.createIcons();
};

/* ==========================================================================
   LIVE CLOCK MODULE
   Formats and updates the date and time string in the top navigation header.
   ========================================================================== */
function updateLiveClock() {
    // Create a new JavaScript Date object representing the current moment
    const now = new Date();
    
    // Format local time string (e.g., "02:45:10 PM")
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Format local date string (e.g., "Thu, Oct 29")
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Inject combined date and time string into the HTML element with id 'live-clock'
    document.getElementById('live-clock').innerText = `${dateStr} • ${timeStr}`;
}

/* ==========================================================================
   CATEGORY FILTER MODULE
   Builds, styles, and handles clicks for category navigation buttons.
   ========================================================================== */
function renderCategoryFilters() {
    // Array of available product categories
    const categories = ["All", "Main Course", "Appetizer", "Beverages", "Dessert"];
    
    // Select HTML div container for buttons
    const container = document.getElementById('category-buttons-container');
    
    // Clear out any existing HTML inside the container
    container.innerHTML = '';

    // Loop through each category name in the array
    categories.forEach(cat => {
        // Create a new HTML button element
        const btn = document.createElement('button');
        
        // Attach click event listener calling selectCategory with current category string
        btn.onclick = () => selectCategory(cat);
        
        // Check if current category matches the active state variable
        const isActive = selectedCategory === cat;
        
        // Dynamically apply active (dark background) or inactive (white background) CSS classes
        btn.className = `px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
            isActive 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`;
        
        // Set visible button text
        btn.innerText = cat;
        
        // Append constructed button element into DOM container
        container.appendChild(btn);
    });
}

function selectCategory(category) {
    // Update global state variable with newly selected category string
    selectedCategory = category;
    
    // Refresh category buttons UI to highlight active selection
    renderCategoryFilters();
    
    // Re-filter and re-render product grid cards based on new category
    renderProductGrid();
}

/* ==========================================================================
   PRODUCT GRID & SEARCH MODULE
   Filters inventory based on search/category and constructs dynamic card elements.
   ========================================================================== */
function renderProductGrid() {
    // Select product grid div container
    const grid = document.getElementById('product-grid');
    
    // Read text value from search input field, convert to lowercase, and trim leading/trailing spaces
    const searchVal = document.getElementById('search-input').value.toLowerCase().trim();
    
    // Clear container HTML before rendering filtered results
    grid.innerHTML = '';

    // Filter products array using JavaScript Array.filter() method
    const filteredProducts = productsDatabase.filter(prod => {
        // Check category match ('All' matches everything, otherwise exact category string match)
        const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
        
        // Check search query match (product name includes search string)
        const matchesSearch = prod.name.toLowerCase().includes(searchVal);
        
        // Return true only if product satisfies both category and search filters
        return matchesCategory && matchesSearch;
    });

    // Handle case where filtering yields zero matching products
    if (filteredProducts.length === 0) {
        // Inject empty state feedback HTML markup
        grid.innerHTML = `
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <i data-lucide="package-x" class="w-12 h-12 stroke-[1.5] mb-2"></i>
                <p class="text-sm font-semibold">No products found</p>
                <p class="text-xs">Try searching or selecting a different category</p>
            </div>
        `;
        // Refresh icons for new markup
        lucide.createIcons();
        return;
    }

    // Loop through each matching product to generate HTML card elements
    filteredProducts.forEach(prod => {
        // Create new div card container
        const card = document.createElement('div');
        
        // Set Tailwind CSS class styles for product card wrapper
        card.className = "bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition group";
        
        // Inject card template literal with dynamic product properties
        card.innerHTML = `
            <div>
                <!-- Image container with top category badge overlay -->
                <div class="relative h-32 w-full overflow-hidden bg-slate-100">
                    <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://placehold.co/400x300/e2e8f0/475569?text=${encodeURIComponent(prod.name)}'">
                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                        ${prod.category}
                    </span>
                </div>
                <!-- Card text information section -->
                <div class="p-3.5">
                    <h3 class="font-bold text-xs text-slate-800 line-clamp-1">${prod.name}</h3>
                    <p class="font-black text-sm text-sky-600 mt-1">$${prod.price.toFixed(2)}</p>
                </div>
            </div>
            <!-- Card action button footer -->
            <div class="px-3.5 pb-3.5">
                <button onclick="addToOrder(${prod.id})" class="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    <span>Add to Order</span>
                </button>
            </div>
        `;
        
        // Append constructed product card into grid container
        grid.appendChild(card);
    });

    // Re-scan DOM to turn <i data-lucide="..."> tags into SVG icons
    lucide.createIcons();
}

// Function called whenever user types inside search input element
function handleSearch() {
    renderProductGrid();
}

/* ==========================================================================
   SHOPPING CART OPERATIONS
   Handles adding, quantity updating, and removing items from current order cart.
   ========================================================================== */

function addToOrder(productId) {
    // Find matching product object from master inventory using Array.find()
    const product = productsDatabase.find(p => p.id === productId);
    if (!product) return; // Exit function if product isn't found

    // Check if item is already present in current shopping cart
    const existingItem = currentOrderCart.find(item => item.id === productId);
    
    if (existingItem) {
        // Increment quantity by 1 if item already exists in cart
        existingItem.quantity += 1;
    } else {
        // Push a new cart item object if product is added for the first time
        currentOrderCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    // Refresh cart display UI and recalculated totals
    renderCartSummary();
}

function updateQuantity(productId, delta) {
    // Locate target cart item in current order array
    const item = currentOrderCart.find(i => i.id === productId);
    if (!item) return;

    // Modify quantity by delta (+1 or -1)
    item.quantity += delta;
    
    // Remove item from cart completely if quantity drops to zero or below
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCartSummary();
    }
}

function removeFromCart(productId) {
    // Re-assign cart array with all items EXCEPT the one matching productId
    currentOrderCart = currentOrderCart.filter(item => item.id !== productId);
    
    // Refresh cart UI display
    renderCartSummary();
}

/* ==========================================================================
   CART CALCULATIONS & UI RENDERER
   Calculates subtotals, promotional discounts, taxes, and updates sidebar elements.
   ========================================================================== */
function renderCartSummary() {
    // Get cart items list container element
    const container = document.getElementById('cart-items-container');
    
    // Clear list container HTML content
    container.innerHTML = '';

    // Local tracker variables for total item count and raw subtotal
    let totalItemsCount = 0;
    let subtotal = 0;

    // Display empty cart UI message if cart array has zero items
    if (currentOrderCart.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <i data-lucide="shopping-bag" class="w-12 h-12 stroke-[1.5] mb-2 text-slate-300"></i>
                <p class="text-xs font-semibold text-slate-500">Cart is empty</p>
                <p class="text-[11px] text-slate-400">Click products from the menu to add</p>
            </div>
        `;
    } else {
        // Loop through each cart item to calculate totals and build item rows
        currentOrderCart.forEach(item => {
            // Calculate total price for current line item (price * quantity)
            const itemTotal = item.price * item.quantity;
            
            // Accumulate subtotal and total item count
            subtotal += itemTotal;
            totalItemsCount += item.quantity;

            // Create row element for cart item line
            const row = document.createElement('div');
            row.className = "p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2 shadow-sm";
            
            // Build inner HTML for cart row including quantity adjust buttons (+ / -) and delete icon
            row.innerHTML = `
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-xs text-slate-800 truncate">${item.name}</h4>
                    <div class="text-[11px] text-slate-500 font-medium">
                        $${item.price.toFixed(2)} × ${item.quantity} = <span class="font-bold text-slate-800">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-1.5 shrink-0">
                    <div class="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <!-- Decrement quantity button -->
                        <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-700 shadow-sm font-bold text-xs hover:bg-slate-200">-</button>
                        <span class="w-6 text-center font-bold text-xs text-slate-800">${item.quantity}</span>
                        <!-- Increment quantity button -->
                        <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-700 shadow-sm font-bold text-xs hover:bg-slate-200">+</button>
                    </div>
                    <!-- Delete item from cart button -->
                    <button onclick="removeFromCart(${item.id})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
            
            // Append line item row to cart container
            container.appendChild(row);
        });
    }

    // BUSINESS LOGIC CALCULATIONS:
    // Apply 10% discount if subtotal exceeds $100 threshold; otherwise $0.00
    const discount = subtotal > 100 ? subtotal * 0.10 : 0;
    
    // Calculate 8% tax rate applied to discounted subtotal
    const tax = (subtotal - discount) * 0.08;
    
    // Calculate final payable amount
    const finalTotal = subtotal - discount + tax;

    // UPDATE UI TEXT ELEMENTS WITH FORMATTED DOLLAR VALUES (.toFixed(2) rounds to 2 decimal places):
    document.getElementById('cart-item-count').innerText = totalItemsCount;
    document.getElementById('summary-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').innerText = `-$${discount.toFixed(2)}`;
    document.getElementById('summary-tax').innerText = `$${tax.toFixed(2)}`;
    document.getElementById('summary-total').innerText = `$${finalTotal.toFixed(2)}`;

    // Show discount banner if subtotal passes $100 threshold, hide if under
    const discountBanner = document.getElementById('discount-banner');
    if (subtotal > 100) {
        discountBanner.classList.remove('hidden');
    } else {
        discountBanner.classList.add('hidden');
    }

    // Recalculate cash change due based on updated totals
    calculateChange();
    
    // Render icons
    lucide.createIcons();
}

/* ==========================================================================
   CASH TENDER & CHANGE CALCULATION MODULE
   Calculates money change owed to customer based on input cash field.
   ========================================================================== */
function calculateChange() {
    // Extract subtotal text from DOM, removing dollar sign symbol
    const subtotalText = document.getElementById('summary-subtotal').innerText.replace('$', '');
    
    // Parse raw subtotal string into float number
    const subtotal = parseFloat(subtotalText) || 0;
    
    // Compute discount, tax, and final payable total
    const discount = subtotal > 100 ? subtotal * 0.10 : 0;
    const tax = (subtotal - discount) * 0.08;
    const finalTotal = subtotal - discount + tax;

    // Read numerical cash amount entered by cashier
    const cashGiven = parseFloat(document.getElementById('cash-given-input').value) || 0;
    
    // Calculate change due (cash given minus total cost)
    const changeDue = cashGiven - finalTotal;

    // Select change display element
    const changeDisplay = document.getElementById('change-due-display');
    
    // If cash entered is zero or less than required total, display default gray $0.00
    if (cashGiven <= 0 || changeDue < 0) {
        changeDisplay.innerText = '$0.00';
        changeDisplay.className = "w-full bg-slate-200/60 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-500 flex items-center";
    } else {
        // Display calculated change formatted in green
        changeDisplay.innerText = `$${changeDue.toFixed(2)}`;
        changeDisplay.className = "w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-extrabold text-emerald-700 flex items-center";
    }
}

/* ==========================================================================
   ORDER CLEARING & TRANSACTION COMPLETION
   ========================================================================== */

function promptClearOrder() {
    // Do nothing if cart is already empty
    if (currentOrderCart.length === 0) return;
    
    // Open confirmation modal dialog, passing warning text and an execution callback
    openConfirmModal("Clear Current Order?", "Are you sure you want to remove all items from this order?", () => {
        // Reset cart array to empty
        currentOrderCart = [];
        
        // Reset cash tendered input value
        document.getElementById('cash-given-input').value = '';
        
        // Refresh cart summary UI
        renderCartSummary();
    });
}

function completeSale() {
    // Prevent completing sales with empty cart
    if (currentOrderCart.length === 0) {
        alert("Cannot complete sale with an empty order!");
        return;
    }

    // Calculate totals using Array.reduce() method
    const subtotal = currentOrderCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = subtotal > 100 ? subtotal * 0.10 : 0;
    const tax = (subtotal - discount) * 0.08;
    const finalTotal = subtotal - discount + tax;
    
    // Read input cash tendered
    const cashGiven = parseFloat(document.getElementById('cash-given-input').value) || 0;

    // Validate that cash tendered is equal to or greater than total payable
    if (cashGiven < finalTotal) {
        alert(`Insufficient cash tendered! Payable total is $${finalTotal.toFixed(2)}`);
        return;
    }

    // Calculate final change due
    const changeDue = cashGiven - finalTotal;
    
    // Construct transaction record object
    const saleRecord = {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`, // Generate random 6-digit order ID
        timestamp: new Date().toLocaleString(),                       // Current date/time stamp
        items: [...currentOrderCart],                                 // Copy cart items array
        subtotal,
        discount,
        tax,
        finalTotal,
        cashGiven,
        changeDue
    };

    // Add completed sale record to the top of sales history array using .unshift()
    completedSalesHistory.unshift(saleRecord);
    
    // Update total completed transactions badge count in header
    document.getElementById('sales-count-badge').innerText = completedSalesHistory.length;

    // Display formatted printable receipt modal popup
    renderReceiptModal(saleRecord);
}

/* ==========================================================================
   MODAL DIALOG MANAGEMENT FUNCTIONS
   ========================================================================== */

// 1. Receipt Modal Renderer
function renderReceiptModal(sale) {
    // Target receipt content body element
    const content = document.getElementById('receipt-content');
    
    // String variable to accumulate HTML for line items
    let itemsHTML = '';
    
    // Loop through purchased items to format receipt lines
    sale.items.forEach(item => {
        itemsHTML += `
            <div class="flex justify-between py-1 border-b border-dashed border-slate-200">
                <div>
                    <div>${item.name}</div>
                    <div class="text-[10px] text-slate-400">${item.quantity} x $${item.price.toFixed(2)}</div>
                </div>
                <div class="font-bold">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });

    // Inject complete receipt document layout into modal container
    content.innerHTML = `
        <div class="text-center pb-2 border-b border-slate-300 space-y-0.5">
            <h4 class="font-bold text-sm tracking-wider uppercase">POSPAY EXPRESS STORE</h4>
            <p class="text-[10px] text-slate-500">123 Supermarket Blvd, Suite 100</p>
            <p class="text-[10px] text-slate-500">Date: ${sale.timestamp}</p>
            <p class="text-[10px] text-slate-500">Receipt ID: ${sale.orderId}</p>
        </div>

        <div class="py-2 space-y-1">
            ${itemsHTML}
        </div>

        <div class="pt-2 border-t border-slate-300 space-y-1 text-slate-700">
            <div class="flex justify-between">
                <span>Subtotal:</span>
                <span>$${sale.subtotal.toFixed(2)}</span>
            </div>
            ${sale.discount > 0 ? `
                <div class="flex justify-between text-emerald-600">
                    <span>Discount (10%):</span>
                    <span>-$${sale.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="flex justify-between">
                <span>Tax (8%):</span>
                <span>$${sale.tax.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900">
                <span>TOTAL PAID:</span>
                <span>$${sale.finalTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between pt-1">
                <span>Cash Tendered:</span>
                <span>$${sale.cashGiven.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
                <span>Change Due:</span>
                <span>$${sale.changeDue.toFixed(2)}</span>
            </div>
        </div>

        <div class="text-center pt-4 text-[10px] text-slate-400">
            *** Thank you for shopping! ***
        </div>
    `;

    // Remove 'hidden' class to display receipt modal backdrop overlay
    document.getElementById('receipt-modal').classList.remove('hidden');
}

function closeReceiptModal() {
    // Hide receipt modal popup by adding 'hidden' class back
    document.getElementById('receipt-modal').classList.add('hidden');
    
    // Reset order cart array for next transaction
    currentOrderCart = [];
    
    // Clear cash input field
    document.getElementById('cash-given-input').value = '';
    
    // Refresh cart display UI
    renderCartSummary();
}

// 2. Custom Product Modal Handlers
function openCustomProductModal() {
    // Show custom product creation modal
    document.getElementById('custom-product-modal').classList.remove('hidden');
}

function closeCustomProductModal() {
    // Hide custom product modal
    document.getElementById('custom-product-modal').classList.add('hidden');
    
    // Reset form inputs back to blank defaults
    document.getElementById('custom-product-form').reset();
}

function handleAddCustomProduct(e) {
    // Stop form submission from refreshing the webpage
    e.preventDefault();
    
    // Read user inputs from form controls
    const name = document.getElementById('custom-name').value.trim();
    const price = parseFloat(document.getElementById('custom-price').value);
    const category = document.getElementById('custom-category').value;

    // Validate inputs
    if (!name || isNaN(price) || price <= 0) return;

    // Construct new product object with timestamp unique ID (Date.now())
    const newProduct = {
        id: Date.now(),
        name,
        price,
        category,
        image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80`
    };

    // Add new custom item to top of master inventory database array using .unshift()
    productsDatabase.unshift(newProduct);
    
    // Close creation modal dialog
    closeCustomProductModal();
    
    // Re-render product grid to display newly created item immediately
    renderProductGrid();
}

// 3. Sales History Drawer Handlers
function toggleSalesHistoryModal() {
    const modal = document.getElementById('sales-history-modal');
    
    // Toggle 'hidden' class on modal element to open/close
    modal.classList.toggle('hidden');

    // If modal is being opened, render current session sales list
    if (!modal.classList.contains('hidden')) {
        renderSalesHistory();
    }
}

function renderSalesHistory() {
    const container = document.getElementById('sales-history-container');
    container.innerHTML = '';

    // Show empty history placeholder if no sales have completed yet
    if (completedSalesHistory.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center text-slate-400 text-xs">
                No transactions recorded in this session yet.
            </div>
        `;
        return;
    }

    // Loop through completed sales history array to render transaction record cards
    completedSalesHistory.forEach(sale => {
        const card = document.createElement('div');
        card.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs";
        
        card.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span class="font-bold text-slate-900">${sale.orderId}</span>
                <span class="text-[10px] text-slate-400">${sale.timestamp}</span>
            </div>
            <div class="space-y-0.5 text-slate-600">
                ${sale.items.map(i => `<div class="flex justify-between"><span>${i.name} (x${i.quantity})</span><span>$${(i.price * i.quantity).toFixed(2)}</span></div>`).join('')}
            </div>
            <div class="pt-1.5 border-t border-slate-200/60 flex justify-between font-bold text-slate-900">
                <span>Total:</span>
                <span class="text-emerald-600">$${sale.finalTotal.toFixed(2)}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 4. Generic Confirmation Modal Handlers
function openConfirmModal(title, msg, onConfirm) {
    // Set custom modal heading text
    document.getElementById('confirm-modal-title').innerText = title;
    
    // Set custom modal message text
    document.getElementById('confirm-modal-msg').innerText = msg;
    
    // Store reference to execution callback function
    confirmActionCallback = onConfirm;
    
    // Show confirmation modal
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal(confirmed) {
    // Hide confirmation modal
    document.getElementById('confirm-modal').classList.add('hidden');
    
    // Execute callback function if user clicked confirm ('Yes') button
    if (confirmed && confirmActionCallback) {
        confirmActionCallback();
    }
    
    // Reset callback variable
    confirmActionCallback = null;
}