// Initialize the calculator
const calculator = new TimeCalculator(CONFIG.START_DATE, CONFIG.TIMEZONE);

// Get DOM elements
const yearsElement = document.getElementById('years');
const monthsElement = document.getElementById('months');
const weeksElement = document.getElementById('weeks');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const themeToggle = document.querySelector('.theme-toggle');

// Theme handling
let isDarkMode = false;
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Initialize theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    toggleTheme();
}

themeToggle.addEventListener('click', toggleTheme);

// Helper function to animate number changes
function animateNumberChange(element, newValue) {
    const oldValue = element.textContent;
    if (oldValue !== newValue) {
        element.classList.add('changing');
        setTimeout(() => element.classList.remove('changing'), 500);
    }
    element.textContent = newValue;
}
const musicToggle = document.querySelector('.music-toggle');
const bgMusic = document.getElementById('bgMusic');
const counterCards = document.querySelectorAll('.counter-card');

// Update all counters
function updateCounters() {
    const time = calculator.calculateTimeDifference();
    
    animateNumberChange(yearsElement, time.years);
    animateNumberChange(monthsElement, time.months);
    animateNumberChange(weeksElement, time.weeks);
    animateNumberChange(daysElement, time.days);
    animateNumberChange(hoursElement, time.hours);
    animateNumberChange(minutesElement, time.minutes);
    animateNumberChange(secondsElement, time.seconds);

    // Add anniversary effect if it's a monthly anniversary
    if (time.isMonthAnniversary) {
        counterCards.forEach(card => {
            card.classList.add('anniversary');
        });
    } else {
        counterCards.forEach(card => {
            card.classList.remove('anniversary');
        });
    }
}

// Music toggle functionality
let isMusicPlaying = false;
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggle.style.opacity = '0.7';
    } else {
        bgMusic.play();
        musicToggle.style.opacity = '1';
    }
    isMusicPlaying = !isMusicPlaying;
});

// Update counters every second
updateCounters();
setInterval(updateCounters, 1000);

// Create floating elements dynamically
function createFloatingElements() {
    const container = document.querySelector('.floating-elements');
    const elements = ['❤️', '⭐', '✨'];
    
    setInterval(() => {
        const element = document.createElement('div');
        element.textContent = elements[Math.floor(Math.random() * elements.length)];
        element.style.left = Math.random() * 100 + 'vw';
        element.style.animationDuration = (15 + Math.random() * 10) + 's';
        element.style.opacity = '0.3';
        element.className = 'floating-element';
        
        container.appendChild(element);
        
        // Remove element after animation
        setTimeout(() => {
            element.remove();
        }, 25000);
    }, 3000);
}

// Start floating elements animation
createFloatingElements();
