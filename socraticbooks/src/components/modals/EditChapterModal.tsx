// src/components/modals/EditChapterModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { Chapter } from '../../services/chaptersService';

interface EditChapterModalProps {
    open: boolean;
    chapter: Chapter | null;
    onClose: () => void;
    onSubmit: (chapterId: string, title: string, subject: string, topic: string) => void;
}

const EditChapterModal: React.FC<EditChapterModalProps> = ({
    open,
    chapter,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');

    useEffect(() => {
        if (chapter) {
            setTitle(chapter.title);
            setSubject(chapter.subject);
            setTopic(chapter.topic);
        }
    }, [chapter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chapter) {
            onSubmit(chapter.id, title, subject, topic);
        }
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setSubject('');
        setTopic('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Chapter</DialogTitle>
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
                        Save Changes
                    </button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditChapterModal;
