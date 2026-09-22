import { useParams } from 'react-router-dom';

import StudentExamContent from './StudentExamContent';

export default function StudentExam() {
  const { id } = useParams<{ id: string }>();
  return <StudentExamContent key={id} />;
}
