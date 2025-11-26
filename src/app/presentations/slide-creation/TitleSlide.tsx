import { Slide, Heading, Text, FlexBox } from 'spectacle';

export interface TitleSlideProps {
  unit: string;
  title: string;
  bigIdea: string;
  example: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export function TitleSlide({
  unit,
  title,
  bigIdea,
  example,
  icon,
  backgroundColor = 'bg-gradient-to-br from-blue-50 to-indigo-100',
  textColor = 'text-indigo-900',
}: TitleSlideProps) {
  return (
    <Slide className={backgroundColor}>
      <FlexBox flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        {icon && (
          <div className="mb-8">
            {icon}
          </div>
        )}

        <Text className="text-lg text-indigo-600 font-semibold mb-2">
          Unit {unit}
        </Text>

        <Heading className={`text-5xl font-bold ${textColor} mb-8 text-center`}>
          {title}
        </Heading>

        <Text className="text-2xl text-indigo-700 mb-12 text-center max-w-3xl">
          {bigIdea}
        </Text>

        <div className="bg-white/70 rounded-lg p-6 shadow-lg">
          <Text className="text-xl text-gray-800">
            <span className="font-semibold">Example:</span> {example}
          </Text>
        </div>
      </FlexBox>
    </Slide>
  );
}
