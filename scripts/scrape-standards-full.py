#!/usr/bin/env python3
"""
Scrape standards from HTML docs and create JSON with both main standards and substandards.
Only captures NY-style CCSS standards, filtering out other state frameworks and MP standards.

Usage:
    python scripts/scrape-standards-full.py
"""

import re
import json
from pathlib import Path

# Unicode math character mappings
UNICODE_TO_ASCII = {
    '\u2013': '-', '\u2014': '-',  # en-dash, em-dash
    '\u2018': "'", '\u2019': "'",  # single quotes
    '\u201c': '"', '\u201d': '"',  # double quotes
    '\u00d7': '*',  # multiplication sign
    '\u00f7': '/',  # division sign
    '\u2212': '-',  # minus sign
    '\u00b2': '^2', '\u00b3': '^3',  # superscripts
    '\u2070': '^0', '\u00b9': '^1', '\u2074': '^4',
    '\u2075': '^5', '\u2076': '^6', '\u2077': '^7',
    '\u2078': '^8', '\u2079': '^9',
    '\u2080': '_0', '\u2081': '_1', '\u2082': '_2',
    '\u2083': '_3', '\u2084': '_4', '\u2085': '_5',
    '\u2086': '_6', '\u2087': '_7', '\u2088': '_8', '\u2089': '_9',
    '\u00bd': '1/2', '\u00bc': '1/4', '\u00be': '3/4',
    '\u2153': '1/3', '\u2154': '2/3',
    '\u2155': '1/5', '\u2156': '2/5', '\u2157': '3/5',
    '\u2158': '4/5', '\u2159': '1/6', '\u215a': '5/6',
    '\u215b': '1/8', '\u215c': '3/8', '\u215d': '5/8', '\u215e': '7/8',
    '\u03c0': 'pi',  # pi
    '\u221a': 'sqrt',  # square root
    '\u221e': 'infinity',  # infinity
    '\u2260': '!=',  # not equal
    '\u2264': '<=',  # less than or equal
    '\u2265': '>=',  # greater than or equal
    '\u00b0': ' degrees',  # degree symbol
}

# Math italic characters (U+1D44E onwards)
for i, letter in enumerate('abcdefghijklmnopqrstuvwxyz'):
    UNICODE_TO_ASCII[chr(0x1D44E + i)] = letter
for i, letter in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):
    UNICODE_TO_ASCII[chr(0x1D434 + i)] = letter

def clean_text(text):
    """Clean text by replacing Unicode characters with ASCII equivalents."""
    for unicode_char, ascii_char in UNICODE_TO_ASCII.items():
        text = text.replace(unicode_char, ascii_char)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_standard_code(code):
    """
    Normalize a standard code to NY-X.DOMAIN.NUMx format.
    Returns None if not a valid NY CCSS standard.
    """
    code = code.strip().rstrip('.')

    # Skip non-standard codes
    if not code:
        return None

    # Remove NY- prefix if present (we'll add it back at the end)
    if code.startswith('NY-'):
        code = code[3:]

    # Skip MP (Math Practice) standards
    if code.upper().startswith('MP'):
        return None

    # Skip other state frameworks
    skip_prefixes = ['KY', 'NC', 'CC', 'PS', 'G.CO', 'MPS', 'Transformational']
    for prefix in skip_prefixes:
        if code.startswith(prefix):
            return None

    # Skip numbered standards (like "8.22", "5", "7")
    if re.match(r'^\d+\.?\d*$', code):
        return None

    # Skip codes with non-standard domains
    alt_domains = ['GM', 'GSR', 'PAR', 'MGSR', 'MG']
    for domain in alt_domains:
        if f'.{domain}' in code or code.startswith(domain):
            return None

    # Valid CCSS domains for grades 6-8
    valid_domains = ['RP', 'NS', 'EE', 'G', 'SP', 'F', 'NF', 'NBT', 'MD', 'OA']

    # Pattern: X.DOMAIN.CLUSTER.NUM.LETTER (e.g., 8.G.A.1.a) -> NY-8.G.1a
    match = re.match(r'^(\d+)\.([A-Z]+)\.([A-Z])\.(\d+)\.?([a-d])?$', code)
    if match:
        grade, domain, cluster, num, letter = match.groups()
        if domain in valid_domains:
            suffix = letter if letter else ''
            return f"NY-{grade}.{domain}.{num}{suffix}"

    # Pattern: X.DOMAIN.NUM.LETTER (e.g., 8.G.1.a) -> NY-8.G.1a
    match = re.match(r'^(\d+)\.([A-Z]+)\.(\d+)\.?([a-d])?$', code)
    if match:
        grade, domain, num, letter = match.groups()
        if domain in valid_domains:
            suffix = letter if letter else ''
            return f"NY-{grade}.{domain}.{num}{suffix}"

    # Pattern: X.DOMAIN.NUMx (e.g., 8.G.1a) -> NY-8.G.1a
    match = re.match(r'^(\d+)\.([A-Z]+)\.(\d+)([a-d])?$', code)
    if match:
        grade, domain, num, letter = match.groups()
        if domain in valid_domains:
            suffix = letter if letter else ''
            return f"NY-{grade}.{domain}.{num}{suffix}"

    return None

