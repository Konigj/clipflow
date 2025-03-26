import { useState, useEffect, useRef } from 'react'
import { 
  updateTextSession, 
  subscribeToSession, 
  unsubscribeFromSession 
} from './utils/realtimeDb';
import { DatabaseReference } from 'firebase/database';

function App() {
  const [text, setText] = useState('')
  const [isSyncing, setIsSyncing] = useState(false);
  const sessionRefValue = useRef<DatabaseReference | null>(null);
  const isLocalChange = useRef(false);
  
  // ID fijo para la única sesión compartida
  const SHARED_SESSION_ID = 'global-session';

  // Suscribirse a la única sesión compartida al cargar
  useEffect(() => {
    // Suscribirse a Firebase updates
    const handleRemoteChange = (newText: string) => {
      if (!isLocalChange.current) {
        setText(newText);
      }
      isLocalChange.current = false;
      setIsSyncing(false);
    };

    sessionRefValue.current = subscribeToSession(SHARED_SESSION_ID, handleRemoteChange);

    return () => {
      if (sessionRefValue.current) {
        unsubscribeFromSession(sessionRefValue.current);
        sessionRefValue.current = null;
      }
    };
  }, []);

  // Manejar cambios de texto
  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    setIsSyncing(true);
    isLocalChange.current = true;
    await updateTextSession(SHARED_SESSION_ID, newText);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600">
          ClipFlow
        </h1>
        
        <div className="flex items-center justify-between mb-6 bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm text-gray-300">
              {isSyncing ? 'Syncing...' : 'Connected'}
            </span>
          </div>
        </div>
        
        <div className="relative w-full">
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-96 p-4 rounded-lg bg-gray-800/70 backdrop-blur-sm border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none text-gray-100 placeholder-gray-400 shadow-xl"
            placeholder="Paste your text here..."
          />
        </div>
        
        <p className="text-gray-400 text-sm mt-4 text-center">
          Este texto se comparte con todos los que estén usando la aplicación en este momento.
        </p>
      </div>
    </div>
  )
}

export default App
