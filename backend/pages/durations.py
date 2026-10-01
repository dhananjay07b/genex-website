"""
Parsing for the free-text durations editors type ("14:32 min", "48 min",
"1:02:10", "1 h 20 min"). The text stays what visitors see; the parsed
seconds let the API sort and filter by length ("under 20 minutes").
"""
import re


def parse_duration_seconds(text):
    """Seconds in `text`, or None when it holds no number."""
    if not text:
        return None
    text = text.strip().lower()
    if ":" in text:
        parts = [int(p) for p in re.findall(r"\d+", text.split(" ")[0])]
        if len(parts) == 2:
            return parts[0] * 60 + parts[1]
        if len(parts) == 3:
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
        return None
    hours = re.search(r"(\d+)\s*h", text)
    minutes = re.search(r"(\d+)\s*m", text)
    if hours or minutes:
        return (int(hours.group(1)) * 3600 if hours else 0) + (int(minutes.group(1)) * 60 if minutes else 0)
    number = re.search(r"\d+", text)
    # A bare number is minutes ("40" means 40 min, the way editors write it).
    return int(number.group()) * 60 if number else None
