const BASE_URL = 'https://dare.hss.cmu.edu/api/socratic-books';

export const getUserAffiliation = async (uid: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/users/${uid}`);
    const data = await response.json();
    return data.affiliation;
};