import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState} from 'react';
import Home from './components/home/Home';
import PrivateRoute from './PrivateRoute';
import Login from './components/Login/Login';

function App() {

  const [token, setToken] = useState<string>('')

  const updateToken = (token: string) => {
    setToken(token)
  }

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" Component={(props) => <Login {...props} updateToken={updateToken} />} />
          <Route path='/home'
          element={
          <PrivateRoute>
           <Home />
          </PrivateRoute>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
