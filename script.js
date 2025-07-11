// DOM Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const likeButtons = document.querySelectorAll('.like-btn');

// Performance optimization variables
let isFiltering = false;
let filterTimeout = null;
let activeAnimations = new Set();

// Filter functionality with debouncing
function initializeFiltering() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Prevent multiple rapid clicks
            if (isFiltering) return;
            
            // Clear any pending filter operations
            if (filterTimeout) {
                clearTimeout(filterTimeout);
            }
            
            // Cancel all active animations
            cancelActiveAnimations();
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter the product cards with debouncing
            isFiltering = true;
            filterProducts(filterValue);
            
            // Reset filtering flag after animation completes
            filterTimeout = setTimeout(() => {
                isFiltering = false;
                activeAnimations.clear();
            }, 400);
        });
    });
}

// Cancel all active animations
function cancelActiveAnimations() {
    activeAnimations.forEach(card => {
        card.classList.remove('filtering', 'filter-in', 'filter-out');
        card.style.animationDelay = '';
        card.removeEventListener('animationend', handleAnimationEnd);
    });
    activeAnimations.clear();
}

// Enhanced filtering function with search support
function filterProducts(category = null, searchTerm = '') {
    // Cancel any active animations
    cancelActiveAnimations();
    
    // Get current active filter if no category specified
    if (category === null) {
        const activeBtn = document.querySelector('.filter-btn.active');
        category = activeBtn ? activeBtn.dataset.filter : 'all';
    }
    
    // Get current search term if not provided
    if (!searchTerm) {
        const searchInput = document.getElementById('search-input');
        searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    }
    
    // Immediately clean up all animation states
    productCards.forEach(card => {
        card.classList.remove('filter-in', 'filter-out', 'filtering');
        card.style.animationDelay = '';
        card.removeEventListener('animationend', handleAnimationEnd);
    });
    
    // Use double requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const visibleCards = [];
            const hiddenCards = [];
            
            // Separate cards into visible and hidden arrays based on both filter and search
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardName = card.querySelector('h3').textContent.toLowerCase();
                
                const matchesCategory = category === 'all' || cardCategory === category;
                const matchesSearch = !searchTerm || cardName.includes(searchTerm);
                const shouldShow = matchesCategory && matchesSearch;
                
                if (shouldShow) {
                    visibleCards.push(card);
                } else {
                    hiddenCards.push(card);
                }
            });
            
            // Process hidden cards immediately
             hiddenCards.forEach(card => {
                 card.classList.add('filtering', 'filter-out');
                 card.addEventListener('animationend', handleAnimationEnd, { once: true });
                 activeAnimations.add(card);
             });
             
             // Process visible cards immediately
             visibleCards.forEach((card, index) => {
                 card.classList.remove('hidden');
                 card.classList.add('filtering', 'filter-in');
                 card.style.animationDelay = `${index * 15}ms`;
                 card.addEventListener('animationend', handleAnimationEnd, { once: true });
                 activeAnimations.add(card);
             });
        });
    });
    
    // Update the count
    updateVisibleCount(category);
    updateFilterCounts();
}

// Update filter button counts
function updateFilterCounts() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const category = btn.dataset.filter;
        
        let count = 0;
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardName = card.querySelector('h3').textContent.toLowerCase();
            
            const matchesCategory = category === 'all' || cardCategory === category;
            const matchesSearch = !searchTerm || cardName.includes(searchTerm);
            
            if (matchesCategory && matchesSearch) {
                count++;
            }
        });
        
        const countSpan = btn.querySelector('.count');
        if (countSpan) {
            countSpan.textContent = count;
        }
    });
}

// Handle animation end events
function handleAnimationEnd(event) {
    const card = event.target;
    
    if (card.classList.contains('filter-out')) {
        card.classList.add('hidden');
    }
    
    // Clean up animation classes
    card.classList.remove('filtering', 'filter-in', 'filter-out');
    card.style.animationDelay = '';
    
    // Remove from active animations set
    activeAnimations.delete(card);
}

// Update visible product count (optional enhancement)
function updateVisibleCount(category) {
    const visibleCards = document.querySelectorAll('.product-card:not(.hidden)');
    console.log(`Showing ${visibleCards.length} products for category: ${category}`);
}

// Like button functionality
function initializeLikeButtons() {
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Prevent card click event if any
            e.stopPropagation();
            
            // Toggle liked state
            this.classList.toggle('liked');
            
            // Add a small animation effect
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            // Optional: Store liked state in localStorage
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            storeLikedState(productName, this.classList.contains('liked'));
        });
    });
}

// Store liked state in localStorage (optional enhancement)
function storeLikedState(productName, isLiked) {
    let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    
    if (isLiked) {
        if (!likedProducts.includes(productName)) {
            likedProducts.push(productName);
        }
    } else {
        likedProducts = likedProducts.filter(name => name !== productName);
    }
    
    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
}

// Restore liked state from localStorage (optional enhancement)
function restoreLikedState() {
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent;
        const likeButton = card.querySelector('.like-btn');
        
        if (likedProducts.includes(productName)) {
            likeButton.classList.add('liked');
        }
    });
}

