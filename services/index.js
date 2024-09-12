import { db } from '@/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

export const saveInterviewAnswers = async (data, jobId, userId) => {
  try {
    // Referencia al documento del usuario en la colección 'students'
    const userCollection = doc(db, 'students', userId);

    const userDoc = await getDoc(userCollection);

    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Obtiene los trabajos del usuario
    const userJobs = userDoc.data().jobs || [];

    // Busca el índice del trabajo que coincide con jobId
    const jobIndex = userJobs.findIndex((job) => job.id === Number(jobId));
    console.log(jobIndex);

    if (jobIndex === -1) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    // Agrega la información de 'data' al campo 'interview' del trabajo correspondiente
    userJobs[jobIndex].interview = data;
    userJobs[jobIndex].statusStepFive = 'success';

    // Actualiza el documento del usuario con los trabajos modificados
    await updateDoc(userCollection, {
      jobs: userJobs,
    });

    return true;
  } catch (error) {
    console.error('Error saving interview answers:', error);
    throw new Error(`Error saving interview answers: ${error.message}`);
  }
};
