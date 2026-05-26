with open("data/logs/app.log", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("Last 50 log lines:")
for line in lines[-50:]:
    print(line.strip())
