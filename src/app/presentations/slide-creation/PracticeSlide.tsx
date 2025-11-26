import { Slide, Heading, Text, FlexBox } from 'spectacle';
import { DataTable, TableRow } from './components/DataTable';

export interface PracticeSlideProps {
  scenario: string;
  context: string;
  icon: React.ReactNode;
  tableData: TableRow[];
  inputLabel?: string;
  outputLabel?: string;
  instructions?: string;
  showAnswers?: boolean;
}

export function PracticeSlide({
  scenario,
  context,
  icon,
  tableData,
  inputLabel = 'Input',
  outputLabel = 'Output',
  instructions = 'Find the missing values using the same strategy.',
  showAnswers = false,
}: PracticeSlideProps) {
  return (
    <Slide className="bg-gradient-to-br from-orange-50 to-red-100">
      <FlexBox flexDirection="column" height="100%">
        {/* Header */}
        <FlexBox alignItems="center" className="mb-6">
          <div className="mr-4">{icon}</div>
          <Heading className="text-4xl font-bold text-orange-900">
            {scenario}
          </Heading>
        </FlexBox>

        {/* Context */}
        <Text className="text-xl text-orange-800 mb-6 max-w-3xl">
          {context}
        </Text>

        {/* Instructions */}
        <Text className="text-lg text-orange-700 font-semibold mb-8">
          {instructions}
        </Text>

        {/* Data Table - NO scaffolding */}
        <DataTable
          data={tableData}
          inputLabel={inputLabel}
          outputLabel={outputLabel}
          showAllValues={showAnswers}
        />
      </FlexBox>
    </Slide>
  );
}
