const { useState, useEffect, useRef, useCallback } = React;

// Main App Component
function TeachingNotesApp() {
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState("");
  const [currentNotes, setCurrentNotes] = useState("");

  // Pre-formatted template that mirrors scraped_notes.json structure
  const getNotesTemplate = () => {
    return `Warm Up: [Enter warm-up activity description]

[Describe the student's engagement and performance with the warm-up activity. Include specific observations about their approach, problem-solving techniques, and understanding.]

Main Activity: [Enter main activity description]

[Provide detailed observations about the student's work on the main activity. Note their focus, independence, challenges faced, and progress made.]

[Add an encouraging closing remark about their effort, progress, and areas of strength.]`;
  };
  // batchSize is derived from students.length to avoid sync issues
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ words: 0, concepts: 0, languages: 0 });
  const [showSuggestions, setShowSuggestions] = useState(true); // Always show templates
  const [activeTemplateTab, setActiveTemplateTab] = useState("engagement");
  const [currentTheme, setCurrentTheme] = useState("dark-orange");
  const [editorLoading, setEditorLoading] = useState(true);
  const [editorError, setEditorError] = useState(false);
  const [enhancedDataLoaded, setEnhancedDataLoaded] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const suggestionEngineRef = useRef(null);
  const monacoIntegrationRef = useRef(null);

  // Comprehensive theme configuration
  const getThemeColors = (theme) => {
    const themes = {
      "dark-orange": {
        monaco: "vs-dark",
        primary: "#ff8c42",
        secondary: "#ff6b35",
        background: "#1a2332",
        backgroundSecondary: "#2d3748",
        text: "#e2e8f0",
        border: "#ff6b35",
        highlight: "rgba(255, 140, 66, 0.15)",
        highlightBorder: "rgba(255, 140, 66, 0.4)",
      },
      "solarized-dark": {
        monaco: "vs-dark",
        primary: "#268bd2",
        secondary: "#2aa198",
        background: "#002b36",
        backgroundSecondary: "#073642",
        text: "#839496",
        border: "#2aa198",
        highlight: "rgba(38, 139, 210, 0.15)",
        highlightBorder: "rgba(38, 139, 210, 0.4)",
      },
      monokai: {
        monaco: "vs-dark",
        primary: "#a6e22e",
        secondary: "#f92672",
        background: "#272822",
        backgroundSecondary: "#3e3d32",
        text: "#f8f8f2",
        border: "#a6e22e",
        highlight: "rgba(166, 226, 46, 0.15)",
        highlightBorder: "rgba(166, 226, 46, 0.4)",
      },
      dracula: {
        monaco: "vs-dark",
        primary: "#bd93f9",
        secondary: "#ff79c6",
        background: "#282a36",
        backgroundSecondary: "#44475a",
        text: "#f8f8f2",
        border: "#bd93f9",
        highlight: "rgba(189, 147, 249, 0.15)",
        highlightBorder: "rgba(189, 147, 249, 0.4)",
      },
      nord: {
        monaco: "vs-dark",
        primary: "#88c0d0",
        secondary: "#5e81ac",
        background: "#2e3440",
        backgroundSecondary: "#3b4252",
        text: "#eceff4",
        border: "#88c0d0",
        highlight: "rgba(136, 192, 208, 0.15)",
        highlightBorder: "rgba(136, 192, 208, 0.4)",
      },
      "github-dark": {
        monaco: "vs-dark",
        primary: "#58a6ff",
        secondary: "#1f6feb",
        background: "#0d1117",
        backgroundSecondary: "#161b22",
        text: "#c9d1d9",
        border: "#58a6ff",
        highlight: "rgba(88, 166, 255, 0.15)",
        highlightBorder: "rgba(88, 166, 255, 0.4)",
      },
    };
    return themes[theme] || themes["dark-orange"];
  };

  // Theme to Monaco theme mapping
  const getMonacoTheme = (theme) => {
    return getThemeColors(theme).monaco;
  };

  // Initialize template on first load
  useEffect(() => {
    if (!currentNotes) {
      setCurrentNotes(getNotesTemplate());
    }
  }, []);

  // Initialize Enhanced Autocomplete System
  useEffect(() => {
    const initializeEnhancedAutocomplete = async () => {
      try {
        console.log("Loading enhanced autocomplete data...");
        const dataLoader = getDataLoader();
        const enhancedData = await dataLoader.loadEnhancedData();

        // Initialize suggestion engine
        suggestionEngineRef.current = new SuggestionEngine(enhancedData);

        // Initialize Monaco integration
        monacoIntegrationRef.current = new MonacoIntegration(
          suggestionEngineRef.current
        );

        setEnhancedDataLoaded(true);
        console.log("Enhanced autocomplete system ready");
      } catch (error) {
        console.error("Failed to initialize enhanced autocomplete:", error);
        // Fall back to basic autocomplete
        setEnhancedDataLoaded(false);
      }
    };

    initializeEnhancedAutocomplete();
  }, []);

  // Initialize Monaco Editor
  useEffect(() => {
    let isInitialized = false;

    const initializeEditor = () => {
      if (isInitialized || !editorRef.current || monacoRef.current) return;

      try {
        isInitialized = true;
        monacoRef.current = window.monaco.editor.create(editorRef.current, {
          value: currentNotes || getNotesTemplate(),
          language: "markdown",
          theme: getMonacoTheme(currentTheme),
          fontSize: 14,
          lineHeight: 24,
          fontFamily: '"Courier New", Courier, monospace',
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 20, bottom: 20 },
          smoothScrolling: true,

          // ========== ENHANCED CURSOR AND HIGHLIGHTING SETTINGS ==========
          cursorBlinking: "expand", // More visible blinking animation
          cursorSmoothCaretAnimation: "on", // Enable smooth cursor movement
          cursorWidth: 2, // Thinner cursor
          cursorStyle: "line", // Line cursor style

          // Line highlighting
          renderLineHighlight: "all", // Highlight entire current line
          renderLineHighlightOnlyWhenFocus: false, // Always show line highlight

          // Selection and occurrence highlighting
          selectionHighlight: true, // Highlight matching selections
          occurrencesHighlight: true, // Highlight word occurrences
          renderFinalNewline: true, // Show final newline character

          // Word highlighting settings
          wordHighlight: true, // Enable word highlighting on cursor
          wordHighlightBackground: getThemeColors(currentTheme).highlight, // Dynamic word highlight color
          wordHighlightBorder: `1px solid ${getThemeColors(currentTheme).highlightBorder}`, // Dynamic border

          // Selection settings
          roundedSelection: true, // Rounded selection corners
          selectionClipboard: true, // Enable selection clipboard

          // Find/replace highlighting
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },

          folding: true,
          lineNumbers: "on",
          glyphMargin: false,
          readOnly: false,
          contextmenu: true,
          mouseWheelZoom: false,

          // Bracket matching
          matchBrackets: "always", // Always highlight matching brackets
          bracketPairColorization: { enabled: true }, // Enable bracket colorization

          // Indent guides
          renderIndentGuides: true, // Show indent guides
          highlightActiveIndentGuide: true, // Highlight active indent guide

          quickSuggestions: false, // Disable automatic suggestions to be less obtrusive
          parameterHints: { enabled: false }, // Reduce visual noise
          suggestOnTriggerCharacters: true, // Keep trigger-based suggestions
          acceptSuggestionOnEnter: "smart", // Only accept on exact matches
          tabCompletion: "on",
          wordBasedSuggestions: false, // Disable generic word suggestions
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        });

        // ========== ENHANCED CURSOR AND HIGHLIGHTING EVENT HANDLERS ==========

        // Cursor position change handler for enhanced highlighting
        monacoRef.current.onDidChangeCursorPosition((e) => {
          // Add custom cursor line highlighting
          const model = monacoRef.current.getModel();
          const decorations = monacoRef.current.getLineDecorations(
            e.position.lineNumber
          );

          // Clear previous custom decorations
          const existingDecorations = decorations.filter(
            (d) => d.options.className === "current-line-exact"
          );
          if (existingDecorations.length > 0) {
            monacoRef.current.removeDecorations(
              existingDecorations.map((d) => d.id)
            );
          }

          // Add new line decoration
          monacoRef.current.createDecorationsCollection([
            {
              range: new window.monaco.Range(
                e.position.lineNumber,
                1,
                e.position.lineNumber,
                1
              ),
              options: {
                isWholeLine: true,
                className: "current-line-exact",
                zIndex: 1,
              },
            },
          ]);
        });

        // Selection change handler for enhanced selection highlighting
        monacoRef.current.onDidChangeCursorSelection((e) => {
          // Enhanced selection highlighting is handled by CSS
          // This event can be used for future enhancements
        });

        // Focus/blur handlers for editor highlight states
        monacoRef.current.onDidFocusEditorWidget(() => {
          // Add focused state to editor container
          if (editorRef.current) {
            editorRef.current.classList.add("monaco-editor-focused");
          }
        });

        monacoRef.current.onDidBlurEditorWidget(() => {
          // Remove focused state from editor container
          if (editorRef.current) {
            editorRef.current.classList.remove("monaco-editor-focused");
          }
        });

        // Set up live content changes with debounce to prevent conflicts
        let updateTimeout;
        monacoRef.current.onDidChangeModelContent(() => {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            const value = monacoRef.current.getValue();
            setCurrentNotes(value);
            updateStats(value);
          }, 100);
        });

        // Enhanced auto-completion provider
        let completionDisposable = null;

        if (enhancedDataLoaded && monacoIntegrationRef.current) {
          // Use enhanced autocomplete system
          completionDisposable =
            monacoIntegrationRef.current.registerCompletionProvider(
              window.monaco
            );
          console.log("Enhanced autocomplete registered");
        } else {
          // Fallback to basic completion provider
          completionDisposable =
            window.monaco.languages.registerCompletionItemProvider("markdown", {
              provideCompletionItems: (model, position) => {
                const suggestions = [];

                // Add observation templates
                Object.entries(OBSERVATION_TEMPLATES).forEach(
                  ([category, items]) => {
                    items.forEach((item) => {
                      suggestions.push({
                        label: item,
                        kind: window.monaco.languages.CompletionItemKind
                          .Snippet,
                        insertText: `- ${item}`,
                        documentation: `${
                          category.charAt(0).toUpperCase() + category.slice(1)
                        } observation`,
                        range: {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: position.column,
                          endColumn: position.column,
                        },
                      });
                    });
                  }
                );

                return { suggestions };
              },
            });
          console.log("Basic autocomplete registered (fallback)");
        }

        // Focus the editor and apply custom styling
        setTimeout(() => {
          monacoRef.current.focus();

          // Force update font family and colors after initialization
          monacoRef.current.updateOptions({
            fontFamily: '"Courier New", Courier, monospace',
          });

          // Apply custom styling with dynamic theme colors
          const themeColors = getThemeColors(currentTheme);
          const editorElement =
            editorRef.current.querySelector(".monaco-editor");
          if (editorElement) {
            editorElement.style.fontFamily =
              '"Courier New", Courier, monospace';
            editorElement.style.background = themeColors.background;
            editorElement.classList.add("monaco-editor-with-grid");

            // Apply clean background without grid
            const editorBackground = editorElement.querySelector(
              ".monaco-editor-background"
            );
            if (editorBackground) {
              editorBackground.style.backgroundColor = themeColors.background;
            }

            // Ensure view lines have clean background
            const viewLines = editorElement.querySelector(".view-lines");
            if (viewLines) {
              viewLines.style.backgroundColor = "transparent";
            }
          }

          setEditorLoading(false);
        }, 100);

        // Cleanup function
        return () => {
          if (completionDisposable) {
            completionDisposable.dispose();
          }
        };
      } catch (error) {
        console.error("Failed to initialize Monaco Editor:", error);
        setEditorError(true);
        setEditorLoading(false);
        isInitialized = false;
      }
    };

    // Better Monaco loading with proper CDN handling
    const loadMonaco = () => {
      if (window.monaco) {
        // Monaco is already available
        initializeEditor();
        return;
      }

      if (typeof window.require !== "undefined") {
        try {
          // Configure require.js for Monaco CDN
          window.require.config({
            paths: {
              vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs",
            },
          });

          // Load Monaco from CDN
          window.require(
            ["vs/editor/editor.main"],
            () => {
              initializeEditor();
            },
            (error) => {
              console.error("Failed to load Monaco from CDN:", error);
              setEditorError(true);
              setEditorLoading(false);
            }
          );
        } catch (error) {
          console.error("Require.js error:", error);
          setEditorError(true);
          setEditorLoading(false);
        }
      } else {
        // require.js not available, try direct check
        const checkMonaco = setInterval(() => {
          if (window.monaco) {
            clearInterval(checkMonaco);
            initializeEditor();
          }
        }, 200);

        // Clear interval after 8 seconds
        setTimeout(() => {
          clearInterval(checkMonaco);
          if (!monacoRef.current) {
            console.warn("Monaco Editor failed to load - using fallback");
            setEditorError(true);
            setEditorLoading(false);
          }
        }, 8000);
      }
    };

    // Start loading Monaco
    loadMonaco();

    // Global timeout fallback
    setTimeout(() => {
      if (!monacoRef.current && !editorError) {
        console.warn("Monaco Editor timeout - using fallback textarea");
        setEditorError(true);
        setEditorLoading(false);
      }
    }, 12000);

    // Cleanup function
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, [currentTheme, enhancedDataLoaded]);

  // Update Monaco theme when theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({
        theme: getMonacoTheme(currentTheme),
        wordHighlightBackground: getThemeColors(currentTheme).highlight,
        wordHighlightBorder: `1px solid ${getThemeColors(currentTheme).highlightBorder}`,
      });

      // Update editor styling with new theme colors
      const editorElement = editorRef.current.querySelector(".monaco-editor");
      if (editorElement) {
        editorElement.style.background = getThemeColors(currentTheme).background;
        
        const editorBackground = editorElement.querySelector(".monaco-editor-background");
        if (editorBackground) {
          editorBackground.style.backgroundColor = getThemeColors(currentTheme).background;
        }
      }
    }

    // Show theme change notification
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 20px;
        background: ${getThemeColors(currentTheme).background};
        color: ${getThemeColors(currentTheme).text};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        border: 2px solid ${getThemeColors(currentTheme).border};
        backdrop-filter: blur(10px);
      ">
        <div style="display: flex; align-items: center;">
          <i class="fas fa-palette" style="margin-right: 8px; color: ${getThemeColors(currentTheme).primary};"></i>
          <span>Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1).replace(/([A-Z])/g, ' $1')}</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove notification after 2 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }, [currentTheme]);

  // Update editor content when currentNotes changes externally (but not from editor itself)
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== currentNotes) {
      const position = monacoRef.current.getPosition();
      monacoRef.current.setValue(currentNotes);
      if (position) {
        monacoRef.current.setPosition(position);
      }
    }
  }, [currentNotes]);

  // Update statistics in real-time
  const updateStats = useCallback((text) => {
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    const concepts = LANGUAGE_KEYWORDS.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const languages = [
      "python",
      "javascript",
      "java",
      "html",
      "css",
      "react",
    ].filter((lang) => text.toLowerCase().includes(lang)).length;

    setStats({ words, concepts, languages });
  }, []);

  // Add student to batch
  const addToBatch = useCallback(() => {
    if (!currentStudent.trim()) {
      alert("Please enter a student name");
      return;
    }

    if (!currentNotes.trim()) {
      alert("Please add some notes for this student");
      return;
    }

    const newStudent = {
      id: Date.now(),
      name: currentStudent.trim(),
      notes: currentNotes.trim(),
      timestamp: new Date().toISOString(),
      wordCount: stats.words,
      conceptsFound: stats.concepts,
    };

    setStudents((prev) => [...prev, newStudent]);

    // Clear form and load template for next student
    setCurrentStudent("");
    const template = getNotesTemplate();
    setCurrentNotes(template);
    if (monacoRef.current) {
      monacoRef.current.setValue(template);
    }

    // Success feedback
    setTimeout(() => {
      document.querySelector("#student-name-input").focus();
    }, 100);
  }, [currentStudent, currentNotes, stats]);

  // Fallback clipboard copy function for non-HTTPS environments
  const fallbackCopyToClipboard = (text) => {
    return new Promise((resolve, reject) => {
      // Method 1: Create a textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          resolve();
        } else {
          reject(new Error("execCommand copy failed"));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  };

  // Process batch (export to clipboard)
  const processBatch = useCallback(async () => {
    if (students.length === 0) {
      alert("No students in batch to process");
      return;
    }

    setIsProcessing(true);

    try {
      // Format for LLM processing similar to original
      const formattedOutput = students
        .map(
          (student) =>
            `Student: ${student.name}\nObservations:\n${student.notes}\n---`
        )
        .join("\n\n");

      // Try modern Clipboard API first, fallback to execCommand
      let copyMethod = "Unknown";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(formattedOutput);
          copyMethod = "Modern Clipboard API";
        } else {
          await fallbackCopyToClipboard(formattedOutput);
          copyMethod = "Legacy execCommand";
        }
      } catch (clipboardError) {
        // If clipboard fails, try the fallback method
        await fallbackCopyToClipboard(formattedOutput);
        copyMethod = "Fallback execCommand";
      }

      // Enhanced visual feedback with acknowledgment
      setTimeout(() => {
        setIsProcessing(false);

        // Create a more prominent success notification
        const notification = document.createElement("div");
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 600;
            border: 2px solid #34d399;
            min-width: 320px;
          ">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <i class="fas fa-check-circle" style="margin-right: 12px; font-size: 18px;"></i>
              <span style="font-size: 16px;">Notes Successfully Copied!</span>
            </div>
            <div style="font-size: 14px; opacity: 0.9; margin-left: 30px;">
              ${students.length} student observation${
          students.length !== 1 ? "s" : ""
        } copied to clipboard
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-left: 30px; margin-top: 4px;">
              Ready to paste into your document
            </div>
            <div style="font-size: 10px; opacity: 0.6; margin-left: 30px; margin-top: 2px;">
              Method: ${copyMethod}
            </div>
          </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove notification after 4 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 4000);

        // Also show a backup alert for compatibility
        console.log(
          `✅ Successfully exported ${students.length} students to clipboard using ${copyMethod}!`
        );
      }, 800);
    } catch (error) {
      setIsProcessing(false);

      // Enhanced error notification with more helpful guidance
      const errorNotification = document.createElement("div");
      errorNotification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 600;
          border: 2px solid #fbbf24;
          min-width: 320px;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <i class="fas fa-exclamation-triangle" style="margin-right: 12px; font-size: 18px;"></i>
            <span style="font-size: 16px;">Copy to Clipboard Failed</span>
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-left: 30px;">
            ${error.message}
          </div>
          <div style="font-size: 12px; opacity: 0.7; margin-left: 30px; margin-top: 4px;">
            Try: 1) Use HTTPS/localhost 2) Allow clipboard permissions 3) Use Ctrl+A, Ctrl+C manually
          </div>
          <div style="font-size: 10px; opacity: 0.6; margin-left: 30px; margin-top: 2px;">
            GitHub Pages deployment will work with HTTPS
          </div>
        </div>
      `;

      document.body.appendChild(errorNotification);

      setTimeout(() => {
        if (errorNotification.parentNode) {
          errorNotification.parentNode.removeChild(errorNotification);
        }
      }, 6000);

      console.error("Export error:", error);

      // As a final fallback, display the text in a modal for manual copy
      const modal = document.createElement("div");
      modal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: #1f2937;
            padding: 24px;
            border-radius: 12px;
            max-width: 80%;
            max-height: 80%;
            color: white;
          ">
            <h3 style="margin: 0 0 16px 0; color: #fbbf24;">Manual Copy Required</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #d1d5db;">
              Please select all text below and copy manually (Ctrl+A, Ctrl+C):
            </p>
            <textarea style="
              width: 100%;
              height: 300px;
              padding: 12px;
              border-radius: 6px;
              border: none;
              background: #374151;
              color: white;
              font-family: monospace;
              font-size: 12px;
            " readonly onclick="this.select()">${formattedOutput}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" style="
              margin-top: 16px;
              padding: 8px 16px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">Close</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }
  }, [students]);

  // Clear batch
  const clearBatch = useCallback(() => {
    if (students.length === 0) {
      // Show feedback even when batch is empty
      const notification = document.createElement("div");
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 600;
          border: 2px solid #fbbf24;
          min-width: 280px;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <i class="fas fa-info-circle" style="margin-right: 12px; font-size: 18px;"></i>
            <span style="font-size: 16px;">Batch Already Empty</span>
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-left: 30px;">
            No students to clear
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
      return;
    }

    if (
      confirm(
        `Clear batch of ${students.length} student${
          students.length !== 1 ? "s" : ""
        }?\n\nThis action cannot be undone.`
      )
    ) {
      const clearedCount = students.length;
      setStudents([]);

      // Show success notification for clearing
      const notification = document.createElement("div");
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 600;
          border: 2px solid #f87171;
          min-width: 280px;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <i class="fas fa-trash-alt" style="margin-right: 12px; font-size: 18px;"></i>
            <span style="font-size: 16px;">Batch Cleared</span>
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-left: 30px;">
            ${clearedCount} student observation${
        clearedCount !== 1 ? "s" : ""
      } removed
          </div>
          <div style="font-size: 12px; opacity: 0.7; margin-left: 30px; margin-top: 4px;">
            Ready for new notes
          </div>
        </div>
      `;

      document.body.appendChild(notification);

      // Auto-remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);

      console.log(`🗑️ Cleared batch of ${clearedCount} students`);
    }
  }, [students.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            e.stopPropagation();
            addToBatch();
            break;
          case "e":
            e.preventDefault();
            e.stopPropagation();
            processBatch();
            break;
          case "r":
          case "R":
            // Handle both lowercase and uppercase
            e.preventDefault();
            e.stopPropagation();
            // Add extra protection against browser refresh
            clearBatch();
            return false;
          case "ArrowLeft":
            e.preventDefault();
            e.stopPropagation();
            cycleThroughTemplates("prev");
            break;
          case "ArrowRight":
            e.preventDefault();
            e.stopPropagation();
            cycleThroughTemplates("next");
            break;
        }
      }
    };

    // Add event listener with capture to intercept before browser defaults
    window.addEventListener("keydown", handleKeyboard, true);
    return () => window.removeEventListener("keydown", handleKeyboard, true);
  }, [addToBatch, processBatch, clearBatch, activeTemplateTab]);

  // Function to cycle through template categories
  const cycleThroughTemplates = useCallback(
    (direction) => {
      const categories = Object.keys(OBSERVATION_TEMPLATES);
      const currentIndex = categories.indexOf(activeTemplateTab);

      let nextIndex;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % categories.length;
      } else {
        nextIndex = (currentIndex - 1 + categories.length) % categories.length;
      }

      setActiveTemplateTab(categories[nextIndex]);
    },
    [activeTemplateTab]
  );

  return (
    <div
      className={`min-h-screen transition-all duration-300 theme-${currentTheme}`}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="text-white p-6 shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <i className="fas fa-cubes icon-avant-garde"></i>
            <div>
              <h1
                className="heading-avant-garde"
                data-text="gotta-get-dem-notes"
              >
                gotta-get-dem-notes
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-2xl font-mono">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-orange-200">
                {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Theme:
              </label>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="p-2 rounded-lg text-sm font-medium transition-all border-2 focus:outline-none focus:ring-2 text-white"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="dark-orange">Dark Orange</option>
                <option value="solarized-dark">Solarized Dark</option>
                <option value="monokai">Monokai</option>
                <option value="dracula">Dracula</option>
                <option value="nord">Nord</option>
                <option value="github-dark">GitHub Dark</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Top Section - Student Input with Batch Status */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className="p-6 rounded-xl shadow-lg fade-in accent-border"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <i className="fas fa-user-graduate accent-orange text-xl"></i>
                <h2 className="text-xl font-semibold text-white">
                  Current Student
                </h2>
              </div>

              <input
                id="student-name-input"
                type="text"
                value={currentStudent}
                onChange={(e) => setCurrentStudent(e.target.value)}
                placeholder="Enter student name..."
                className="w-full p-4 rounded-lg text-lg font-medium transition-all border-2 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-30 text-white placeholder-gray-400"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setTimeout(() => {
                      if (monacoRef.current) {
                        monacoRef.current.focus();
                      }
                    }, 100);
                  }
                }}
              />
            </div>
          </div>

          {/* Batch Status - Compact Version */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl shadow-lg fade-in accent-border h-full flex flex-col justify-center"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <i className="fas fa-layer-group accent-orange text-xl"></i>
                <h2 className="text-lg font-semibold text-white">
                  Batch Status
                </h2>
              </div>

              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    students.length > 0 ? "accent-orange" : "text-gray-500"
                  }`}
                >
                  {students.length}
                </div>
                <div className="text-sm text-gray-300">
                  Student{students.length !== 1 ? "s" : ""} in batch
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section - Notes Editor */}
        <div className="mb-6">
          <div
            className="p-6 rounded-xl shadow-lg fade-in accent-border"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <i className="fas fa-edit accent-orange text-xl"></i>
                <h2 className="text-xl font-semibold text-white">
                  Observation Notes
                </h2>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <span
                  className="px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: getThemeColors(currentTheme).highlight,
                    color: getThemeColors(currentTheme).primary,
                    border: `1px solid ${getThemeColors(currentTheme).highlightBorder}`,
                  }}
                >
                  <i className="fas fa-font mr-1"></i>
                  {stats.words} words
                </span>
                <span
                  className="px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: getThemeColors(currentTheme).highlight,
                    color: getThemeColors(currentTheme).secondary,
                    border: `1px solid ${getThemeColors(currentTheme).highlightBorder}`,
                  }}
                >
                  <i className="fas fa-lightbulb mr-1"></i>
                  {stats.concepts} concepts
                </span>
                <span
                  className="px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: getThemeColors(currentTheme).highlight,
                    color: getThemeColors(currentTheme).text,
                    border: `1px solid ${getThemeColors(currentTheme).highlightBorder}`,
                  }}
                >
                  <i className="fas fa-code mr-1"></i>
                  {stats.languages} languages
                </span>
              </div>
            </div>

            <div className="relative">
              <div
                ref={editorRef}
                className="monaco-container monaco-editor-with-grid theme-dark-blue h-96 border rounded-lg overflow-hidden cursor-text accent-border"
                style={{
                  border: `1px solid ${getThemeColors(currentTheme).border}`,
                  minHeight: "384px",
                  position: "relative",
                  background: getThemeColors(currentTheme).background,
                }}
                onClick={() => {
                  if (monacoRef.current) {
                    monacoRef.current.focus();
                  }
                }}
                tabIndex={0}
                onFocus={() => {
                  if (monacoRef.current) {
                    monacoRef.current.focus();
                  }
                }}
              />
              {editorLoading && !editorError && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg border"
                  style={{
                    border: "1px solid #374151",
                  }}
                >
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-3"></i>
                    <div className="text-gray-500 font-medium">
                      Loading Advanced Editor
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Initializing Monaco Editor from CDN...
                    </div>
                    <div className="text-xs text-blue-400 mt-2">
                      This may take a few seconds • Fallback available if needed
                    </div>
                    <button
                      onClick={() => {
                        console.log("Manual fallback triggered");
                        setEditorError(true);
                        setEditorLoading(false);
                      }}
                      className="mt-3 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-all"
                    >
                      Skip to Text Editor
                    </button>
                  </div>
                </div>
              )}
              {editorError && (
                <div
                  className="absolute inset-0 p-4 bg-gray-800 rounded-lg border"
                  style={{
                    border: "1px solid #374151",
                  }}
                >
                  <div className="text-center mb-4">
                    <i className="fas fa-exclamation-triangle text-2xl text-yellow-500 mb-2"></i>
                    <div className="text-gray-500 font-medium">
                      Advanced Editor Unavailable
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Using enhanced text editor instead
                    </div>
                    <div className="text-xs text-blue-400 mt-2">
                      All features still work • Auto-save • Keyboard shortcuts •
                      Statistics
                    </div>
                  </div>
                  <textarea
                    value={currentNotes || getNotesTemplate()}
                    onChange={(e) => {
                      setCurrentNotes(e.target.value);
                      updateStats(e.target.value);
                    }}
                    placeholder="Use the pre-formatted template to structure your student observations..."
                    className="courier-font editor-grid-background w-full h-64 p-3 rounded-md border transition-all resize-none focus:outline-none focus:ring-2 text-sm leading-relaxed placeholder-gray-400 accent-border"
                    style={{
                      backgroundColor: getThemeColors(currentTheme).background,
                      borderColor: getThemeColors(currentTheme).border,
                      color: getThemeColors(currentTheme).text,
                      focusRingColor: getThemeColors(currentTheme).primary,
                    }}
                    autoFocus
                    spellCheck="true"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-300 flex items-center">
                <i className="fas fa-lightbulb accent-orange mr-2"></i>
                <span>
                  Type "-" for suggestions • Ctrl+Space for completion • Ctrl+←
                  → to cycle templates
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const template = getNotesTemplate();
                    setCurrentNotes(template);
                    if (monacoRef.current) {
                      monacoRef.current.setValue(template);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all button-accent"
                  title="Load the structured template for note-taking"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  Load Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Library Section - Below Editor */}
        <div className="mb-6">
          <div
            className="p-6 rounded-xl shadow-lg fade-in accent-border"
            style={{
              backgroundColor: getThemeColors(currentTheme).background,
              border: `1px solid ${getThemeColors(currentTheme).border}`,
            }}
          >
            <div className="flex items-center mb-4">
              <i className="fas fa-clipboard-list accent-orange mr-2"></i>
              <h3 className="text-lg font-semibold text-white">
                Template Library
              </h3>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-600">
              {Object.keys(OBSERVATION_TEMPLATES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTemplateTab(category)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all flex items-center space-x-2 ${
                    activeTemplateTab === category
                      ? "button-accent border-b-2 border-orange-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  style={{
                    backgroundColor:
                      activeTemplateTab === category
                        ? "rgba(255, 107, 53, 0.2)"
                        : "transparent",
                  }}
                >
                  <i className={TEMPLATE_ICONS[category]}></i>
                  <span>
                    {category
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </button>
              ))}
            </div>

            {/* Template Content - More columns since it's full width */}
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {OBSERVATION_TEMPLATES[activeTemplateTab]?.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Insert at cursor position instead of appending
                      if (monacoRef.current) {
                        const position = monacoRef.current.getPosition();
                        const model = monacoRef.current.getModel();
                        const range = {
                          startLineNumber: position.lineNumber,
                          startColumn: position.column,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column,
                        };

                        const textToInsert = `- ${item}`;
                        model.pushEditOperations(
                          [],
                          [
                            {
                              range: range,
                              text: textToInsert + "\n",
                            },
                          ],
                          () => null
                        );

                        // Update state
                        const newValue = monacoRef.current.getValue();
                        setCurrentNotes(newValue);
                      } else {
                        // Fallback for textarea
                        const newText =
                          currentNotes +
                          (currentNotes ? "\n" : "") +
                          `- ${item}`;
                        setCurrentNotes(newText);
                      }
                    }}
                    className="text-left p-3 text-sm rounded-lg border transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      backgroundColor: getThemeColors(currentTheme).backgroundSecondary,
                      borderColor: getThemeColors(currentTheme).backgroundSecondary,
                      color: getThemeColors(currentTheme).text,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = getThemeColors(currentTheme).highlight;
                      e.currentTarget.style.borderColor = getThemeColors(currentTheme).primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = getThemeColors(currentTheme).backgroundSecondary;
                      e.currentTarget.style.borderColor = getThemeColors(currentTheme).backgroundSecondary;
                    }}
                    title="Click to insert at cursor position"
                  >
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-plus-circle accent-orange text-xs mt-1 flex-shrink-0"></i>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-info-circle"></i>
                  <span>
                    Click to insert at cursor • Ctrl+← → to cycle categories
                  </span>
                </div>
                <div>
                  {OBSERVATION_TEMPLATES[activeTemplateTab]?.length || 0}{" "}
                  templates available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Quick Actions and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl shadow-lg fade-in accent-border"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <i className="fas fa-bolt accent-orange mr-2"></i>
                Quick Actions
              </h2>

              <div className="space-y-3">
                <button
                  onClick={addToBatch}
                  disabled={!currentStudent.trim() || !currentNotes.trim()}
                  className={`w-full p-4 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentStudent.trim() && currentNotes.trim()
                      ? "button-accent pulse-glow"
                      : "bg-gray-600 text-gray-400"
                  }`}
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add to Batch (Ctrl+Enter)
                </button>

                <button
                  onClick={processBatch}
                  disabled={students.length === 0 || isProcessing}
                  className={`w-full p-4 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    students.length > 0 && !isProcessing
                      ? "button-accent"
                      : "bg-gray-600 text-gray-400"
                  }`}
                >
                  <i
                    className={`${
                      isProcessing
                        ? "fas fa-spinner fa-spin"
                        : "fas fa-clipboard"
                    } mr-2`}
                  ></i>
                  {isProcessing ? "Processing..." : "Export Batch (Ctrl+E)"}
                </button>

                <button
                  onClick={clearBatch}
                  disabled={students.length === 0}
                  className={`w-full p-4 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    students.length > 0
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-600 text-gray-400"
                  }`}
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear Batch (Ctrl+R)
                </button>
              </div>
            </div>
          </div>

          {/* Recent Students */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl shadow-lg fade-in accent-border"
              style={{
                backgroundColor: getThemeColors(currentTheme).background,
                border: `1px solid ${getThemeColors(currentTheme).border}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <i className="fas fa-users accent-orange mr-2"></i>
                Recent Students
              </h2>

              {students.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students
                    .slice(-5)
                    .reverse()
                    .map((student) => (
                      <div
                        key={student.id}
                        className="p-3 rounded-lg border transition-all hover:shadow-md"
                        style={{
                          backgroundColor: getThemeColors(currentTheme).backgroundSecondary,
                          borderColor: getThemeColors(currentTheme).backgroundSecondary,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-white">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-300">
                            {student.wordCount} words
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(student.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-inbox text-4xl text-gray-500 mb-3"></i>
                  <div className="text-gray-400 font-medium">No students in batch yet</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Add students to see them appear here
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl shadow-lg fade-in accent-border"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <i className="fas fa-keyboard accent-orange mr-2"></i>
                Shortcuts
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Add to Batch</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Export Batch</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+E
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Clear Batch</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+R
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Auto-complete</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+Space
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Next Template</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+→
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Prev Template</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: getThemeColors(currentTheme).primary, 
                      color: "white" 
                    }}
                  >
                    Ctrl+←
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the app using React 18 createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TeachingNotesApp />);
