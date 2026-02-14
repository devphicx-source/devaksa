// Devaksa Green Solutions - Apple Style Interactive Logic

document.addEventListener("DOMContentLoaded", () => {
    console.log("Devaksa Experience Loaded");


    // Check Auth State
    checkAuthState();

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // ... (rest of code)
    });

    // Check Auth State
    checkAuthState();

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {


        // Smooth Scrolling for Navigation Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    const navLinks = document.querySelector('.nav-links');
                    const menuIcon = document.querySelector('.mobile-menu-btn i');

                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        menuIcon.classList.remove('fa-xmark');
                        menuIcon.classList.add('fa-bars');
                    }

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar Scroll Effect
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.style.background = "rgba(251, 251, 253, 0.85)";
                navbar.style.borderBottom = "1px solid rgba(0,0,0,0.08)";
            } else {
                navbar.style.background = "rgba(251, 251, 253, 0.72)";
                navbar.style.borderBottom = "1px solid rgba(0,0,0,0.0)";
            }
        });

        // Intersection Observer for Fade-in Animations
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, observerOptions);

        // Apply animation to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";
            card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
            observer.observe(card);
        });

        // Native select is now being used; custom logic removed.
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuIcon = document.querySelector('.mobile-menu-btn i');

    navLinks.classList.toggle('active');

    if (navLinks.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
    } else {
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    }
}

// Custom Confirmation Logic
let performConfirmAction = null;

function showConfirmModal(message, actionCallback) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-yes-btn');

    messageEl.textContent = message;
    performConfirmAction = actionCallback;

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Remove old listener to prevent stacking
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
        if (performConfirmAction) performConfirmAction();
        closeConfirmModal();
    });
}

// Custom Success/Alert Modal Logic
// Custom Toast Notification Logic
function showSuccessModal(message) {
    // Create toast element dynamically
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span></span>';
        document.body.appendChild(toast);
    }

    toast.querySelector('span').textContent = message;

    // Show toast
    requestAnimationFrame(() => {
        toast.classList.add('active');
    });

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Reuse closeConfirmModal for both
function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const cancelBtn = modal.querySelector('.btn-secondary');
    const confirmBtn = document.getElementById('confirm-yes-btn');

    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        // Reset state in case it was used as an alert
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        if (confirmBtn) confirmBtn.textContent = "Yes";
    }, 300);
}

// Close confirm modal on outside click
const confirmModal = document.getElementById('confirm-modal');
if (confirmModal) {
    confirmModal.addEventListener('click', function (e) {
        if (e.target === this) closeConfirmModal();
    });
}

// Mock Enquiry Logic / Buy Now
function openEnquiry(productName) {
    const token = localStorage.getItem('token');

    if (!token) {
        showConfirmModal("You must be logged in to purchase products.\nGo to Login Page?", () => {
            window.location.href = "login.html";
        });
        return;
    }

    const message = `Interested in ${productName}?\nOur team will contact you shortly. Proceed to Enquiry?`;
    showConfirmModal(message, () => {
        const modal = document.getElementById('enquiry-modal');
        if (modal) {
            const productInput = modal.querySelector('input[placeholder*="Product Name"]');
            if (productInput) productInput.value = productName.trim();
            openEnquiryModal();
        } else {
            window.location.href = "sendEnq.html";
        }
    });
}

// Review Modal Logic
function openReviewModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        showConfirmModal("You must be logged in to write a review.\nGo to Login Page?", () => {
            window.location.href = "login.html";
        });
        return;
    }

    const modal = document.getElementById('review-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Logout Function
function logout() {
    showConfirmModal("Are you sure you want to logout?", () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showSuccessModal("Logged out successfully.");
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Wait for transition
}

// Close modal when clicking outside
const modalElement = document.getElementById('review-modal');
if (modalElement) {
    modalElement.addEventListener('click', function (e) {
        if (e.target === this) {
            closeReviewModal();
        }
    });
}

// Star Rating Logic
let currentRating = 0;
function rate(stars) {
    currentRating = stars;
    const starElements = document.querySelectorAll('.star-rating i');
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid');
        } else {
            star.classList.remove('fa-solid');
            star.classList.add('fa-regular');
        }
    });
}

// Submit Review
async function submitReview(e) {
    e.preventDefault();

    // Get form data
    const form = e.target;
    const productName = form.querySelector('select').value;
    const comment = form.querySelector('textarea').value;

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const reviewerName = user.name || "Guest User";

    const reviewData = {
        productName: productName,
        reviewerName: reviewerName,
        rating: currentRating || 5, // Default to 5 if not selected
        comment: comment
    };

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            showSuccessModal("Thank you! Your review has been submitted.");
            closeReviewModal();
            e.target.reset();
            rate(0);
        } else {
            showSuccessModal("Failed to submit review. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        showSuccessModal("Something went wrong.");
    }
}

// Enquiry Modal Logic
function openEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close enquiry modal when clicking outside
const enquiryModal = document.getElementById('enquiry-modal');
if (enquiryModal) {
    enquiryModal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeEnquiryModal();
        }
    });
}

async function submitEnquiry(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const enquiryData = {
        productName: formData.get('productName'),
        name: formData.get('name'),
        email: formData.get('email'),
        countryCode: formData.get('countryCode'),
        mobile: formData.get('mobile'),
        message: formData.get('message')
    };

    try {
        const response = await fetch('/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enquiryData)
        });

        if (response.ok) {
            showSuccessModal("Enquiry Sent! We will contact you shortly.");
            closeEnquiryModal();
            e.target.reset();
        } else {
            showSuccessModal("Failed to send enquiry.");
        }
    } catch (error) {
        console.error("Error:", error);
        showSuccessModal("Something went wrong.");
    }
}

// Add to Cart Logic
async function addToCart(productName) {
    const token = localStorage.getItem('token');

    if (!token) {
        showConfirmModal("You must be logged in to add items to cart.\nGo to Login Page?", () => {
            window.location.href = "login.html";
        });
        return;
    }

    try {
        // Map product names to images (Case-insensitive matching)
        const productImages = {
            'cow dung cake': 'cow-dung-cake.jpeg',
            'varmi compost': 'cow-dung-manure.jpeg',
            'raw forest honey': 'natural-pure-raw-honey-.jpeg',
            'cow dung manure': 'cow-dung-powder.jpeg',
            'moringa powder': 'moringa.jpeg'
        };

        const normalizedName = productName.toLowerCase().trim();
        const image = productImages[normalizedName] || 'devaks-logo.png';

        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productName,
                price: 499, // Hardcoded for now as per index.html
                image
            })
        });

        if (response.ok) {
            const cartDot = document.querySelector('.cart-dot');
            if (cartDot) {
                cartDot.style.display = 'block';
                cartDot.classList.add('pulse');
                setTimeout(() => cartDot.classList.remove('pulse'), 500);
            }
            showSuccessModal(`${productName} added to cart!`);
        } else {
            const errorText = await response.text();
            console.error('Failed response:', response.status, errorText);
            showSuccessModal(`Failed to add item to cart (Status: ${response.status}).`);
        }
    } catch (error) {
        console.error("Cart Error:", error);
        showSuccessModal("Something went wrong. Check console.");
    }
}



// Global Auth Functions
function checkAuthState() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Only try to toggle if elements exist (avoids errors on pages without these IDs)
    if (loginBtn && logoutBtn) {
        if (token) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'flex';
        } else {
            loginBtn.style.display = 'flex';
            logoutBtn.style.display = 'none';
        }
    }
}
