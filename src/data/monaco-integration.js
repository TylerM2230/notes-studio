/**
 * Monaco Integration - Handles Monaco Editor completion provider setup
 * Provides intelligent autocomplete using the enhanced suggestion engine
 */

class MonacoIntegration {
    constructor(suggestionEngine) {
        this.suggestionEngine = suggestionEngine;
        this.completionDisposable = null;
        this.isRegistered = false;
    }

    /**
     * Register the completion provider with Monaco
     * @param {Object} monaco - Monaco editor instance
     * @returns {Object} Disposable for cleanup
     */
    registerCompletionProvider(monaco) {
        if (this.isRegistered && this.completionDisposable) {
            this.completionDisposable.dispose();
        }

        this.completionDisposable = monaco.languages.registerCompletionItemProvider('markdown', {
            provideCompletionItems: (model, position) => {
                return this._provideCompletionItems(model, position, monaco);
            },
            
            // More selective trigger characters to be less obtrusive
            triggerCharacters: ['-'],
            
            // Resolution for additional info
            resolveCompletionItem: (item, token) => {
                return this._resolveCompletionItem(item, token);
            }
        });

        this.isRegistered = true;
        return this.completionDisposable;
    }

    /**
     * Provide completion items based on current context
     * @private
     */
    _provideCompletionItems(model, position, monaco) {
        try {
            // Get current text context
            const currentLine = model.getLineContent(position.lineNumber);
            const textBeforeCursor = model.getValueInRange({
                startLineNumber: Math.max(1, position.lineNumber - 5),
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            // Only show suggestions in specific contexts to be less obtrusive
            const isNewBulletPoint = currentLine.trim() === '' || currentLine.trim() === '-';
            const isAfterDash = currentLine.startsWith('- ') && position.column > 2;
            const hasMinimumText = textBeforeCursor.trim().length >= 10; // Require some context
            
            // Be more selective about when to show suggestions
            if (!isNewBulletPoint && !isAfterDash) {
                return { suggestions: [] };
            }
            
            // For existing text, require explicit trigger
            if (isAfterDash && !hasMinimumText) {
                return { suggestions: [] };
            }
            
            // Get intelligent suggestions with reduced quantity for less obtrusiveness
            const allSuggestions = this.suggestionEngine.getSuggestions(
                textBeforeCursor,
                position.column,
                this._detectLanguageContext(textBeforeCursor)
            );
            
            // Limit to top 15 suggestions to reduce visual clutter
            const limitedSuggestions = allSuggestions.slice(0, 15);

            // Convert to Monaco completion items with reduced detail
            const completionItems = limitedSuggestions.map(suggestion => ({
                label: suggestion.label,
                kind: this._getMonacoKind(suggestion.kind, monaco),
                insertText: isNewBulletPoint ? suggestion.insertText : suggestion.label,
                documentation: {
                    value: this._getShorterDocumentation(suggestion),
                    isTrusted: true
                },
                sortText: suggestion.sortText || suggestion.label,
                filterText: suggestion.label,
                range: this._getInsertionRange(position, currentLine, isNewBulletPoint),
                additionalTextEdits: isNewBulletPoint ? [] : undefined,
                command: undefined
            }));

            return {
                suggestions: completionItems,
                incomplete: false
            };

        } catch (error) {
            console.error('Error providing completion items:', error);
            return { suggestions: [] };
        }
    }

    /**
     * Get shorter, less obtrusive documentation for suggestions
     * @private
     */
    _getShorterDocumentation(suggestion) {
        const kindMap = {
            'concept': 'Programming concept',
            'phrase': 'Teaching observation',
            'language': 'Language-specific',
            'general': 'General observation',
            'template': 'Template'
        };
        
        return kindMap[suggestion.kind] || 'Suggestion';
    }

    /**
     * Get Monaco completion item kind based on suggestion type
     * @private
     */
    _getMonacoKind(suggestionKind, monaco) {
        const kindMap = {
            'concept': monaco.languages.CompletionItemKind.Keyword,
            'phrase': monaco.languages.CompletionItemKind.Snippet,
            'language': monaco.languages.CompletionItemKind.Module,
            'general': monaco.languages.CompletionItemKind.Text,
            'template': monaco.languages.CompletionItemKind.Snippet
        };

        return kindMap[suggestionKind] || monaco.languages.CompletionItemKind.Text;
    }

    /**
     * Determine insertion range for completion
     * @private
     */
    _getInsertionRange(position, currentLine, isNewBulletPoint) {
        if (isNewBulletPoint) {
            // Replace the entire line for new bullet points
            return {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: currentLine.length + 1
            };
        } else {
            // Insert at current position for inline completion
            return {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column
            };
        }
    }

    /**
     * Detect programming language from context
     * @private
     */
    _detectLanguageContext(text) {
        const languageKeywords = {
            'Python': ['python', 'print(', 'def ', 'import ', 'for i in', 'if __name__'],
            'JavaScript': ['javascript', 'function(', 'const ', 'let ', 'console.log', 'document.'],
            'Java': ['java', 'public class', 'System.out', 'public static void', 'import java.']
        };

        const lowerText = text.toLowerCase();
        
        for (const [language, keywords] of Object.entries(languageKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
                return language;
            }
        }

        return null;
    }

    /**
     * Resolve additional details for completion item
     * @private
     */
    _resolveCompletionItem(item, token) {
        // Could add more detailed documentation or examples here
        return item;
    }

    /**
     * Update suggestion engine with new data
     */
    updateSuggestionEngine(newEngine) {
        this.suggestionEngine = newEngine;
    }

    /**
     * Dispose of the completion provider
     */
    dispose() {
        if (this.completionDisposable) {
            this.completionDisposable.dispose();
            this.completionDisposable = null;
        }
        this.isRegistered = false;
    }

    /**
     * Check if completion provider is registered
     */
    isCompletionProviderRegistered() {
        return this.isRegistered;
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonacoIntegration;
} else {
    window.MonacoIntegration = MonacoIntegration;
}