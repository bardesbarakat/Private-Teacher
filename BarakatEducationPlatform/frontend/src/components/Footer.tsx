import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{ backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center' }}>
            <p>&copy; {new Date().getFullYear()} Barakat Education Platform. All rights reserved.</p>
            <p>
                Follow us on 
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"> Facebook</a>, 
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"> Twitter</a>, and 
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"> Instagram</a>.
            </p>
        </footer>
    );
};

export default Footer;