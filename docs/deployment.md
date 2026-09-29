# GreenPulse Agri-DPG Production Deployment Guide

This guide provides step-by-step instructions for deploying GreenPulse Agri-DPG to production using free cloud services: **Vercel** for the React Frontend, **Render** for the FastAPI Python Backend, and **MongoDB Atlas** for the Cloud Database.

---

## 1. Cloud Database Setup (MongoDB Atlas)

1. Sign up / log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 Free Tier** Cluster.
3. Under **Database Access**, create a user (e.g. `mahekanak_db_user`) with a strong password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so production servers can connect.
5. Obtain your connection URI:
   ```text
   mongodb+srv://<username>:<password>@cluster0.310xgh0.mongodb.net/greenpulse?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render)

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com/) with GitHub.
3. Click **New +** → **Web Service** and select your `greenpulse-agri-dpg` repository.
4. Set the configuration:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `MONGODB_URL`: `mongodb+srv://<username>:<password>@cluster0.310xgh0.mongodb.net/greenpulse?retryWrites=true&w=majority`
   - `ENVIRONMENT`: `production`
6. Click **Create Web Service**. Copy your backend URL (e.g., `https://greenpulse-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/) with GitHub.
2. Click **Add New** → **Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or `react-scripts build`)
   - **Output Directory**: `build`
4. Environment Variables:
   - `REACT_APP_API_URL`: `https://greenpulse-api.onrender.com`
5. Click **Deploy**. Vercel will host your application on a global CDN.

---

## 4. Continuous Deployment (CD) Workflow

Once deployed, any future code changes pushed to your GitHub `main` branch will automatically trigger automated builds:
```bash
git add .
git commit -m "Update feature or UI layout"
git push origin main
```
Vercel and Render will detect the commit and automatically update the live site within 1 to 2 minutes.
