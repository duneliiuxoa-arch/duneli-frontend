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
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {/* Mode Toggle */}
      <div className={`${theme.cardStyle} rounded-full p-1 flex items-center gap-1 flex-shrink-0`}>
        <button
          onClick={() => onModeChange('interest')}
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full transition-all text-sm ${
            mode === 'interest' ? theme.buttonClass : 'hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Interest</span>
          </div>
        </button>
        <button
          onClick={() => onModeChange('categories')}
          className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full transition-all text-sm ${
            mode === 'categories' ? theme.buttonClass : 'hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Categories</span>
          </div>
        </button>
      </div>

      {/* Category Filter (visible when Categories mode is active) */}
      {mode === 'categories' && (
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`${theme.cardStyle} rounded-full px-4 py-2 sm:px-6 flex items-center gap-2 hover:scale-105 transition-transform text-sm sm:text-base`}
          >
            <span>{selectedCategory}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full mt-2 ${theme.cardStyle} rounded-xl overflow-hidden z-40 min-w-[160px]`}
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      selectedCategory === category ? theme.buttonClass : ''
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
      <div className="relative" ref={languageRef}>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className={`${theme.cardStyle} rounded-full px-4 py-2 sm:px-6 flex items-center gap-2 hover:scale-105 transition-transform text-sm sm:text-base`}
        >
          <Globe className="w-4 h-4" />
          <span>{selectedLanguage}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showLanguageDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 ${theme.cardStyle} rounded-xl overflow-hidden z-40 min-w-[160px]`}
            >
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => {
                    onLanguageChange(language);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                    selectedLanguage === language ? theme.buttonClass : ''
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
      <div className="relative ml-auto" ref={sortRef}>
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className={`${theme.cardStyle} rounded-full px-4 py-2 sm:px-6 flex items-center gap-1.5 sm:gap-2 hover:scale-105 transition-transform text-sm sm:text-base`}
        >
          <span className="hidden sm:inline text-sm opacity-70">Sort:</span>
          <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showSortDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 top-full mt-2 ${theme.cardStyle} rounded-xl overflow-hidden z-40 min-w-[180px]`}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                    sortBy === option.value ? theme.buttonClass : ''
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
