// src/components/modals/CreateChapterModal.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';

interface CreateChapterModalProps {
    open: boolean;
    bookId: string;
    onClose: () => void;
    onSubmit: (title: string, subject: string, topic: string) => void;
}

const CreateChapterModal: React.FC<CreateChapterModalProps> = ({
    open,
    bookId,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(title, subject, topic);
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setSubject('');
        setTopic('');
        onClose();
    };

    if (false) console.log(bookId);  // Prevent unused variable error

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Create New Chapter</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 mt-4">
                        <TextField
                            autoFocus
                            label="Title"
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <TextField
                            label="Subject"
                            fullWidth
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                        <TextField
                            label="Topic"
                            fullWidth
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                </DialogContent>
                <DialogActions className="p-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-socratic text-socratic-font-light rounded hover:bg-socratic-dark"
                        disabled={!title || !subject || !topic}
                    >
                        Create Chapter
                    </button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateChapterModal;
