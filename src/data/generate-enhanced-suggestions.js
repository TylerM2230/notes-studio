// Generate Enhanced Suggestions from Scraped Notes Data
// This script processes the scraped_notes.json and creates enhanced suggestion data

// Load the scraped data (this will be loaded differently in the browser)
let scrapedData;
let enhancedSuggestions;

// Function to load and process data
async function loadAndProcessData() {
    try {
        // In browser environment, we'll load this differently
        if (typeof fetch !== 'undefined') {
            const response = await fetch('./scraped_notes.json');
            scrapedData = await response.json();
        } else {
            // Node.js environment (for development)
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../../scraped_notes.json');
            scrapedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        // Process the data using our analyzer
        const analyzer = new (typeof NotesAnalyzer !== 'undefined' ? NotesAnalyzer : require('./notes-analyzer.js'))(scrapedData);
        enhancedSuggestions = analyzer.analyze();
        
        console.log('Enhanced suggestions generated:', {
            concepts: enhancedSuggestions.concepts.top.length,
            phrases: Object.values(enhancedSuggestions.phrases).reduce((sum, arr) => sum + arr.length, 0),
            conceptSuggestions: enhancedSuggestions.concepts.suggestions.length
        });
        
        return enhancedSuggestions;
    } catch (error) {
        console.error('Error processing scraped data:', error);
        return null;
    }
}

// Enhanced Templates based on real data analysis
const ENHANCED_OBSERVATION_TEMPLATES = {
    // Programming concepts (top 20 from data)
    programmingConcepts: [
        "demonstrated understanding of for loops in their implementation",
        "applied conditional statements effectively to solve the problem",
        "showed mastery of variable declaration and manipulation",
        "used random number generation creatively in their solution",
        "handled user input validation appropriately",
        "implemented list operations with confidence",
        "debugged iteration logic independently",
        "explained while loop functionality clearly to peers",
        "applied function parameters correctly in their code",
        "demonstrated modulo operation understanding through examples"
    ],

    // Positive engagement (extracted from real session notes)
    positiveEngagement: [
        "did an excellent job demonstrating functionality and explaining logic",
        "effectively expanded their project's capabilities and features",
        "showed strong development skills throughout the session",
        "did a great job breaking down complex problems into steps",
        "applied strong problem-solving techniques and engaged deeply",
        "demonstrated impressive focus while building their project",
        "worked independently for most of the session with minimal guidance",
        "showed genuine interest and growing enthusiasm for programming",
        "created decision trees to map outcomes and implement logic",
        "customized their project creatively while maintaining functionality"
    ],

    // Progress and learning (based on frequent phrases)
    progressAndLearning: [
        "made significant progress with core programming concepts",
        "grasped new concepts quickly and applied them effectively",
        "showed improvement from previous sessions in problem-solving",
        "demonstrated growing confidence with programming syntax",
        "connected new learning to previously covered material",
        "exhibited strong analytical thinking skills during activities",
        "approached challenges with a positive, can-do attitude",
        "showed persistence when encountering coding obstacles",
        "made thoughtful connections between different programming concepts",
        "demonstrated metacognitive awareness of their own learning process"
    ],

    // Challenges and support (constructive observations)
    challengesAndSupport: [
        "needed additional support with complex conditional logic",
        "benefited from step-by-step guidance during problem decomposition",
        "required assistance with debugging syntax errors",
        "struggled initially with loop iteration but improved with practice",
        "needed clarification on function parameter usage",
        "worked through list indexing concepts with instructor support",
        "found variable scope concepts challenging but made progress",
        "required additional practice with input validation techniques",
        "benefited from peer collaboration during difficult sections",
        "needed encouragement to persist through challenging debugging"
    ],

    // Technical skills (programming-specific observations)
    technicalSkills: [
        "debugged code independently and systematically",
        "wrote clean, well-structured code with appropriate comments",
        "effectively used print statements for troubleshooting",
        "demonstrated understanding of error message interpretation",
        "applied proper indentation and code formatting consistently",
        "showed ability to trace through code execution mentally",
        "used appropriate variable names and coding conventions",
        "demonstrated version control understanding during collaboration",
        "effectively integrated multiple programming concepts in solutions",
        "showed ability to refactor code for improved readability"
    ],

    // Collaboration and communication
    collaborationSkills: [
        "explained their code logic clearly to peers during pair programming",
        "collaborated effectively during group problem-solving activities",
        "provided helpful feedback to classmates during code reviews",
        "asked thoughtful questions that demonstrated deep engagement",
        "showed patience and empathy when helping struggling peers",
        "communicated technical concepts using appropriate vocabulary",
        "actively participated in class discussions about programming approaches",
        "demonstrated respect for different coding styles and approaches",
        "contributed meaningfully to team debugging sessions",
        "showed leadership skills during collaborative programming tasks"
    ],

    // Assessment and reflection
    assessmentLanguage: [
        "ready to advance to more complex programming challenges",
        "would benefit from additional practice with fundamental concepts",
        "demonstrated mastery of core programming principles",
        "showing consistent improvement in problem-solving approaches",
        "ready for introduction of advanced programming topics",
        "needs continued reinforcement of basic syntax and structure",
        "exhibiting strong foundation for future programming learning",
        "would benefit from additional project-based learning opportunities",
        "demonstrated readiness for independent programming projects",
        "showing signs of developing programming intuition and logic"
    ]
};

// Context-aware suggestion mapping
const CONTEXT_MAPPINGS = {
    // When user types certain keywords, suggest related completions
    'loop': ['programmingConcepts', 'technicalSkills'],
    'conditional': ['programmingConcepts', 'technicalSkills'],
    'variable': ['programmingConcepts', 'technicalSkills'],
    'function': ['programmingConcepts', 'technicalSkills'],
    'debug': ['technicalSkills', 'challengesAndSupport'],
    'struggle': ['challengesAndSupport', 'progressAndLearning'],
    'excellent': ['positiveEngagement', 'progressAndLearning'],
    'collaborate': ['collaborationSkills', 'positiveEngagement'],
    'explain': ['collaborationSkills', 'technicalSkills'],
    'progress': ['progressAndLearning', 'assessmentLanguage'],
    'ready': ['assessmentLanguage', 'progressAndLearning']
};

// Language-specific suggestions
const LANGUAGE_SPECIFIC_TEMPLATES = {
    'Python': [
        "demonstrated understanding of Python syntax and indentation rules",
        "effectively used Python's built-in functions and methods",
        "showed proficiency with Python list comprehensions",
        "applied Python's string manipulation methods appropriately",
        "used Python's range() function effectively in loops"
    ],
    'JavaScript': [
        "demonstrated understanding of JavaScript event handling",
        "effectively manipulated DOM elements using JavaScript",
        "showed proficiency with JavaScript array methods",
        "applied JavaScript async/await patterns appropriately",
        "used JavaScript object notation effectively"
    ]
};

// Export enhanced templates and mappings
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENHANCED_OBSERVATION_TEMPLATES,
        CONTEXT_MAPPINGS,
        LANGUAGE_SPECIFIC_TEMPLATES,
        loadAndProcessData
    };
} else {
    window.ENHANCED_OBSERVATION_TEMPLATES = ENHANCED_OBSERVATION_TEMPLATES;
    window.CONTEXT_MAPPINGS = CONTEXT_MAPPINGS;
    window.LANGUAGE_SPECIFIC_TEMPLATES = LANGUAGE_SPECIFIC_TEMPLATES;
    window.loadAndProcessData = loadAndProcessData;
}