import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAv0DdodGF8SPM1nfFjiojEWAwA-2IBz5w',
  authDomain: 'multiplay-62301.firebaseapp.com',
  databaseURL:
    'https://multiplay-62301-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'multiplay-62301',
  storageBucket: 'multiplay-62301.appspot.com',
  messagingSenderId: '376046444192',
  appId: '1:376046444192:web:a32a4033c84506dcf6b3c5',
  measurementId: 'G-LRQYX9PG33',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const user = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (userFirebase) => {
        unsubscribe();
        resolve(userFirebase);
      },
      reject
    );
  });
};

export { db, auth, user };
