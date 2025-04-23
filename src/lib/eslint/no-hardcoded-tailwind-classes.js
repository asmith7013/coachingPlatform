/**
 * ESLint rule to detect hardcoded Tailwind classes that should use tokens
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce use of design tokens instead of hardcoded Tailwind classes',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      avoidHardcodedClass: 'Avoid hardcoded Tailwind class "{{ className }}". Use design tokens instead.',
      suggestToken: 'Consider using "{{ tokenName }}" from tokens/{{ tokenFile }}.ts instead.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedPatterns = options.allowedPatterns || [];
    const allowedRegexps = allowedPatterns.map(pattern => new RegExp(pattern));

    // Patterns to detect (extend as needed)
    const hardcodedPatterns = [
      // Colors
      { pattern: /text-gray-\d+/, tokenFile: 'text', suggestedToken: 'textColors' },
      { pattern: /text-blue-\d+/, tokenFile: 'text', suggestedToken: 'textColors' },
      { pattern: /text-red-\d+/, tokenFile: 'text', suggestedToken: 'textColors' },
      { pattern: /text-indigo-\d+/, tokenFile: 'text', suggestedToken: 'textColors' },
      { pattern: /bg-gray-\d+/, tokenFile: 'colors', suggestedToken: 'semanticColorMap' },
      { pattern: /bg-blue-\d+/, tokenFile: 'colors', suggestedToken: 'semanticColorMap' },
      { pattern: /bg-red-\d+/, tokenFile: 'colors', suggestedToken: 'semanticColorMap' },
      { pattern: /bg-indigo-\d+/, tokenFile: 'colors', suggestedToken: 'semanticColorMap' },
      { pattern: /border-gray-\d+/, tokenFile: 'colors', suggestedToken: 'semanticColorMap' },
      
      // Text sizes
      { pattern: /text-xs/, tokenFile: 'typography', suggestedToken: 'textSize.xs' },
      { pattern: /text-sm/, tokenFile: 'typography', suggestedToken: 'textSize.sm' },
      { pattern: /text-base/, tokenFile: 'typography', suggestedToken: 'textSize.base' },
      { pattern: /text-lg/, tokenFile: 'typography', suggestedToken: 'textSize.lg' },
      { pattern: /text-xl/, tokenFile: 'typography', suggestedToken: 'textSize.xl' },
      { pattern: /text-2xl/, tokenFile: 'typography', suggestedToken: 'textSize[\'2xl\']' },
      
      // Font weights
      { pattern: /font-normal/, tokenFile: 'typography', suggestedToken: 'weight.normal' },
      { pattern: /font-medium/, tokenFile: 'typography', suggestedToken: 'weight.medium' },
      { pattern: /font-semibold/, tokenFile: 'typography', suggestedToken: 'weight.semibold' },
      { pattern: /font-bold/, tokenFile: 'typography', suggestedToken: 'weight.bold' },
      
      // Spacing
      { pattern: /p-\d+/, tokenFile: 'spacing', suggestedToken: 'padding' },
      { pattern: /px-\d+/, tokenFile: 'spacing', suggestedToken: 'paddingX' },
      { pattern: /py-\d+/, tokenFile: 'spacing', suggestedToken: 'paddingY' },
      { pattern: /gap-\d+/, tokenFile: 'spacing', suggestedToken: 'gap' },
      
      // Shadows
      { pattern: /shadow-sm/, tokenFile: 'shape', suggestedToken: 'shadows.sm' },
      { pattern: /shadow-md/, tokenFile: 'shape', suggestedToken: 'shadows.md' },
      { pattern: /shadow-lg/, tokenFile: 'shape', suggestedToken: 'shadows.lg' },
      { pattern: /shadow-xl/, tokenFile: 'shape', suggestedToken: 'shadows.xl' },
      { pattern: /shadow-2xl/, tokenFile: 'shape', suggestedToken: 'shadows[\'2xl\']' },
      { pattern: /shadow-none/, tokenFile: 'shape', suggestedToken: 'shadows.none' },
      
      // Border radius
      { pattern: /rounded-none/, tokenFile: 'shape', suggestedToken: 'radii.none' },
      { pattern: /rounded-sm/, tokenFile: 'shape', suggestedToken: 'radii.sm' },
      { pattern: /rounded-md/, tokenFile: 'shape', suggestedToken: 'radii.md' },
      { pattern: /rounded-lg/, tokenFile: 'shape', suggestedToken: 'radii.lg' },
      { pattern: /rounded-xl/, tokenFile: 'shape', suggestedToken: 'radii.xl' },
      { pattern: /rounded-2xl/, tokenFile: 'shape', suggestedToken: 'radii[\'2xl\']' },
      { pattern: /rounded-full/, tokenFile: 'shape', suggestedToken: 'radii.full' },
    ];

    /**
     * Check if a string contains any hardcoded Tailwind classes
     * @param {string} value - The string to check
     * @param {object} node - The AST node
     */
    function checkForHardcodedClasses(value, node) {
      if (typeof value !== 'string') return;
      
      // Skip checking if value matches any allowed pattern
      if (allowedRegexps.some(regexp => regexp.test(value))) {
        return;
      }

      for (const { pattern, tokenFile, suggestedToken } of hardcodedPatterns) {
        const match = value.match(pattern);
        if (match) {
          context.report({
            node,
            messageId: 'avoidHardcodedClass',
            data: {
              className: match[0],
            },
            suggest: [
              {
                messageId: 'suggestToken',
                data: {
                  tokenName: suggestedToken,
                  tokenFile,
                },
              }
            ]
          });
        }
      }
    }

    return {
      // Check JSX className attributes
      JSXAttribute(node) {
        if (
          node.name.name === 'className' && 
          node.value && 
          node.value.type === 'Literal'
        ) {
          checkForHardcodedClasses(node.value.value, node);
        }
        
        // Check for template literals in className
        if (
          node.name.name === 'className' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'TemplateLiteral'
        ) {
          node.value.expression.quasis.forEach(quasi => {
            checkForHardcodedClasses(quasi.value.raw, quasi);
          });
        }
      },

      // Check cn() calls or other utility functions
      CallExpression(node) {
        if (
          node.callee.name === 'cn' || 
          node.callee.name === 'clsx' || 
          node.callee.name === 'classNames'
        ) {
          node.arguments.forEach(arg => {
            if (arg.type === 'Literal') {
              checkForHardcodedClasses(arg.value, arg);
            }
            
            if (arg.type === 'TemplateLiteral') {
              arg.quasis.forEach(quasi => {
                checkForHardcodedClasses(quasi.value.raw, quasi);
              });
            }
          });
        }
      },
    };
  },
}; 