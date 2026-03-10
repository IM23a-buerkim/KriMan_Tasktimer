# KriMan_Tasktimer — Projektübersicht

Kurzüberblick der bisher hinzugefügten Tools und Konfigurationen im Projekt.

Enthaltene Konfigurationsdateien und Skripte

- Prettier
  - .prettierrc — Prettier-Konfiguration (semi, singleQuote, tabWidth, printWidth, trailingComma u. a.)
  - .prettierignore — Dateien/Ordner, die Prettier ignoriert (z. B. node_modules, dist)
  - package.json script: npm run format (führt prettier --write . aus)

- ESLint
  - eslint.config.cjs — Haupt-ESLint-Konfiguration (Flat config für ESLint v9+)
  - .eslintrc.json — vorhandene alternative Konfigurationsdatei (kann entfernt werden, falls gewünscht)
  - package.json scripts: npm run lint (eslint . --ext .js,.jsx,.ts,.tsx) und npm run lint:fix

- CI / GitHub Actions
  - .github/workflows/lint-and-format.yml — Workflow, der bei push und pull_request läuft und folgende Schritte ausführt:
    - npm ci
    - npx prettier --check .
    - npm run lint

Kurze Anweisungen zur Nutzung lokal

1. Abhängigkeiten installieren
   - npm ci

2. Formatieren
   - npm run format

3. Linting prüfen
   - npm run lint

4. Lint-Probleme automatisch beheben
   - npm run lint:fix

Empfehlungen

- VS Code: Prettier-Extension installieren und "Format On Save" aktivieren.
- Behalte nur eine ESLint-Konfigurationsdatei (empfohlen: eslint.config.cjs) um Duplikate zu vermeiden.
- Optional: Husky + lint-staged einrichten, damit vor Commits automatisch formatiert und gelint wird.

Kontakt

- Änderungen an diesen Konfigurationen können einfach per Commit ergänzt werden. Bei Bedarf kann ich Husky/lint-staged konfigurieren oder die ESLint-Konfiguration für TypeScript/React erweitern.
