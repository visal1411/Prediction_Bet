import { sportTabCategories } from '../../data/mockData';

interface SportTabsProps {
  activeSport: string;
  onSportSelect: (sportId: string) => void;
}

export default function SportTabs({ activeSport, onSportSelect }: SportTabsProps) {
  return (
    <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
      <button
        onClick={() => onSportSelect('all')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium whitespace-nowrap transition-colors ${
          activeSport === 'all'
            ? 'bg-[var(--color-accent-blue)] text-white shadow-md'
            : 'bg-[var(--color-sidebar-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-white hover:bg-[var(--color-card-hover)]'
        }`}
      >
        <span className="text-lg">🔥</span>
        <span className="text-sm tracking-wide uppercase">All Sports</span>
      </button>
      {sportTabCategories.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onSportSelect(sport.id)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeSport === sport.id
              ? 'bg-[var(--color-accent-blue)] text-white shadow-md'
              : 'bg-[var(--color-sidebar-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-white hover:bg-[var(--color-card-hover)]'
          }`}
        >
          <span className="text-lg">{sport.icon}</span>
          <span className="text-sm tracking-wide uppercase">{sport.name}</span>
        </button>
      ))}
    </div>
  );
}
