# Décisions Architecturales - InsightCode CLI

Format : **Date | Décision | Raison | Impact**

---

## 2025-06-25 : Score pondéré 40/30/30
**Décision** : Complexité 40%, Duplication 30%, Maintenabilité 30%  
**Raison** : La complexité est le facteur #1 de dette technique  
**Impact** : Score qui reflète les vraies priorités de refactoring

---

## 2025-06-25 : Grade D pour score 70/100
**Décision** : Grading strict (A=90+, B=80+, C=70+, D=60+, F<60)  
**Raison** : Pousser vers l'excellence, pas complaisance  
**Impact** : Notre propre projet a un D, c'est honnête et motivant

---

## 2025-06-25 : Duplication 0% acceptable
**Décision** : Pas de faux positifs, algorithme conservateur  
**Raison** : Mieux vaut rater de la duplication que crier au loup  
**Impact** : Confiance dans les résultats quand duplication détectée

---

## 2025-06-24 : Parser avec TypeScript Compiler API
**Décision** : Utiliser l'API officielle TypeScript plutôt qu'un parser custom  
**Raison** : Précision maximale, maintenance par Microsoft, gratuit  
**Impact** : Parsing 100% fiable, support futur garanti

---

## 2025-06-24 : Complexité cyclomatique simple (McCabe)
**Décision** : Compter uniquement les points de décision, pas de cognitive complexity  
**Raison** : Standard industrie, simple à comprendre et expliquer  
**Impact** : Métrique claire et actionnable

---

## 2025-06-24 : Duplication par hash de blocs
**Décision** : Hash MD5 de blocs de 5 lignes pour détecter duplication  
**Raison** : Balance entre précision et performance  
**Impact** : Détection rapide, peu de faux positifs

---

## 2025-06-24 : Réduction à 3 métriques au lieu de 5
**Décision** : MVP avec seulement complexity, duplication, maintainability  
**Raison** : Simplicité > Features. 80% de la valeur avec 40% de l'effort  
**Impact** : Dev 2x plus rapide, code 2x plus simple

---

## 2025-06-24 : TypeScript only, pas Angular-specific
**Décision** : Analyser tout TypeScript/JavaScript, pas spécifique Angular  
**Raison** : Marché 10x plus large, même complexité de dev  
**Impact** : 500k+ utilisateurs potentiels vs 50k

---

## 2025-06-24 : Pas de système de licence en v1
**Décision** : 100% gratuit open source, monétisation après PMF  
**Raison** : Acquisition first, revenue later. Réduire friction  
**Impact** : -2 semaines de dev, +50% adoption estimée

---

## 2025-06-24 : Architecture stateless (pas de DB)
**Décision** : Aucune persistence, export JSON pour historique  
**Raison** : Zero maintenance, privacy by design, simplicité  
**Impact** : Pas d'historique natif mais 10x plus simple

---

## 2025-06-24 : NPM global, pas de package scoped
**Décision** : `insightcode-cli` au lieu de `@insightcode/cli`  
**Raison** : Plus simple, pas besoin d'org NPM  
**Impact** : Installation plus naturelle

---

## 2025-06-24 : Choix de Commander.js au lieu de yargs/oclif
**Décision** : Commander pour le CLI framework  
**Raison** : Plus simple, bien documenté, suffisant  
**Impact** : 50% moins de boilerplate

---

## 2025-06-24 : Utiliser 4 dépendances max
**Décision** : commander, typescript, chalk, fast-glob only  
**Raison** : Chaque dep = risque de maintenance  
**Impact** : Bundle <10MB, moins de bugs

---

## 2025-06-24 : Pas de GitHub Actions complexe
**Décision** : Simple npm publish manuel  
**Raison** : Side project, pas besoin de CI/CD complexe  
**Impact** : 1 commande pour release

---

## 2025-06-24 : README comme doc principale
**Décision** : Pas de site doc, tout dans README  
**Raison** : 1 source de vérité, plus simple  
**Impact** : Doc toujours à jour

---

## 2025-06-24 : Tests critiques only (pas 100% coverage)
**Décision** : Tester parsing et scoring, pas le CLI  
**Raison** : 80/20, effort vs valeur  
**Impact** : 2h de tests vs 2 jours

---

## À venir : [Template pour futures décisions]
**Décision** :  
**Raison** :  
**Impact** :  

---

## Principes Directeurs

1. **Si ça prend > 1 jour, c'est trop complexe**
2. **Fonctionnel > Parfait**
3. **Moins de code = Moins de bugs**
4. **L'utilisateur s'en fout de ton architecture**
5. **Ship early, iterate often**

---

*Ce document évite de refaire les mêmes débats. Quand hésitation, relire les décisions passées.*