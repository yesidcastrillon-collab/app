/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tractor, 
  Truck, 
  Factory, 
  Milk, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { NodeId, Scenario, Feedback, QuizQuestion } from './types';
import { generateScenario, getFeedback, generateQuiz } from './services/gemini';

const NODES = [
  { id: 'finca', label: 'Finca', icon: Tractor, color: 'bg-emerald-500', emoji: '🚜' },
  { id: 'transporte', label: 'Transporte', icon: Truck, color: 'bg-blue-500', emoji: '🚛' },
  { id: 'planta', label: 'Planta', icon: Factory, color: 'bg-indigo-500', emoji: '🏭' },
  { id: 'consumo', label: 'Consumo', icon: Milk, color: 'bg-amber-500', emoji: '🥛' },
] as const;

export default function App() {
  const [currentNode, setCurrentNode] = useState<NodeId | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const startNode = async (nodeId: NodeId) => {
    setLoading(true);
    setCurrentNode(nodeId);
    setFeedback(null);
    setQuiz(null);
    setQuizAnswered(null);
    setShowMenu(false);
    try {
      const newScenario = await generateScenario(nodeId);
      setScenario(newScenario);
    } catch (error) {
      console.error("Error generating scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (!scenario) return;
    setLoading(true);
    try {
      const result = await getFeedback(scenario, optionId);
      setFeedback(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!currentNode) return;
    setLoading(true);
    setFeedback(null);
    setScenario(null);
    try {
      const newQuiz = await generateQuiz(currentNode);
      setQuiz(newQuiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index);
  };

  const reset = () => {
    setCurrentNode(null);
    setScenario(null);
    setFeedback(null);
    setQuiz(null);
    setShowMenu(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Milk size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Trazabilidad Láctea</h1>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Decreto 616 de 2006</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          {showMenu ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {showMenu ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2 mb-4">
                <h2 className="text-3xl font-bold text-stone-800 mb-2 italic serif">Menú de Trazabilidad</h2>
                <p className="text-stone-500">Selecciona un nodo para comenzar tu aprendizaje interactivo.</p>
              </div>
              
              {NODES.map((node) => (
                <motion.button
                  key={node.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startNode(node.id)}
                  className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all text-left"
                >
                  <div className={`w-14 h-14 ${node.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                    <node.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {node.label} <span className="text-xl opacity-50">{node.emoji}</span>
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {node.id === 'finca' && 'Rutinas de ordeño, higiene y sanidad animal.'}
                    {node.id === 'transporte' && 'Cadena de frío y pruebas de plataforma.'}
                    {node.id === 'planta' && 'Higienización, laboratorio y almacenamiento.'}
                    {node.id === 'consumo' && 'Rotulado, vida útil y clasificación.'}
                  </p>
                  <div className="absolute top-8 right-8 text-stone-200 group-hover:text-emerald-500 transition-colors">
                    <ChevronRight size={32} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm font-medium text-stone-400">
                <button onClick={reset} className="hover:text-emerald-600 transition-colors">Inicio</button>
                <ChevronRight size={14} />
                <span className="text-stone-900 capitalize">{currentNode}</span>
              </nav>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-stone-500 font-medium animate-pulse">Consultando al Tutor Experto...</p>
                </div>
              ) : (
                <>
                  {/* Scenario View */}
                  {scenario && !feedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                        <h2 className="text-2xl font-bold text-stone-800 mb-4 italic serif">{scenario.title}</h2>
                        <p className="text-stone-600 leading-relaxed text-lg">{scenario.description}</p>
                      </div>
                      <div className="p-8 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">¿Qué acción tomarías?</p>
                        {scenario.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className="w-full p-5 text-left rounded-2xl border-2 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group"
                          >
                            <span className="font-medium text-stone-700">{option.text}</span>
                            <ChevronRight size={20} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Feedback View */}
                  {feedback && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-3xl border p-8 shadow-xl ${
                        feedback.isCorrect 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-6">
                        <div className={`p-4 rounded-2xl shrink-0 ${
                          feedback.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                        } text-white shadow-lg`}>
                          {feedback.isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <div className="space-y-4">
                          <h3 className={`text-2xl font-bold ${
                            feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'
                          }`}>
                            {feedback.isCorrect ? '¡Excelente elección!' : 'Atención: Riesgo detectado'}
                          </h3>
                          <p className="text-stone-700 leading-relaxed text-lg">
                            {feedback.message}
                          </p>
                          {feedback.citation && (
                            <div className="flex items-start gap-2 p-4 bg-white/50 rounded-xl border border-black/5">
                              <Info size={18} className="shrink-0 mt-1 text-stone-500" />
                              <p className="text-sm font-mono text-stone-600 italic">
                                {feedback.citation}
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-4 flex flex-wrap gap-4">
                            <button 
                              onClick={() => startNode(currentNode!)}
                              className="px-6 py-3 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-2"
                            >
                              <RotateCcw size={18} /> Otro Escenario
                            </button>
                            <button 
                              onClick={startQuiz}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                            >
                              Finalizar y Evaluar
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quiz View */}
                  {quiz && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-8 bg-indigo-600 text-white">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Evaluación Continua</p>
                        <h2 className="text-2xl font-bold italic serif">{quiz.question}</h2>
                      </div>
                      <div className="p-8 space-y-4">
                        {quiz.options.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={quizAnswered !== null}
                            onClick={() => handleQuizAnswer(idx)}
                            className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center justify-between ${
                              quizAnswered === null 
                                ? 'border-stone-100 hover:border-indigo-500 hover:bg-indigo-50/30' 
                                : idx === quiz.correctIndex
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : quizAnswered === idx
                                    ? 'border-rose-500 bg-rose-50'
                                    : 'border-stone-100 opacity-50'
                            }`}
                          >
                            <span className="font-medium text-stone-700">{option}</span>
                            {quizAnswered !== null && idx === quiz.correctIndex && <CheckCircle2 size={20} className="text-emerald-500" />}
                            {quizAnswered === idx && idx !== quiz.correctIndex && <XCircle size={20} className="text-rose-500" />}
                          </button>
                        ))}

                        {quizAnswered !== null && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4"
                          >
                            <div className="flex items-start gap-3">
                              <Info size={20} className="text-indigo-600 mt-1" />
                              <div>
                                <p className="font-bold text-stone-800 mb-1">Fundamento Técnico:</p>
                                <p className="text-stone-600 leading-relaxed">{quiz.explanation}</p>
                              </div>
                            </div>
                            <button 
                              onClick={reset}
                              className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                            >
                              Volver al Menú de Trazabilidad
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-stone-200 p-4 text-center">
        <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">
          Basado en el Decreto 616 de 2006 • Manual de Calidad • Cartilla BPO
        </p>
      </footer>
    </div>
  );
}
