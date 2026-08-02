import { TrendingUp, Grid3x3, ChevronDown, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DiscoveryMode, Category, SortOption, Theme, Language } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';

interface DiscoveryControlsProps {
  currentTheme: Theme;
  mode: DiscoveryMode;
  onModeChange: (mode: DiscoveryMode) => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  selectedLanguage: Language | 'All';
  onLanguageChange: (language: Language | 'All') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const categories: (Category | 'All')[] = ['All', 'Geography', 'Politics', 'History', 'Sports', 'Technology', 'Environment'];
const languages: (Language | 'All')[] = ['All', 'English', 'Chinese', 'Spanish', 'French', 'German', 'Hindi'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'mostInterested', label: 'Most Interested' },
];

export function DiscoveryControls({
  currentTheme,
  mode,
  onModeChange,
  selectedCategory,
  onCategoryChange,
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
}: DiscoveryControlsProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Mode Toggle */}
      <div className={`rounded-full p-1 flex items-center gap-1 ${
        isDuneli
          ? 'bg-white border border-blue-100 shadow-sm'
          : `${theme.cardStyle}`
      }`}>
        <button
          onClick={() => onModeChange('interest')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === 'interest'
              ? isDuneli
                ? 'text-white shadow-md'
                : theme.buttonClass
              : isDuneli
                ? 'text-[#1A1A2E]/60 hover:bg-blue-50'
                : 'hover:bg-white/10'
          }`}
          style={mode === 'interest' && isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interest</span>
          </div>
        </button>
        <button
          onClick={() => onModeChange('categories')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === 'categories'
              ? isDuneli
                ? 'text-white shadow-md'
                : theme.buttonClass
              : isDuneli
                ? 'text-[#1A1A2E]/60 hover:bg-blue-50'
                : 'hover:bg-white/10'
          }`}
          style={mode === 'categories' && isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
        >
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-3.5 h-3.5" />
            <span>Categories</span>
          </div>
        </button>
      </div>

      {/* Category Filter (visible when Categories mode is active) */}
      {mode === 'categories' && (
        <div className="relative z-30" ref={categoryRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="bg-white/90 backdrop-blur-md border border-blue-100/80 shadow-sm rounded-full px-6 py-2.5 text-sm font-bold text-[#1A1A2E] flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
          >
            <span>{selectedCategory}</span>
            <ChevronDown className="w-4 h-4 text-[#3B5BF6]" />
          </button>

          <AnimatePresence>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-2xl rounded-2xl overflow-hidden z-40 min-w-[190px] p-1.5"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white font-extrabold shadow-md'
                        : 'text-[#1A1A2E] font-bold hover:bg-blue-50 hover:text-[#3B5BF6]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Language Filter */}
      <div className="relative z-30" ref={languageRef}>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="bg-white/90 backdrop-blur-md border border-blue-100/80 shadow-sm rounded-full px-6 py-2.5 text-sm font-bold text-[#1A1A2E] flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#7C3AED]" />
          <span>{selectedLanguage}</span>
          <ChevronDown className="w-4 h-4 text-[#7C3AED]" />
        </button>

        <AnimatePresence>
          {showLanguageDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-2xl rounded-2xl overflow-hidden z-40 min-w-[190px] p-1.5"
            >
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => {
                    onLanguageChange(language);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left rounded-xl text-xs transition-colors cursor-pointer ${
                    selectedLanguage === language
                      ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white font-extrabold shadow-md'
                      : 'text-[#1A1A2E] font-bold hover:bg-blue-50 hover:text-[#3B5BF6]'
                  }`}
                >
                  {language}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Dropdown */}
      <div className="relative ml-auto z-30" ref={sortRef}>
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="bg-white/90 backdrop-blur-md border border-blue-100/80 shadow-sm rounded-full px-6 py-2.5 text-sm font-bold text-[#1A1A2E] flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
        >
          <span className="text-xs text-[#1A1A2E]/60 font-semibold">Sort:</span>
          <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
          <ChevronDown className="w-4 h-4 text-[#F97316]" />
        </button>

        <AnimatePresence>
          {showSortDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 min-w-[190px] p-1.5"
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left rounded-xl text-xs transition-colors cursor-pointer ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white font-extrabold shadow-md'
                      : 'text-[#1A1A2E] font-bold hover:bg-blue-50 hover:text-[#3B5BF6]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