// Add smooth transitions for filtering
function addFilterTransitions() {
    // Remove this function as we'll use CSS classes instead
    // CSS animations are more performant than JS transitions
}

// Enhanced search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterProducts(null, searchTerm);
    });
    
    // Clear search on Escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            filterProducts();
        }
    });
}

// Sort functionality
function initializeSort() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        sortProducts(sortBy);
    });
}

function sortProducts(sortBy) {
    const gallery = document.querySelector('.product-gallery');
    const cards = Array.from(gallery.querySelectorAll('.product-card'));
    
    cards.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'name-desc':
                return b.dataset.name.localeCompare(a.dataset.name);
            case 'price-asc':
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            case 'price-desc':
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => gallery.appendChild(card));
}

// View toggle functionality
function initializeViewToggle() {
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const gallery = document.querySelector('.product-gallery');
    
    if (!gridBtn || !listBtn || !gallery) return;
    
    gridBtn.addEventListener('click', () => {
        gallery.classList.remove('list-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        localStorage.setItem('viewMode', 'grid');
    });
    
    listBtn.addEventListener('click', () => {
        gallery.classList.add('list-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        localStorage.setItem('viewMode', 'list');
    });
    
    // Restore saved view mode
    const savedView = localStorage.getItem('viewMode') || 'grid';
    if (savedView === 'list') {
        listBtn.click();
    }
}

// Cart functionality
function initializeCart() {
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const card = this.closest('.product-card');
            const productName = card.dataset.name;
            const productPrice = card.dataset.price;
            
            // Add to cart animation
            this.style.transform = 'scale(0.95)';
            this.textContent = 'Đã thêm!';
            
            setTimeout(() => {
                this.style.transform = '';
                this.textContent = 'Thêm vào giỏ';
            }, 1000);
            
            // Store in localStorage (simple cart)
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.name === productName);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: parseFloat(productPrice),
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        });
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart count in UI if element exists
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Clear filters functionality
function initializeClearFilters() {
    const clearBtn = document.getElementById('clear-filters-btn');
    if (!clearBtn) return;
    
    clearBtn.addEventListener('click', function() {
        // Reset all filters
        document.getElementById('search-input').value = '';
        document.getElementById('sort-select').value = 'default';
        
        // Reset active filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        
        // Show all products
        filterProducts();
    });
}

// Add loading animation
function addLoadingAnimation() {
    // Use CSS classes for better performance
    productCards.forEach((card, index) => {
        card.classList.add('loading');
        card.style.animationDelay = `${index * 100}ms`;
        
        // Remove loading class after animation
        setTimeout(() => {
            card.classList.remove('loading');
            card.classList.add('loaded');
        }, 600 + (index * 100));
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initializeFiltering();
    initializeLikeButtons();
    restoreLikedState();
    addFilterTransitions();
    
    // Enhanced features
    initializeSearch();
    initializeSort();
    initializeViewToggle();
    initializeCart();
    initializeClearFilters();
    addLoadingAnimation();
    updateCartCount();
    
    // Initialize filter counts
    updateFilterCounts();
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Press 'Escape' to show all products
        if (e.key === 'Escape') {
            const allButton = document.querySelector('[data-filter="all"]');
            if (allButton) {
                allButton.click();
            }
        }
        
        // Press number keys to filter categories
        const numberKeys = ['1', '2', '3', '4', '5'];
        const keyIndex = numberKeys.indexOf(e.key);
        if (keyIndex !== -1 && filterButtons[keyIndex]) {
            filterButtons[keyIndex].click();
        }
        
        // Press 'S' to focus search
        if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
            const searchInput = document.getElementById('search-input');
            if (searchInput && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
        
        // Press 'G' for grid view, 'L' for list view
        if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
            const gridBtn = document.getElementById('grid-view-btn');
            if (gridBtn && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                gridBtn.click();
            }
        }
        
        if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
            const listBtn = document.getElementById('list-view-btn');
            if (listBtn && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                listBtn.click();
            }
        }
        
        // Press 'C' to clear filters
        if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
            const clearBtn = document.getElementById('clear-filters-btn');
            if (clearBtn && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                clearBtn.click();
            }
        }
    });
    
    console.log('Product Gallery initialized successfully!');
    console.log('Keyboard shortcuts:');
    console.log('- Press 1-5 to filter categories');
    console.log('- Press Escape to show all products');
});

// Add window resize handler for responsive adjustments
window.addEventListener('resize', function() {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(function() {
        // Re-initialize any responsive features if needed
        updateVisibleCount();
        updateFilterCounts();
        
        // Recalculate any dynamic layouts if needed
        const gallery = document.querySelector('.product-gallery');
        if (gallery) {
            // Force reflow for better responsive behavior
            gallery.style.display = 'none';
            gallery.offsetHeight; // Trigger reflow
            gallery.style.display = 'grid';
        }
    }, 250);
});

// Export functions for potential external use
window.ProductGallery = {
    filterProducts,
    initializeFiltering,
    initializeLikeButtons,
    restoreLikedState
};