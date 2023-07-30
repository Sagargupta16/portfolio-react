import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const App = () => {
  return (
    <BrowserRouter basename="/portfolio-react">
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
