// Suppress development warnings for CDN usage
window.process = { env: { NODE_ENV: 'production' } };

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.warn('Resource loading issue (this is normal for CDN usage):', e.message);
});

// Suppress warnings from Babel and source maps
const originalConsoleWarn = console.warn;
console.warn = function(message) {
    if (typeof message === 'string' && (
        message.includes('source map') || 
        message.includes('in-browser Babel transformer')
    )) {
        return; // Suppress expected warnings
    }
    originalConsoleWarn.apply(console, arguments);
};