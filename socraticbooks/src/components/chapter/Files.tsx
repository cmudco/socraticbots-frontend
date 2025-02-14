// src/components/chapter/Files.tsx
interface FilesProps {
    chapterId: string;
}

const Files: React.FC<FilesProps> = ({ chapterId }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Files</h3>
                <button
                    type="button"
                    className="px-4 py-2 bg-socratic text-white rounded hover:bg-socratic-dark"
                >
                    Upload File
                </button>
            </div>
            
            <div className="text-center text-gray-500 py-8">
                File management coming soon...
            </div>
        </div>
    );
};

export default Files;
