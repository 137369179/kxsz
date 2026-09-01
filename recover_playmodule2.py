import json

transcript_path = "/Users/mac/.gemini/antigravity/brain/3037a24c-5667-449e-a817-7535e5fca007/.system_generated/logs/transcript_full.jsonl"

file_contents = {}

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get("type") == "PLANNER_RESPONSE" and "tool_calls" in entry:
                for call in entry["tool_calls"]:
                    name = call.get("name")
                    args = call.get("args", {})
                    if name == "write_to_file":
                        if "TargetFile" in args and "CodeContent" in args:
                            path = args["TargetFile"]
                            if "/Desktop/识字/src" in path:
                                file_contents[path] = args["CodeContent"]
                    elif name == "replace_file_content":
                        if "TargetFile" in args and "TargetContent" in args and "ReplacementContent" in args:
                            path = args["TargetFile"]
                            if path in file_contents:
                                file_contents[path] = file_contents[path].replace(args["TargetContent"], args["ReplacementContent"])
        except Exception as e:
            pass

for path, content in file_contents.items():
    print(f"Recovered {path}")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

