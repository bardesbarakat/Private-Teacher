export interface Course {
    id: number;
    title: string;
    description: string;
    duration: string;
    instructor: string;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    enrolledCourses: number[];
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}