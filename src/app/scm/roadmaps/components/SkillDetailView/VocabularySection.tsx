"use client";

import { useState } from "react";
import { AccordionItem } from "../AccordionItem";

interface VocabItem {
  term: string;
  definition?: string;
}

interface VocabularySectionProps {
  vocabulary: (string | VocabItem)[];
}

export function VocabularySection({ vocabulary }: VocabularySectionProps) {
  const [expandedVocabulary, setExpandedVocabulary] = useState<Set<number>>(
    new Set(),
  );

  const toggleVocabulary = (index: number) => {
    const newExpanded = new Set(expandedVocabulary);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVocabulary(newExpanded);
  };

  if (!vocabulary || vocabulary.length === 0) return null;

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Vocabulary ({vocabulary.length})
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {vocabulary.map((vocabItem, index) => {
          // Handle both old format (string) and new format (object with term/definition)
          const term =
            typeof vocabItem === "string" ? vocabItem : vocabItem.term;
          const definition =
            typeof vocabItem === "object" && "definition" in vocabItem
              ? vocabItem.definition
              : null;

          return (
            <AccordionItem
              key={index}
              title={term}
              content={definition || undefined}
              isExpanded={expandedVocabulary.has(index)}
              onToggle={() => toggleVocabulary(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
