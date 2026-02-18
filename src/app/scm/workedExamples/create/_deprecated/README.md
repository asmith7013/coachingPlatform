# Deprecated CLI Scripts

The following CLI scripts were originally part of the worked example creation workflow. They have been **superseded by the browser implementation** and have been removed.

## Scripts That Existed

| Script                     | Original Purpose                        | Browser Replacement                        |
| -------------------------- | --------------------------------------- | ------------------------------------------ |
| `sync-to-db.js`            | Sync HTML slides to MongoDB via mongosh | `saveWorkedExampleDeck` server action      |
| `generate-pptx.js`         | Convert HTML to PPTX                    | `/api/scm/worked-examples/export-pptx` API |
| `validate-pptx.sh`         | Visual validation (PPTX → PDF → images) | Browser preview + viewer                   |
| `check-svg-overlaps.js`    | Detect SVG overlap issues               | Browser preview (visual inspection)        |
| `svg-capture.js`           | Screenshot SVG elements                 | Browser-based screenshot                   |
| `verify-worked-example.ts` | Verify deck integrity                   | Browser wizard validation                  |

## Why Removed?

The browser wizard at `/scm/workedExamples/create` is the canonical way to create and export worked examples. The CLI scripts were development tools that have been fully superseded.

If you need to reference the original implementation, check the git history.
