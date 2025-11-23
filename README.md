# RTF - Return to Form Fitness Planner

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/wolfsquadtraining-4104s-projects/v0-rtf)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/FSkv9ALGyMN)

## Overview

A comprehensive 12-week fitness transformation planner with AI-powered coaching analysis. Track workouts, monitor habits, analyze performance, and document progress through an all-in-one platform.

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## 🤖 AI Coach Setup

The AI Coach provides personalized workout analysis, form alerts, and recommendations using Anthropic's Claude AI.

### Demo Mode (Default)
By default, the app runs in **demo mode** with sample analysis. No setup required!

### Enable Real AI Analysis

To activate real AI coaching:

1. **Get an Anthropic API Key**
   - Visit [console.anthropic.com](https://console.anthropic.com)
   - Sign up or log in
   - Generate an API key from the dashboard

2. **Add API Key to Replit Secrets**
   - Open the **Secrets** pane in your Replit workspace (Tools → Secrets)
   - Click "Add a new secret"
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (starts with `sk-ant-`)
   - Click "Add secret"

3. **Restart the Workflow**
   - The app will automatically detect the API key
   - Real AI analysis will activate on your next workout

### How It Works
- AI Coach analyzes your exercise data (sets, reps, load, RPE)
- Provides strength trend observations
- Alerts you to potential form issues
- Gives 3 actionable recommendations per session
- Re-analyzes automatically when you modify exercise data

## Deployment

Your project is live at:

**[https://vercel.com/wolfsquadtraining-4104s-projects/v0-rtf](https://vercel.com/wolfsquadtraining-4104s-projects/v0-rtf)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/FSkv9ALGyMN](https://v0.app/chat/FSkv9ALGyMN)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
