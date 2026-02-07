// Sample tools data
const tools = [
    { emoji: "🖼️", title: "JPG to PNG Batch", description: "Multi-threaded local conversion. Choose Best Quality for lossless assets or Optimized 8-bit PNGs using intelligent quantization.", category: "image-to-image", url:"https://convertpixels.org/jpg-to-png" },
    { emoji: "🖼️", title: "PNG to JPG Batch", description: "Instant browser-based processing. Convert up to 20 PNGs to high-quality JPGs without ever uploading a single byte to a server.", category: "image-to-image", url:"https://convertpixels.org/png-to-jpg" },
    { emoji: "🖼️", title: "WEBP to PNG Batch", description: "High-speed worker-driven conversion. Turn modern WebP files into universal PNGs while preserving alpha transparency and quality.", category: "image-to-image", url:"https://convertpixels.org/webp-to-png" },
    { emoji: "🖼️", title: "JPG to WEBP Batch", description: "The ultimate web optimization tool. Convert JPG to WebP for faster site speeds using multi-core processing on your own device.", category: "image-to-image", url:"https://convertpixels.org/jpg-to-webp" },
    { emoji: "🖼️", title: "PNG to WEBP Batch", description: "Advanced high-performance compression. Keep your transparency but cut file sizes by 70% with client-side quantization logic.", category: "image-to-image", url:"https://convertpixels.org/png-to-webp" },
    { emoji: "🖼️", title: "WEBP to JPG Batch", description: "Fast, local conversion to standard JPG format. Process batch images in seconds with dedicated workers for maximum performance.", category: "image-to-image", url:"https://convertpixels.org/webp-to-jpg" }
];

// DOM Elements
const exploreBtn = document.getElementById('exploreBtn');
const toolsGridContainer = document.getElementById('toolsGridContainer');
const toolsGrid = document.getElementById('toolsGrid');
const searchBar = document.getElementById('searchBar');
const requestForm = document.getElementById('requestForm');
const scrollProgress = document.getElementById('scrollProgress');
const searchResultsInfo = document.getElementById('searchResultsInfo');

// Search state variables
let searchTimeout;
let isSearchActive = false;

// ===== PERFECT SCROLLING FUNCTION =====
function scrollToElementPerfectly(element) {
    const topBar = document.querySelector('.top-bar');
    const topBarHeight = topBar ? topBar.offsetHeight : 70;
    const isMobile = window.innerWidth <= 768;
    
    // Get BOTH elements positions
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + window.scrollY;
    
    // Check if search results are visible
    const searchResultsVisible = searchResultsInfo && 
                                searchResultsInfo.classList.contains('show');
    let searchResultsHeight = 0;
    
    if (searchResultsVisible) {
        const resultsRect = searchResultsInfo.getBoundingClientRect();
        searchResultsHeight = resultsRect.height + 20; // Add margin
    }
    
    // Calculate perfect scroll position
    let targetScroll;
    
    if (isMobile) {
        // Mobile: element should be near top, but not under top bar
        // Account for search results height
        targetScroll = elementTop - topBarHeight - 30 - searchResultsHeight;
    } else {
        // Desktop: element should be comfortably visible
        const viewportHeight = window.innerHeight;
        const elementHeight = elementRect.height;
        
        if (elementHeight > viewportHeight * 0.6) {
            // If element is large, show top part (accounting for search results)
            targetScroll = elementTop - topBarHeight - 40 - searchResultsHeight;
        } else {
            // If element is small, center it
            targetScroll = elementTop - (viewportHeight / 2) + (elementHeight / 2);
            
            // If search results would be cut off, adjust
            if (searchResultsVisible) {
                const resultsTop = elementTop - searchResultsHeight - 30;
                if (targetScroll > resultsTop) {
                    targetScroll = resultsTop;
                }
            }
        }
    }
    
    // Ensure we don't scroll past the top
    targetScroll = Math.max(0, targetScroll);
    
    // Smooth scroll
    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
    
    return targetScroll;
}

// ===== UPDATE SEARCH RESULTS =====
function updateSearchResults(visibleCount, searchTerm) {
    if (!searchResultsInfo) return;
    
    if (searchTerm && searchTerm.length > 0) {
        if (visibleCount === 0) {
            searchResultsInfo.innerHTML = `🔍 No tools found for "<strong>${searchTerm}</strong>"`;
            searchResultsInfo.className = 'search-results-info show no-results';
        } else {
            searchResultsInfo.innerHTML = `🔍 Found <strong>${visibleCount}</strong> tool${visibleCount !== 1 ? 's' : ''} for "<strong>${searchTerm}</strong>"`;
            searchResultsInfo.className = 'search-results-info show has-results';
        }
    } else {
        searchResultsInfo.className = 'search-results-info';
    }
}

