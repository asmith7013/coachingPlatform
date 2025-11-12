export interface ExampleSketch {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface ExampleCategory {
  name: string;
  examples: ExampleSketch[];
}
