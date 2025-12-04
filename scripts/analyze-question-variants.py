#!/usr/bin/env python3
import json
import re
from typing import List, Dict, Any
from difflib import SequenceMatcher

def normalize_code(code: str) -> str:
    """Normalize code by replacing numbers and strings with placeholders"""
    if not code:
        return ''

    # Replace numbers
    normalized = re.sub(r'\b\d+\.?\d*\b', '#NUM#', code)
    # Replace quoted strings
    normalized = re.sub(r'"[^"]*"', '"#TEXT#"', normalized)
    normalized = re.sub(r"'[^']*'", "'#TEXT#'", normalized)
    # Normalize whitespace
    normalized = re.sub(r'\s+', ' ', normalized)

    return normalized.strip()

def calculate_similarity(str1: str, str2: str) -> float:
    """Calculate similarity ratio between two strings (0 to 1)"""
    if str1 == str2:
        return 1.0
    if not str1 or not str2:
        return 0.0

    return SequenceMatcher(None, str1, str2).ratio()

def group_questions_by_variants(questions: List[Dict], similarity_threshold: float = 0.85) -> List[Dict]:
    """Group questions by code similarity"""
    groups = []
    processed = set()

    for question in questions:
        q_id = question['id']
        if q_id in processed:
            continue

        normalized_code = normalize_code(question['questionContent'].get('d3Content', ''))

        # Find similar questions (including current question)
        similar_questions = [{'questionId': q_id, 'question': question, 'similarity': 1.0}]

        for other_question in questions:
            other_id = other_question['id']
            if other_id == q_id or other_id in processed:
                continue

            other_normalized = normalize_code(other_question['questionContent'].get('d3Content', ''))
            similarity = calculate_similarity(normalized_code, other_normalized)

            if similarity >= similarity_threshold:
                similar_questions.append({
                    'questionId': other_id,
                    'question': other_question,
                    'similarity': similarity
                })
                processed.add(other_id)

        # Sort by question ID to find the true root (lowest ID)
        similar_questions.sort(key=lambda x: x['questionId'])

        # The root is the question with the lowest ID
        root = similar_questions[0]
        variants = similar_questions[1:]  # All others are variants

        # Create group
        groups.append({
            'rootQuestionId': root['questionId'],
            'rootQuestion': root['question'],
            'variants': variants,
            'normalizedCode': normalized_code
        })

        processed.add(q_id)

    return groups

def main():
    print('🔍 Analyzing question variants from assignment.json...\n')

    # Read file with encoding handling
    with open('docs/assignment-clean.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not data.get('success') or not data.get('data'):
        raise ValueError('Invalid assignment data format')

    assignments = data['data']

    # Collect all questions
    all_questions = []
    for assignment in assignments:
        for aq in assignment.get('assignment_questions', []):
            all_questions.append(aq['questions'])

    print(f'📊 Total questions found: {len(all_questions)}\n')

    # Filter to only d3 questions
    d3_questions = [
        q for q in all_questions
        if q['questionContent'].get('type') == 'd3' and q['questionContent'].get('d3Content')
    ]

    print(f'📊 D3 questions with code: {len(d3_questions)}\n')

    # Group by variants
    groups = group_questions_by_variants(d3_questions)

    # Print results
    print('=' * 80)
    print('VARIANT ANALYSIS RESULTS')
    print('=' * 80)
    print()

    groups_with_variants = [g for g in groups if g['variants']]
    standalone_questions = [g for g in groups if not g['variants']]

    print(f'✅ Question groups with variants: {len(groups_with_variants)}')
    print(f'📄 Standalone questions: {len(standalone_questions)}\n')

    # Show detailed groups
    for group in groups_with_variants:
        print('-' * 80)
        print(f"🌳 ROOT QUESTION ID: {group['rootQuestionId']}")
        q_text = group['rootQuestion']['questionContent']['questionText'][:100]
        print(f"   Question: {q_text}...")
        print(f"   Variants found: {len(group['variants'])}")
        print()

        for variant in group['variants']:
            similarity_pct = variant['similarity'] * 100
            print(f"   🔀 VARIANT ID: {variant['questionId']} ({similarity_pct:.1f}% similar)")
            v_text = variant['question']['questionContent']['questionText'][:100]
            print(f"      Question: {v_text}...")
        print()

    # Generate mapping
    mapping = {}

    for index, group in enumerate(groups):
        mapping[group['rootQuestionId']] = {
            'type': 'root',
            'groupId': index
        }

        for variant in group['variants']:
            mapping[variant['questionId']] = {
                'type': 'variant',
                'rootQuestionId': group['rootQuestionId'],
                'groupId': index
            }

    # Save mapping
    with open('docs/question-variant-mapping.json', 'w') as f:
        json.dump(mapping, f, indent=2)

    print('=' * 80)
    print('\n✅ Mapping saved to: docs/question-variant-mapping.json')
    print('\n📈 Summary:')
    print(f"   - Total question groups: {len(groups)}")
    print(f"   - Groups with variants: {len(groups_with_variants)}")
    print(f"   - Total root questions: {len(groups)}")
    total_variants = sum(len(g['variants']) for g in groups)
    print(f"   - Total variant questions: {total_variants}")

if __name__ == '__main__':
    main()
