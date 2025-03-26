import { database } from '../firebase';
import { ref, set, onValue, off, DatabaseReference } from 'firebase/database';

// Create or update a text session
export const updateTextSession = async (sessionId: string, text: string): Promise<void> => {
  try {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    await set(sessionRef, {
      content: text,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating text session:', error);
    throw error;
  }
};

// Subscribe to text changes
export const subscribeToSession = (
  sessionId: string, 
  callback: (text: string) => void
): DatabaseReference => {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.content !== undefined) {
      callback(data.content);
    } else {
      // Initialize empty session if it doesn't exist
      updateTextSession(sessionId, '');
      callback('');
    }
  });

  return sessionRef;
};

// Unsubscribe from text changes
export const unsubscribeFromSession = (sessionRef: DatabaseReference): void => {
  off(sessionRef);
}; 