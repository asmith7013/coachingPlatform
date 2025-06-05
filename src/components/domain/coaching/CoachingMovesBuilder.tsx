import React from 'react';
import { Input } from '@/components/core/fields/Input';
import { Button } from '@/components/core/Button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/ui/utils/formatters';
import { semanticColors } from '@/lib/tokens/colors';

interface CoachingMoveType {
  category: string;
  specificMove: string;
  toolsResources: string;
}

interface CoachingMovesBuilderProps {
  moves: CoachingMoveType[];
  onMovesChange: (moves: CoachingMoveType[]) => void;
}

export const CoachingMovesBuilder: React.FC<CoachingMovesBuilderProps> = ({
  moves,
  onMovesChange
}) => {
  const addMove = () => {
    onMovesChange([...moves, { category: '', specificMove: '', toolsResources: '' }]);
  };

  const removeMove = (index: number) => {
    onMovesChange(moves.filter((_, i) => i !== index));
  };

  const updateMove = (index: number, field: keyof CoachingMoveType, value: string) => {
    const updated = [...moves];
    updated[index][field] = value;
    onMovesChange(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Action Plan - Menu of Coaching Moves</h3>
        <Button
          intent="secondary"
          appearance="outline"
          textSize="sm"
          padding="sm"
          onClick={addMove}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Move
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {moves.map((move, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-lg p-4',
              semanticColors.bg.surface,
              semanticColors.border.muted
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-700">Move {index + 1}</h4>
              <Button
                intent="secondary"
                appearance="outline"
                textSize="sm"
                padding="sm"
                onClick={() => removeMove(index)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input
                label="Category"
                value={move.category}
                onChange={(e) => updateMove(index, 'category', e.target.value)}
                placeholder="Category"
                textSize="sm"
                padding="sm"
              />
              
              <Input
                label="Specific Move"
                value={move.specificMove}
                onChange={(e) => updateMove(index, 'specificMove', e.target.value)}
                placeholder="Specific Move"
                textSize="sm"
                padding="sm"
              />
              
              <Input
                label="Tools/Resources"
                value={move.toolsResources}
                onChange={(e) => updateMove(index, 'toolsResources', e.target.value)}
                placeholder="Drive Link"
                textSize="sm"
                padding="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 