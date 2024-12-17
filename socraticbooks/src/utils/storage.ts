// src/utils/storage.ts
import { storage, firestore } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

export const uploadChapterFile = async (
  userId: string,
  chapterId: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const fileId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const storagePath = `users/${userId}/chapters/${chapterId}/files/${fileId}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(storageRef);
          
          // Save metadata to Firestore
          const fileDoc = await addDoc(collection(firestore, 'files'), {
            id: fileId,
            chapterId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            storageUrl: storagePath,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId
          });

          resolve({
            id: fileId,
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size
          });
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

export const deleteChapterFile = async (userId: string, fileId: string) => {
  try {
    // Get file document from Firestore
    const filesRef = collection(firestore, 'files');
    const q = query(filesRef, where('id', '==', fileId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('File not found');
    }

    const fileDoc = querySnapshot.docs[0];
    const fileData = fileDoc.data();

    // Delete from Storage
    const storageRef = ref(storage, fileData.storageUrl);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(fileDoc.ref);

  } catch (error) {
    throw error;
  }
};