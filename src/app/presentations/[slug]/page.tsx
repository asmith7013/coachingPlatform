"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getDeckBySlug } from '@actions/worked-examples';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
// Import only the specific icons we use instead of the entire library
import {
  Calculator,
  Cake,
  Gamepad2,
  Pizza,
  Video,
  TrendingUp,
  Rocket,
  Download,
  Smartphone,
  Wind,
  X,
  type LucideIcon
} from 'lucide-react';

// Dynamically import Spectacle to reduce initial bundle size
const Deck = dynamic(() => import('spectacle').then(mod => ({ default: mod.Deck })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading presentation...</div>
});

// Dynamically import slide components
const TitleSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.TitleSlide })));
const ContextSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.ContextSlide })));
const PredictionSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.PredictionSlide })));
const RevealSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.RevealSlide })));
const ReasoningSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.ReasoningSlide })));
const PracticeSlide = dynamic(() => import('../slide-creation').then(mod => ({ default: mod.PracticeSlide })));

// Map of icon names to icon components (only the ones we use)
const iconMap: Record<string, LucideIcon> = {
  Calculator,
  Cake,
  Gamepad2,
  Pizza,
  Video,
  TrendingUp,
  Rocket,
  Download,
  Smartphone,
  Wind,
};

export default function WorkedExampleViewer() {
  const params = useParams();
  const slug = params.slug as string;

  const [deck, setDeck] = useState<WorkedExampleDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeck() {
      try {
        const result = await getDeckBySlug(slug);

        if (result.success && result.data) {
          setDeck(result.data as WorkedExampleDeck);
        } else {
          setError(result.error || 'Failed to load deck');
        }
      } catch {
        setError('An error occurred while loading the deck');
      } finally {
        setLoading(false);
      }
    }

    loadDeck();
  }, [slug]);

  // Helper to get Lucide icon component from icon name string
  const getIcon = (iconName?: string, size = 48) => {
    if (!iconName) return null;

    const Icon = iconMap[iconName];
    if (!Icon) {
      console.warn(`Icon "${iconName}" not found in iconMap. Add it to the imports if needed.`);
      return null;
    }

    return <Icon size={size} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading presentation...</p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Deck not found'}</p>
          <Link href="/presentations/slide-viewer" className="text-blue-600 hover:underline">
            Back to presentations list
          </Link>
        </div>
      </div>
    );
  }

  const { slides } = deck;

  return (
    <>
      {/* Close button - fixed position in top-right corner */}
      <Link
        href="/presentations"
        className="fixed top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Close presentation"
      >
        <X size={24} className="text-gray-700" />
      </Link>

      <Deck>
        {/* Slide 1: Title */}
        <TitleSlide
        unit={slides.slide1.unit}
        title={slides.slide1.title}
        bigIdea={slides.slide1.bigIdea}
        example={slides.slide1.example}
        icon={getIcon(slides.slide1.icon, 64)}
      />

      {/* Slide 2: Context */}
      <ContextSlide
        scenario={slides.slide2.scenario}
        context={slides.slide2.context}
        icon={getIcon(slides.slide2.icon)}
        tableData={slides.slide2.tableData}
        inputLabel={slides.slide2.inputLabel}
        outputLabel={slides.slide2.outputLabel}
      />

      {/* Slide 3: Prediction 1 */}
      <PredictionSlide
        question={slides.slide3.question}
        tableData={slides.slide3.tableData}
        highlightRow={slides.slide3.highlightRow}
        inputLabel={slides.slide3.inputLabel}
        outputLabel={slides.slide3.outputLabel}
      />

      {/* Slide 4: Reveal 1 */}
      <RevealSlide
        calculation={slides.slide4.calculation}
        explanation={slides.slide4.explanation}
        answer={slides.slide4.answer}
        isConstant={slides.slide4.isConstant}
      />

      {/* Slide 5: Prediction 2 */}
      <PredictionSlide
        question={slides.slide5.question}
        tableData={slides.slide5.tableData}
        highlightRow={slides.slide5.highlightRow}
        inputLabel={slides.slide5.inputLabel}
        outputLabel={slides.slide5.outputLabel}
      />

      {/* Slide 6: Reveal 2 */}
      <RevealSlide
        calculation={slides.slide6.calculation}
        explanation={slides.slide6.explanation}
        answer={slides.slide6.answer}
      />

      {/* Slide 7: Reasoning */}
      <ReasoningSlide
        title={slides.slide7.title}
        steps={slides.slide7.steps}
        mathRule={slides.slide7.mathRule}
        keyInsight={slides.slide7.keyInsight}
      />

      {/* Slide 8: Practice 1 */}
      <PracticeSlide
        scenario={slides.slide8.scenario}
        context={slides.slide8.context}
        icon={getIcon(slides.slide8.icon)}
        tableData={slides.slide8.tableData}
        inputLabel={slides.slide8.inputLabel}
        outputLabel={slides.slide8.outputLabel}
      />

      {/* Slide 9: Practice 2 */}
      <PracticeSlide
        scenario={slides.slide9.scenario}
        context={slides.slide9.context}
        icon={getIcon(slides.slide9.icon)}
        tableData={slides.slide9.tableData}
        inputLabel={slides.slide9.inputLabel}
        outputLabel={slides.slide9.outputLabel}
      />
      </Deck>
    </>
  );
}
