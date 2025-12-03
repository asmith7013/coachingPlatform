import { Slide, Heading, Text, FlexBox, Box } from 'spectacle';
import { Lightbulb } from 'lucide-react';
import { DataTable, TableRow } from './components/DataTable';

export interface RevealSlideProps {
  calculation: string;
  explanation: string;
  answer: string;
  tableData?: TableRow[];
  inputLabel?: string;
  outputLabel?: string;
  isConstant?: boolean;
}

export function RevealSlide({
  calculation,
  explanation,
  answer,
  tableData,
  inputLabel,
  outputLabel,
  isConstant = false,
}: RevealSlideProps) {
  return (
    <Slide className="bg-gradient-to-br from-green-50 to-teal-100">
      <FlexBox flexDirection="column" justifyContent="center" alignItems="center" height="100%">
        {/* Calculation - Large and centered */}
        <Heading className="text-6xl font-bold text-teal-900 mb-8">
          {calculation}
        </Heading>

        {/* Explanation */}
        <Text className="text-2xl text-teal-800 mb-8 text-center max-w-3xl">
          {explanation}
        </Text>

        {/* Answer box */}
        <Box className="bg-teal-600 text-white rounded-lg p-6 shadow-xl mb-6">
          <Text className="text-3xl font-bold">
            {answer}
          </Text>
        </Box>

        {/* Optional: Emphasize if this is the constant */}
        {isConstant && (
          <FlexBox alignItems="center" className="mt-4">
            <Lightbulb size={32} className="text-yellow-500 mr-3" />
            <Text className="text-xl text-teal-700 font-semibold">
              This is the constant rate!
            </Text>
          </FlexBox>
        )}

        {/* Optional: Show updated table */}
        {tableData && (
          <div className="mt-8">
            <DataTable
              data={tableData}
              inputLabel={inputLabel || 'Input'}
              outputLabel={outputLabel || 'Output'}
              showAllValues={true}
            />
          </div>
        )}
      </FlexBox>
    </Slide>
  );
}
