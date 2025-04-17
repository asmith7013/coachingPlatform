import { headingVariants, textVariants } from '@/lib/ui/variants/typography'
import type { HeadingVariants, TextVariants } from '@/lib/ui/variants/typography'
import { textSize, heading, color, weight } from '@/lib/ui/tokens/typography'

const textSizes = Object.keys(textSize) as (keyof typeof textSize)[]
const headingLevels = Object.keys(heading) as (keyof typeof heading)[]
const fontWeights = Object.keys(weight) as (keyof typeof weight)[]
const textColors = Object.keys(color) as (keyof typeof color)[]

type TextSample = {
  size: TextVariants['size'];
  weight: TextVariants['weight'];
  color: TextVariants['color'];
};

type HeadingSample = {
  level: HeadingVariants['level'];
  color: HeadingVariants['color'];
};

function TextSample({ 
  size, 
  weight = 'normal',
  color = 'default',
}: { 
  size: TextVariants['size']
  weight?: TextVariants['weight']
  color?: TextVariants['color']
}) {
  return (
    <div className="space-y-2">
      <div className={textVariants({ size, weight, color })}>
        The quick brown fox jumps over the lazy dog
      </div>
      <div className={textVariants({ size: 'sm', color: 'muted' })}>
        {size} / {weight} / {color}
      </div>
    </div>
  )
}

function HeadingSample({ level }: { level: HeadingVariants['level'] }) {
  return (
    <div className="space-y-2">
      <div className={headingVariants({ level })}>
        The quick brown fox jumps over the lazy dog
      </div>
      <div className={textVariants({ size: 'sm', color: 'muted' })}>
        Heading {level}
      </div>
    </div>
  )
}

export default function TypographyPreview() {
  return (
    <div className="space-y-12">
      {/* Text Sizes */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Text Sizes</h2>
        <div className="mt-8 space-y-8">
          {textSizes.map((size) => (
            <TextSample key={size} size={size} />
          ))}
        </div>
      </section>

      {/* Headings */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Headings</h2>
        <div className="mt-8 space-y-8">
          {headingLevels.map((level) => (
            <HeadingSample key={level} level={level} />
          ))}
        </div>
      </section>

      {/* Font Weights */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Font Weights</h2>
        <div className="mt-8 space-y-8">
          {fontWeights.map((weight) => (
            <TextSample key={weight} size="base" weight={weight} />
          ))}
        </div>
      </section>

      {/* Text Colors */}
      <section>
        <h2 className={headingVariants({ level: 'h2' })}>Text Colors</h2>
        <div className="mt-8 space-y-8">
          {textColors.map((color) => (
            <TextSample key={color} size="base" color={color} />
          ))}
        </div>
      </section>
    </div>
  )
} 