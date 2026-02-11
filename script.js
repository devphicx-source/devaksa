// Devaksa Green Solutions - Apple Style Interactive Logic

document.addEventListener("DOMContentLoaded", () => {
    console.log("Devaksa Experience Loaded");

    // Check Auth State
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

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

// Mock Enquiry Logic / Buy Now
function openEnquiry(productName) {
    const token = localStorage.getItem('token');

    if (!token) {
        if (confirm("You must be logged in to purchase products.\n\nGo to Login Page?")) {
            window.location.href = "login.html";
        }
        return;
    }

    const message = `Interested in ${productName}?\n\nOur team will contact you shortly about pricing and delivery.`;
    if (confirm(message + "\n\nClick OK to go to the Enquiry Form.")) {
        // Pre-fill the enquiry modal if possible, or just open it
        // For now, let's open the modal we made
        const modal = document.getElementById('enquiry-modal');
        if (modal) {
            // Pre-fill product name
            const productInput = modal.querySelector('input[placeholder*="Product Name"]');
            if (productInput) productInput.value = productName;
            openEnquiryModal();
        } else {
            window.location.href = "sendEnq.html"; // Fallback if modal missing
        }
    }
}

// Review Modal Logic
// Review Modal Logic
function openReviewModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm("You must be logged in to write a review.\n\nGo to Login Page?")) {
            window.location.href = "login.html";
        }
        return;
    }

    const modal = document.getElementById('review-modal');
    modal.style.display = 'flex';
    // Small delay to allow display:flex to apply before adding active class for transition
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
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
            alert("Thank you! Your review has been submitted.");
            closeReviewModal();
            e.target.reset();
            rate(0);
        } else {
            alert("Failed to submit review. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
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
    const inputs = e.target.querySelectorAll('input, textarea');
    const enquiryData = {
        productName: inputs[0].value,
        name: inputs[1].value,
        email: inputs[2].value,
        message: inputs[3].value
    };

    try {
        const response = await fetch('/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enquiryData)
        });

        if (response.ok) {
            alert("Enquiry Sent! We will contact you shortly.");
            closeEnquiryModal();
            e.target.reset();
        } else {
            alert("Failed to send enquiry.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}
