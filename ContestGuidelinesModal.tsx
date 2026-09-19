import React, { useState } from 'react';
import { X, Award, Calendar, CheckCircle2, ShieldCheck, Flame, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenGame: () => void;
}

export const ContestGuidelinesModal: React.FC<Props> = ({ isOpen, onClose, onOpenGame }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'rules' | 'checklist'>('about');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF6F0] border-2 border-[#E2CBA6] rounded-2xl shadow-2xl overflow-hidden my-6 text-[#4A403B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Header Banner */}
        <div className="relative bg-gradient-to-r from-[#5A1830] via-[#852C48] to-[#5A1830] p-6 text-white text-center border-b-2 border-[#E2CBA6]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-amber-300 font-deva text-lg font-bold">॥ श्री गणेशाय नमः ॥</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-amber-200 tracking-wide">
            Ganesh Chaturthi Game Design Contest
          </h2>
          <p className="text-sm sm:text-base text-rose-100/90 mt-1 max-w-xl mx-auto">
            Official Guidelines & Contest Requirements from <a href="https://niat-web.github.io/Ganesh-chaturthi-game-design-contest/" target="_blank" rel="noreferrer" className="underline hover:text-amber-200 inline-flex items-center gap-1 font-medium">niat-web.github.io <ExternalLink className="w-3.5 h-3.5" /></a>
          </p>

          {/* Prize Badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 pt-3 border-t border-white/15 text-xs sm:text-sm font-semibold flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-300/40 rounded-full text-amber-200">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Prizes: ₹30,000 Pool</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-300/40 rounded-full text-rose-100">
              <Calendar className="w-4 h-4 text-rose-200" />
              <span>Deadline: 20 September, 5:00 PM</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-300/40 rounded-full text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Cross-Campus Play Ready</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E2CBA6] bg-[#F4ECE2]">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 text-sm sm:text-base font-semibold transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'about'
                ? 'border-[#852C48] text-[#852C48] bg-[#FAF6F0]'
                : 'border-transparent text-[#776B64] hover:text-[#4A403B]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Contest Brief & Themes
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 text-sm sm:text-base font-semibold transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'rules'
                ? 'border-[#852C48] text-[#852C48] bg-[#FAF6F0]'
                : 'border-transparent text-[#776B64] hover:text-[#4A403B]'
            }`}
          >
            <Flame className="w-4 h-4" />
            Rules & Criteria
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-3 text-sm sm:text-base font-semibold transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'checklist'
                ? 'border-[#852C48] text-[#852C48] bg-[#FAF6F0]'
                : 'border-transparent text-[#776B64] hover:text-[#4A403B]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Submission Compliance
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm sm:text-base space-y-4">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-[#5A1830] text-lg mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  What the Contest is About
                </h3>
                <p className="text-[#5A4D46] leading-relaxed">
                  The Ganesh Chaturthi Game Design Contest invites students to build a complete, playable game themed around <strong>Vinayaka Chaturthi</strong>. A game that feels polished, respectful, and fun to replay beats an unfinished complex project.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#5A1830] mb-2">Contest Festive Elements Featured in This Game:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🐭</span>
                    <div>
                      <strong>Mushak, Ganesha's Mouse:</strong> Protagonist in our runner platformer.
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🥟</span>
                    <div>
                      <strong>Modaks & Sweets:</strong> Ukadiche & golden modaks, laddus, and offerings.
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🥁</span>
                    <div>
                      <strong>Dhol Tasha Rhythm:</strong> High energy Puneri dhol procession rhythm beat game.
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <div>
                      <strong>Eco-Friendly Clay Murtis:</strong> Shadu mati crafting and green visarjan challenge.
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <div>
                      <strong>Durva Grass & Jaswand:</strong> Sacred 21 blades of durva & hibiscus offerings.
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2CBA6] flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <div>
                      <strong>Cross-Campus Arena:</strong> Direct leaderboard filtering for inter-college play.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg text-sm text-[#702434]">
                <strong>Crucial Contest Directive:</strong> <em>"Handle the theme with respect. Lord Ganesha should always be shown with care. Games should not show him being hurt, attacked or mocked."</em>
                <br />Our game strictly honors this: Mushak collects offerings with joy, obstacles only cause harmless slips, and the grand culmination is Lord Ganesha's divine Aarti blessing!
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#5A1830]">Official Evaluation Criteria:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-[#52443C]">
                  <li><strong>Fun and Playability:</strong> Engaging loops, responsive controls, rewarding feedback.</li>
                  <li><strong>Creativity:</strong> Authentic festive cultural integration and multi-mode variety.</li>
                  <li><strong>Completeness:</strong> Start screen, levels, sound FX, win/loss conditions, replay loop.</li>
                  <li><strong>Ease of Use:</strong> Mobile touch support & desktop keyboard inputs.</li>
                  <li><strong>Cross-Campus Access:</strong> Open browser link with campus ranking filters.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#5A1830]">Contest Submission Compliance Checklist:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Easy to start & Working gameplay:</strong> Immediate one-click start, instructions shown upfront, zero blocker bugs.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Proper ending & Replay:</strong> Clear scores, combo counters, level progression, and instant replay.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Mobile and Laptop Responsive:</strong> Keyboard controls (Arrows / A, S, D / Space) + on-screen touch buttons for mobile.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Leaderboard & Cross-Campus Play:</strong> Filterable high scores across NIAT, IIT, COEP, BITS, VJTI, and all colleges.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Audio & Assets:</strong> 100% royalty-free, browser synthesized Web Audio API (Dhol, Tasha, Bell, Shankh) and scalable vector art.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F4ECE2] border-t border-[#E2CBA6] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#776B64]">
            Contest link: <span className="font-mono text-[#5A1830]">niat-web.github.io/Ganesh-chaturthi-game-design-contest</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#E2CBA6] bg-white text-[#4A403B] hover:bg-amber-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenGame();
              }}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#9C445D] to-[#852C48] text-white shadow-md hover:brightness-110 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Play Festival Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
