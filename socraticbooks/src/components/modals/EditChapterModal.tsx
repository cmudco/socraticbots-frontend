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
    onSubmit: (chapterId: string, data: {
        title: string;
        subject: string;
        topic: string;
        greeting?: string;
        teaching_style?: string;
        qa_instructions?: string;
        restrictions?: string;
    }) => void;
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
    const [greeting, setGreeting] = useState('');
    const [teachingStyle, setTeachingStyle] = useState('');
    const [qaInstructions, setQaInstructions] = useState('');
    const [restrictions, setRestrictions] = useState('');

    // Log when props change
    useEffect(() => {
        console.log('Modal props changed:', { open, chapter });
    }, [open, chapter]);

    // Update state when chapter changes
    useEffect(() => {
        console.log('Setting values from chapter:', chapter);
        if (chapter) {
            setTitle(chapter.title || '');
            setSubject(chapter.subject || '');
            setTopic(chapter.topic || '');
            setGreeting(chapter.greeting || '');
            setTeachingStyle(chapter.teaching_style || '');
            setQaInstructions(chapter.qa_instructions || '');
            setRestrictions(chapter.restrictions || '');
        }
    }, [chapter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting with values:', {
            title,
            subject,
            topic,
            greeting,
            teachingStyle,
            qaInstructions,
            restrictions
        });
        if (chapter) {
            onSubmit(chapter.id, {
                title,
                subject,
                topic,
                greeting,
                teaching_style: teachingStyle,
                qa_instructions: qaInstructions,
                restrictions
            });
        }
    };

    const handleClose = () => {
        console.log('Closing modal and resetting values');
        setTitle('');
        setSubject('');
        setTopic('');
        setGreeting('');
        setTeachingStyle('');
        setQaInstructions('');
        setRestrictions('');
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            TransitionProps={{
                onEnter: () => {
                    console.log('Dialog entering with chapter:', chapter);
                }
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Chapter</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 mt-4">
                        <TextField
                            label="Title"
                            fullWidth
                            value={title}
                            onChange={(e) => {
                                console.log('Title changed to:', e.target.value);
                                setTitle(e.target.value);
                            }}
                            required
                        />
                        <TextField
                            label="Subject"
                            fullWidth
                            value={subject}
                            onChange={(e) => {
                                console.log('Subject changed to:', e.target.value);
                                setSubject(e.target.value);
                            }}
                        />
                        <TextField
                            label="Topic"
                            fullWidth
                            value={topic}
                            onChange={(e) => {
                                console.log('Topic changed to:', e.target.value);
                                setTopic(e.target.value);
                            }}
                        />
                        <TextField
                            label="Greeting"
                            fullWidth
                            multiline
                            rows={4}
                            value={greeting}
                            onChange={(e) => {
                                console.log('Greeting changed to:', e.target.value);
                                setGreeting(e.target.value);
                            }}
                        />
                        <TextField
                            label="Teaching Style"
                            fullWidth
                            multiline
                            rows={4}
                            value={teachingStyle}
                            onChange={(e) => {
                                console.log('Teaching Style changed to:', e.target.value);
                                setTeachingStyle(e.target.value);
                            }}
                        />
                        <TextField
                            label="QA Instructions"
                            fullWidth
                            multiline
                            rows={4}
                            value={qaInstructions}
                            onChange={(e) => {
                                console.log('QA Instructions changed to:', e.target.value);
                                setQaInstructions(e.target.value);
                            }}
                        />
                        <TextField
                            label="Restrictions"
                            fullWidth
                            multiline
                            rows={4}
                            value={restrictions}
                            onChange={(e) => {
                                console.log('Restrictions changed to:', e.target.value);
                                setRestrictions(e.target.value);
                            }}
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
                        disabled={!title}
                    >
                        Save Changes
                    </button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditChapterModal;
