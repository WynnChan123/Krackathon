import './App.css';
// eslint-disable-next-line no-unused-vars
import { supabase } from './services/supabaseClient';

function App() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-red-500">
        Tailwind Working
      </h1>
    </div>
  );
}

export default App;
