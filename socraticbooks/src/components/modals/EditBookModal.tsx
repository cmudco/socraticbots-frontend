// src/components/modals/EditBookModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField } from '@mui/material';
import { Book } from '../../services/booksService';

interface EditBookModalProps {
    open: boolean;
    book: Book | null;
    onClose: () => void;
    onSubmit: (bookId: string, title: string, description: string) => Promise<void>;
}

const EditBookModal: React.FC<EditBookModalProps> = ({ open, book, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (book) {
            setTitle(book.title);
            setDescription(book.description);
        }
    }, [book]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (book && title.trim() && description.trim()) {
            await onSubmit(book.id, title.trim(), description.trim());
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="edit-book-modal"
        >
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl mb-4">Edit Book</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mb-4"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        multiline
                        rows={4}
                        className="mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-socratic text-socratic-fontlight rounded hover:bg-socratic-dark"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default EditBookModal;
