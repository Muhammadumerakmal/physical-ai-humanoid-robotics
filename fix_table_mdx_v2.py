import os

folders = ["docs/part3-control", "docs/part4-learning", "docs/part5-systems", "docs/part6-future"]

for folder in folders:
    for filename in os.listdir(folder):
        if filename.endswith(".mdx"):
            path = os.path.join(folder, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            # Replace the problematic table row completely with escaped placeholders
            # or just remove the <Term> tag.
            content = content.replace("| \\`<Term>\\` |", "| Term |")
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {path}")
