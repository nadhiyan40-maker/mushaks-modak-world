import React, { useState, useMemo } from 'react';
import { X, Trophy, Medal, Search, Filter, School, Flame, Sparkles } from 'lucide-react';
import { LeaderboardEntry, GameMode } from '../types';
import { getLeaderboard, CAMPUS_LIST } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  userCampus: string;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentMode,
  userCampus,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>(currentMode);
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = useMemo(() => {
    return getLeaderboard();
  }, [isOpen]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedMode !== 'all' && entry.gameMode !== selectedMode) return false;
      if (selectedCampus !== 'all' && entry.campus !== selectedCampus) return false;
      if (
        searchQuery &&
        !entry.playerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.campus.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [entries, selectedMode, selectedCampus, searchQuery]);

  if (!isOpen) return null;

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'mushak_quest':
        return "Mushak's Modak Quest";
      case 'dhol_rhythm':
        return 'Dhol Tasha Rhythm';
      case 'eco_murti':
        return 'Eco Murti Maker';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF6F0] border-2 border-[#E2CBA6] rounded-2xl shadow-2xl overflow-hidden my-6 text-[#4A403B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5A1830] to-[#7D2943] p-5 text-white flex items-center justify-between border-b-2 border-[#E2CBA6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-amber-200">
                Cross-Campus Leaderboard
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/80">
                Real-time rankings across participating universities & colleges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-[#F4ECE2] border-b border-[#E2CBA6] space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Game Mode Pill */}
            <div className="flex bg-white/80 rounded-lg p-1 border border-[#E2CBA6] text-xs font-semibold">
              <button
                onClick={() => setSelectedMode('all')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedMode === 'all'
                    ? 'bg-[#852C48] text-white shadow-xs'
                    : 'text-[#5A4D46] hover:bg-[#FAF6F0]'
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => setSelectedMode('mushak_quest')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedMode === 'mushak_quest'
                    ? 'bg-[#852C48] text-white shadow-xs'
                    : 'text-[#5A4D46] hover:bg-[#FAF6F0]'
                }`}
              >
                Mushak Quest
              </button>
              <button
                onClick={() => setSelectedMode('dhol_rhythm')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedMode === 'dhol_rhythm'
                    ? 'bg-[#852C48] text-white shadow-xs'
                    : 'text-[#5A4D46] hover:bg-[#FAF6F0]'
                }`}
              >
                Dhol Rhythm
              </button>
              <button
                onClick={() => setSelectedMode('eco_murti')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedMode === 'eco_murti'
                    ? 'bg-[#852C48] text-white shadow-xs'
                    : 'text-[#5A4D46] hover:bg-[#FAF6F0]'
                }`}
              >
                Eco Murti
              </button>
            </div>

            {/* Campus Select Filter */}
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-[#E2CBA6] text-xs font-medium ml-auto">
              <School className="w-3.5 h-3.5 text-[#852C48]" />
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="bg-transparent border-none outline-hidden text-[#4A403B] cursor-pointer"
              >
                <option value="all">All Campuses</option>
                {CAMPUS_LIST.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#776B64] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student or campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-[#E2CBA6] text-sm text-[#4A403B] placeholder:text-[#776B64] focus:outline-hidden focus:ring-2 focus:ring-[#852C48]"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 text-[#776B64]">
              <Trophy className="w-12 h-12 mx-auto text-[#E2CBA6] mb-2" />
              <p className="font-semibold text-[#5A4D46]">No entries match your search</p>
              <p className="text-xs text-[#776B64] mt-1">Play any game round to register your campus on the board!</p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isUserCampus = entry.campus === userCampus;
              const isTop3 = idx < 3;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    idx === 0
                      ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                      : idx === 1
                      ? 'bg-stone-50 border-stone-300'
                      : idx === 2
                      ? 'bg-orange-50/60 border-orange-200'
                      : 'bg-white border-[#E2CBA6]/60 hover:bg-[#FAF6F0]'
                  } ${isUserCampus ? 'ring-1 ring-[#852C48]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-800'
                          : idx === 2
                          ? 'bg-amber-700/80 text-amber-100'
                          : 'bg-[#F4ECE2] text-[#776B64]'
                      }`}
                    >
                      {idx === 0 ? <Medal className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#4A403B]">
                          {entry.playerName}
                        </span>
                        {isUserCampus && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#852C48] text-white font-medium">
                            Your Campus
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#776B64]">
                        <span>{entry.campus}</span>
                        <span>•</span>
                        <span className="text-[#852C48] font-medium">{getModeLabel(entry.gameMode)}</span>
                        {entry.levelReached && (
                          <span>• Stage {entry.levelReached}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-[#5A1830]">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#776B64]">
                      {entry.metricLabel}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4ECE2] border-t border-[#E2CBA6] flex items-center justify-between text-xs text-[#776B64]">
          <div>
            Contest Rule: Best verified score per student/campus appears on global ranking.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold bg-[#852C48] text-white rounded-lg hover:bg-[#6E2340] transition"
          >
            Back to Arena
          </button>
        </div>
      </div>
    </div>
  );
};
