import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Header />
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/courses" component={Courses} />
                </Switch>
                <Footer />
            </div>
        </Router>
    );
};

export default App;