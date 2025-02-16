const API_BASE_URL = 'https://dare.hss.cmu.edu/api/socratic-books';


export async function verifyAccessCode(accessCode: string): Promise<{
    valid: boolean;
    contact_andrew?: string;
    description?: string;
    affiliation?: string;  // ADD THIS
    message?: string;
}> {
    const response = await fetch(`${API_BASE_URL}/access-codes/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_code: accessCode }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

export async function createUserRecord(uid: string, email: string, accessCode: string, affiliation: string) {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            uid, 
            email, 
            access_code: accessCode,
            affiliation: affiliation  // Pass the affiliation we got from verify
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create user record');
    }

    return response.json();
}


