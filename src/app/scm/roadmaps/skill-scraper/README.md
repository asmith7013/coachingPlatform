# Teach to One Roadmaps Skill Scraper

A web scraper for extracting educational skill content from the Teach to One Roadmaps platform.

## Features

- **Authentication**: Handles two-step login process (login button + credentials form)
- **Content Extraction**: Extracts comprehensive skill data including:
  - Skill title and description
  - Skill challenge criteria
  - Essential questions
  - Launch activities
  - Teacher/student strategies
  - Models and manipulatives
  - Discussion questions
  - Common misconceptions
  - Additional resources
  - Standards alignment
  - Vocabulary terms
  - Associated images

- **Batch Processing**: Process up to 12 skill URLs at once
- **Error Handling**: Graceful handling of individual skill failures
- **Debug Mode**: Visible browser mode for troubleshooting
- **Export**: JSON export of all scraped data

## Usage

1. **Authentication**: Enter your Roadmaps login credentials
2. **URLs**: Paste skill URLs (one per line, max 12)
3. **Settings**: Configure delay between requests (default: 2000ms)
4. **Scrape**: Use regular mode or debug mode (visible browser)
5. **Export**: Download results as JSON file

## URL Format

Skill URLs should follow this format:

```
https://roadmaps.teachtoone.org/plan/skills/{skill_id}
```

Example:

```
https://roadmaps.teachtoone.org/plan/skills/660
https://roadmaps.teachtoone.org/plan/skills/661
https://roadmaps.teachtoone.org/plan/skills/662
```

## Technical Details

### Architecture

- **Server Actions**: Playwright-based scraping with proper error handling
- **Authentication**: Two-step process handling login button and credentials form
- **Content Extraction**: Fieldset-based and section-based content parsing
- **Accordion Expansion**: Automatically expands collapsed content sections
- **Image Collection**: Extracts all image URLs (excluding data URIs)

### Selectors Used

- Login: `[data-testid="login"]`, `#username`, `#password`, `button[type="submit"]`
- Content: Fieldsets with legend matching, h4 headers for sections
- Accordions: `[aria-expanded="false"]` for expansion
- Images: `img[src]:not([src^="data:"])`

### Error Handling

- Individual skill failures don't stop batch processing
- Authentication errors are clearly reported
- Network and parsing errors are captured and logged
- Results include both successful and failed extractions

### Rate Limiting

- Configurable delay between requests (1-10 seconds)
- Default 2-second delay to be respectful to the server
- Debug mode uses minimum 3-second delay

## File Structure

```
src/app/tools/roadmaps-scraper/
├── page.tsx                          # Main UI component
├── components/
│   ├── RoadmapsScraperForm.tsx      # Form component
│   └── ResultsDisplay.tsx           # Results display
├── actions/
│   └── scrape-skills.ts             # Server actions
├── hooks/
│   └── useRoadmapsScraper.ts        # React hook
├── lib/
│   ├── types.ts                     # TypeScript types
│   ├── roadmaps-auth.ts             # Authentication logic
│   └── skill-extractor.ts           # Content extraction
└── README.md                        # This file
```

## Development

The scraper follows established patterns from the IM scraper:

- **Error Handling**: Uses `handleServerError` and `handleValidationError`
- **Validation**: Zod schemas for request/response validation
- **Browser Management**: Proper Playwright lifecycle management
- **State Management**: React hooks with loading/error states
- **UI Components**: Consistent with existing design system

## Troubleshooting

### Authentication Issues

- Verify credentials are correct
- Use "Test Credentials" button before scraping
- Check if account has access to skill pages

### Scraping Issues

- Use Debug Mode to see browser interactions
- Check console logs for detailed error messages
- Verify URLs are accessible and follow correct format
- Ensure delay is sufficient (increase if getting rate limited)

### Content Issues

- Some content may be in collapsed accordions (automatically expanded)
- Images are collected as URLs, not downloaded
- Vocabulary extraction depends on proper accordion expansion
- Standards content may vary by skill page structure
