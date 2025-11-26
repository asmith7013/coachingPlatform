import { Slide, Heading, Text, FlexBox } from 'spectacle';
import { DataTable, TableRow } from './components/DataTable';

export interface ContextSlideProps {
  scenario: string;
  context: string;
  icon: React.ReactNode;
  tableData: TableRow[];
  inputLabel?: string;
  outputLabel?: string;
  showAllValues?: boolean;
}

export function ContextSlide({
  scenario,
  context,
  icon,
  tableData,
  inputLabel = 'Input',
  outputLabel = 'Output',
  showAllValues = false,
}: ContextSlideProps) {
  return (
    <Slide className="bg-gradient-to-br from-green-50 to-emerald-100">
      <FlexBox flexDirection="column" height="100%">
        {/* Header */}
        <FlexBox alignItems="center" className="mb-6">
          <div className="mr-4">{icon}</div>
          <Heading className="text-4xl font-bold text-emerald-900">
            {scenario}
          </Heading>
        </FlexBox>

        {/* Context */}
        <Text className="text-xl text-emerald-800 mb-8 max-w-3xl">
          {context}
        </Text>

        {/* Data Table */}
        <DataTable
          data={tableData}
          inputLabel={inputLabel}
          outputLabel={outputLabel}
          showAllValues={showAllValues}
        />
      </FlexBox>
    </Slide>
  );
}
