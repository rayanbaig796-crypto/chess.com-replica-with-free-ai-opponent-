import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "./ChessBoard";
import { Lesson } from "../types";
import { School, ArrowRight, Play, CheckCircle, GraduationCap, RotateCcw } from "lucide-react";

export const LearnScreen: React.FC = () => {
  // Hardcoded premium lessons database
  const lessons: Lesson[] = [
    {
      id: "l1",
      title: "The Sicilian Defense",
      category: "Openings",
      difficulty: "Intermediate",
      description: "The most popular counter-attacking option for Black against White's 1.e4 pawn push.",
      steps: [
        {
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          explanation: "White triggers the match immediately with the king-side pawn advance to central e4.",
          targetMove: "e2e4"
        },
        {
          fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          explanation: "Instead of copying with e5, Black plays c5! This asymmetrical wall fights for control of d4 without exposing the king.",
          targetMove: "c7c5"
        },
        {
          fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
          explanation: "The standard Sicilian board is set. Black controls the critical d4 square from the flank.",
        }
      ]
    },
    {
      id: "l2",
      title: "The Ruy Lopez (Spanish Opening)",
      category: "Openings",
      difficulty: "Beginner",
      description: "One of the most classical and fundamental openings, focusing on rapid development and kingside attack.",
      steps: [
        {
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          explanation: "Initial pawn advance: 1. e4",
          targetMove: "e2e4"
        },
        {
          fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          explanation: "Black mirrors the pawn play: 1... e5",
          targetMove: "e7e5"
        },
        {
          fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
          explanation: "White develops the knight to f3, immediately attacking Black's e5 pawn.",
          targetMove: "b8c6"
        },
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          explanation: "White develops the bishop to b5! Threatening the knight that guards the critical e5 pawn.",
          targetMove: "f1b5"
        },
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
          explanation: "The Ruy Lopez board is configured. White applies long-term positional pressure on Black's pawn chain.",
        }
      ]
    }
  ];

  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [chess, setChess] = useState<Chess>(() => new Chess());

  const activeLesson = lessons[activeLessonIdx];
  const activeStep = activeLesson.steps[currentStepIdx];

  // Sync board with step changes
  useEffect(() => {
    if (activeStep) {
      setChess(new Chess(activeStep.fen));
    }
  }, [activeStep, activeLessonIdx, currentStepIdx]);

  const handleNextStep = () => {
    if (currentStepIdx < activeLesson.steps.length - 1) {
      // If there is a targeted move to showcase, execute it visually before moving on
      if (activeStep.targetMove) {
        const fresh = new Chess(chess.fen());
        try {
          const from = activeStep.targetMove.slice(0, 2);
          const to = activeStep.targetMove.slice(2, 4);
          fresh.move({ from, to, promotion: "q" });
          setChess(fresh);
        } catch {}
      }

      setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 500);
    }
  };

  const resetLesson = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-5xl mx-auto pb-10 animate-fade-in">
      {/* 4-COLUMN LEFT: CHOOSE LESSON COURSE */}
      <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <School size={15} className="text-primary" />
            Classroom Courses
          </h3>

          <div className="space-y-3.5">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                onClick={() => {
                  setActiveLessonIdx(idx);
                  setCurrentStepIdx(0);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeLessonIdx === idx
                    ? "bg-secondary-container text-on-secondary-container border-primary"
                    : "bg-surface-container text-on-surface border-surface-container-highest hover:bg-surface-bright"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {lesson.category}
                  </span>
                  <span className="text-[9.5px] font-semibold text-on-surface-variant font-mono">
                    {lesson.difficulty}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mt-2">{lesson.title}</h4>
                <p className="text-[11.5px] text-on-surface-variant mt-1.5 line-clamp-2">
                  {lesson.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8-COLUMN RIGHT: INTERACTIVE COURSE BOARD */}
      <div className="lg:col-span-8 flex flex-col gap-3 order-1 lg:order-2">
        <div className="bg-surface-charcoal rounded-xl p-4 shadow-xl border border-surface-container-highest space-y-4">
          <div className="flex border-b border-surface-container pb-3 justify-between items-center">
            <div>
              <h2 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold">
                {activeLesson.title} — Step {currentStepIdx + 1} of {activeLesson.steps.length}
              </h2>
              <p className="text-xs text-on-surface-variant font-semibold mt-0.5 uppercase tracking-wide">
                Theoretical Overview
              </p>
            </div>
            <button
              onClick={resetLesson}
              className="p-1 px-2.5 rounded bg-surface-container hover:bg-surface-bright text-xs font-semibold hover:text-primary transition-all flex items-center gap-1 border border-surface-container-highest shadow-inner"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Board render */}
            <div className="sm:col-span-7 flex justify-center">
              <ChessBoard
                chess={chess}
                onMove={() => {}} // Simple visual display, not interactive moves
                isInteractive={false}
                isFlipped={false}
                lastMove={null}
              />
            </div>

            {/* Instruction comments */}
            <div className="sm:col-span-5 space-y-4 flex flex-col justify-between h-full py-2">
              <div className="bg-surface-container p-4 rounded-xl border border-surface-container-highest space-y-3">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="text-action-gold" size={18} />
                  <span className="text-[10px] font-bold text-action-gold uppercase tracking-wider">Coach Insights</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed font-sans font-medium">
                  {activeStep.explanation}
                </p>
              </div>

              {currentStepIdx < activeLesson.steps.length - 1 ? (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-primary-container text-on-primary-container font-semibold rounded-lg btn-3d shadow-xl flex justify-center items-center gap-1.5 text-xs uppercase"
                >
                  Demonstrate Step <ArrowRight size={14} />
                </button>
              ) : (
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-center text-primary-fixed flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle size={15} />
                  <span className="text-xs font-bold uppercase tracking-wider">Course Completed!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
