import { Slide, Heading, Text, FlexBox } from 'spectacle';
import { DataTable, TableRow } from './components/DataTable';

export interface PredictionSlideProps {
  question: string;
  tableData: TableRow[];
  highlightRow?: number;
  highlightCell?: {
    row: number;
    column: 'input' | 'output';
  };
  inputLabel?: string;
  outputLabel?: string;
  hintText?: string;
}

export function PredictionSlide({
  question,
  tableData,
  highlightRow,
  highlightCell,
  inputLabel = 'Input',
  outputLabel = 'Output',
  hintText,
}: PredictionSlideProps) {
  return (
    <Slide className="bg-gradient-to-br from-yellow-50 to-amber-100">
      <FlexBox flexDirection="column" justifyContent="center" height="100%">
        {/* Question - Large and prominent */}
        <Heading className="text-4xl font-bold text-amber-900 mb-12 text-center">
          {question}
        </Heading>

        {/* Table with highlighting */}
        <DataTable
          data={tableData}
          inputLabel={inputLabel}
          outputLabel={outputLabel}
          highlightRow={highlightRow}
          highlightCell={highlightCell}
        />

        {/* Hint or thinking prompt */}
        <Text className="text-lg text-amber-700 mt-8 text-center italic">
          {hintText || 'Think about it before continuing...'}
        </Text>
      </FlexBox>
    </Slide>
  );
}