def parse_html(html_path, grade):
    """Parse HTML file and extract lessons with standards.

    Only extracts NY standards from initiative-25 (the NY state standards).
    Returns lessons keyed by title for easy matching with database.
    """
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    lessons = []
    standard_descriptions = {}

    # First, find unit boundaries
    # Pattern: "X.N: Unit Title" where X is the grade
    unit_headers = list(re.finditer(rf'{grade}\.(\d+):\s*([^<]+)', html))

    # Build position -> unit mapping
    unit_positions = []
    for match in unit_headers:
        unit_num = int(match.group(1))
        unit_positions.append((match.start(), unit_num))

    def get_unit_for_position(pos):
        """Get unit number for a given position in HTML."""
        current_unit = 1
        for unit_pos, unit_num in unit_positions:
            if pos >= unit_pos:
                current_unit = unit_num
            else:
                break
        return current_unit

    # Find all lessons - pattern: "Lesson N: Title"
    lesson_pattern = r'Lesson (\d+): ([^<]+)</a></td>(.*?)(?=Lesson \d+:|$)'

    for match in re.finditer(lesson_pattern, html, re.DOTALL):
        lesson_num = int(match.group(1))
        lesson_title = clean_text(match.group(2))
        section = match.group(3)

        # Determine which unit this lesson belongs to
        unit_num = get_unit_for_position(match.start())

        # Extract NY standards ONLY from initiative-25
        # Pattern: initiative-25"><summary class="common-core-tip [optional-classes]">CODE</summary><p...>TEXT</p>
        # Classes can include: building-on-code, building-towards-code, or none (current)
        standard_pattern = r'initiative-25"><summary class="common-core-tip([^"]*)">([^<]+)</summary><p[^>]*>(?:<strong>[^<]*</strong>)?\s*([^<]*)</p>'

        seen_codes = set()
        standards = []

        for std_match in re.finditer(standard_pattern, section):
            css_classes = std_match.group(1)
            raw_code = std_match.group(2).strip()
            raw_text = clean_text(std_match.group(3))

            # Skip MP standards
            if raw_code.startswith('MP'):
                continue

            normalized = normalize_standard_code(raw_code)
            if normalized and normalized not in seen_codes:
                seen_codes.add(normalized)

                # Determine context from CSS classes
                context = 'current'  # default
                if 'building-on-code' in css_classes:
                    context = 'buildingOn'
                elif 'building-towards-code' in css_classes:
                    context = 'buildingTowards'

                standards.append({
                    'code': normalized,  # Keep NY- prefix as part of standard code
                    'text': raw_text,
                    'context': context
                })

                # Track description
                if raw_text and normalized not in standard_descriptions:
                    standard_descriptions[normalized] = raw_text

        if standards:
            lessons.append({
                'unit': unit_num,
                'lesson': lesson_num,
                'lessonTitle': lesson_title,
                'standards': standards
            })

    return lessons, standard_descriptions

def detect_units(html_path, lessons):
    """Detect unit numbers from HTML structure."""
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find unit headers - pattern varies but usually "Unit N" or "X.N: Unit Title"
    unit_pattern = r'(\d+)\.(\d+):\s*([^<]+)</h'

    unit_map = {}
    current_unit = 1

    for match in re.finditer(unit_pattern, html):
        grade_or_course = match.group(1)
        unit_num = int(match.group(2))
        unit_title = clean_text(match.group(3))

        # Get position in HTML
        pos = match.start()
        unit_map[pos] = unit_num

    # Assign units to lessons based on their position
    # For now, use a simpler approach - parse unit numbers from nearby context

    # Alternative: Find "Grade X Unit Y" patterns
    grade_unit_pattern = r'Grade \d+ Unit (\d+)'
    for match in re.finditer(grade_unit_pattern, html):
        unit_num = int(match.group(1))
        pos = match.start()
        unit_map[pos] = unit_num

    return unit_map

def main():
    docs_dir = Path('/Users/alexsmith/ai-coaching-platform/docs/nyse')

    for grade in ['6', '7', '8']:
        html_path = docs_dir / f'standards{grade}.html'
        if not html_path.exists():
            print(f"Skipping grade {grade} - no HTML file")
            continue

        print(f"\nProcessing Grade {grade}...")

        lessons, descriptions = parse_html(html_path, grade)

        print(f"  Found {len(lessons)} lessons")
        print(f"  Found {len(descriptions)} unique standard descriptions")

        # Show sample
        if lessons:
            sample = lessons[0]
            print(f"  Sample: Lesson {sample['lesson']}: {sample['lessonTitle']}")
            print(f"    Standards: {[s['code'] for s in sample['standards'][:5]]}")

        # Save JSON
        output = {
            'grade': grade,
            'source': str(html_path),
            'standard_descriptions': descriptions,
            'lessons': lessons
        }

        output_path = docs_dir / f'grade{grade}-standards-full.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"  Saved to {output_path}")

if __name__ == '__main__':
    main()
