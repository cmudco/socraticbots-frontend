import { storage, firestore } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

const readFileContent = async (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (file.type.includes('image/')) {
      reject(new Error('Image files cannot be vectorized'));
      return;
    }

    try {
      if (file.type === 'application/pdf') {
        // Handle PDFs by sending to our backend
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${API_BASE_URL}/api/socratic-books/files/process-pdf`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error('Failed to process PDF');
        }

        const data = await response.json();
        resolve(data.text);
      } else {
        // Handle text files as before
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const vectorizeFile = async (
  fileId: string,
  fileName: string,
  content: string,
  chapterId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/socratic-books/files/${fileId}/vectorize?userId=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          fileName,
          chapterId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to vectorize file');
    }
  } catch (error) {
    console.error('Vectorization error:', error);
    throw error;
  }
};

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
    let fileContent: string | null = null;
    try {
      fileContent = await readFileContent(file);
    } catch (error) {
      console.warn('Could not read file content for vectorization:', error);
    }

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
          try {
            const downloadURL = await getDownloadURL(storageRef);

            // Save metadata to Firestore and get the document reference
            const docRef = await addDoc(collection(firestore, 'files'), {
              id: fileId,
              chapterId,
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              storageUrl: storagePath,
              createdAt: new Date(),
              updatedAt: new Date(),
              userId,
              vectorized: false
            });

            if (fileContent) {
              try {
                await vectorizeFile(fileId, file.name, fileContent, chapterId, userId);
                // Update vectorization status using the document reference
                await updateDoc(docRef, { vectorized: true });
              } catch (vectorizeError) {
                console.error('Failed to vectorize file:', vectorizeError);
              }
            }

            resolve({
              id: fileId,
              name: file.name,
              url: downloadURL,
              type: file.type,
              size: file.size,
              vectorized: fileContent !== null
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

export const deleteChapterFile = async (userId: string, fileId: string) => {
  try {
    // Get the file data from Firestore
    const filesRef = collection(firestore, 'files');
    const q = query(filesRef, where('id', '==', fileId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('File not found');
    }

    const fileDoc = querySnapshot.docs[0];
    const fileData = fileDoc.data();

    // Delete from Firebase Storage
    const storageRef = ref(storage, fileData.storageUrl);
    await deleteObject(storageRef);

    // If the file was vectorized, delete from Pinecone
    if (fileData.vectorized) {
      try {
        await fetch(
          `${API_BASE_URL}/api/socratic-books/files/${fileId}/delete-vectors?userId=${userId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              chapterId: fileData.chapterId,
            }),
          }
        );
      } catch (error) {
        console.error('Failed to delete from vector database:', error);
      }
    }

    // Delete from Firestore
    await deleteDoc(fileDoc.ref);
  } catch (error) {
    throw error;
  }
};