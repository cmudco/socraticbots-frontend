// src/components/chat/ChatButton.tsx
import { useNavigate } from 'react-router-dom';

interface ChatButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  chapterId: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ chapterId, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    navigate(`/chapters/${chapterId}/chat`);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Start Chat
    </button>
  );
};

export default ChatButton;