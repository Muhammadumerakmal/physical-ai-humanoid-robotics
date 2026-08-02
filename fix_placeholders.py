import os

replacements = {
    "<One or two paragraphs. Motivate before you explain.>": "Placeholder description.",
    "<Objective 1.>": "Placeholder objective.",
    "<One-line definition.>": "Placeholder.",
    "<Body of the chapter.>": "Placeholder content.",
    "<Real humanoid platform example.>": "Placeholder example.",
    "<Summary.>": "Placeholder summary.",
    "<Task.>": "Placeholder exercise.",
    "<Link>": "Placeholder link."
}

folders = ["docs/part3-control", "docs/part4-learning", "docs/part5-systems", "docs/part6-future"]

for folder in folders:
    for filename in os.listdir(folder):
        if filename.endswith(".mdx"):
            path = os.path.join(folder, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            for old, new in replacements.items():
                content = content.replace(old, new)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {path}")
