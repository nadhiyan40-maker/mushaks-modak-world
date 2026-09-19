/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MarioGaneshGame } from './components/MarioGaneshGame';
import { ContestGuidelinesModal } from './components/ContestGuidelinesModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameMode, PlayerProfile } from './types';
import { getPlayerProfile, savePlayerProfile } from './utils/storage';
import { 
  BookOpen, 
  ExternalLink, 
  Gamepad2, 
  Sparkles,
  Trophy
} from 'lucide-react';

export default function App() {
  const [currentMode] = useState<GameMode>('mushak_quest');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(getPlayerProfile);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Sync profile changes
  const handleUpdateProfile = (newProfile: PlayerProfile) => {
    setPlayerProfile(newProfile);
    savePlayerProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#3D2E28] flex flex-col selection:bg-[#E97451] selection:text-white relative">
      {/* Auspicious Warm Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Navigation Header */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={() => {}}
        playerProfile={playerProfile}
        onUpdateProfile={handleUpdateProfile}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Contest Header Banner */}
      <section className="bg-gradient-to-r from-[#FAF0E4] via-[#FDF8F0] to-[#FAF0E4] border-b border-[#E2CBA6] py-2.5 px-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-[#5A1830]">
            <span className="text-base">🏆</span>
            <span className="font-semibold">
              Ganesh Chaturthi Game Design Contest Entry
            </span>
            <span className="hidden md:inline text-[#776B64]">
              — ₹30,000 Prize Pool | Theme: Vinayaka Traditions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="px-3 py-1 bg-white hover:bg-amber-50 border border-[#E2CBA6] rounded-full font-semibold text-[#852C48] transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Leaderboard</span>
            </button>
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="px-3 py-1 bg-white hover:bg-amber-50 border border-[#E2CBA6] rounded-full font-semibold text-[#852C48] transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contest Guidelines</span>
            </button>
            <a
              href="https://niat-web.github.io/Ganesh-chaturthi-game-design-contest/"
              target="_blank"
              rel="noreferrer"
              className="text-[#776B64] hover:text-[#5A1830] underline flex items-center gap-1 font-medium hidden sm:inline-flex text-xs"
            >
              <span>Contest Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Game Screen Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* Game Title & Lore Card */}
        <div className="text-center max-w-2xl mb-5">
          <div className="font-deva text-[#852C48] text-sm font-semibold tracking-wider mb-1">
            ॥ मूषकराज सुपर मोदक वर्ल्ड ॥
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-[#5A1830] tracking-tight">
            Mushak's Modak World
          </h2>
          <p className="text-xs sm:text-sm text-[#776B64] mt-1.5 leading-relaxed">
            Super Mario Bros platformer with a Ganesh festival theme! Run, leap over holy water pits, head-bump [ ? ] mystery blocks for ukadiche modaks, power up into Super Mushak, and slide down the temple flag to reach Lord Ganesha's sanctum.
          </p>
        </div>

        {/* The Mario Ganesh Game */}
        <div className="w-full flex justify-center">
          <MarioGaneshGame
            playerProfile={playerProfile}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#5A1830] text-[#FBF7F1] border-t-2 border-[#E2CBA6] mt-10 py-7 px-4 text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-deva text-amber-300 text-lg font-bold">
            ॥ गणपति बप्पा मोरया • मंगल मूर्ति मोरया ॥
          </div>
          <p className="text-rose-200/90 text-xs max-w-xl mx-auto">
            Created for the <strong>Ganesh Chaturthi Game Design Contest</strong> (<a href="https://niat-web.github.io/Ganesh-chaturthi-game-design-contest/" target="_blank" rel="noreferrer" className="underline hover:text-amber-200">niat-web.github.io</a>).
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-3 text-amber-200/80 text-[11px]">
            <span>🍄 Classic Mario Mechanics</span>
            <span>•</span>
            <span>🥟 Modak Mystery Blocks</span>
            <span>•</span>
            <span>📱 Mobile Touch & Desktop Keyboard</span>
            <span>•</span>
            <span>🏛️ Cross-Campus Leaderboard</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContestGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        onOpenGame={() => setIsGuidelinesOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentMode="mushak_quest"
        userCampus={playerProfile.campus}
      />
    </div>
  );
}
