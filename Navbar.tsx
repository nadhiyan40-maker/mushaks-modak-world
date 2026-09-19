import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Trophy, 
  FileText, 
  Sparkles, 
  User, 
  School,
  ChevronDown
} from 'lucide-react';
import { GameMode, PlayerProfile } from '../types';
import { soundEngine } from '../utils/audio';
import { CAMPUS_LIST, savePlayerProfile } from '../utils/storage';

interface Props {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playerProfile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onOpenGuidelines: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentMode,
  onSelectMode,
  playerProfile,
  onUpdateProfile,
  onOpenGuidelines,
  onOpenLeaderboard,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(playerProfile.name);
  const [tempCampus, setTempCampus] = useState(playerProfile.campus);

  const toggleSound = () => {
    const next = !playerProfile.soundEnabled;
    soundEngine.setMuted(!next);
    onUpdateProfile({ ...playerProfile, soundEnabled: next });
    if (next) soundEngine.playTempleBell();
  };

  const toggleMusic = () => {
    const next = !playerProfile.musicEnabled;
    soundEngine.toggleFestiveBGM(next);
    onUpdateProfile({ ...playerProfile, musicEnabled: next });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...playerProfile,
      name: tempName.trim() || 'Festive Devotee',
      campus: tempCampus,
    };
    savePlayerProfile(updated);
    onUpdateProfile(updated);
    setIsEditingProfile(false);
  };

  return (
    <header className="w-full bg-[#5A1830] text-[#FBF7F1] border-b-2 border-[#E2CBA6] shadow-md sticky top-0 z-40">
      {/* Top Auspicious Ribbon */}
      <div className="bg-[#441123] px-3 py-1 text-[11px] sm:text-xs flex items-center justify-between text-amber-200/90 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-deva font-bold text-amber-300">॥ श्री गणेशाय नमः ॥</span>
          <span className="hidden md:inline text-rose-200/70">|</span>
          <span className="hidden md:inline text-rose-200/90 font-medium">
            Ganesh Chaturthi Game Design Contest Entry
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGuidelines}
            className="hover:text-amber-300 underline font-medium flex items-center gap-1 cursor-pointer transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Contest Rules & Rewards (₹30K)</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 border border-amber-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🐭
          </div>
          <div>
            <h1 className="font-serif-title font-bold text-base sm:text-xl text-amber-200 tracking-wide flex items-center gap-1.5">
              <span>Mushak's Modak World</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#852C48] text-amber-200 border border-amber-300/40 font-mono">
                Super Mario Edition
              </span>
            </h1>
            <p className="text-[11px] text-rose-200/80 -mt-0.5">
              Side-scrolling 2D platformer honoring Lord Ganesha
            </p>
          </div>
        </div>

        {/* Center World Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-[#441123]/90 px-3 py-1.5 rounded-xl border border-[#E2CBA6]/30 text-xs text-amber-200">
          <span>🚩 World 1-1: Temple Bazaar</span>
          <span>•</span>
          <span className="text-stone-300">Collect Modaks & Reach the Sanctum Flag</span>
        </div>

        {/* Right Controls: Profile & Audio & Leaderboard */}
        <div className="flex items-center gap-2">
          {/* Player Badge / Campus Selector */}
          <div className="relative">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#441123] hover:bg-[#52162b] border border-[#E2CBA6]/40 text-xs text-amber-200 transition cursor-pointer"
              title="Edit Player Nickname & Campus"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <div className="text-left leading-tight max-w-[110px] truncate">
                <div className="font-semibold text-white truncate">{playerProfile.name}</div>
                <div className="text-[10px] text-rose-200/70 truncate">{playerProfile.campus}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-rose-300" />
            </button>

            {/* Profile Dropdown Popup */}
            {isEditingProfile && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-[#FAF6F0] text-[#4A403B] rounded-xl shadow-2xl border-2 border-[#E2CBA6] p-4 z-50 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between font-bold text-sm text-[#5A1830] mb-2 border-b border-[#E2CBA6] pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-[#852C48]" />
                    Participant Info
                  </span>
                  <span className="text-[10px] font-normal text-[#776B64]">For Leaderboard</span>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A4D46] mb-1">
                      Player Nickname:
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2CBA6] rounded-md text-xs text-[#4A403B] focus:ring-1 focus:ring-[#852C48] focus:outline-hidden"
                      placeholder="e.g. ModakChampion"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A4D46] mb-1">
                      Campus / College:
                    </label>
                    <select
                      value={tempCampus}
                      onChange={(e) => setTempCampus(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-[#E2CBA6] rounded-md text-xs text-[#4A403B] focus:ring-1 focus:ring-[#852C48] focus:outline-hidden"
                    >
                      {CAMPUS_LIST.map((campus) => (
                        <option key={campus} value={campus}>
                          {campus}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-2.5 py-1 rounded-md text-[#776B64] hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-md bg-[#852C48] text-white font-semibold hover:bg-[#6E2340]"
                    >
                      Save Info
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              playerProfile.soundEnabled
                ? 'bg-[#852C48] border-rose-300/40 text-amber-200 hover:bg-[#9C445D]'
                : 'bg-[#441123] border-white/20 text-rose-300/50 hover:text-white'
            }`}
            title={playerProfile.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {playerProfile.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Festive Drum Rhythm Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              playerProfile.musicEnabled
                ? 'bg-[#B15671] border-amber-300 text-amber-200 animate-pulse'
                : 'bg-[#441123] border-white/20 text-rose-300/50 hover:text-white'
            }`}
            title={playerProfile.musicEnabled ? 'Stop Festive Dhol Groove' : 'Play Festive Dhol Groove'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs shadow-sm hover:brightness-110 transition cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </div>
      </div>
    </header>
  );
};
