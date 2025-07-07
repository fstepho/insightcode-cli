#!/bin/bash

# Créer une copie de sauvegarde
cp .ai.md .ai.md.backup

# Extraire et dédupliquer les entrées de log
awk '
  /<!-- GIT-LOG:START -->/ { inlog=1; print; next }
  /<!-- GIT-LOG:END -->/ { inlog=0; print; next }
  inlog && /^- / {
    if (!seen[$0]++) print
    next
  }
  { print }
' .ai.md > .ai.md.clean

mv .ai.md.clean .ai.md
echo "✅ Log cleaned. Backup saved as .ai.md.backup"
