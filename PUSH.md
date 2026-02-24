# Push vers GitHub

Ouvre **PowerShell** ou **CMD**, va dans le dossier du projet puis exécute les commandes une par une.

### 1. Aller dans le dossier Backend

```powershell
cd "C:\Users\Elijah Lyon King\Documents\Backend"
```

### 2. Initialiser Git (si ce dossier n’est pas encore un dépôt)

```powershell
git init
git branch -M main
```

### 3. Ajouter le remote

```powershell
git remote add origin https://github.com/Eliebotuna/Eskalate-Backend.git
```

Si tu as déjà un `origin` :  
`git remote set-url origin https://github.com/Eliebotuna/Eskalate-Backend.git`

### 4. Ajouter les fichiers, committer, pousser

```powershell
git add .
git commit -m "feat: Eskalate News API - auth, articles, analytics, dashboard"
git push -u origin main
```

---

**Authentification GitHub**  
Si on te demande un mot de passe, utilise un **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) à la place du mot de passe, ou configure une clé SSH.
