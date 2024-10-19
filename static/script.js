// Get the button element
const recommendBtn = document.querySelector('.recommendBtn button');

// Array of different aesthetics
const aesthetics = [
  { bannerColor: '#f7d6e0', bannerTextColor: '#4d295a', captionColor: '#fef2bf', captionTextColor: '#735c00' },
  { bannerColor: '#b0e5a1', bannerTextColor: '#2e663f', captionColor: '#f0f0f0', captionTextColor: '#333' },
  // Add more aesthetic options here as desired
];

// Initialize the current aesthetic index
let currentAestheticIndex = 0;

// Function to handle the click event and apply the next aesthetic
function changeAesthetic() {
  // Get the banner and captionText elements
  const banner = document.querySelector('.banner');
  const captionText = document.querySelector('.captionText');

  // Get the next aesthetic from the array
  const nextAesthetic = aesthetics[currentAestheticIndex];

  // Apply the new styles
  banner.style.backgroundColor = nextAesthetic.bannerColor;
  banner.style.color = nextAesthetic.bannerTextColor;
  captionText.style.backgroundColor = nextAesthetic.captionColor;
  captionText.style.color = nextAesthetic.captionTextColor;

  // Move to the next aesthetic (circular)
  currentAestheticIndex = (currentAestheticIndex + 1) % aesthetics.length;
}

// Add a click event listener to the button
recommendBtn.addEventListener('click', changeAesthetic);
