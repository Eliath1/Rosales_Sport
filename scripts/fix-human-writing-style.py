#!/usr/bin/env python3
"""Replace AI-style symbols in markdown and rule files with plain developer prose markers."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTENSIONS = {".md", ".mdc", ".yaml", ".yml"}
SKIP_DIRS = {".git", "node_modules"}

REPLACEMENTS = [
    ("\u2014", " - "),
    ("\u2013", "-"),
    ("\u00a7", "Section "),
    ("\u2026", "..."),
    ("\u201c", '"'),
    ("\u201d", '"'),
    ("\u2018", "'"),
    ("\u2019", "'"),
    ("\u2192", "->"),
    ("\u2190", "<-"),
    ("\u21d2", "=>"),
    ("\u25ba", ""),
    ("\u25b8", ""),
    ("\U0001f3af", ""),
    ("\u26a0\ufe0f", "Warning:"),
    ("\u26a0", "Warning:"),
    ("\u2705", "Yes"),
    ("\u274c", "No"),
    ("\u25cf", "*"),
    ("\u25cb", "Optional"),
]


def clean_line(line: str) -> str:
    for old, new in REPLACEMENTS:
        line = line.replace(old, new)
    return line


def normalize_spacing(text: str) -> str:
    # Fix double-spaced hyphen pairs left by em-dash replacement
    text = re.sub(r"  -  ", " - ", text)
    text = re.sub(r" -  ", " - ", text)
    text = re.sub(r"  - ", " - ", text)
    return text


def clean_content(text: str) -> str:
    lines = [clean_line(line) for line in text.splitlines(keepends=True)]
    return normalize_spacing("".join(lines))


def should_process(path: Path) -> bool:
    if path.suffix.lower() not in EXTENSIONS:
        return False
    return not any(part in SKIP_DIRS for part in path.parts)


def main() -> None:
    changed: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or not should_process(path):
            continue
        original = path.read_text(encoding="utf-8")
        updated = clean_content(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed.append(path)

    print(f"Updated {len(changed)} files")
    for p in sorted(changed):
        print(f"  {p.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
