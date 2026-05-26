import os

search_term = "54.167.104.118"
workspace = r"d:\PRADEEP\INTERNSHIP\AppXcess\lwd\generic_bot\generic_bot_frontend\.next"

found = False
for root, dirs, files in os.walk(workspace):
    for file in files:
        if file.endswith((".js", ".html", ".json")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if search_term in content:
                        print(f"Found {search_term} in built file: {path}")
                        found = True
            except Exception as e:
                pass

if not found:
    print("Search term not found in built files.")
