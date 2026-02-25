// Product Database Generator
const categories = [
    "Face Wash", "Moisturizer", "Sunscreen", "Serum", "Face Mask", 
    "Toner", "Foundation", "Compact Powder", "Lipstick", "Lip Balm", 
    "Kajal", "Mascara", "Eyeshadow", "Blush", "Highlighter", 
    "Makeup Remover", "Shampoo", "Conditioner", "Hair Clips & Accessories", 
    "Hair Bands & Styling Tools"
];

// Generate placeholder products
let allProducts = [];
categories.forEach(cat => {
    for(let i=1; i<=8; i++) {
        let price = Math.floor(Math.random() * 800) + 199; // ₹199 to ₹999
        let rating = (Math.random() * 1 + 4).toFixed(1); // 4.0 to 5.0
        let imageKeywords = cat.toLowerCase().includes('hair') ? 'haircare,accessories' : 'skincare,cosmetics,makeup';
        
        allProducts.push({
            id: `${cat.toLowerCase().replace(/[\s&]+/g, '-')}-${i}`,
            name: `${cat} ${['Premium', 'Essentials', 'Glow', 'Natural', 'Luxe'][Math.floor(Math.random()*5)]}`,
            category: cat,
            price: price,
            // Using a stable unsplash image proxy or stable IDs since source.unsplash is deprecated
            // We use a predefined set of beautiful aesthetic cosmetic images
            image: `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80`, 
            rating: rating,
            description: `Experience the natural glow with our luxury ${cat.toLowerCase()}. Handcrafted for your beauty.`
        });
    }
});

// State
let cart = JSON.parse(localStorage.getItem('beauty_cart')) || [];
let currentProducts = [];

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const cartCount = document.querySelector('.cart-count');
const scrollTopBtn = document.getElementById('scroll-top');
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-products');
const modalOverlay = document.getElementById('quick-view-modal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCartCount();
    
    // Determine page context
    const categoryMeta = document.querySelector('meta[name="category"]');
    if (categoryMeta) {
        const cat = categoryMeta.getAttribute('content');
        currentProducts = allProducts.filter(p => p.category === cat);
        renderProducts(currentProducts);
    } else if (document.getElementById('featured-grid')) {
        // Homepage
        currentProducts = allProducts.filter((p, index) => index % 15 === 0).slice(0, 8); // Just grab some random products
        renderProducts(currentProducts, document.getElementById('featured-grid'));
    }

    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('beauty_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let current = document.documentElement.getAttribute('data-theme');
            let next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('beauty_theme', next);
            updateThemeIcon(next);
        });
    }
}

function updateThemeIcon(theme) {
    if(!themeToggle) return;
    if (theme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Product Rendering
function renderProducts(products, container = productGrid) {
    if (!container) return;
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <button class="quick-view-btn" onclick="openQuickView('${product.id}')">Quick View</button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${getStars(product.rating)} (${product.rating})
                </div>
                <div class="product-price">₹${product.price}</div>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function getStars(rating) {
    let stars = '';
    for(let i=1; i<=5; i++) {
        if (i <= Math.floor(rating)) stars += '<i class="fas fa-star"></i>';
        else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// Cart Logic
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('beauty_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function updateCartCount() {
    const countItems = document.querySelectorAll('.cart-count');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countItems.forEach(el => el.textContent = total);
}

// Quick View Modal
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !modalOverlay) return;

    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `₹${product.price}`;
    document.getElementById('modal-desc').textContent = product.description;
    document.getElementById('modal-add-btn').onclick = () => addToCart(product.id);

    modalOverlay.classList.add('active');
}

function closeQuickView() {
    if(modalOverlay) {
        modalOverlay.classList.remove('active');
    }
}

// Sorting & Filtering
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        let sorted = [...currentProducts];
        if (e.target.value === 'low') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (e.target.value === 'high') {
            sorted.sort((a, b) => b.price - a.price);
        }
        renderProducts(sorted);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = currentProducts.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
        renderProducts(filtered);
    });
}

// Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Scroll to Top
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Render Cart Page
function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    
    if (!cartContainer || !cartTotalAmount) return;
    
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Your cart is empty. <a href="index.html" style="color:var(--accent-color)">Continue Shopping</a></td></tr>';
        cartTotalAmount.textContent = '₹0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                ${item.name}
            </td>
            <td>₹${item.price}</td>
            <td>
                <input type="number" class="cart-qty" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)">
            </td>
            <td>₹${itemTotal}</td>
            <td>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartContainer.appendChild(tr);
    });

    cartTotalAmount.textContent = `₹${total}`;
}

function updateCartQuantity(index, quantity) {
    if (quantity < 1) quantity = 1;
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('beauty_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('beauty_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// Form validation (Homepage)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent successfully! We will get back to you soon.');
        contactForm.reset();
    });
}

const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        showToast('Order placed successfully! Thank you for shopping with BEAUTY.');
        cart = [];
        localStorage.setItem('beauty_cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
        checkoutForm.reset();
    });
}