// Initialize tools grid
function initializeToolsGrid() {
    toolsGrid.innerHTML = '';
    
    tools.forEach((tool, index) => {
        const toolCard = document.createElement('a');
        toolCard.href = tool.url;
        toolCard.className = 'tool-card fade-in-up';
        toolCard.setAttribute('data-title', tool.title.toLowerCase());
        toolCard.setAttribute('data-description', tool.description.toLowerCase());
        toolCard.setAttribute('data-category', tool.category);
        toolCard.setAttribute('data-original-index', index);
        toolCard.style.animationDelay = `${index * 0.05}s`;
        
        toolCard.innerHTML = `
            <div class="tool-emoji">${tool.emoji}</div>
            <h3 class="tool-title">${tool.title}</h3>
            <p class="tool-description">${tool.description}</p>
        `;
        
        toolsGrid.appendChild(toolCard);
    });
}

// Explore button click handler
exploreBtn.addEventListener('click', function() {
    const isExpanded = toolsGridContainer.classList.contains('expanded');
    
    if (isExpanded) {
        this.classList.remove('rotated');
        toolsGridContainer.classList.remove('expanded');
        // Clear search when manually closing
        if (searchBar.value.trim() === '') {
            searchBar.value = '';
            filterTools('');
            updateSearchResults(0, '');
        }
    } else {
        this.classList.add('rotated');
        toolsGridContainer.classList.add('expanded');
        
        if (toolsGrid.children.length === 0) {
            initializeToolsGrid();
        }
        
        // PERFECT SCROLLING
        setTimeout(() => {
            scrollToElementPerfectly(toolsGridContainer);
        }, 180);
    }
});

// ENHANCED filterTools function with BETTER highlighting
function filterTools(searchTerm) {
    if (toolsGrid.children.length === 0) return 0;
    
    let visibleTools = 0;
    const toolCards = Array.from(toolsGrid.children);
    
    // First pass: filter tools
    toolCards.forEach(toolCard => {
        if (toolCard.classList.contains('no-tools-message')) return;
        
        const title = toolCard.getAttribute('data-title');
        const description = toolCard.getAttribute('data-description');
        const titleElement = toolCard.querySelector('.tool-title');
        const originalTitle = titleElement.textContent;
        
        if (searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm)) {
            toolCard.classList.remove('filtered-out');
            visibleTools++;
            
            // Score for ranking
            let score = 0;
            if (title.startsWith(searchTerm)) score = 100;
            else if (title.includes(searchTerm)) score = 80;
            else if (description.includes(searchTerm)) score = 60;
            
            toolCard.dataset.score = score;
            
            // Visual feedback - border
            if (score >= 100) {
                toolCard.style.borderLeft = '4px solid var(--success)';
            } else if (score >= 80) {
                toolCard.style.borderLeft = '4px solid var(--primary)';
            } else {
                toolCard.style.borderLeft = '1px solid var(--border)';
            }
            
            // BETTER HIGHLIGHTING - More visible
            if (searchTerm && searchTerm.length > 0) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                const highlightedTitle = originalTitle.replace(regex, 
                    '<span class="search-highlight">$1</span>'
                );
                titleElement.innerHTML = highlightedTitle;
            } else {
                // Reset to original text
                titleElement.textContent = originalTitle;
            }
        } else {
            toolCard.classList.add('filtered-out');
            toolCard.style.borderLeft = '1px solid var(--border)';
            // Reset title if hidden
            titleElement.textContent = originalTitle;
        }
    });
    
    // Second pass: reorder if searching
    if (searchTerm && searchTerm.length > 0 && visibleTools > 0) {
        const visibleCards = toolCards.filter(card => 
            !card.classList.contains('filtered-out') &&
            !card.classList.contains('no-tools-message')
        );
        
        // Sort by score (highest first)
        visibleCards.sort((a, b) => {
            return (parseInt(b.dataset.score) || 0) - (parseInt(a.dataset.score) || 0);
        });
        
        // Reorder in DOM
        visibleCards.forEach(card => {
            toolsGrid.appendChild(card);
        });
    }
    
    // Reset order when search cleared
    if (searchTerm === '') {
        const allCards = Array.from(toolsGrid.children).filter(card => 
            !card.classList.contains('no-tools-message')
        );
        
        allCards.sort((a, b) => {
            return (parseInt(a.dataset.originalIndex) || 0) - (parseInt(b.dataset.originalIndex) || 0);
        });
        
        allCards.forEach(card => {
            toolsGrid.appendChild(card);
            card.style.borderLeft = '1px solid var(--border)';
            // Reset title
            const titleElement = card.querySelector('.tool-title');
            if (titleElement) {
                const tool = tools[parseInt(card.dataset.originalIndex)];
                if (tool) {
                    titleElement.textContent = tool.title;
                }
            }
        });
    }
    
    // Show no results message
    let noToolsMessage = toolsGrid.querySelector('.no-tools-message');
    
    if (visibleTools === 0 && searchTerm !== '') {
        if (!noToolsMessage) {
            noToolsMessage = document.createElement('div');
            noToolsMessage.className = 'no-tools-message';
            noToolsMessage.textContent = `No tools found for "${searchTerm}". Try a different search term.`;
            toolsGrid.appendChild(noToolsMessage);
        }
    } else if (noToolsMessage) {
        noToolsMessage.remove();
    }
    
    return visibleTools;
}

