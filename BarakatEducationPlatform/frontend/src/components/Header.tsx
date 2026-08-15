import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Assuming you have a CSS file for styling

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">
                <h1>Barakat Education Platform</h1>
            </div>
            <nav className="navbar">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/courses">Courses</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;