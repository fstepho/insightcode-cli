# Configuration des Seuils de Duplication - Guide Utilisateur

## Vue d'ensemble

InsightCode propose maintenant **deux modes d'analyse de duplication** pour s'adapter aux différents contextes de projet :

### 🔥 Mode Strict (Nouveau) - `--strict-duplication`
- **Aligné sur les standards industriels** (SonarQube, Google)
- **Seuils** : ≤3% excellent, ≤8% acceptable, ≤15% critique
- **Recommandé pour** : Nouveaux projets, équipes expérimentées, standards élevés

### 🛠️ Mode Legacy (Par défaut) 
- **Permissif pour l'analyse de legacy/brownfield**
- **Seuils** : ≤15% excellent, ≤30% acceptable, ≤50% critique  
- **Recommandé pour** : Projets existants, migration progressive, codebase héritée

## Utilisation

### Mode Strict (Standards Industriels)
```bash
# Analyse avec seuils stricts alignés SonarQube/Google
insightcode . --strict-duplication

# Combinaison avec d'autres options
insightcode src/ --strict-duplication --format json
```

### Mode Legacy (Par défaut)
```bash
# Analyse standard (seuils permissifs)
insightcode .

# Explicitement spécifier le mode legacy
insightcode . # (mode legacy par défaut)
```

## Comparaison des Résultats

Pour **30% de duplication**, les scores diffèrent significativement :

| Mode | Score Duplication | Interprétation | Grade Impact |
|------|------------------|----------------|--------------|
| **Legacy** | 88/100 (Bon) | Acceptable pour legacy | A (97/100) |
| **Strict** | 75/100 (Moyen) | Problématique, action requise | A (94/100) |

## Impact Visuel dans les Rapports

### Mode Legacy
```
Duplication Score:   88/100  ██████████████████░░
Duplication Mode:   Legacy (Permissive for Brownfield)
```

### Mode Strict  
```
Duplication Score:   75/100  ███████████████░░░░░
Duplication Mode:   Strict (Industry Standards: SonarQube/Google)

CRITICAL FILES REQUIRING ATTENTION
1. src/service.ts → Health: 30/100 (duplication)
```

## Contexte et Justification

### Pourquoi Deux Modes ?

1. **Honnêteté Académique** : Les seuils legacy d'InsightCode (≤15% = excellent) sont 5x plus permissifs que SonarQube (≤3%)

2. **Contexte Projet** :
   - **Nouveaux projets** → Mode strict recommandé
   - **Legacy/brownfield** → Mode legacy approprié

3. **Comparabilité** : Le mode strict permet la comparaison avec des outils industrie standards

### Standards de Référence

| Outil/Organisation | Seuil "Échec" | Seuil "Excellent" |
|-------------------|---------------|-------------------|
| **SonarQube** | >3% (new code) | ≤3% |
| **Google** | ~2-3% maintenu | ≤3% |
| **InsightCode Strict** | >15% | ≤3% |
| **InsightCode Legacy** | >50% | ≤15% |

## Recommandations d'Usage

### ✅ Utilisez le Mode Strict quand :
- Vous démarrez un nouveau projet
- Votre équipe suit des standards stricts de qualité  
- Vous voulez comparer avec SonarQube/CodeClimate
- Vous visez l'excellence technique

### ✅ Utilisez le Mode Legacy quand :
- Vous analysez du code existant/hérité
- Vous migrez progressivement vers de meilleurs standards
- Vous voulez éviter le "découragement" d'équipes sur legacy
- Vous priorisez la détection des cas extrêmes (>50%)

## Intégration CI/CD

### Standards Stricts (Greenfield)
```yaml
# GitHub Actions exemple
- name: Code Quality Check (Strict)
  run: |
    npx insightcode src/ --strict-duplication --format ci
    if [ $? -ne 0 ]; then exit 1; fi
```

### Standards Permissifs (Brownfield)
```yaml
# Migration progressive
- name: Code Quality Check (Legacy)
  run: |
    npx insightcode src/ --format ci  # Mode legacy par défaut
    # Échoue seulement si >50% duplication (très permissif)
```

## Migration Progressive

### Stratégie Recommandée
1. **Phase 1** : Utiliser le mode legacy pour l'état des lieux
2. **Phase 2** : Fixer les problèmes critiques identifiés en legacy
3. **Phase 3** : Passer au mode strict pour de nouveaux standards
4. **Phase 4** : Appliquer progressivement le strict à l'existant

---

## 🚨 Avertissement Important

Le **mode legacy ne doit pas être interprété comme une validation** que 15% de duplication est acceptable selon les standards industriels. Il s'agit d'un mode d'analyse **adapté aux contraintes** des projets existants, permettant une amélioration progressive.

Pour toute nouvelle fonctionnalité ou nouveau projet, **le mode strict est fortement recommandé**.
