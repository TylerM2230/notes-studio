// Teaching observation templates and suggestions
const OBSERVATION_TEMPLATES = {
    engagement: [
        "Jumped right into today's activity without needing extra encouragement",
        "Eyes lit up when we introduced the new concept",
        "Kept asking 'what if we tried this instead?' throughout the session",
        "Stayed focused even when classmates were getting distracted",
        "Volunteered to share their solution with the group",
        "Seemed genuinely curious about how things work under the hood",
        "Made spontaneous connections to yesterday's lesson",
        "Leaned forward and took notes during the explanation",
        "Asked follow-up questions that showed they were really thinking",
        "Worked steadily through the entire session without checking the clock",
        "Started experimenting with variations before I even suggested it",
        "Helped a struggling classmate without being asked",
        "Came in already talking about ideas from last week",
        "Stayed after to continue working on the project"
    ],
    problemSolving: [
        "Tried three different approaches before asking for help",
        "Talked through their thinking process out loud",
        "Used the debugger tools to track down the issue",
        "Sketched out the problem on paper before coding",
        "Broke the big task into smaller, manageable pieces",
        "Found a creative workaround when the obvious solution didn't work",
        "Recognized a pattern from a previous problem and adapted it",
        "Googled error messages and tried suggested solutions",
        "Built a simple test case to isolate the problem",
        "Asked a classmate to explain their approach",
        "Backtracked when they realized they were on the wrong path",
        "Celebrated small wins along the way to the final solution",
        "Used rubber duck debugging to work through the logic",
        "Drew diagrams to visualize the data flow",
        "Refused to give up even when things got frustrating"
    ],
    technicalProgress: [
        "Finally clicked with how loops actually work",
        "Started using meaningful variable names without reminders",
        "Caught their own syntax errors before running the code",
        "Explained the concept to a classmate in their own words",
        "Built something beyond what the assignment required",
        "Made the connection between this topic and real-world apps",
        "Remembered shortcuts from previous lessons",
        "Started thinking about edge cases and error handling",
        "Can now read and understand others' code much better",
        "Suggested improvements to the example code",
        "Used advanced features we only briefly mentioned",
        "Showed up already having experimented with the concept at home",
        "Confidently navigated the development environment",
        "Made significant progress since struggling with this last month",
        "Started teaching concepts to newer students"
    ],
    challengingBehaviors: [
        "Gets visibly frustrated when code doesn't work immediately",
        "Tends to shut down when the problem seems too complex",
        "Rushes through instructions without reading carefully",
        "Wants to copy solutions rather than understand the process",
        "Claims 'this is stupid' when encountering difficult concepts",
        "Gives minimal effort on tasks that don't come easily",
        "Focuses on being 'done' rather than learning thoroughly",
        "Becomes defensive when receiving constructive feedback",
        "Avoids experimenting for fear of making mistakes",
        "Compares their progress negatively to faster classmates",
        "Expects immediate mastery without practice time",
        "Blames the tools when things don't work as expected"
    ],
    avoidancePatterns: [
        "Found reasons to work on easier tasks instead",
        "Kept asking 'do we have to do this part?'",
        "Spent time organizing files instead of tackling the main problem",
        "Claimed their computer was 'acting weird' when struggling",
        "Asked to use the bathroom frequently during challenging sections",
        "Pretended to understand rather than admitting confusion",
        "Waited for others to solve it then asked to see their solution",
        "Changed the requirements to make the task easier",
        "Focused on perfecting the easy parts while avoiding the hard ones",
        "Made jokes to deflect when things got difficult",
        "Suddenly remembered urgent tasks they needed to work on instead",
        "Asked if they could work with a partner (to let them lead)"
    ],
    disruptiveBehaviors: [
        "Started side conversations during instruction time",
        "Made jokes that pulled other students off task",
        "Clicked around on unrelated websites during the lesson",
        "Interrupted to share unrelated stories or experiences",
        "Made exaggerated sighs and complaints about the difficulty",
        "Gave running commentary about how 'boring' the material was",
        "Tried to help classmates when they should be listening",
        "Used their phone despite classroom rules",
        "Argued about why they should be allowed to do things differently",
        "Made noise with keyboard, chair, or other materials",
        "Left their workspace frequently without permission",
        "Dominated group discussions without letting others contribute"
    ],
    criticalThinking: [
        "Asked 'but what would happen if we changed this parameter?'",
        "Spotted an edge case that could break the solution",
        "Questioned whether there might be a more efficient approach",
        "Connected today's concept to something completely different we learned before",
        "Wondered aloud about the trade-offs between different methods",
        "Came up with an example that challenged the general rule",
        "Asked thoughtful questions about when NOT to use this technique",
        "Evaluated pros and cons before choosing their approach",
        "Recognized assumptions they were making and tested them",
        "Proposed alternative ways to solve the same problem",
        "Analyzed why their first attempt didn't work as expected",
        "Made predictions about what the output would be before running code",
        "Thought about how users might misuse or break their program",
        "Considered the broader implications of what we're learning"
    ],
    socialEmotional: [
        "Offered encouragement to a frustrated classmate",
        "Shared their screen to help someone who was stuck",
        "Celebrated others' successes without jealousy",
        "Asked for help in a way that showed they'd already tried",
        "Remained calm and focused when their own code broke",
        "Listened patiently to different approaches during group work",
        "Gave constructive feedback during peer reviews",
        "Showed genuine interest in how others solved problems",
        "Admitted when they didn't understand something",
        "Took responsibility for their part in group project delays",
        "Handled criticism of their code professionally",
        "Made inclusive comments that welcomed quieter students",
        "Managed their time well to meet group deadlines",
        "Showed empathy when others were struggling with the material"
    ]
};

const LANGUAGE_KEYWORDS = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#', 'HTML', 'CSS', 'React', 'Node.js',
    'variables', 'functions', 'loops', 'conditionals', 'arrays', 'objects', 'classes'
];

// Icons for template categories
const TEMPLATE_ICONS = {
    engagement: 'fas fa-heart',
    problemSolving: 'fas fa-puzzle-piece', 
    technicalProgress: 'fas fa-chart-line',
    challengingBehaviors: 'fas fa-exclamation-triangle',
    avoidancePatterns: 'fas fa-eye-slash',
    disruptiveBehaviors: 'fas fa-ban',
    criticalThinking: 'fas fa-brain',
    socialEmotional: 'fas fa-users'
};

// Debug information
console.log('Teaching Notes Studio - Initializing...');
console.log('React version:', React.version);
console.log('Monaco available:', !!window.monaco);
console.log('Require.js available:', !!window.require);