/**
 * Suggestion Engine - Core module for intelligent autocomplete suggestions
 * Handles suggestion generation, ranking, and context-aware filtering
 */

class SuggestionEngine {
    constructor(enhancedData = null) {
        this.enhancedData = enhancedData;
        this.suggestionCache = new Map();
        this.contextKeywords = this._initializeContextKeywords();
    }

    /**
     * Initialize context detection keywords
     * @private
     */
    _initializeContextKeywords() {
        return {
            programming: ['loop', 'function', 'variable', 'array', 'object', 'class', 'method'],
            positive: ['excellent', 'great', 'fantastic', 'outstanding', 'impressive', 'strong'],
            challenges: ['struggle', 'difficulty', 'challenge', 'problem', 'confusion', 'error'],
            progress: ['improvement', 'progress', 'growth', 'development', 'mastery', 'learning'],
            collaboration: ['collaborate', 'pair', 'team', 'peer', 'group', 'together'],
            assessment: ['ready', 'prepare', 'advance', 'next', 'evaluation', 'assessment']
        };
    }

    /**
     * Get intelligent suggestions based on current context
     * @param {string} currentText - The current text being typed
     * @param {number} position - Cursor position
     * @param {string} language - Programming language context
     * @returns {Array} Array of suggestion objects
     */
    getSuggestions(currentText = '', position = 0, language = '') {
        const context = this._detectContext(currentText, position);
        const cacheKey = `${context.type}_${context.keywords.join('_')}_${language}`;
        
        // Check cache first for performance
        if (this.suggestionCache.has(cacheKey)) {
            return this.suggestionCache.get(cacheKey);
        }

        const suggestions = this._generateContextualSuggestions(context, language);
        const rankedSuggestions = this._rankSuggestions(suggestions, context);
        
        // Cache the results
        this.suggestionCache.set(cacheKey, rankedSuggestions);
        return rankedSuggestions;
    }

    /**
     * Detect context from current text
     * @private
     */
    _detectContext(text, position) {
        const words = text.toLowerCase().split(/\s+/);
        const recentWords = words.slice(-10); // Look at last 10 words for context
        
        const detectedCategories = [];
        const matchedKeywords = [];

        // Check each context category
        for (const [category, keywords] of Object.entries(this.contextKeywords)) {
            const matches = keywords.filter(keyword => 
                recentWords.some(word => word.includes(keyword))
            );
            
            if (matches.length > 0) {
                detectedCategories.push(category);
                matchedKeywords.push(...matches);
            }
        }

        return {
            type: detectedCategories.length > 0 ? detectedCategories[0] : 'general',
            categories: detectedCategories,
            keywords: matchedKeywords,
            wordCount: words.length
        };
    }

    /**
     * Generate contextual suggestions based on detected context
     * @private
     */
    _generateContextualSuggestions(context, language) {
        const suggestions = [];
        
        // Add context-specific suggestions
        if (this.enhancedData) {
            suggestions.push(...this._getEnhancedSuggestions(context, language));
        }
        
        // Add fallback suggestions
        suggestions.push(...this._getFallbackSuggestions(context));
        
        return suggestions;
    }

    /**
     * Get suggestions from enhanced data analysis
     * @private
     */
    _getEnhancedSuggestions(context, language) {
        if (!this.enhancedData) return [];
        
        const suggestions = [];
        
        // Add concept-based suggestions
        if (context.categories.includes('programming') && this.enhancedData.concepts) {
            suggestions.push(...this._getConceptSuggestions(context));
        }
        
        // Add phrase-based suggestions
        suggestions.push(...this._getPhraseSuggestions(context));
        
        // Add language-specific suggestions
        if (language && this.enhancedData.languages) {
            suggestions.push(...this._getLanguageSpecificSuggestions(language));
        }
        
        return suggestions;
    }

    /**
     * Get concept-based suggestions
     * @private
     */
    _getConceptSuggestions(context) {
        if (!this.enhancedData.concepts?.suggestions) return [];
        
        return this.enhancedData.concepts.suggestions
            .filter(s => context.keywords.some(k => s.text.includes(k)))
            .slice(0, 15)
            .map(s => ({
                label: s.text,
                insertText: `- ${s.text}`,
                documentation: `Programming concept: ${s.concept} (used ${s.frequency} times)`,
                sortText: `1_${s.frequency.toString().padStart(3, '0')}_${s.text}`,
                kind: 'concept'
            }));
    }

    /**
     * Get phrase-based suggestions
     * @private
     */
    _getPhraseSuggestions(context) {
        if (!this.enhancedData.phrases) return [];
        
        const categoryMap = {
            positive: 'positive',
            challenges: 'constructive',
            progress: 'progress',
            general: 'neutral'
        };
        
        const category = categoryMap[context.type] || 'neutral';
        const phrases = this.enhancedData.phrases[category] || [];
        
        return phrases.slice(0, 20).map((phrase, index) => ({
            label: phrase,
            insertText: `- ${phrase}`,
            documentation: `${category} observation from real teaching notes`,
            sortText: `2_${index.toString().padStart(2, '0')}_${phrase}`,
            kind: 'phrase'
        }));
    }

    /**
     * Get language-specific suggestions
     * @private
     */
    _getLanguageSpecificSuggestions(language) {
        // This would integrate with language-specific templates
        const templates = [
            `demonstrated understanding of ${language} syntax and conventions`,
            `effectively used ${language} built-in functions and libraries`,
            `showed proficiency with ${language} data structures and methods`
        ];
        
        return templates.map((template, index) => ({
            label: template,
            insertText: `- ${template}`,
            documentation: `${language}-specific observation template`,
            sortText: `3_${index.toString().padStart(2, '0')}_${template}`,
            kind: 'language'
        }));
    }

    /**
     * Get fallback suggestions for unknown contexts
     * @private
     */
    _getFallbackSuggestions(context) {
        const fallbacks = [
            'engaged actively with the learning material',
            'demonstrated problem-solving skills during the session',
            'showed willingness to ask questions when confused',
            'participated meaningfully in class discussions',
            'exhibited growth mindset when facing challenges'
        ];
        
        return fallbacks.map((suggestion, index) => ({
            label: suggestion,
            insertText: `- ${suggestion}`,
            documentation: 'General teaching observation',
            sortText: `9_${index.toString().padStart(2, '0')}_${suggestion}`,
            kind: 'general'
        }));
    }

    /**
     * Rank suggestions based on relevance and frequency
     * @private
     */
    _rankSuggestions(suggestions, context) {
        // Sort by sortText (which includes priority and frequency)
        return suggestions
            .sort((a, b) => a.sortText.localeCompare(b.sortText))
            .slice(0, 50); // Limit to top 50 suggestions for performance
    }

    /**
     * Clear suggestion cache (useful for data updates)
     */
    clearCache() {
        this.suggestionCache.clear();
    }

    /**
     * Update enhanced data (when new analysis is available)
     */
    updateData(newData) {
        this.enhancedData = newData;
        this.clearCache();
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuggestionEngine;
} else {
    window.SuggestionEngine = SuggestionEngine;
}