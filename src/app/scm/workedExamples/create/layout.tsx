// Route segment config for server actions in this route
// analyzeProblem calls Claude Opus API with image processing which can take 2-4 minutes
export const maxDuration = 240; // 4 minutes

export default function WorkedExampleCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