// PERFECT Search functionality
searchBar.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const searchTerm = this.value.toLowerCase().trim();
    
    searchTimeout = setTimeout(() => {
        // User is searching
        if (searchTerm.length > 0) {
            isSearchActive = true;
            
            // Expand tools if not already expanded
            if (!toolsGridContainer.classList.contains('expanded')) {
                exploreBtn.classList.add('rotated');
                toolsGridContainer.classList.add('expanded');
                
                if (toolsGrid.children.length === 0) {
                    initializeToolsGrid();
                }
            }
            
            // Filter tools
            const visibleCount = filterTools(searchTerm);
            
            // Update search results
            updateSearchResults(visibleCount, searchTerm);
            
            // PERFECT SCROLLING - Wait for DOM updates
            setTimeout(() => {
                if (toolsGridContainer.classList.contains('expanded')) {
                    scrollToElementPerfectly(toolsGridContainer);
                    
                    // Visual feedback
                    toolsGridContainer.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    setTimeout(() => {
                        toolsGridContainer.style.boxShadow = 'none';
                    }, 800);
                }
            }, 180);
        } 
        // User cleared search
        else {
            isSearchActive = false;
            filterTools('');
            updateSearchResults(0, '');
            
            // DON'T auto-scroll when clearing - better UX!
            // User stays where they are to continue browsing
        }
    }, 200);
});

// Escape key to clear search
searchBar.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        this.value = '';
        filterTools('');
        updateSearchResults(0, '');
        this.blur();
        isSearchActive = false;
        
        // Don't auto-scroll - user stays where they are
    }
});

// Search bar focus effects
searchBar.addEventListener('focus', function() {
    this.style.borderColor = 'var(--primary)';
    this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
});

searchBar.addEventListener('blur', function() {
    this.style.borderColor = 'var(--border)';
    this.style.boxShadow = 'none';
});

// ===== REQUEST FORM SUBMISSION =====
// Initialize EmailJS
emailjs.init("g68cD0jfv_Qzhryze");

const requestInput = document.querySelector('.request-input');
const MIN_CHARS = 40; // Updated to 40

// Helper to validate real content (Email format + No character spam)
function isInputValid(text) {
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const hasRealEmail = emailRegex.test(text);
const isLongEnough = text.length >= MIN_CHARS;
// Check if the user is just repeating the same char (e.g., "aaaaaaaaaaa")
const isNotSpam = !/(.)\1{10,}/.test(text); 

return hasRealEmail && isLongEnough && isNotSpam;
}

// 1. LIVE VALIDATION: Visual cues as they type
requestInput.addEventListener('input', function() {
const text = this.value.trim();

if (isInputValid(text)) {
    this.style.borderColor = '#10b981'; // Green
    this.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)';
} else if (text.length > 0) {
    this.style.borderColor = '#3b82f6'; // Blue
    this.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
} else {
    this.style.borderColor = '';
    this.style.boxShadow = '';
}
});

