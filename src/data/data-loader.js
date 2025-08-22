/**
 * Data Loader - Handles loading and processing of scraped notes data
 * Provides a clean interface for data access with error handling and caching
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.isLoading = false;
        this.loadPromise = null;
    }

    /**
     * Load and process scraped notes data
     * @returns {Promise<Object>} Processed data object
     */
    async loadEnhancedData() {
        // Return cached data if available
        if (this.cache.has('enhancedData')) {
            return this.cache.get('enhancedData');
        }

        // Return existing promise if already loading
        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this._performDataLoad();
        
        try {
            const result = await this.loadPromise;
            this.cache.set('enhancedData', result);
            return result;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    /**
     * Perform the actual data loading and processing
     * @private
     */
    async _performDataLoad() {
        try {
            // Load raw scraped data
            const scrapedData = await this._loadScrapedData();
            
            if (!scrapedData || !Array.isArray(scrapedData)) {
                console.warn('Invalid scraped data format, using fallback');
                return this._getFallbackData();
            }

            // Process data using analyzer
            const analyzer = new NotesAnalyzer(scrapedData);
            const processedData = analyzer.analyze();
            
            console.log('Data processing complete:', {
                students: processedData.stats.totalStudents,
                notes: processedData.stats.totalNotes,
                concepts: processedData.stats.uniqueConcepts,
                phrases: processedData.stats.uniquePhrases
            });

            return processedData;

        } catch (error) {
            console.error('Error loading enhanced data:', error);
            return this._getFallbackData();
        }
    }

    /**
     * Load raw scraped data from file and sanitize student names
     * @private
     */
    async _loadScrapedData() {
        try {
            const response = await fetch('./scraped_notes.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const rawData = await response.json();
            
            // Sanitize data to remove student names for privacy
            return this._sanitizeStudentData(rawData);
        } catch (error) {
            console.warn('Failed to load scraped_notes.json:', error.message);
            throw error;
        }
    }

    /**
     * Remove student names and other identifying information from data
     * @private
     */
    _sanitizeStudentData(data) {
        if (!Array.isArray(data)) return data;
        
        return data.map((student, index) => {
            const sanitizedStudent = { ...student };
            
            // Remove the student name field entirely
            delete sanitizedStudent.student_name;
            
            // Remove any author info that might contain personal data
            if (sanitizedStudent.author_info) {
                delete sanitizedStudent.author_info;
            }
            
            // Sanitize notes to remove specific names while keeping content
            if (sanitizedStudent.notes && Array.isArray(sanitizedStudent.notes)) {
                sanitizedStudent.notes = sanitizedStudent.notes.map(note => {
                    const sanitizedNote = { ...note };
                    
                    // Remove author info from individual notes
                    if (sanitizedNote.author_info) {
                        delete sanitizedNote.author_info;
                    }
                    
                    // Remove specific dates (keep only the educational content)
                    if (sanitizedNote.date_written) {
                        delete sanitizedNote.date_written;
                    }
                    
                    if (sanitizedNote.session_notes) {
                        // Remove specific student names but keep the educational content
                        sanitizedNote.session_notes = this._removeStudentNamesFromText(sanitizedNote.session_notes);
                    }
                    
                    return sanitizedNote;
                });
            }
            
            return sanitizedStudent;
        });
    }

    /**
     * Remove student names and other identifying information from text while preserving educational content
     * @private
     */
    _removeStudentNamesFromText(text) {
        if (!text) return text;
        
        // Comprehensive list of potential names to anonymize
        const commonNames = [
            // From dataset
            'Alexis', 'Zoe', 'Chelsea', 'Thomas', 'Samay', 'Oliver', 'Dylan', 
            'Bradley', 'Camden', 'Alejandro', 'Pablo', 'Anderson', 'Chang', 
            'Kaya', 'Concepcion', 'Deng', 'Parekh', 'Garcia', 'Shah', 'Hogue', 'Tsang',
            // Additional common names for safety
            'Alex', 'Sam', 'Chris', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley',
            'Avery', 'Quinn', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Hayden',
            'Jamie', 'Kai', 'Logan', 'Parker', 'Peyton', 'Reese', 'Sage', 'Skyler'
        ];
        
        let sanitizedText = text;
        
        // Replace specific names with generic terms
        commonNames.forEach(name => {
            const nameRegex = new RegExp(`\\b${name}\\b`, 'gi');
            sanitizedText = sanitizedText.replace(nameRegex, 'the student');
        });
        
        // Remove any remaining potential names (capitalized words that could be names)
        // This is conservative - only removes isolated capitalized words that aren't known safe terms
        const safeterms = [
            'Warm', 'Up', 'Main', 'Activity', 'Project', 'Python', 'JavaScript', 'Java',
            'Big', 'Idea', 'Temperature', 'Converter', 'Perfect', 'Number', 'Checker',
            'Keep', 'Fantastic', 'Great', 'Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday', 'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Remove potential names that aren't in safe terms list
        sanitizedText = sanitizedText.replace(/\b[A-Z][a-z]+\b/g, (match) => {
            if (safeterms.includes(match)) {
                return match; // Keep safe terms
            }
            return 'the student'; // Replace potential names
        });
        
        // Clean up possessive forms and duplicates
        sanitizedText = sanitizedText.replace(/\bthe student's\b/gi, 'the student\'s');
        sanitizedText = sanitizedText.replace(/\bthe student\s+the student\b/gi, 'the student');
        sanitizedText = sanitizedText.replace(/\bthe student\s+the student\b/gi, 'the student'); // Run twice to catch cascades
        
        // Remove any dates that might be identifying
        sanitizedText = sanitizedText.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, 'during a recent session');
        sanitizedText = sanitizedText.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, 'during a recent session');
        
        return sanitizedText;
    }

    /**
     * Provide fallback data when scraped data is unavailable
     * @private
     */
    _getFallbackData() {
        console.log('Using fallback enhanced data');
        
        return {
            concepts: {
                top: [
                    ['for loop', 50], ['conditionals', 45], ['variables', 40],
                    ['functions', 35], ['lists', 30], ['input', 25]
                ],
                suggestions: [
                    { text: 'demonstrated understanding of for loops', concept: 'for loop', frequency: 50, category: 'concept-based' },
                    { text: 'applied conditionals effectively', concept: 'conditionals', frequency: 45, category: 'concept-based' },
                    { text: 'showed mastery of variable usage', concept: 'variables', frequency: 40, category: 'concept-based' }
                ]
            },
            phrases: {
                positive: [
                    'did an excellent job demonstrating their understanding',
                    'showed strong problem-solving skills throughout the session',
                    'applied concepts effectively and with confidence',
                    'demonstrated impressive focus and engagement',
                    'worked independently with minimal guidance needed'
                ],
                constructive: [
                    'needed additional support with complex concepts',
                    'benefited from step-by-step guidance during problems',
                    'required assistance with debugging techniques',
                    'would benefit from additional practice with fundamentals'
                ],
                progress: [
                    'made significant improvement from previous sessions',
                    'showed growing confidence with programming concepts',
                    'demonstrated clear progress in problem-solving approach',
                    'exhibited developing understanding of core principles'
                ],
                neutral: [
                    'participated in class discussions and activities',
                    'completed assigned exercises during the session',
                    'followed along with instruction and examples',
                    'asked clarifying questions when needed'
                ]
            },
            languages: [
                ['Python', 200], ['JavaScript', 150], ['Java', 100]
            ],
            applications: [
                ['Warm-up Exercise', 80], ['Main Project', 70], ['Practice Problems', 60]
            ],
            stats: {
                totalStudents: 0,
                totalNotes: 0,
                uniqueConcepts: 6,
                uniquePhrases: 18,
                languages: 3,
                applications: 3
            }
        };
    }

    /**
     * Check if data is currently loading
     */
    isDataLoading() {
        return this.isLoading;
    }

    /**
     * Clear cached data (useful for refreshing)
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cached data without loading (returns null if not cached)
     */
    getCachedData() {
        return this.cache.get('enhancedData') || null;
    }
}

// Singleton pattern for global data access
let dataLoaderInstance = null;

/**
 * Get the singleton DataLoader instance
 */
function getDataLoader() {
    if (!dataLoaderInstance) {
        dataLoaderInstance = new DataLoader();
    }
    return dataLoaderInstance;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader, getDataLoader };
} else {
    window.DataLoader = DataLoader;
    window.getDataLoader = getDataLoader;
}