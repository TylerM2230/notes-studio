// Notes Analysis Engine for Teaching Notes Studio
// Processes scraped_notes.json to extract patterns and generate intelligent autocomplete suggestions

class NotesAnalyzer {
    constructor(scrapedData) {
        this.data = scrapedData;
        this.conceptFrequency = new Map();
        this.teachingPhrases = [];
        this.languagePatterns = new Map();
        this.applicationContexts = new Map();
        this.sessionPatterns = {
            positive: [],
            constructive: [],
            neutral: [],
            progress: [],
            challenges: []
        };
    }

    // Main analysis function
    analyze() {
        console.log(`Analyzing ${this.data.length} students with ${this.getTotalNotes()} total notes...`);
        
        this.extractProgrammingConcepts();
        this.extractTeachingPhrases();
        this.extractLanguagePatterns();
        this.extractApplicationContexts();
        this.categorizeObservations();
        
        return this.generateSuggestions();
    }

    getTotalNotes() {
        return this.data.reduce((total, student) => total + student.notes.length, 0);
    }

    // Extract and count programming concepts
    extractProgrammingConcepts() {
        for (const student of this.data) {
            for (const note of student.notes) {
                if (note.working_concepts) {
                    const concepts = note.working_concepts
                        .split(',')
                        .map(c => c.trim().toLowerCase())
                        .filter(c => c.length > 0);
                    
                    for (const concept of concepts) {
                        this.conceptFrequency.set(concept, (this.conceptFrequency.get(concept) || 0) + 1);
                    }
                }
            }
        }
    }

    // Extract teaching observation phrases from session notes
    extractTeachingPhrases() {
        const phrasePatterns = [
            // Positive achievement patterns
            /([A-Z][^.!?]*(?:did a? (?:great|excellent|fantastic|amazing|wonderful|outstanding) job|performed (?:well|excellently|admirably))[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:demonstrated|showed|exhibited|displayed) (?:strong|excellent|impressive|solid|good|remarkable)[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:applied|used|utilized|implemented) [^.!?]*(?:effectively|successfully|skillfully|confidently)[^.!?]*[.!?])/gi,
            
            // Progress and learning patterns
            /([A-Z][^.!?]*(?:grasped|understood|mastered|learned|picked up)[^.!?]*(?:quickly|easily|well|effectively)[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:made (?:significant|great|good|solid|impressive) (?:progress|improvement|strides))[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:worked|engaged|focused|concentrated) (?:independently|diligently|hard|effectively)[^.!?]*[.!?])/gi,
            
            // Problem-solving patterns
            /([A-Z][^.!?]*(?:broke down|approached|tackled|solved) [^.!?]*(?:systematically|methodically|logically|creatively)[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:debugged|troubleshot|identified|resolved)[^.!?]*[.!?])/gi,
            
            // Challenge and difficulty patterns
            /([A-Z][^.!?]*(?:struggled|had difficulty|found challenging|needed (?:help|support|guidance))[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:required|benefited from) (?:additional|extra|more|some) (?:support|guidance|explanation|practice)[^.!?]*[.!?])/gi,
            
            // Engagement and participation patterns
            /([A-Z][^.!?]*(?:participated|engaged|contributed) (?:actively|enthusiastically|well|effectively)[^.!?]*[.!?])/gi,
            /([A-Z][^.!?]*(?:asked|posed) (?:thoughtful|insightful|good|relevant) questions?[^.!?]*[.!?])/gi,
        ];

        for (const student of this.data) {
            for (const note of student.notes) {
                if (note.session_notes) {
                    for (const pattern of phrasePatterns) {
                        const matches = note.session_notes.match(pattern) || [];
                        this.teachingPhrases.push(...matches.map(m => m.trim()));
                    }
                }
            }
        }

        // Remove duplicates and clean up
        this.teachingPhrases = [...new Set(this.teachingPhrases)]
            .filter(phrase => phrase.length > 20 && phrase.length < 200)
            .sort((a, b) => a.length - b.length);
    }

