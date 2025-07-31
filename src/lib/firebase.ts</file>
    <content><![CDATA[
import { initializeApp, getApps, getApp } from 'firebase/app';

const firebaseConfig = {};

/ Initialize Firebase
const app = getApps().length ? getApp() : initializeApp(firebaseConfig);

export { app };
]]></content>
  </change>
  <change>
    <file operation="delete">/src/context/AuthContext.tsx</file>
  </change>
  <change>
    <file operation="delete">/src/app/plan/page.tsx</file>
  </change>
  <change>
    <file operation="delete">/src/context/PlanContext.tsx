import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };