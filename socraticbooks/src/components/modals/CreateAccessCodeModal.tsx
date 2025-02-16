import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    FormControlLabel, 
    Checkbox,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CreateAccessCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        access_code: string;
        description: string;
        is_active: boolean;
        contact_andrew?: string;
    }) => void;
    onGenerateCode: () => string;
}

const CreateAccessCodeModal: React.FC<CreateAccessCodeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onGenerateCode
}) => {
    const [accessCode, setAccessCode] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [contactAndrew, setContactAndrew] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            access_code: accessCode,
            description,
            is_active: isActive,
            contact_andrew: contactAndrew || undefined
        });
        handleClose();
    };

    const handleGenerateCode = () => {
        setAccessCode(onGenerateCode());
    };

    const handleClose = () => {
        setAccessCode('');
        setDescription('');
        setIsActive(true);
        setContactAndrew('');
        onClose();
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Create New Access Code
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <TextField
                            label="Access Code"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            required
                            fullWidth
                        />
                        <Button 
                            variant="outlined" 
                            onClick={handleGenerateCode}
                            style={{ minWidth: '120px' }}
                        >
                            Generate
                        </Button>
                    </div>

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                    />

                    <TextField
                        label="Contact Andrew (Optional)"
                        value={contactAndrew}
                        onChange={(e) => setContactAndrew(e.target.value)}
                        fullWidth
                        margin="normal"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Active"
                        style={{ marginTop: '8px' }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={!accessCode.trim() || !description.trim()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateAccessCodeModal;
