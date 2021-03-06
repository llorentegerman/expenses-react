import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ProvideExpenses } from './logic/useExpenses';
import MainComponent from './pages/MainComponent';
import './App.css';

const whyDidYouRender = require('@welldone-software/why-did-you-render');
whyDidYouRender(React);

class App extends React.Component {
    componentDidMount() {
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    resize = () => this.forceUpdate();

    render() {
        return (
            <ProvideExpenses>
                <Router basename={`/${process.env.REACT_APP_basename || ''}`}>
                    <MainComponent />
                </Router>
            </ProvideExpenses>
        );
    }
}

export default App;
