import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home: React.FC = () => {
    return (
        <div>
            <Header />
            <main>
                <h1>Welcome to Barakat Education Platform</h1>
                <p>Your journey to knowledge starts here. Explore our courses and enhance your skills.</p>
            </main>
            <Footer />
        </div>
    );
};

export default Home;