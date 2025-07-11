// DOM Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const likeButtons = document.querySelectorAll('.like-btn');

// Filter functionality
function initializeFiltering() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter the product cards
            filterProducts(filterValue);
        });
    });
}

// Filter products based on category
function filterProducts(category) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            // Show the card
            card.classList.remove('hidden');
            // Add a small delay for smooth appearance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            // Hide the card
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            // Add hidden class after transition
            setTimeout(() => {
                card.classList.add('hidden');
            }, 300);
        }
    });
    
    // Update the count or perform any additional actions
    updateVisibleCount(category);
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
    productCards.forEach(card => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
}

// Search functionality (bonus feature)
function initializeSearch() {
    // Create search input if it doesn't exist
    const existingSearch = document.querySelector('.search-input');
    if (!existingSearch) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.cssText = `
            margin-bottom: 1rem;
            text-align: center;
        `;
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search products...';
        searchInput.style.cssText = `
            padding: 0.75rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            font-size: 1rem;
            width: 300px;
            max-width: 100%;
            outline: none;
            transition: border-color 0.3s ease;
        `;
        
        searchContainer.appendChild(searchInput);
        
        // Insert before filter buttons
        const filterContainer = document.querySelector('.filter-buttons');
        filterContainer.parentNode.insertBefore(searchContainer, filterContainer);
        
        // Add search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            productCards.forEach(card => {
                const productName = card.querySelector('h3').textContent.toLowerCase();
                const isVisible = productName.includes(searchTerm);
                
                if (isVisible) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        
        // Style focus state
        searchInput.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
        });
        
        searchInput.addEventListener('blur', function() {
            this.style.borderColor = '#e2e8f0';
        });
    }
}

// Add loading animation
function addLoadingAnimation() {
    // Initially hide all cards
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        // Animate cards in sequence
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initializeFiltering();
    initializeLikeButtons();
    restoreLikedState();
    addFilterTransitions();
    
    // Optional enhancements
    initializeSearch();
    addLoadingAnimation();
    
    // Add keyboard navigation for accessibility
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
    });
    
    console.log('Product Gallery initialized successfully!');
    console.log('Keyboard shortcuts:');
    console.log('- Press 1-5 to filter categories');
    console.log('- Press Escape to show all products');
});

// Add window resize handler for responsive adjustments
window.addEventListener('resize', function() {
    // Recalculate any dynamic layouts if needed
    const gallery = document.querySelector('.product-gallery');
    if (gallery) {
        // Force reflow for better responsive behavior
        gallery.style.display = 'none';
        gallery.offsetHeight; // Trigger reflow
        gallery.style.display = 'grid';
    }
});

// Export functions for potential external use
window.ProductGallery = {
    filterProducts,
    initializeFiltering,
    initializeLikeButtons,
    restoreLikedState
};