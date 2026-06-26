# Deploying VectorShift Pipeline Builder

The app has two pieces that deploy separately:

| Piece | Recommended host | Free tier | Result |
|-------|------------------|-----------|--------|
| **Backend** (FastAPI) | [Render](https://render.com) | ✅ | `https://<name>.onrender.com` |
| **Frontend** (React/CRA) | [Vercel](https://vercel.com) | ✅ | `https://<name>.vercel.app` |

Both deploy straight from a GitHub repo — so step 0 is getting the code onto GitHub.

---

## Step 0 — Push to GitHub
From the project root:
```bash
git init
git add .
git commit -m "VectorShift pipeline builder"
gh repo create vectorshift-pipeline --public --source=. --push
# (or create a repo on github.com and `git remote add origin … && git push -u origin main`)
```
The root `.gitignore` already excludes `venv/`, `node_modules/`, and the local
pipeline store, so only source is pushed.

---

## Step 1 — Deploy the backend (Render)
1. Render → **New + → Blueprint**, connect the repo. It auto-reads
   [`render.yaml`](render.yaml) and creates the `vectorshift-backend` service.
   - (Manual alternative: New + → Web Service, **Root Directory** =
     `backend-20260626T023302Z-3-001/backend`, **Build** =
     `pip install -r requirements.txt`, **Start** =
     `uvicorn main:app --host 0.0.0.0 --port $PORT`.)
2. Deploy. Copy the URL, e.g. `https://vectorshift-backend.onrender.com`.
3. Confirm it's live: open that URL → you should see `{"Ping":"Pong"}`.

> Free Render services sleep after inactivity, so the **first request after idle
> takes ~50s** to wake. The frontend just shows the loading state until it answers.

---

## Step 2 — Deploy the frontend (Vercel)
1. Vercel → **Add New → Project**, import the repo.
2. **Root Directory** = `frontend-20260626T023322Z-3-001/frontend`
   (Framework preset: Create React App — auto-detected).
3. Add an **Environment Variable**:
   - `REACT_APP_API_BASE` = your Render backend URL (from Step 1).
   - (Vercel env vars take precedence over the committed `.env`, so this wins.)
4. Deploy. Copy the URL, e.g. `https://vectorshift-yourname.vercel.app`.

---

## Step 3 — Allow the frontend origin on the backend (CORS)
1. In Render → your service → **Environment**, set:
   - `ALLOWED_ORIGINS` = your Vercel URL (e.g.
     `https://vectorshift-yourname.vercel.app`).
2. Save → Render redeploys. (`*.vercel.app` preview URLs are already allowed by
   the built-in regex in `main.py`.)

Done — open the Vercel URL, build a pipeline, hit **Submit Pipeline**, and the
analysis round-trips to the live backend.

---

## Local Docker (optional)
The backend ships a [`Dockerfile`](backend-20260626T023302Z-3-001/backend/Dockerfile):
```bash
cd backend-20260626T023302Z-3-001/backend
docker build -t vectorshift-backend .
docker run -p 8001:8001 vectorshift-backend
```
