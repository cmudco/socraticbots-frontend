// src/components/chapter/Files.tsx
import { useState, useEffect } from 'react';
import { DareFile, getFiles, getFileTags } from '../../services/filesService';

interface FilesProps {
    chapterId: string;
    selectedFiles: string[];
    selectedTags: string[];
    onFileSelect: (fileIds: string[]) => void;
    onTagSelect: (tags: string[]) => void;
}

const Files: React.FC<FilesProps> = ({ 
    chapterId, 
    selectedFiles, 
    selectedTags, 
    onFileSelect, 
    onTagSelect 
}) => {
    const [files, setFiles] = useState<DareFile[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [filesData, tagsData] = await Promise.all([
                    getFiles(),
                    getFileTags()
                ]);
                setFiles(filesData);
                setTags(tagsData);
                setError(null);
            } catch (err) {
                setError('Failed to load files and tags');
                console.error('Error loading files and tags:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (false) { console.log(chapterId); } // Placeholder to prevent unused variable error

    const handleTagSelect = (e: React.MouseEvent, tag: string) => {
        e.preventDefault();
        e.stopPropagation();
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        onTagSelect(newTags);
    };

    const handleFileSelect = (fileId: string) => {
        const newFiles = selectedFiles.includes(fileId)
            ? selectedFiles.filter(f => f !== fileId)
            : [...selectedFiles, fileId];
        onFileSelect(newFiles);
    };

    const filteredFiles = files.filter(file => 
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-4">Loading files...</div>;
    }

    if (error) {
        return <div className="text-red-600 py-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-socratic focus:border-socratic"
                />

                {/* Tags selection */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                onClick={(e) => handleTagSelect(e, tag)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                                    selectedTags.includes(tag)
                                        ? 'bg-socratic text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Files list */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Files</h4>
                    <div className="space-y-2">
                        {filteredFiles.map(file => (
                            <div
                                key={file.file_id}
                                onClick={() => handleFileSelect(file.file_id)}
                                className={`p-4 border rounded cursor-pointer transition-colors duration-200 ${
                                    selectedFiles.includes(file.file_id)
                                        ? 'bg-socratic/10 border-socratic'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{file.file_name}</div>
                                        <div className="text-sm text-gray-500">
                                            {(file.file_size / 1024).toFixed(1)} KB • {file.file_type}
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border ${
                                        selectedFiles.includes(file.file_id)
                                            ? 'bg-socratic border-socratic'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedFiles.includes(file.file_id) && (
                                            <div className="w-full h-full text-white flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredFiles.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                No files found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Files;
