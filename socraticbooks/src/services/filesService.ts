import axios from 'axios';
import { getAuth } from 'firebase/auth';

const BASE_URL = 'https://dare.hss.cmu.edu/api';

export interface DareFile {
    id: number;
    file_id: string;
    user_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    download_url: string;
    storage_path: string;
    is_vectorized: boolean;
    created_at: string;
    updated_at: string;
}

export const getFiles = async (): Promise<DareFile[]> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const response = await axios.get(`${BASE_URL}/files`, {
        params: { userId: user.uid }
    });
    return response.data;
};

export const getFileTags = async (): Promise<string[]> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const response = await axios.get(`${BASE_URL}/files/tags/all`, {
        params: { userId: user.uid }
    });
    return response.data.tags;
};
