
import React, { useState } from 'react';
import { FilmIcon, SparklesIcon, LinkIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface HeaderProps {
    onProjectCreate: (prompt: string, duration: number, youtubeUrl: string, pacing: 'standard' | 'fast') => Promise<void>;
    isLoading: boolean;
}

const PacingSelector: React.FC<{ value: 'standard' | 'fast', onChange: (value: 'standard' | 'fast') => void, disabled: boolean }> = ({ value, onChange, disabled }) => {
    const { t } = useLocalization();
    const activeClasses = "bg-blue-600 text-white shadow-md";
    const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

    return (
        <div className="flex items-center gap-3">
             <span className="text-sm font-semibold text-gray-700">{t('pacingTitle')}:</span>
            <div className="flex rounded-lg p-1 bg-gray-100 border border-gray-200">
                <button
                    type="button"
                    onClick={() => onChange('standard')}
                    disabled={disabled}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${value === 'standard' ? activeClasses : inactiveClasses}`}
                >
                    {t('pacingStandard')}
                </button>
                <button
                    type="button"
                    onClick={() => onChange('fast')}
                    disabled={disabled}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${value === 'fast' ? activeClasses : inactiveClasses}`}
                >
                    {t('pacingFast')}
                </button>
            </div>
        </div>
    );
};

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useLocalization();
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

    return (
        <div className="flex rounded-lg p-1 bg-gray-100 border border-gray-200">
            <button
                onClick={() => setLocale('ko')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${locale === 'ko' ? activeClasses : inactiveClasses}`}
            >
                KR
            </button>
            <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${locale === 'en' ? activeClasses : inactiveClasses}`}
            >
                EN
            </button>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onProjectCreate, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(15);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [pacing, setPacing] = useState<'standard' | 'fast'>('standard');
    const { t } = useLocalization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt.trim() && !youtubeUrl.trim()) || isLoading) return;
        await onProjectCreate(prompt, duration, youtubeUrl, pacing);
        // Do not clear inputs after submission to allow for easy tweaking
    };

    return (
        <header className="w-full p-4 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-lg shadow-md shrink-0">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-gray-900">
                        <FilmIcon />
                        <h1 className="text-2xl font-bold">{t('appTitle')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                         <button
                            type="submit"
                            disabled={isLoading || (!prompt.trim() && !youtubeUrl.trim())}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <SparklesIcon />
                            <span>{isLoading ? t('generating') : t('generate')}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative md:col-span-2 flex items-center bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                         <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('commercialIdeaPlaceholder')}
                            className="w-full bg-transparent p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                            disabled={isLoading}
                        />
                    </div>
                     <div className="relative flex items-center bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                         <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Math.max(3, parseInt(e.target.value, 10) || 3))}
                            className="w-full bg-transparent p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                            disabled={isLoading}
                            min="3"
                        />
                         <span className="absolute right-3 text-sm text-gray-500">{t('totalVideoDuration')}</span>
                    </div>
                </div>
                 <div className="relative flex items-center bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <LinkIcon />
                    </div>
                    <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder={t('youtubeUrlPlaceholder')}
                        className="w-full bg-transparent p-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                        disabled={isLoading}
                    />
                </div>
                 <div className="flex items-center justify-start">
                    <PacingSelector value={pacing} onChange={setPacing} disabled={isLoading} />
                </div>
            </form>
        </header>
    );
};

export default Header;