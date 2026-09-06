<div align="center">

# 🎓 Private-Teacher (BEdu Platform)

[![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![.NET Core](https://img.shields.io/badge/Backend-.NET_Core-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/Database-SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A comprehensive, scalable EdTech ecosystem bridging the gap between private teachers and students through intelligent dashboards, real-time tracking, and interactive curriculum management.

</div>

## 📌 Project Overview

**Private-Teacher** is a modern Learning Management System (LMS) built to empower private educators. It provides a structured, dual-track curriculum (Arabic & Languages), robust role-based access control, and real-time live session integrations. The architecture is cleanly decoupled into a React frontend and a C# ASP.NET Core backend.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
* **Smart Dashboard:** Real-time statistics, progress charts, and a dynamic live-session countdown timer.
* **Course Materials:** An intuitive UI to explore tracks, chapters, and lessons. Supports multiple file formats (PDFs, PPTXs, Code snippets, Mind Maps, Infographics).
* **Multi-Language Curriculum:** Seamlessly switch between the Arabic syllabus (RTL) and the Languages syllabus (LTR).

### 👨‍🏫 Teacher Features
* **Curriculum Builder:** Visually construct course tracks, chapters, and lessons. Includes a one-click "Seed Official Curriculum" generator.
* **Multi-Format Uploads:** Upload supplementary resources directly to lessons (Videos, Documents, Interactive Code).
* **Student Tracking:** Monitor enrollment and progress across different units.

### ⚙️ System Features
* **Role-Based Authentication:** JWT-based login for Students, Teachers, and Parents.
* **Responsive Design:** Custom CSS architectures ensuring a fluid experience across devices.

---

## 📂 Project Architecture

The repository is divided into two main environments to separate concerns:

```text
privateTeacher/
├── backend/                  # C# ASP.NET Core Web API
│   └── BEdu.API/
│       ├── Controllers/      # API endpoints (Curriculum, Stats, Auth)
│       ├── Models/           # EF Core Database entities
│       ├── DTOs/             # Data Transfer Objects
│       ├── Data/             # AppDbContext and Migrations
│       └── Program.cs        # Application entry point
│
└── frontend/                 # React SPA (Vite)
    ├── src/
    │   ├── components/       # Reusable UI components (Navbar, Layouts)
    │   ├── context/          # React Contexts (AuthContext, LanguageContext)
    │   ├── features/         # Domain-specific modules (CurriculumBuilder)
    │   ├── pages/            # Application views (StudentDashboard, TeacherDashboard)
    │   └── services/         # API integration (Axios)
    ├── package.json
    └── vite.config.js
