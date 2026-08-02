import os

folders = ["docs/part3-control", "docs/part4-learning", "docs/part5-systems", "docs/part6-future"]

for folder in folders:
    for filename in os.listdir(folder):
        if filename.endswith(".mdx"):
            path = os.path.join(folder, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            # Escape the <Term> in the table to avoid MDX thinking it's a component
            content = content.replace("| <Term> |", "| \\`<Term>\\` |")
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {path}")
