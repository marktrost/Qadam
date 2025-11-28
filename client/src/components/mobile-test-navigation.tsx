import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NetworkStatus from "@/components/network-status";
import TestToolsModal from "@/components/test-tools-modal";

interface TestQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  solutionImageUrl?: string;
  answers: Array<{ id: string; text: string; isCorrect?: boolean }>;
  subjectName?: string;
}

interface MobileTestNavigationProps {
  questions: TestQuestion[];
  currentIndex: number;
  userAnswers: Record<string, string | string[]>;
  onQuestionChange: (index: number) => void;
  onAnswerSelect: (questionId: string, answerId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  timeLeft: number;
  isReviewMode?: boolean;
  variantName?: string;
  blockName?: string;
  testData?: any[];
  isOfflineMode?: boolean;
  hasCalculator?: boolean;
  hasPeriodicTable?: boolean;
}

export default function MobileTestNavigation({
  questions,
  currentIndex,
  userAnswers,
  onQuestionChange,
  onAnswerSelect,
  onSubmit,
  isSubmitting,
  timeLeft,
  isReviewMode = false,
  variantName = "Тест",
  blockName = "Тест",
  testData = [],
  isOfflineMode = false,
  hasCalculator = false,
  hasPeriodicTable = false
}: MobileTestNavigationProps) {
  const [showNavigation, setShowNavigation] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false); // Свернуто по умолчанию
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const currentQuestion = questions[currentIndex];

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only trigger horizontal swipes
    if (!isVerticalSwipe) {
      if (isLeftSwipe && currentIndex < questions.length - 1) {
        onQuestionChange(currentIndex + 1);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } else if (isRightSwipe && currentIndex > 0) {
        onQuestionChange(currentIndex - 1);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }
  };

  // Вычисляем номер вопроса внутри предмета
  const getQuestionNumberInSubject = (globalIndex: number) => {
    let questionCount = 0;
    
    for (let i = 0; i < testData.length; i++) {
      const subjectQuestionCount = testData[i].questions.length;
      
      if (globalIndex < questionCount + subjectQuestionCount) {
        return {
          questionNumber: globalIndex - questionCount + 1,
          subjectIndex: i,
          subjectName: testData[i].subject.name
        };
      }
      
      questionCount += subjectQuestionCount;
    }
    
    return { questionNumber: 1, subjectIndex: 0, subjectName: '' };
  };

  const currentQuestionInfo = getQuestionNumberInSubject(currentIndex);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenCalculator = () => setShowCalculator(true);
  const handleOpenPeriodicTable = () => setShowPeriodicTable(true);
  const handleCloseCalculator = () => setShowCalculator(false);
  const handleClosePeriodicTable = () => setShowPeriodicTable(false);

  const confirmSubmitTest = () => {
    setShowSubmitDialog(false);
    onSubmit();
  };

  return (
    <div className="md:hidden min-h-screen bg-background safe-area-padding">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-3 pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground line-clamp-1">
                {blockName} - {variantName}
              </h1>
              {isReviewMode && (
                <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-500 text-xs px-1 py-0">
                  <i className="fas fa-eye mr-1"></i>
                  Қарау
                </Badge>
              )}
            </div>
            
            {/* Таймер */}
            {!isReviewMode && (
              <div className="flex items-center gap-1 bg-card border rounded px-2 py-1">
                <i className="fas fa-clock text-blue-500 text-xs"></i>
                <span className="text-xs font-mono font-bold text-foreground">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {isOfflineMode && (
            <div className="flex items-center">
              <NetworkStatus showDetails={false} className="text-xs" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-70px)]">
        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-3 space-y-3">
            {/* Subjects Navigation - Свернутая по умолчанию */}
            <Card className="border">
              <CardHeader className="pb-2 px-3 py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Предметы</CardTitle>
                  <div className="flex items-center space-x-1">
                    {!isReviewMode && hasCalculator && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenCalculator}
                        className="h-7 w-7 p-0"
                      >
                        <i className="fas fa-calculator text-xs"></i>
                      </Button>
                    )}
                    {!isReviewMode && hasPeriodicTable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenPeriodicTable}
                        className="h-7 w-7 p-0"
                      >
                        <i className="fas fa-table text-xs"></i>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSubjects(!showSubjects)}
                      className="h-7 px-2 text-xs"
                    >
                      <i className={`fas fa-chevron-${showSubjects ? 'up' : 'down'} mr-1`}></i>
                      {showSubjects ? 'Свернуть' : 'Развернуть'}
                    </Button>
                    <Sheet open={showNavigation} onOpenChange={setShowNavigation}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                          <i className="fas fa-th-large mr-1"></i>
                          {currentIndex + 1}/{questions.length}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                        <div className="p-3 h-full flex flex-col">
                          <h3 className="text-base font-semibold mb-3">Навигация по вопросам</h3>
                          <div className="grid grid-cols-5 gap-1 mb-3 flex-1 overflow-y-auto">
                            {questions.map((question, index) => (
                              <Button
                                key={question.id}
                                variant={currentIndex === index ? "default" : "outline"}
                                size="sm"
                                className={`h-10 min-h-[2.5rem] text-xs ${
                                  userAnswers[question.id] 
                                    ? currentIndex === index 
                                      ? "bg-accent" 
                                      : "bg-accent/20 border-accent text-accent-foreground" 
                                    : ""
                                }`}
                                onClick={() => {
                                  onQuestionChange(index);
                                  setShowNavigation(false);
                                }}
                              >
                                {index + 1}
                              </Button>
                            ))}
                          </div>
                          
