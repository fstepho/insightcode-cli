#!/bin/bash

# Créer une copie de sauvegarde
cp .ai.md .ai.md.backup

# Convertir l'ancien format vers le nouveau
awk '
BEGIN { in_log = 0 }
/<!-- GIT-LOG:START -->/ { 
    print
    in_log = 1
    next
}
/<!-- GIT-LOG:END -->/ { 
    in_log = 0
    print
    next
}
in_log {
    # Capturer les lignes avec ### 
    if (/^### /) {
        # Extraire date et titre
        if (match($0, /### ([A-Za-z]+ [0-9]+, [0-9]+)( \([^)]+\))? - (.+)/, arr)) {
            date_str = arr[1]
            title = arr[3]
            
            # Conversion des mois
            gsub(/January/, "01", date_str)
            gsub(/February/, "02", date_str)
            gsub(/March/, "03", date_str)
            gsub(/April/, "04", date_str)
            gsub(/May/, "05", date_str)
            gsub(/June/, "06", date_str)
            gsub(/July/, "07", date_str)
            gsub(/August/, "08", date_str)
            gsub(/September/, "09", date_str)
            gsub(/October/, "10", date_str)
            gsub(/November/, "11", date_str)
            gsub(/December/, "12", date_str)
            
            # Reformater la date
            if (match(date_str, /([0-9]+) ([0-9]+), ([0-9]+)/, d)) {
                formatted_date = d[3] "-" d[1] "-" sprintf("%02d", d[2])
                print "- " formatted_date ": " title
            }
        }
    }
    # Ignorer toutes les autres lignes dans la section log
    next
}
!in_log { print }
' .ai.md > .ai.md.converted

mv .ai.md.converted .ai.md
echo "✅ Log converti au nouveau format. Backup: .ai.md.backup"
