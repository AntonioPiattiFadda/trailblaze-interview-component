// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyDJjWY_ufRsblh64DX3XI_P1a3zQ-3YbsU',
  authDomain: 'trailblaze-careers-23e93.firebaseapp.com',
  projectId: 'trailblaze-careers-23e93',
  storageBucket: 'trailblaze-careers-23e93.appspot.com',
  messagingSenderId: '595953322479',
  appId: '1:595953322479:web:3c67c819118d6332554e1a',
  measurementId: 'G-VHWGT668NG',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
