'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { FaChevronDown, FaChevronUp, FaSlidersH, FaTimes } from 'react-icons/fa';

interface CategoryWithTags {
  category: string;
  tags: string[];
}

interface ProductFilterProps {
  categoryTagArray: CategoryWithTags[];
}

export default function ProductFilter({ categoryTagArray }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const activeTags = searchParams.getAll('tags');

  const handleTagClick = (tag: string) => {
    const currentTags = searchParams.getAll('tags');
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (currentTags.includes(tag)) {
      newSearchParams.delete('tags');
      currentTags.filter(t => t !== tag).forEach(t => newSearchParams.append('tags', t));
    } else {
      newSearchParams.append('tags', tag);
    }

    newSearchParams.delete('page');
    newSearchParams.set('page', '1');

    if (currentPath === '/') {
      router.push(`/products?${newSearchParams.toString()}`);
    } else {
      router.replace(`?${newSearchParams.toString()}`);
    }
  };

  const handleClearAll = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('tags');
    newSearchParams.delete('page');
    newSearchParams.set('page', '1');

    if (currentPath === '/') {
      router.push(`/products?${newSearchParams.toString()}`);
    } else {
      router.replace(`?${newSearchParams.toString()}`);
    }
  };

  return (
    <Suspense>
      <div className="w-full">
        {/* Top bar: search + filter toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchBar />
          </div>

          <button
            onClick={() => setFiltersOpen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-accent bg-secondary hover:bg-accent hover:text-white transition-colors font-semibold"
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            <FaSlidersH className="h-4 w-4" />
            <span>Filters</span>
            {activeTags.length > 0 && (
              <span className="bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeTags.length}
              </span>
            )}
            {filtersOpen ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />}
          </button>

          {activeTags.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-accent text-sm hover:bg-accent hover:text-white transition-colors"
              aria-label="Clear all filters"
            >
              <FaTimes className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Active tag pills summary (always visible) */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
              >
                {tag.replace(/-/g, ' ')}
                <FaTimes className="h-3 w-3 ml-1" />
              </button>
            ))}
          </div>
        )}

        {/* Collapsible filter panel */}
        <div
          id="filter-panel"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            filtersOpen ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Desktop: bento grid */}
          <div className="hidden md:grid grid-cols-4 gap-4 pt-1">
            {categoryTagArray.map(({ category, tags }) => {
              const sortedTags = [...tags].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: 'base' })
              );
              return (
                <div key={category} className="rounded-xl p-4 shadow-sm bg-secondary">
                  <h4 className="font-bold mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {sortedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 rounded border text-sm transition-colors ${
                          activeTags.includes(tag)
                            ? 'bg-accent border-accent text-white hover:bg-accent/90'
                            : 'border-accent hover:bg-accent hover:text-white'
                        }`}
                      >
                        {tag.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: accordion */}
          <div className="md:hidden space-y-2 pt-1">
            {categoryTagArray.map(({ category, tags }) => {
              const sortedTags = [...tags].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: 'base' })
              );
              const isExpanded = expandedCategory === category;
              return (
                <div
                  key={category}
                  className="border border-primary rounded-xl overflow-hidden bg-secondary"
                >
                  <button
                    className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
                    onClick={() => setExpandedCategory(prev => (prev === category ? null : category))}
                    aria-expanded={isExpanded}
                    aria-controls={`panel-${category}`}
                  >
                    {category}
                    {isExpanded ? (
                      <FaChevronUp className="h-3 w-3" />
                    ) : (
                      <FaChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  {isExpanded && (
                    <div id={`panel-${category}`} className="px-4 pb-4 flex flex-wrap gap-2">
                      {sortedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className={`px-3 py-1 rounded border text-sm transition-colors ${
                            activeTags.includes(tag)
                              ? 'bg-accent border-accent text-white hover:bg-accent/90'
                              : 'border-accent hover:bg-accent hover:text-white'
                          }`}
                        >
                          {tag.replace(/-/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Suspense>
  );
}