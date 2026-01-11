import json

# Read the tab-separated file
with open('/Users/alexsmith/ai-coaching-platform/exam_data_split_units.txt', 'r') as f:
    lines = f.readlines()

# Parse header
header = lines[0].strip().split('\t')

# Parse data rows
data = []
for line in lines[1:]:
    values = line.strip().split('\t')
    row = {}
    for i, h in enumerate(header):
        if i < len(values):
            # Extract year from Exam field (e.g., "Spring 2025" -> "2025")
            if h == "Exam":
                exam_value = values[i]
                row[h] = exam_value
                # Extract year
                if exam_value:
                    parts = exam_value.split()
                    if len(parts) >= 2:
                        row["Year"] = parts[1]
                    else:
                        row["Year"] = ""
                else:
                    row["Year"] = ""
            elif h == "Q#":
                # Convert Q# to integer if possible
                try:
                    row[h] = int(values[i]) if values[i] else None
                except:
                    row[h] = values[i] if values[i] else None
            elif h == "Grade":
                # Convert Grade to integer if possible
                try:
                    row[h] = int(values[i]) if values[i] else None
                except:
                    row[h] = values[i] if values[i] else None
            elif h == "Unit #":
                # Convert Unit # to integer if possible
                try:
                    row[h] = int(values[i]) if values[i] else None
                except:
                    row[h] = values[i] if values[i] else None
            else:
                row[h] = values[i] if values[i] else None
        else:
            if h != "Year":  # Year is handled separately
                row[h] = None
    data.append(row)

# Write to JSON file
with open('/Users/alexsmith/ai-coaching-platform/exam_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Converted {len(data)} rows to JSON")
print(f"Sample entry:")
print(json.dumps(data[0], indent=2))
