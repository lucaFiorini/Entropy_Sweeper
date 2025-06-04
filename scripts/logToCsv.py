import json
import csv

# File paths
jsonl_file = 'logs/entropy_log.jsonl'
csv_file = 'logs/output.csv'

# Read JSONL lines into a list of dicts
data = []
max_entropy_len = 0

with open(jsonl_file, 'r') as infile:
    for line in infile:
        item = json.loads(line)
        entropy_len = len(item.get('entropy', []))
        max_entropy_len = max(max_entropy_len, entropy_len)
        data.append(item)

# Define fieldnames dynamically based on max entropy length
fieldnames = ['run', 'type'] + [f'entropy_{i}' for i in range(max_entropy_len)]

# Write to CSV
with open(csv_file, 'w', newline='') as outfile:
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for item in data:
        row = {
            'run': item.get('run'),
            'type': item.get('type'),
        }

        entropy = item.get('entropy', [])
        for i in range(max_entropy_len):
            row[f'entropy_{i}'] = entropy[i] if i < len(entropy) else ''

        writer.writerow(row)

print(f"Conversion complete: {jsonl_file} -> {csv_file}")
