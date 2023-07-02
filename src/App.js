import './App.css';
import { Layout } from './Layout';
import { Route, Routes } from 'react-router';
import { Dashboard } from './Dashboard';
import { Quartet } from './Quartet';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Layout>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />}>
            </Route>
            <Route path="/quartet/:id" element={<Quartet />} />
          </Routes>
        </BrowserRouter>
      </Layout>
    </div>
  );
}

export default App;