// 2. SUBMIT HANDLER: The "Smart Guard"
requestForm.addEventListener('submit', function(e) {
e.preventDefault();
e.stopPropagation();

const requestText = requestInput.value.trim();
const sendBtn = document.querySelector('.send-request-btn');
const fullPlaceholder = `Minimum ${MIN_CHARS} characters required. Describe what the tool should do, supported file formats, technical limitations, preferred workflow, and your email.`;

// THE GUARD
if (!isInputValid(requestText)) {
    console.log("❌ Validation failed.");
    
    requestInput.style.borderColor = '#ef4444'; // Red
    requestInput.style.animation = 'shake 0.5s';
    
    const hasEmail = requestText.includes('@') && requestText.includes('.');
    const isLongEnough = requestText.length >= MIN_CHARS;

    // Smart, direct messaging
    if (!hasEmail && !isLongEnough) {
        requestInput.placeholder = `Required: At least ${MIN_CHARS} chars AND a valid email!`;
    } else if (!hasEmail) {
        requestInput.placeholder = "Valid email missing! Please include (name@example.com).";
    } else if (!isLongEnough) {
        requestInput.placeholder = `Description too short! Need at least ${MIN_CHARS} characters.`;
    } else {
        requestInput.placeholder = "Invalid input. Please use real words and a valid email format.";
    }
    
    requestInput.value = ''; 

    setTimeout(() => {
        requestInput.style.animation = '';
        requestInput.style.borderColor = '#3b82f6';
        requestInput.placeholder = fullPlaceholder;
    }, 3000);

    return; 
}

if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = "Sending..."; 
}
requestInput.classList.add('sending-mode');

// 3. SUCCESS PATH
console.log("✅ Validation passed. Sending request...");

let templateParams = {
    to_email: "techpc.u2005@gmail.com",
    message: requestText 
};

emailjs.send("service_sklywbd", "template_qy6e6za", templateParams)
    .then(response => {
        console.log("✅ Email sent!", response);
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = "Send Request"; 
        }
        requestInput.classList.remove('sending-mode');
        
        // Show Success Modal
        const successMessage = document.getElementById('successMessage') || document.getElementById('successModal');
        const successOverlay = document.getElementById('successOverlay');
        
        requestInput.value = '';
        requestInput.style.borderColor = '';
        requestInput.style.boxShadow = '';
        
        if (successMessage && successOverlay) {
            successMessage.classList.add('show');
            successOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            if (typeof createConfetti === 'function') createConfetti();
        }
    })
    .catch(error => {
        console.log("❌ EmailJS failed", error);
        alert("Something went wrong. Please check your internet connection and try again.");
    });
});

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random position
        confetti.style.left = Math.random() * 100 + 'vw';
        
        // Random color
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Random shape
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        document.body.appendChild(confetti);
        
        // Animate
        const animation = confetti.animate([
            { 
                top: '0px', 
                opacity: 1,
                transform: 'rotate(0deg)'
            },
            { 
                top: '100vh', 
                opacity: 0,
                transform: `rotate(${Math.random() * 360}deg)`
            }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });
        
        // Remove after animation
        animation.onfinish = () => confetti.remove();
    }
}

// ===== CLOSE SUCCESS MODAL =====
document.getElementById('closeSuccessBtn').addEventListener('click', function() {
    const successMessage = document.getElementById('successMessage');
    const successOverlay = document.getElementById('successOverlay');
    
    successMessage.classList.remove('show');
    successOverlay.classList.remove('show');
    document.body.style.overflow = '';
});

// Also close when clicking overlay
document.getElementById('successOverlay').addEventListener('click', function() {
    const successMessage = document.getElementById('successMessage');
    const successOverlay = document.getElementById('successOverlay');
    
    successMessage.classList.remove('show');
    successOverlay.classList.remove('show');
    document.body.style.overflow = '';
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const successMessage = document.getElementById('successMessage');
        const successOverlay = document.getElementById('successOverlay');
        
        if (successMessage.classList.contains('show')) {
            successMessage.classList.remove('show');
            successOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
});

// ===== SCROLL PROGRESS =====
window.addEventListener('scroll', function() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
    
    // Hide search results when scrolling up on mobile
    if (window.innerWidth <= 768 && searchResultsInfo && searchResultsInfo.classList.contains('show')) {
        if (window.scrollY < 100) {
            searchResultsInfo.classList.remove('show');
        }
    }
});

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        searchBar.focus();
    }, 800);
});

function adjustHeroSpacing() {
        const topBar = document.querySelector('.top-bar');
        const hero = document.querySelector('.hero');
        
        if (topBar && hero) {
            const topBarHeight = topBar.offsetHeight;
            // Add 20px extra for comfortable spacing
            const requiredPadding = topBarHeight + 40;
            
            // Apply to hero section
            hero.style.paddingTop = `${requiredPadding}px`;
        }
    }
    
    // Run on load and resize
    window.addEventListener('load', adjustHeroSpacing);
    window.addEventListener('resize', adjustHeroSpacing);