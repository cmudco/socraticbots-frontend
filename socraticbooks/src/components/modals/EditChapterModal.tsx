// src/components/modals/EditChapterModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import ReactQuill from 'react-quill'; // We'll use Quill for rich text editing
import 'react-quill/dist/quill.snow.css';
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

type AdvancedField = 'greeting' | 'teaching_style' | 'qa_instructions' | 'restrictions';

const EditChapterModal: React.FC<EditChapterModalProps> = ({
    open,
    chapter,
    onClose,
    onSubmit,
}) => {
    // Basic fields
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');

    // Advanced fields
    const [greeting, setGreeting] = useState('');
    const [teachingStyle, setTeachingStyle] = useState('');
    const [qaInstructions, setQaInstructions] = useState('');
    const [restrictions, setRestrictions] = useState('');

    // UI state
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedAdvancedField, setSelectedAdvancedField] = useState<AdvancedField>('greeting');

    useEffect(() => {
        if (chapter) {
            setTitle(chapter.title);
            setSubject(chapter.subject || '');
            setTopic(chapter.topic || '');
            setGreeting(chapter.greeting || '');
            setTeachingStyle(chapter.teaching_style || '');
            setQaInstructions(chapter.qa_instructions || '');
            setRestrictions(chapter.restrictions || '');
        }
    }, [chapter]);

    const getCurrentAdvancedValue = () => {
        switch (selectedAdvancedField) {
            case 'greeting': return greeting;
            case 'teaching_style': return teachingStyle;
            case 'qa_instructions': return qaInstructions;
            case 'restrictions': return restrictions;
            default: return '';
        }
    };

    const handleAdvancedValueChange = (value: string) => {
        switch (selectedAdvancedField) {
            case 'greeting': setGreeting(value); break;
            case 'teaching_style': setTeachingStyle(value); break;
            case 'qa_instructions': setQaInstructions(value); break;
            case 'restrictions': setRestrictions(value); break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Chapter</DialogTitle>
                <DialogContent>
                    <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
                        <Tab label="Basic Info" />
                        <Tab label="Advanced Settings" />
                    </Tabs>

                    {currentTab === 0 ? (
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
                            />
                            <TextField
                                label="Topic"
                                fullWidth
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 mt-4">
                            <FormControl fullWidth>
                                <InputLabel>Field to Edit</InputLabel>
                                <Select
                                    value={selectedAdvancedField}
                                    onChange={(e) => setSelectedAdvancedField(e.target.value as AdvancedField)}
                                >
                                    <MenuItem value="greeting">Greeting</MenuItem>
                                    <MenuItem value="teaching_style">Teaching Style</MenuItem>
                                    <MenuItem value="qa_instructions">QA Instructions</MenuItem>
                                    <MenuItem value="restrictions">Restrictions</MenuItem>
                                </Select>
                            </FormControl>
                            <ReactQuill
                                theme="snow"
                                value={getCurrentAdvancedValue()}
                                onChange={handleAdvancedValueChange}
                                className="h-64 mb-12" // Extra margin bottom for Quill toolbar
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="p-4">
                    <button
                        type="button"
                        onClick={onClose}
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
