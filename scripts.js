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