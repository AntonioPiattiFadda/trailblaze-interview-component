import { db } from '@/firebaseConfig';
import { collection, getDoc, doc, updateDoc } from 'firebase/firestore';

export const saveInterviewAnswers = async (data, jobId, userId) => {
  try {
    // Referencia al documento del usuario en la colección 'students'
    const userCollection = collection(db, 'students');
    console.log(userId, JobId);

    const userRef = doc(userCollection, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Obtiene los trabajos del usuario
    const userJobs = userDoc.data().jobs || [];

    // Busca el índice del trabajo que coincide con jobId
    const jobIndex = userJobs.findIndex((job) => job.id === jobId);

    if (jobIndex === -1) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    // Agrega la información de 'data' al campo 'interview' del trabajo correspondiente
    userJobs[jobIndex].interview = data;

    // Actualiza el documento del usuario con los trabajos modificados
    await updateDoc(userDocRef, {
      jobs: userJobs,
    });

    console.log('Interview data saved successfully!');
  } catch (error) {
    console.error('Error saving interview answers:', error);
    // Corrige la manera de lanzar el error
    throw new Error(`Error saving interview answers: ${error.message}`);
  }
};
