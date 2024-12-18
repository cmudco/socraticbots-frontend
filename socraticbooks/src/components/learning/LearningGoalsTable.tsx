type LearningGoal = {
  id: string;
  text: string;
  display_order: number;
};

type LearningGoalsTableProps = {
  goals: LearningGoal[];
};

const LearningGoalsTable = ({ goals }: LearningGoalsTableProps) => {
  return (
    <div className="w-64 bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Learning Goals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left text-sm font-medium text-gray-500">Goal</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Coverage</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Mastery</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div 
                    className="cursor-help relative group"
                    title={goal.text} // Basic HTML tooltip
                  >
                    LG{goal.display_order}
                  </div>
                </td>
                <td className="p-3 text-center">-</td>
                <td className="p-3 text-center">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LearningGoalsTable;