# Bulk Sync Components

This folder contains reusable components for the bulk sync page.

## MultiSectionSelector

**Use this component when multiple sections can be selected at once.**

The `MultiSectionSelector` component provides a multi-select interface for choosing sections across different schools. It features:

- **School-based grouping**: Sections are organized by school with visual separation
- **Select All functionality**: Each school has a "Select All" checkbox with indeterminate state support
- **Color-coded checkboxes**: Each section has a unique color based on school color families
- **Responsive grid layout**: Adapts to different screen sizes

### Usage

```tsx
import { MultiSectionSelector } from "./components/MultiSectionSelector";
import { getSectionColors } from "@/app/scm/podsie/velocity/utils/colors";

// In your component:
const [selectedSections, setSelectedSections] = useState<string[]>([]);
const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());

// Load section options and compute colors
const colors = getSectionColors(sectionOptions);
setSectionColors(colors);

// Render the selector
<MultiSectionSelector
  sections={sectionOptions}
  selectedSections={selectedSections}
  onToggle={(sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }}
  sectionColors={sectionColors}
/>
```

### Props

```typescript
interface SectionOption {
  id: string;
  school: string;
  displayName: string;
}

interface MultiSectionSelectorProps {
  sections: SectionOption[];
  selectedSections: string[];
  onToggle: (sectionId: string) => void;
  sectionColors: Map<string, string>;
}
```

## Other Components

- **SchoolSelector**: School dropdown with sync all button (deprecated - use MultiSectionSelector instead)
- **SectionCard**: Individual section display with units and assignments
- **UnitCard**: Unit grouping with sync button
- **AssignmentItem**: Individual assignment with activity badges
