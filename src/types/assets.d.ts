// Type declarations for raw asset imports (via Webpack asset/source)

declare module "*.html" {
  const content: string;
  export default content;
}

declare module "*.md" {
  const content: string;
  export default content;
}
