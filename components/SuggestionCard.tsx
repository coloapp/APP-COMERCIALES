import React from 'react';

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  content: string | null;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, content }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-start space-x-4 h-full">
      <div className="flex-shrink-0 text-cyan-500">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-gray-600 text-sm mt-1">{content || '...'}</p>
      </div>
    </div>
  );
};

export default SuggestionCard;