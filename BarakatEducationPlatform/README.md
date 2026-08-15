# Barakat Education Platform

## Overview
The Barakat Education Platform is a full-stack application designed to provide educational resources and manage courses and students. The project consists of a backend built with .NET 8 Web API and a frontend developed using React.

## Project Structure
```
BarakatEducationPlatform
├── backend
│   ├── BarakatEducationPlatform.sln
│   └── BarakatEducationApi
│       ├── Controllers
│       │   ├── CoursesController.cs
│       │   └── StudentsController.cs
│       ├── Models
│       │   ├── Course.cs
│       │   └── Student.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── BarakatEducationApi.csproj
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages
│   │   │   ├── Home.tsx
│   │   │   └── Courses.tsx
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── types
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## How to Run the Backend
1. Navigate to the `backend/BarakatEducationApi` directory.
2. Run `dotnet restore` to restore the dependencies.
3. Run `dotnet run` to start the backend server.

## How to Run the Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install the dependencies.
3. Run `npm start` to start the development server.
4. Open a web browser and go to `http://localhost:3000` to view the application.

## Features
- **Course Management**: Create, retrieve, update, and delete courses through the API.
- **Student Management**: Register students, log in, and retrieve student information.
- **Responsive Design**: The frontend is built with React, ensuring a responsive user experience.

## Technologies Used
- **Backend**: .NET 8 Web API
- **Frontend**: React
- **Database**: (Specify your database here, e.g., SQL Server, PostgreSQL, etc.)

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.