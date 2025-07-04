# UI Mockups and Design Guidelines

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Used for buttons, links, and highlights
- **Success**: Green (#22C55E) - Used for resolved issues and verified solutions
- **Warning**: Orange (#F59E0B) - Used for open issues and alerts
- **Gray Scale**: Various grays for text, backgrounds, and borders

### Typography
- **Headings**: Inter font family, bold weights
- **Body Text**: Inter font family, regular weight
- **Code**: Monospace font for code blocks

### Spacing
- Consistent 4px grid system
- Card padding: 24px (1.5rem)
- Component spacing: 16px (1rem)
- Section spacing: 24px (1.5rem)

## Page Layouts

### 1. Issue List View

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Logo            │ │ Search Bar      │ │ Create Issue    │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Main Content                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Issues (25 total)                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [✓] Login button not responding                    │ │ │
│ │ │ The login button on the main page is not responding │ │ │
│ │ │ John Tester • 2 hours ago • 3 comments              │ │ │
│ │ │ [open] TC-001 [ui] [login]                          │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Database connection timeout                         │ │ │
│ │ │ Getting connection timeout errors when running...   │ │ │
│ │ │ Sarah QA • 1 day ago • 1 comment                    │ │ │
│ │ │ [resolved] TC-015 [backend] [database]              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Previous 1 2 3 Next                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Clean card-based layout
- Status badges (open/resolved)
- Comment counts and timestamps
- Tag display
- Pagination controls
- Search bar prominently displayed

### 2. Single Issue View

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ Issue Details                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Login button not responding                        │ │
│ │ [open] TC-001 • John Tester • 2 hours ago              │ │
│ │ [ui] [login]                                            │ │
│ │                                                         │ │
│ │ The login button on the main page is not responding    │ │
│ │ to clicks. Test case TC-001 fails consistently.        │ │
│ │                                                         │ │
│ │ [screenshot.png] [log.txt]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Comments (3)                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Alice Dev • 1 hour ago                                  │ │
│ │ This was caused by a JavaScript event handler conflict. │ │
│ │ [Mark as Verified Solution]                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Bob Senior • 30 min ago [VERIFIED SOLUTION]             │ │
│ │ The issue is resolved by removing the conflicting      │ │
│ │ event listener. Verified working.                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Add Comment                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Your Name: [________________]                           │ │
│ │ Comment:                                                │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │                                                     │ │ │
│ │ │                                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ [Choose Files] [Post Comment]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Issue metadata prominently displayed
- File attachments with preview/download
- Comment thread with verification system
- Markdown support for rich content
- File upload in comments

### 3. Create Issue Form

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ Create New Issue                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title *                                                │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Brief description of the issue                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Description *                                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Detailed description of the issue, steps to...     │ │ │
│ │ │                                                     │ │ │
│ │ │                                                     │ │ │
│ │ │                                                     │ │ │
│ │ │                                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Supports Markdown formatting                            │ │
│ │                                                         │ │
│ │ Test Case ID                                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ e.g., TC-001, TEST-123                              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Your Name *                                             │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Enter your name                                      │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Tags                                                    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ui, backend, mobile (comma-separated)               │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Separate tags with commas                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Attachments                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Drag and drop files here, or browse                 │ │ │
│ │ │ Supports images, PDFs, and text files (max 16MB)    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ [screenshot.png] (1.2 MB) [×]                          │ │
│ │ [log.txt] (45 KB) [×]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Create Issue] [Cancel]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Clear form layout with required field indicators
- Rich text editor with Markdown support
- Drag-and-drop file upload
- File preview and removal
- Tag suggestions

### 4. Search Results Page

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ Search Results (15 results found)                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Search Query                                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Search issues, descriptions, or test cases...      │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Status: [All Status ▼] Test Case ID: [TC-001]          │ │
│ │ Tags: [All Tags ▼]                                      │ │
│ │                                                         │ │
│ │ [Search] [Clear Filters]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Showing 10 of 15 results                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Login button not responding                        │ │
│ │ The login button on the main page is not responding    │ │
│ │ John Tester • 2 hours ago • 3 comments                 │ │
│ │ [open] TC-001 [ui] [login]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Database connection timeout                             │ │
│ │ Getting connection timeout errors when running...       │ │
│ │ Sarah QA • 1 day ago • 1 comment                       │ │
│ │ [resolved] TC-015 [backend] [database]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Advanced search filters
- Real-time search results
- Filter combination
- Result count display

## Component Specifications

### Issue Card Component
- **Height**: Variable based on content
- **Padding**: 24px
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 8px
- **Shadow**: Subtle hover effect
- **Status Badge**: Color-coded (orange for open, green for resolved)

### Comment Card Component
- **Avatar**: 40px circular placeholder
- **Verified Solution**: Green background with checkmark
- **Markdown Support**: Syntax highlighting for code blocks
- **File Attachments**: Inline display with download links

### Search Bar Component
- **Width**: Responsive, max 600px
- **Icon**: Search icon on left
- **Placeholder**: Descriptive text
- **Auto-complete**: Tag suggestions

### File Upload Component
- **Drag Zone**: Dashed border, highlighted on drag
- **File List**: Horizontal layout with remove buttons
- **File Size**: Displayed next to filename
- **Preview**: Thumbnail for images

## Responsive Design

### Mobile Breakpoints
- **Small**: < 640px
- **Medium**: 640px - 768px
- **Large**: 768px - 1024px
- **XL**: > 1024px

### Mobile Adaptations
- Single column layout
- Collapsed navigation
- Touch-friendly buttons
- Simplified search filters
- Swipe gestures for file upload

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states
- **Alt Text**: For all images and icons

## Performance Considerations

- **Lazy Loading**: Images and comments
- **Pagination**: Limit initial load
- **Search Debouncing**: Prevent excessive API calls
- **File Compression**: Optimize uploads
- **Caching**: Browser and API caching 