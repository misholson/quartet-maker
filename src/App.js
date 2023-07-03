import './App.css';
import { Layout } from './Layout';
import { Route, Routes } from 'react-router';
import { Dashboard } from './Dashboard';
import { Quartet } from './Quartet';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SongEdit } from './Manage/SongEdit';

const queryClient = new QueryClient();
function App() {
  return (
    <div className="App">
      <Layout>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />}>
              </Route>
              <Route path="/quartet/:id" element={<Quartet />} />
              <Route path="/join-quartet" element={<>Join</>} />
              <Route path="/create-quartet" element={<>Create</>} />
              <Route path="/manage-arrangers" element={<>Manage Arrangers</>} />
              <Route path="/manage-songs" element={<SongEdit />} />
              <Route path="/manage-arrangements" element={<>Manage Arrangements</>} />
              <Route path="/manage-users" element={<>Manage Users</>} />
            </Routes>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Layout>
    </div>
  );
}

export default App;
