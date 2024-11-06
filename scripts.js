// Carousel state variables
let currentIndex = 0;
let isAnimating = false;

// Touch handling variables
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50;

// Social media links configuration
const socialLinks = {
    facebook: "https://facebook.com/share?url=",
    twitter: "https://twitter.com/intent/tweet?url=",
    linkedin: "https://www.linkedin.com/sharing/share-offsite/?url="
};


let books = [];

// Function to update the carousel display
function updateCarousel() {
    const carousel = document.querySelector('.book-carousel');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = document.querySelectorAll('.book-pair').length;
    
    // Update transform
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
    
    // Update button visibility
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    
    if (leftBtn) leftBtn.style.display = currentIndex === 0 ? 'none' : 'block';
    if (rightBtn) rightBtn.style.display = currentIndex === totalSlides - 1 ? 'none' : 'block';
}

// Function to scroll left
function scrollLeft() {
    if (currentIndex > 0 && !isAnimating) {
        isAnimating = true;
        currentIndex--;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
}

// Function to scroll right
function scrollRight() {
    const totalSlides = document.querySelectorAll('.book-pair').length;
    if (currentIndex < totalSlides - 1 && !isAnimating) {
        isAnimating = true;
        currentIndex++;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
}

// Function to set slide for dots
function setSlide(index) {
    if (!isAnimating) {
        isAnimating = true;
        currentIndex = index;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
}

// Handle touch events
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (!touchStartX) return;
    touchEndX = event.touches[0].clientX;
    event.preventDefault();
}

function handleTouchEnd() {
    if (!touchStartX || !touchEndX) return;

    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
            scrollLeft();
        } else {
            scrollRight();
        }
    }
    
    touchStartX = 0;
    touchEndX = 0;
}

// Create individual book element with social sharing
function createBookElement(book) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book-item';
    bookDiv.innerHTML = `
        ${book.coverImage ? `<img src="${book.coverImage}" class="book-cover" alt="${book.title}">` : ''}
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <p>${book.description || ''}</p>
        <div class="share-icon">
            <i class="fas fa-share-alt"></i>
            <div class="social-tooltip">
                <div class="social-links">
                    <a href="${socialLinks.facebook}${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-facebook"></i>
                        <span class="tooltip">Share on Facebook</span>
                    </a>
                    <a href="${socialLinks.twitter}${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-twitter"></i>
                        <span class="tooltip">Share on Twitter</span>
                    </a>
                    <a href="${socialLinks.linkedin}${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-linkedin"></i>
                        <span class="tooltip">Share on LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Add click event for share icon
    const shareIcon = bookDiv.querySelector('.share-icon');
    shareIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const tooltip = shareIcon.querySelector('.social-tooltip');
        // Hide all other tooltips first
        document.querySelectorAll('.social-tooltip').forEach(t => {
            if (t !== tooltip) t.classList.remove('show');
        });
        // Toggle current tooltip
        tooltip.classList.toggle('show');
    });

    return bookDiv;
}

// Fetch books from Airtable
// Add this near the top of your file where other constants are defined
const NETLIFY_FUNCTION_URL = 'https://unique-baklava-fb1387.netlify.app/.netlify/functions/getBooks';

// Update your fetchBooks function to use this URL
async function fetchBooks() {
    try {
        const response = await fetch(NETLIFY_FUNCTION_URL);
        const data = await response.json();
        
        books = data.records.map(record => ({
            id: record.id,
            title: record.fields.Title,
            author: record.fields.Author,
            coverImage: record.fields.CoverImage?.[0]?.url || '',
            description: record.fields.Description
        }));
        
        renderBooks();
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Render books in the carousel
function renderBooks() {
    const carousel = document.querySelector('.book-carousel');
    carousel.innerHTML = ''; // Clear existing content

    // Create book pairs
    for (let i = 0; i < books.length; i += 2) {
        const pair = document.createElement('div');
        pair.className = 'book-pair';

        // Add first book
        pair.appendChild(createBookElement(books[i]));

        // Add second book if it exists
        if (books[i + 1]) {
            pair.appendChild(createBookElement(books[i + 1]));
        }

        carousel.appendChild(pair);
    }

    // Initialize carousel state
    updateCarousel();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start fetching books from Airtable
    fetchBooks();
    setInterval(fetchBooks, 60000); // Poll every minute
    
    // Initialize carousel
    const carousel = document.querySelector('.book-carousel');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    
    // Add touch event listeners
    if (carousel) {
        carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
        carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Add button click listeners
    if (leftBtn) leftBtn.addEventListener('click', scrollLeft);
    if (rightBtn) rightBtn.addEventListener('click', scrollRight);
    
    // Add dot click listeners
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => setSlide(index));
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.share-icon')) {
            document.querySelectorAll('.social-tooltip').forEach(tooltip => {
                tooltip.classList.remove('show');
            });
        }
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        scrollLeft();
    } else if (e.key === 'ArrowRight') {
        scrollRight();
    }
});