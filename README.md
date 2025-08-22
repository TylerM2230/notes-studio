# Teaching Notes Studio

A web application for educators to write and organize student observation notes. You can batch multiple students and export all notes to your clipboard for pasting into other documents.

## Getting Started

### Option 1: Run Locally (Recommended)

1. **Download or clone this project**

   ```bash
   git clone <repository-url>
   cd notes-studio
   ```

2. **Start a web server** (required for full functionality)

   ```bash
   # If you have Python 3:
   python3 -m http.server 8000

   # If you have Node.js:
   npx serve .

   # If you have PHP:
   php -S localhost:8000
   ```

3. **Open in your browser**
   ```
   http://localhost:8000
   ```

### Option 2: Just Open the File

You can double-click `index.html` to open it directly in your browser, but some features (like autocomplete data) won't work without a web server.

### Option 3: Online

You can also visit the Github Pages Site

## How to Use

### Basic Workflow

1. Enter a student's name in the top text field
2. Write your observation notes in the editor below
3. Click "Add to Batch" or press `Ctrl+Enter`
4. Repeat for more students
5. Click "Export Batch" or press `Ctrl+E` to copy all notes to your clipboard
6. Paste into your gradebook, LMS, or wherever you keep records

### Using Templates

- Click any template button to insert common observation phrases
- Use `Ctrl+Space` to trigger autocomplete while typing
- Press `Ctrl+←` or `Ctrl+→` to cycle through template categories

### Themes

Use the theme dropdown in the top-right corner to change colors. All 6 themes will update the entire interface including the editor.

## Available Themes

Six color themes are available:

- **Dark Orange** (Default): Orange highlights on dark background
- **Solarized Dark**: Blue tones
- **Monokai**: Green and pink highlights
- **Dracula**: Purple and pink
- **Nord**: Blue and cyan
- **GitHub Dark**: Blue theme

When you change themes, the editor colors and all interface elements update to match.

## Template Categories

Eight types of observation templates are included:

1. **Engagement** - Student participation and motivation
2. **Problem Solving** - How students approach challenges
3. **Technical Progress** - Skills and concept understanding
4. **Challenging Behaviors** - Areas that need support
5. **Avoidance Patterns** - When students resist tasks
6. **Disruptive Behaviors** - Classroom management notes
7. **Critical Thinking** - Advanced reasoning
8. **Social Emotional** - Collaboration and self-regulation

## Keyboard Shortcuts

- `Ctrl+Enter` - Add student to batch
- `Ctrl+E` - Export batch to clipboard
- `Ctrl+R` - Clear batch
- `Ctrl+Space` - Show autocomplete suggestions
- `Ctrl+←/→` - Switch template categories
- `Enter` in name field - Jump to editor

## File Structure

```
├── index.html              # Main file to open
├── src/app.js              # Main application code
├── src/data/               # Templates and autocomplete data
├── assets/styles.css       # Styling and themes
├── config/                 # Editor configuration
└── scraped_notes.json      # Sample autocomplete data
```

## Technical Requirements

- Works in Chrome, Firefox, Safari, Edge (recent versions)
- Uses React, Monaco Editor (VS Code's editor), and Tailwind CSS
- No installation needed - everything loads from CDN
- Best experience with a web server, but will work by opening the HTML file
- HTTPS gives better clipboard functionality

## Privacy

Your student data never leaves your browser. Nothing is sent to any server or stored anywhere except your local session.
