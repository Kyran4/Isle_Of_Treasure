# Treasure Isle

A browser prototype of the classic island digging game. Plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Files
- `index.html` - page structure
- `style.css` - styling
- `game.js` - game logic and canvas rendering (energy, loot tables, quests, saves)

## Run locally
Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` > Open with Live Server), or run `python -m http.server` in this folder and visit http://localhost:8000.

## Deploy to GitHub Pages
1. Create a new GitHub repository (for example `treasure-isle`).
2. In this folder run:
   ```
   git init
   git add .
   git commit -m "Treasure Isle prototype"
   git branch -M main
   git remote add origin https://github.com/<Kyran4>/treasure-isle.git
   git push -u origin main
   ```
3. On GitHub go to **Settings > Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
4. After a minute the game is live at `https://<Kyran4>.github.io/treasure-isle/`.

## Tuning
In `game.js`: `REGEN` (milliseconds per energy point), `ITEMS` (emoji, name, value, drop weight) and `POOL` (quest templates).
