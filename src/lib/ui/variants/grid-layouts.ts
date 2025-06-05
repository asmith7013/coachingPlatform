import { tv } from 'tailwind-variants';

/**
 * Grid Layout Variants
 * 
 * Provides responsive grid layouts using CSS Grid with proper breakpoints.
 * Replaces fractional width approaches with container-controlled layouts.
 * 
 * @example
 * ```tsx
 * // Basic responsive grid
 * <div className={gridLayoutVariant({ columns: 3, gap: 'md' })}>
 *   {items.map(item => <Card key={item.id} />)}
 * </div>
 * 
 * // Auto-fit grid (responsive without breakpoints)
 * <div className={gridLayoutVariant({ columns: 'auto', gap: 'lg' })}>
 *   {items.map(item => <Card key={item.id} />)}
 * </div>
 * ```
 */
export const gridLayoutVariant = tv({
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
      auto: 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))]', // Auto-fit with min width
      autoFill: 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]' // Auto-fill variant
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    },
    alignItems: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }
  },
  defaultVariants: {
    columns: 'auto',
    gap: 'md',
    alignItems: 'stretch'
  }
});

/**
 * Card Grid Variant
 * 
 * Specialized grid layout for card components with predefined density options.
 * Cards automatically fill grid cells with consistent heights using flexbox.
 * 
 * @example
 * ```tsx
 * // Comfortable density (default)
 * <div className={cardGridVariant({ density: 'comfortable' })}>
 *   {cards.map(card => <InfoCard key={card.id} {...card} />)}
 * </div>
 * 
 * // Compact for dashboards
 * <div className={cardGridVariant({ density: 'compact' })}>
 *   {cards.map(card => <InfoCard key={card.id} {...card} />)}
 * </div>
 * ```
 */
export const cardGridVariant = tv({
  base: [
    'grid',
    gridLayoutVariant({ gap: 'md', alignItems: 'stretch' })
  ],
  variants: {
    density: {
      compact: gridLayoutVariant({ columns: 4 }),
      comfortable: gridLayoutVariant({ columns: 3 }),
      spacious: gridLayoutVariant({ columns: 2 })
    }
  },
  defaultVariants: {
    density: 'comfortable'
  }
}); 