    // Extract language usage patterns
    extractLanguagePatterns() {
        for (const student of this.data) {
            for (const note of student.notes) {
                if (note.language_focus) {
                    const lang = note.language_focus.trim();
                    this.languagePatterns.set(lang, (this.languagePatterns.get(lang) || 0) + 1);
                }
            }
        }
    }

    // Extract application/project contexts
    extractApplicationContexts() {
        for (const student of this.data) {
            for (const note of student.notes) {
                if (note.application) {
                    const app = note.application.trim();
                    this.applicationContexts.set(app, (this.applicationContexts.get(app) || 0) + 1);
                }
            }
        }
    }

    // Categorize observations by sentiment and type
    categorizeObservations() {
        const categories = {
            positive: /(?:excellent|great|fantastic|outstanding|impressive|strong|good|well|effectively|successfully|confidently|enthusiastically|actively)/i,
            constructive: /(?:struggled|difficulty|challenging|needed help|required support|benefited from|could improve|should focus)/i,
            progress: /(?:improvement|progress|growth|development|mastered|learned|grasped|picked up)/i,
            challenges: /(?:obstacles|barriers|difficulties|challenges|problems|issues|confusion)/i
        };

        for (const phrase of this.teachingPhrases) {
            for (const [category, pattern] of Object.entries(categories)) {
                if (pattern.test(phrase)) {
                    this.sessionPatterns[category].push(phrase);
                    break; // Only add to first matching category
                }
            }
        }

        // Add unmatched phrases to neutral category
        const categorizedPhrases = Object.values(this.sessionPatterns).flat();
        this.sessionPatterns.neutral = this.teachingPhrases.filter(
            phrase => !categorizedPhrases.includes(phrase)
        );
    }

    // Generate structured suggestions for autocomplete
    generateSuggestions() {
        const topConcepts = Array.from(this.conceptFrequency.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 50);

        const topLanguages = Array.from(this.languagePatterns.entries())
            .sort(([,a], [,b]) => b - a);

        const topApplications = Array.from(this.applicationContexts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);

        return {
            concepts: {
                top: topConcepts,
                suggestions: this.generateConceptSuggestions(topConcepts)
            },
            phrases: {
                positive: this.sessionPatterns.positive.slice(0, 30),
                constructive: this.sessionPatterns.constructive.slice(0, 20),
                progress: this.sessionPatterns.progress.slice(0, 25),
                challenges: this.sessionPatterns.challenges.slice(0, 15),
                neutral: this.sessionPatterns.neutral.slice(0, 20)
            },
            languages: topLanguages,
            applications: topApplications,
            stats: {
                totalStudents: this.data.length,
                totalNotes: this.getTotalNotes(),
                uniqueConcepts: this.conceptFrequency.size,
                uniquePhrases: this.teachingPhrases.length,
                languages: this.languagePatterns.size,
                applications: this.applicationContexts.size
            }
        };
    }

    // Generate concept-specific teaching suggestions
    generateConceptSuggestions(topConcepts) {
        const suggestions = [];
        const templates = [
            "demonstrated understanding of {concept}",
            "applied {concept} effectively in their solution",
            "showed mastery of {concept} implementation",
            "struggled with {concept} syntax initially",
            "made good progress with {concept} fundamentals",
            "needed additional support with {concept}",
            "creatively used {concept} in their approach",
            "debugged {concept}-related errors independently",
            "explained {concept} clearly to peers",
            "connected {concept} to previous learning"
        ];

        for (const [concept, frequency] of topConcepts.slice(0, 15)) {
            for (const template of templates) {
                suggestions.push({
                    text: template.replace('{concept}', concept),
                    concept,
                    frequency,
                    category: 'concept-based'
                });
            }
        }

        return suggestions;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesAnalyzer;
} else {
    window.NotesAnalyzer = NotesAnalyzer;
}