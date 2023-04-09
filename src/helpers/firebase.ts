import {
 PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 PUBLIC_FIREBASE_STORAGE_BUCKET,
 PUBLIC_FIREBASE_AUTH_DOMAIN,
 PUBLIC_FIREBASE_PROJECT_ID,
 PUBLIC_FIREBASE_API_KEY,
 PUBLIC_FIREBASE_APP_ID,
} from '$env/static/public';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
 messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
 authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId: PUBLIC_FIREBASE_PROJECT_ID,
 apiKey: PUBLIC_FIREBASE_API_KEY,
 appId: PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { db, storage };

export default app;
