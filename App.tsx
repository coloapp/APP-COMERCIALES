import React from 'react';
import type { Model } from './types';
import { VideoProducer } from './components/VideoProducer';
import { LocalizationProvider } from './hooks/useLocalization';

// Start with no pre-made models.
const INITIAL_MODELS: Model[] = [];

const App: React.FC = () => {
  return (
    <LocalizationProvider>
      <div className="h-screen w-screen bg-gray-100 flex flex-col font-sans overflow-hidden">
        <VideoProducer initialModels={INITIAL_MODELS} />
      </div>
    </LocalizationProvider>
  );
};

export default App;