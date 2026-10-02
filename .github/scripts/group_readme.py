#!/usr/bin/env python3
"""Regroupe le tableau de status du README par catégorie (préfixe avant " · ").

Upptime régénère un tableau plat à chaque run ; ce script le re-découpe en
sections. Idempotent : il relit aussi un tableau déjà groupé (les "### Titre"
servent alors de catégorie courante).
"""
import re
import sys

SEP = " · "
START = "<!--start: status pages-->"
END = "<!--end: status pages-->"

text = open("README.md", encoding="utf-8").read()
s, e = text.find(START), text.find(END)
if s < 0 or e < s:
    sys.exit(0)

block = text[s + len(START):e]
comments, header, groups, order = [], [], {}, []
current = None

for line in block.split("\n"):
    if line.startswith("<!--"):
        comments.append(line)
    elif re.match(r"^### (.+)$", line):
        current = line[4:].strip()
    elif re.match(r"^\|\s*URL\s*\|", line) or re.match(r"^\|\s*-{3,}", line):
        if len(header) < 2:
            header.append(line)
    elif line.startswith("|"):
        m = re.search(r"\[([^\]]*)\]\(", line)
        if not m:
            continue
        name = m.group(1)
        if SEP in name:
            cat, short = [p.strip() for p in name.split(SEP, 1)]
            line = line.replace("[" + name + "](", "[" + short + "](", 1)
        else:
            cat = current or "Autres"
        if cat not in groups:
            groups[cat] = []
            order.append(cat)
        groups[cat].append(line)

if not groups:
    sys.exit(0)
if len(header) < 2:
    header = [
        "| URL | Status | History | Response Time | Uptime |",
        "| --- | ------ | ------- | ------------- | ------ |",
    ]

out = ["", *comments]
for cat in order:
    out += ["", "### " + cat, "", *header, *groups[cat]]
out += ["", ""]

new = text[:s + len(START)] + "\n".join(out) + text[e:]
if new != text:
    open("README.md", "w", encoding="utf-8").write(new)
