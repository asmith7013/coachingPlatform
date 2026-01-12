'use client';

import type { DiagramPreview } from '../../lib/types';

interface DiagramPreviewDisplayProps {
  diagramPreview: DiagramPreview;
  compact?: boolean;
}

export function DiagramPreviewDisplay({ diagramPreview, compact = false }: DiagramPreviewDisplayProps) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {/* ASCII Preview */}
      <div>
        <h5 className={`font-semibold text-gray-700 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
          Visual Structure Preview
        </h5>
        <pre className={`bg-gray-900 text-green-400 rounded-lg overflow-x-auto font-mono ${compact ? 'text-xs p-3' : 'text-sm p-4'}`}>
          {diagramPreview.ascii}
        </pre>
      </div>

      {/* Key Elements */}
      {diagramPreview.keyElements.length > 0 && (
        <div>
          <h5 className={`font-semibold text-gray-700 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
            Key Elements
          </h5>
          <ul className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {diagramPreview.keyElements.map((el, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-500 font-medium">{el.element}:</span>
                <span className="text-gray-600">{el.represents}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
