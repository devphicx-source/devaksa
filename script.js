// ===== Page Load =====
document.addEventListener("DOMContentLoaded", function () {
    console.log("E-commerce Website Loaded Successfully");
});

// ===== Search Function =====
const searchIcon = document.querySelector(".search-icon");
const searchInput = document.querySelector(".search-input");

searchIcon.addEventListener("click", function () {
    if (searchInput.value.trim() === "") {
        alert("Please enter a product to search");
    } else {
        alert("Searching for: " + searchInput.value);
    }
});

// ===== Cart Click =====
const cart = document.querySelector(".nav-cart");
cart.addEventListener("click", function () {
    alert("Your cart is empty 🛒");
});

// ===== Sign In Click =====
const signIn = document.querySelector(".nav-signin");
signIn.addEventListener("click", function () {
    alert("Login / Sign Up page coming soon");
});

// ===== See More Buttons =====
const seeMoreButtons = document.querySelectorAll(".box-content p");

seeMoreButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        alert("More products coming soon 🔥");
    });
});

// ===== Back to Top =====
const backToTop = document.querySelector(".foot-panel1");
backToTop.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

document.querySelectorAll(".price-btn").forEach(btn=>{
  btn.onclick = ()=> alert("Contact us for latest price");
});


function openZoom(img){
    document.getElementById("zoomBox").style.display = "flex";
    document.getElementById("zoomImage").src = img.src;
}

function closeZoom(){
    document.getElementById("zoomBox").style.display = "none";
}




function openReview(){
  document.getElementById("reviewModal").style.display="block";
}

function closeReview(){
  document.getElementById("reviewModal").style.display="none";
}


function openMenu() {
  document.getElementById("mySidebar").style.width = "280px";
}

function closeMenu() {
  document.getElementById("mySidebar").style.width = "0";
}