                          <div className="text-xs pt-3 border-t">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Отвечено:</span>
                              <span className="font-medium">{Object.keys(userAnswers).length}/{questions.length}</span>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardHeader>
              {showSubjects && (
                <CardContent className="pt-0 px-3 pb-2">
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {testData.map((subject, index) => {
                      const unanswered = subject.questions.filter(q => !userAnswers[q.id]).length;
                      return (
                        <button
                          key={subject.subject.id}
                          className="w-full text-left p-1.5 rounded text-xs flex items-center justify-between hover:bg-muted/30"
                          onClick={() => {
                            const qIndex = questions.findIndex(q => 
                              testData.find(td => 
                                td.questions.some(tq => tq.id === q.id)
                              )?.subject.name === subject.subject.name
                            );
                            if (qIndex >= 0) onQuestionChange(qIndex);
                          }}
                        >
                          <span className="truncate flex-1 text-left">{subject.subject.name}</span>
                          <Badge variant={unanswered > 0 ? "default" : "secondary"} className="text-xs ml-2">
                            {unanswered}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Question Content */}
            <Card>
              <CardHeader className="pb-2 px-3 py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {currentQuestionInfo.subjectName} - Вопрос {currentQuestionInfo.questionNumber}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion?.subjectName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                <div className={`flex flex-col gap-3 ${currentQuestion?.imageUrl ? 'items-start' : ''}`}>
                  {/* Текст вопроса */}
                  <div className="flex-1">
                    <div className="text-sm text-foreground leading-relaxed">
                      {currentQuestion?.text}
                    </div>
                    
                    {/* Multiple choice hint */}
                    {currentQuestion?.answers.length === 8 && !isReviewMode && (
                      <div className="mt-1 text-xs text-muted-foreground italic">
                        Выберите 3 правильных ответа (2 балла за полностью верный ответ)
                      </div>
                    )}
                  </div>
                  
                  {/* Изображение вопроса */}
                  {currentQuestion?.imageUrl && (
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => {
                        setSelectedImage(currentQuestion.imageUrl!);
                        setImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Изображение к вопросу" 
                        className="w-full max-w-[280px] mx-auto h-auto max-h-[180px] object-contain rounded border shadow-sm bg-muted/30"
                      />
                    </div>
                  )}
                </div>
                
                {/* Answers */}
                <div className="space-y-2">
                  {currentQuestion?.answers.map((answer, index) => {
                    const userAnswer = userAnswers[currentQuestion.id];
                    const isSelected = Array.isArray(userAnswer) 
                      ? userAnswer.includes(answer.id)
                      : userAnswer === answer.id;

                    let answerStyle = "w-full p-2.5 rounded border text-left flex items-start gap-2 text-sm ";
                    
                    if (isReviewMode) {
                      if (isSelected && answer.isCorrect) {
                        answerStyle += "border-2 border-blue-500 bg-blue-50 text-foreground";
                      } else if (isSelected && !answer.isCorrect) {
                        answerStyle += "border-2 border-red-500 bg-red-50 text-foreground";
                      } else if (!isSelected && answer.isCorrect) {
                        answerStyle += "border-2 border-green-500 bg-green-50 text-foreground";
                      } else {
                        answerStyle += "border border-gray-300 bg-gray-50 opacity-60";
                      }
                    } else {
                      answerStyle += isSelected 
                        ? "border-2 border-blue-500 bg-blue-50 cursor-pointer"
                        : "border border-gray-300 hover:bg-gray-50 cursor-pointer";
                    }

                    return (
                      <button
                        key={answer.id}
                        type="button"
                        onClick={() => !isReviewMode && onAnswerSelect(currentQuestion.id, answer.id)}
                        className={answerStyle}
                        disabled={isReviewMode}
                      >
                        {/* Checkbox indicator */}
                        {!isReviewMode && (
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                            }`}>
                              {isSelected && <span className="text-white text-[10px]">✓</span>}
                            </div>
                          </div>
                        )}
                        
                        {/* Answer text */}
                        <div className="flex-1 text-left">
                          <span className="font-medium mr-1">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {answer.text}
                        </div>
                        
                        {/* Review mode indicators */}
                        {isReviewMode && (() => {
                          if (isSelected && answer.isCorrect) {
                            return <span className="ml-1 text-blue-500 font-bold text-xs">✓</span>;
                          } else if (isSelected && !answer.isCorrect) {
                            return <span className="ml-1 text-red-600 font-bold text-xs">✗</span>;
                          } else if (!isSelected && answer.isCorrect) {
                            return <span className="ml-1 text-green-600 font-bold text-xs">✓</span>;
                          }
                          return null;
                        })()}
                      </button>
                    );
                  })}
                </div>
                
                {/* Изображение решения */}
                {isReviewMode && currentQuestion?.solutionImageUrl && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <i className="fas fa-lightbulb text-yellow-500"></i>
                        <span>Решение:</span>
                      </div>
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedImage(currentQuestion.solutionImageUrl!);
                          setImageModalOpen(true);
                        }}
                      >
                        <img 
                          src={currentQuestion.solutionImageUrl} 
                          alt="Решение задачи" 
                          className="w-full max-w-[280px] mx-auto h-auto max-h-[180px] rounded border shadow-sm bg-muted/30"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-3 safe-area-padding-bottom">
          <div className="flex items-center justify-between space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestionChange(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="h-9 text-xs flex-1"
            >
              <i className="fas fa-chevron-left mr-1"></i>
              Назад
            </Button>

            {/* Pagination */}
            <div className="flex items-center gap-1 mx-1">
              {(() => {
                const curSubjectName = currentQuestion?.subjectName;
                if (!curSubjectName) return null;
                const subject = testData.find(s => s.subject.name === curSubjectName);
                if (!subject) return null;
                
                const total = subject.questions.length;
                const localIndex = subject.questions.findIndex(qi => qi.id === currentQuestion?.id);
                const windowSize = 3; // еще меньше кнопок на мобильном
                const half = Math.floor(windowSize / 2);
                let start = Math.max(0, localIndex - half);
                let end = Math.min(total, start + windowSize);
                if (end - start < windowSize) start = Math.max(0, end - windowSize);

                const buttons = [];
                for (let li = start; li < end; li++) {
                  const q = subject.questions[li];
                  const globalIndex = questions.findIndex(aq => aq.id === q.id);
                  const answered = !!userAnswers[q.id];
                  const active = globalIndex === currentIndex;
                  buttons.push(
                    <Button
                      key={q.id}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className={`h-7 w-7 p-0 min-w-7 text-xs ${answered ? 'bg-accent/20 border-accent text-accent-foreground' : ''}`}
                      onClick={() => onQuestionChange(globalIndex)}
                    >
                      {li + 1}
                    </Button>
                  );
                }
                return buttons;
              })()}
            </div>

            <div className="flex items-center gap-1">
              {currentIndex === questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/90 h-9 text-xs flex-1"
                >
                  {isSubmitting ? "..." : "Завершить"}
                </Button>
              ) : (
                <Button
                  onClick={() => onQuestionChange(Math.min(questions.length - 1, currentIndex + 1))}
                  className="h-9 text-xs flex-1"
                >
                  Далее
                  <i className="fas fa-chevron-right ml-1"></i>
                </Button>
              )}
            </div>
          </div>

          {/* Swipe Hint */}
          <div className="text-center text-xs text-muted-foreground mt-2">
            <i className="fas fa-hand-pointer mr-1"></i>
            Проведите влево/вправо для навигации
          </div>
        </div>
      </div>

      {/* Tools Modals */}
      <TestToolsModal
        showCalculator={showCalculator}
        showPeriodicTable={showPeriodicTable}
        onCloseCalculator={handleCloseCalculator}
        onClosePeriodicTable={handleClosePeriodicTable}
      />

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/80 animate-in fade-in-0" 
            onClick={() => {
              setImageModalOpen(false);
              setSelectedImage(null);
            }}
          />
          
          <div className="relative z-50 w-full max-w-[95vw] max-h-[80vh] bg-background border rounded-lg shadow-lg p-0 overflow-hidden">
            <button
              onClick={() => {
                setImageModalOpen(false);
                setSelectedImage(null);
              }}
              className="absolute right-2 top-2 z-10 rounded-sm opacity-70 bg-background ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
            >
              <i className="fas fa-times h-4 w-4"></i>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center bg-background p-4">
              <img 
                src={selectedImage} 
                alt="Изображение в полном размере" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 animate-in fade-in-0" 
            onClick={() => setShowSubmitDialog(false)}
          />
          
          <div className="relative z-50 w-full max-w-[90vw] bg-background border rounded-lg shadow-lg p-4 mx-4">
            <h3 className="text-base font-semibold mb-2">Завершить тест?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {Object.keys(userAnswers).length < questions.length ? (
                <>
                  Вы ответили на <strong>{Object.keys(userAnswers).length}</strong> из <strong>{questions.length}</strong> вопросов.
                  Неотвеченные вопросы будут засчитаны как неправильные.
                </>
              ) : (
                "Вы ответили на все вопросы. Завершить тест и посмотреть результаты?"
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 text-xs h-9"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmSubmitTest}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-xs h-9"
              >
                Завершить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
