// src/components/modals/CreateBookModal.tsx
import React, { useState } from 'react';
import { 
    Modal, 
    Box, 
    Typography, 
    TextField, 
    Button 
} from '@mui/material';

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

interface CreateBookModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string) => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({ open, onClose, onSubmit }) => {
    const [newBook, setNewBook] = useState({ title: '', description: '' });

    const handleSubmit = () => {
        onSubmit(newBook.title, newBook.description);
        setNewBook({ title: '', description: '' }); // Reset form
    };

    const handleClose = () => {
        setNewBook({ title: '', description: '' }); // Reset form
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
        >
            <Box sx={modalStyle}>
                <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Create New Book
                </Typography>
                <TextField
                    fullWidth
                    label="Title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!newBook.title || !newBook.description}
                    >
                        Create
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreateBookModal;
