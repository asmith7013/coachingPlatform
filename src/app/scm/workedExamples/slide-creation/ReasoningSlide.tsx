import { Slide, Heading, Text, FlexBox, OrderedList, ListItem, Box } from 'spectacle';
import { Brain } from 'lucide-react';

export interface ReasoningSlideProps {
  title: string;
  steps: string[];
  mathRule?: string;
  mathExplanation?: string;
  keyInsight?: string;
  icon?: React.ReactNode;
}

export function ReasoningSlide({
  title,
  steps,
  mathRule,
  mathExplanation,
  keyInsight,
  icon,
}: ReasoningSlideProps) {
  return (
    <Slide className="bg-gradient-to-br from-purple-50 to-violet-100">
      <FlexBox flexDirection="column" height="100%">
        {/* Title with icon */}
        <FlexBox alignItems="center" className="mb-8">
          {icon || <Brain size={48} className="text-purple-600 mr-4" />}
          <Heading className="text-4xl font-bold text-purple-900">
            {title}
          </Heading>
        </FlexBox>

        {/* Strategy steps */}
        <OrderedList className="text-2xl text-purple-800 space-y-6 mb-8">
          {steps.map((step, index) => (
            <ListItem key={index} className="mb-4">
              {step}
            </ListItem>
          ))}
        </OrderedList>

        {/* Optional: Math rule */}
        {mathRule && (
          <Box className="bg-purple-200 rounded-lg p-6 mb-6">
            <Text className="text-2xl font-mono font-bold text-purple-900 mb-2">
              {mathRule}
            </Text>
            {mathExplanation && (
              <Text className="text-lg text-purple-700">
                {mathExplanation}
              </Text>
            )}
          </Box>
        )}

        {/* Key insight */}
        {keyInsight && (
          <FlexBox alignItems="center" className="mt-auto">
            <Text className="text-xl text-purple-700 font-semibold">
              💡 {keyInsight}
            </Text>
          </FlexBox>
        )}
      </FlexBox>
    </Slide>
  );
}
