// Suppress development warnings for CDN usage
window.process = { env: { NODE_ENV: 'production' } };

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.warn('Resource loading issue (this is normal for CDN usage):', e.message);
});

// Suppress source map warnings
const originalConsoleWarn = console.warn;
console.warn = function(message) {
    if (typeof message === 'string' && message.includes('source map')) {
        return; // Suppress source map warnings
    }
    originalConsoleWarn.apply(console, arguments);
};