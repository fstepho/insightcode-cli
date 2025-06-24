# InsightCode CLI - Cahier des Charges v2.0

## 1. Vision

InsightCode CLI est un analyseur de qualité de code TypeScript qui fonctionne 100% en local, fournissant des métriques actionnables en moins de 30 secondes, sans jamais envoyer une ligne de code au cloud.

## 2. Utilisateurs Cibles

### Persona Principal
**Sarah, Lead Dev TypeScript (32 ans)**
- Équipe de 5-10 développeurs
- Projets TypeScript/JavaScript (100k+ lignes)
- Pain points:
  - Code reviews prennent trop de temps
  - Dette technique invisible
  - Outils existants trop complexes ou chers
  - Données sensibles ne peuvent pas aller au cloud

### Persona Secondaire
**Marc, Dev Freelance (28 ans)**
- Travaille sur plusieurs projets clients
- Besoin de prouver la qualité de son code
- Budget limité

## 3. Fonctionnalités MVP (v1.0 - 4 semaines)

### 3.1 Must Have

#### F1: Analyse TypeScript/JavaScript
**Description:** Parser qui comprend TypeScript moderne
**Critères d'acceptation:**
- ✅ Détecte tous les fichiers .ts/.js/.tsx/.jsx
- ✅ Ignore node_modules et .gitignore
- ✅ Support ES2015+ et TypeScript 4.0+
- ✅ Fonctionne sur projets mono-repo

#### F2: 3 Métriques Essentielles
**Description:** Focus sur les métriques qui comptent vraiment
```typescript
{
  complexity: number,      // Complexité cyclomatique
  duplication: number,     // % code dupliqué  
  maintainability: number  // Score composite 0-100
}
```
**Critères d'acceptation:**
- ✅ Calcul en < 30s pour 100k lignes
- ✅ Algorithmes éprouvés (McCabe, Halstead simplifié)

#### F3: Score Simple
**Description:** Note globale A-F facile à comprendre
```
Score Global: B (75/100)
├── Complexité: B (78/100) 
├── Duplication: A (92/100) ✅
└── Maintenabilité: C (65/100) ⚠️
```

#### F4: Output Terminal
**Description:** Résultats clairs dans le terminal
```bash
$ insightcode analyze
✅ Analysé: 127 fichiers en 12.3s
📊 Score: B (75/100)
⚠️  3 problèmes majeurs:
   - src/utils/parser.ts:45 - Complexité excessive (15)
   - src/services/api.ts:89 - Code dupliqué (3x)
   - src/index.ts:12 - Fonction trop longue (150 lignes)
```

### 3.2 Should Have (v1.1 - +2 semaines)

- Support Angular/React/Vue basique
- Export JSON pour CI/CD
- Configuration basique (.insightcoderc)
- Top 10 des fichiers problématiques

### 3.3 Could Have (v1.2+)

- Rapport HTML
- Historique des scores
- Suggestions de refactoring
- Support autres langages

### 3.4 Won't Have (pas en v1)

- Interface graphique
- Système de licence complexe
- Support multi-langages complet
- Cloud features

## 4. Contraintes Non-Fonctionnelles

### 4.1 Performance
```yaml
Temps d'analyse:
  - < 10k lignes: < 5 secondes  
  - < 100k lignes: < 30 secondes
  - < 1M lignes: < 3 minutes

Resources:
  - RAM max: 512MB
  - CPU: Single thread (simplicité)
```

### 4.2 Sécurité & Privacy
```yaml
Données:
  - AUCUN code source envoyé
  - AUCUNE télémétrie
  - AUCUN tracking
  - 100% local
```

### 4.3 Distribution
```yaml
Package:
  - NPM registry public
  - Nom: insightcode-cli (si @insightcode non disponible)
  - Taille max: 10MB
  - Zéro dépendance native
```

## 5. Architecture Technique Simplifiée

### 5.1 Stack Minimal
```typescript
// Core seulement
- TypeScript 5.x
- Commander.js (CLI)
- TypeScript Compiler API
- Chalk (colors)
- Fast-glob (fichiers)
```

### 5.2 Structure Simple
```
insightcode-cli/
├── src/
│   ├── cli.ts         # Entry point
│   ├── analyzer.ts    # Logique métrique
│   ├── parser.ts      # AST parsing
│   └── reporter.ts    # Output formatting
├── package.json
└── tsconfig.json
```

## 6. Planning Réaliste

### Phase 1: MVP (4 semaines)
**Semaine 1-2: Core**
- [ ] Setup projet + tests de base
- [ ] Parser TypeScript minimal
- [ ] Calcul complexité cyclomatique

**Semaine 3: Features**
- [ ] Détection duplication simple
- [ ] Score de maintenabilité
- [ ] Output terminal coloré

**Semaine 4: Polish**
- [ ] Tests complets
- [ ] Documentation README
- [ ] Publish NPM

### Phase 2: Feedback (Mois 2)
- [ ] Recueillir feedback utilisateurs
- [ ] Corriger bugs
- [ ] Ajouter export JSON
- [ ] Support configuration

### Phase 3: Growth (Mois 3+)
- [ ] Angular/React patterns
- [ ] Plus de métriques
- [ ] Intégrations CI/CD

## 7. Modèle Économique Simplifié

### 7.1 Phase 1: 100% Gratuit
- Acquisition d'utilisateurs
- Validation du concept
- Construction communauté

### 7.2 Phase 2: Freemium (Mois 6+)
```javascript
const pricing = {
  free: {
    features: "Toutes",
    support: "Communauté"
  },
  
  pro: {
    prix: "29€/mois",
    features: [
      "Support prioritaire",
      "Intégrations avancées",
      "Configuration custom"
    ]
  }
}
```

## 8. Métriques de Succès Réalistes

| Métrique | Mois 1 | Mois 3 | Mois 6 |
|----------|---------|---------|---------|
| Downloads NPM | 100 | 1000 | 5000 |
| GitHub Stars | 50 | 200 | 500 |
| Utilisateurs actifs | 20 | 200 | 1000 |
| Feedback positif | 80% | 85% | 90% |

## 9. Risques et Mitigations

| Risque | Mitigation |
|--------|------------|
| Nom NPM indisponible | Alternatives: quicksight-cli, codehealth-cli |
| Complexité sous-estimée | Commencer par 1 métrique, itérer |
| Pas d'adoption | MVP gratuit, focus sur valeur immédiate |
| Bug parsing | Tests sur projets open source populaires |

## 10. Critères de Validation MVP

### Fonctionnels
- [ ] Analyse un projet TypeScript 50k lignes en < 30s
- [ ] Détecte complexité excessive avec précision
- [ ] Output clair et actionnable

### Techniques  
- [ ] Installation npm en 1 commande
- [ ] Zero configuration requise
- [ ] Fonctionne offline

### Marché
- [ ] 20+ utilisateurs satisfaits
- [ ] 5+ stars GitHub première semaine
- [ ] 1 article de blog avec retour positif

---

**Document validé par:** Solo Dev  
**Date:** Janvier 2025  
**Version:** 2.0  
**Changements v2.0:**
- Simplifié le scope MVP à 3 métriques
- Retiré système de licence complexe  
- Ajusté timeline à 4 semaines + feedback
- Budget marketing retiré (organique only)
- Focus sur TypeScript, Angular en v1.1