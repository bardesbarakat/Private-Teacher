import React, { useEffect, useState } from 'react';

const Courses: React.FC = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/courses');
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div>
            <h1>Available Courses</h1>
            <ul>
                {courses.map(course => (
                    <li key={course.id}>
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Courses;