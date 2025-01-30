import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate API call
  const simulateAPICall = async () => {
    try {
      setLoading(true);
      const response = await axios.get(process.env.REACT_APP_API_URL || 'https://api.example.com/data');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    simulateAPICall();
  }, []);

  const handleIncrement = () => setCount(prev => prev + 1);
  const handleDecrement = () => setCount(prev => prev - 1);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Submitted value: ${inputValue}`);
    setInputValue('');
  };

  return (
    <div className="App">
      <nav className="nav-bar">
        <h1>Jenkins Learning Platform</h1>
        <div className="nav-links">
          <a href="/docs">Documentation</a>
          <a href="/courses">Courses</a>
          <a href="/community">Community</a>
        </div>
      </nav>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="counter-container">
          <h2>Interactive Counter: {count}</h2>
          <div className="button-group">
            <button onClick={handleIncrement}>+</button>
            <button onClick={handleDecrement}>-</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter feedback"
          />
          <button type="submit">Submit</button>
        </form>

        {loading && <p className="status-message">Loading data...</p>}
        {error && <p className="error-message">{error}</p>}
        {data && (
          <div className="api-data">
            <h3>Latest Jenkins News:</h3>
            <p>{JSON.stringify(data)}</p>
          </div>
        )}

        <div className="cta-section">
          <a
            className="App-link"
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Jenkins Courses
          </a>
        </div>
      </header>

      <footer className="app-footer">
        <p>Application version: {process.env.REACT_APP_VERSION}</p>
        <p>© 2023 Jenkins Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;