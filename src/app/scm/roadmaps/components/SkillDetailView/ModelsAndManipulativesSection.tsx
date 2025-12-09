"use client";

interface ModelsAndManipulativesSectionProps {
  primerHtml: string;
}

export function ModelsAndManipulativesSection({ primerHtml }: ModelsAndManipulativesSectionProps) {
  if (!primerHtml) return null;

  // Parse the primer HTML and hide sections we don't want
  const parser = new DOMParser();
  const doc = parser.parseFromString(primerHtml, 'text/html');

  // Find all h4 headers
  const h4Elements = Array.from(doc.querySelectorAll('h4'));

  // Hide all sections except Models and Manipulatives
  const sectionsToHide = [
    'Launch:',
    'Teacher/Student Strategies:',
    'Questions to Help Students Get Unstuck:',
    'Discussion Questions:',
    'Common Misconceptions:',
    'Additional Resources:'
  ];

  h4Elements.forEach(h4 => {
    const headerText = h4.textContent?.trim() || '';
    // Hide all h4 headers (including Models and Manipulatives)
    if (sectionsToHide.some(section => headerText.includes(section)) || headerText.includes('Models and Manipulatives')) {
      h4.style.display = 'none';

      // If it's not Models and Manipulatives, hide the content too
      if (!headerText.includes('Models and Manipulatives')) {
        let currentElement = h4.nextElementSibling;
        while (currentElement && currentElement.tagName !== 'H4') {
          (currentElement as HTMLElement).style.display = 'none';
          currentElement = currentElement.nextElementSibling;
        }
      }
    }
  });

  // Get the modified HTML
  const modifiedHtml = doc.body.innerHTML;

  return (
    <div className="py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Models & Manipulatives</h4>
      <div
        className="all-initial"
        dangerouslySetInnerHTML={{ __html: modifiedHtml }}
        style={{
          fontSize: '14px',
          color: '#4b5563',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
}
