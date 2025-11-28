import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface TestQuestion {
  id: string;
  text: string;
  answers: Array<{ id: string; text: string; }>;
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
  isReviewMode = false
}: MobileTestNavigationProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onQuestionChange(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        onQuestionChange(currentIndex + 1);
      } else if (e.key >= '1' && e.key <= '4') {
        const answerIndex = parseInt(e.key) - 1;
        if (currentQuestion.answers[answerIndex]) {
          onAnswerSelect(currentQuestion.id, currentQuestion.answers[answerIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion, onQuestionChange, onAnswerSelect]);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="md:hidden flex flex-col h-screen safe-area-padding">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sheet open={showNavigation} onOpenChange={setShowNavigation}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <i className="fas fa-th-large mr-2 text-sm"></i>
                  {currentIndex + 1}/{questions.length}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                <div className="p-4 h-full flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">Навигация по вопросам</h3>
                  <div className="grid grid-cols-5 gap-2 mb-4 flex-1 overflow-y-auto">
                    {questions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant={currentIndex === index ? "default" : "outline"}
                        size="sm"
                        className={`h-12 min-h-[3rem] ${
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
                  
                  <div className="space-y-3 text-sm pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Отвечено:</span>
                      <span className="font-medium">{answeredCount}/{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Прогресс:</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 rounded bg-accent"></div>
                        <span className="text-muted-foreground text-xs">Отвечен</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 rounded border border-border"></div>
                        <span className="text-muted-foreground text-xs">Не отвечен</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {currentQuestion?.subjectName}
            </Badge>
          </div>
          
          <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question Content with Swipe */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-3">
                Вопрос {currentIndex + 1}
              </h2>
              <p className="text-foreground leading-relaxed text-sm break-words">
                {currentQuestion?.text}
              </p>
            </div>
            
            <div className="space-y-2">
              {currentQuestion?.answers.map((answer, index) => {
                // Определяем стиль для режима просмотра результатов
                const getAnswerStyle = () => {
                  if (!isReviewMode) {
                    return `
                      flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[52px]
                      ${userAnswers[currentQuestion.id] === answer.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                      }
                    `;
                  }
                  
                  const isUserAnswer = userAnswers[currentQuestion.id] === answer.id;
                  const isCorrectAnswer = (answer as any).isCorrect;
                  
                  if (isCorrectAnswer && isUserAnswer) {
                    return "flex items-start space-x-3 p-3 rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-500 transition-all min-h-[52px]";
                  } else if (isCorrectAnswer && !isUserAnswer) {
                    return "flex items-start space-x-3 p-3 rounded-lg border-2 border-green-500 bg-green-50 text-green-800 transition-all min-h-[52px]";
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    return "flex items-start space-x-3 p-3 rounded-lg border-2 border-red-500 bg-red-50 text-red-800 transition-all min-h-[52px]";
                  } else {
                    return "flex items-start space-x-3 p-3 rounded-lg border border-border bg-muted/20 transition-all opacity-60 min-h-[52px]";
                  }
                };

                const getRadioStyle = () => {
                  if (!isReviewMode) {
                    return `
                      w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                      ${userAnswers[currentQuestion.id] === answer.id 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                      }
                    `;
                  }
                  
                  const isUserAnswer = userAnswers[currentQuestion.id] === answer.id;
                  const isCorrectAnswer = (answer as any).isCorrect;
                  
                  if (isCorrectAnswer && isUserAnswer) {
                    return "w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0";
                  } else if (isCorrectAnswer && !isUserAnswer) {
                    return "w-5 h-5 rounded-full border-2 border-green-600 bg-green-600 flex items-center justify-center mt-0.5 flex-shrink-0";
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    return "w-5 h-5 rounded-full border-2 border-red-600 bg-red-600 flex items-center justify-center mt-0.5 flex-shrink-0";
                  } else {
                    return "w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center mt-0.5 flex-shrink-0";
                  }
                };

                return (
                  <div
                    key={answer.id}
                    className={getAnswerStyle()}
                    onClick={() => {
                      if (!isReviewMode) {
                        onAnswerSelect(currentQuestion.id, answer.id);
                        if ('vibrate' in navigator) {
                          navigator.vibrate(25);
                        }
                      }
                    }}
                  >
                    <div className={getRadioStyle()}>
                      {((isReviewMode && (answer as any).isCorrect) || (!isReviewMode && userAnswers[currentQuestion.id] === answer.id)) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="font-medium mr-2 text-sm">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-foreground text-sm break-words flex-1">
                        {answer.text}
                        {isReviewMode && (answer as any).isCorrect && userAnswers[currentQuestion.id] === answer.id && (
                          <span className="ml-2 text-blue-500 text-xs">✓</span>
                        )}
                        {isReviewMode && (answer as any).isCorrect && userAnswers[currentQuestion.id] !== answer.id && (
                          <span className="ml-2 text-green-600 text-xs">✓</span>
                        )}
                        {isReviewMode && userAnswers[currentQuestion.id] === answer.id && !(answer as any).isCorrect && (
                          <span className="ml-2 text-red-600 text-xs">✗</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Swipe Hint */}
        <div className="text-center text-xs text-muted-foreground mb-4 py-2">
          <i className="fas fa-hand-pointer mr-1"></i>
          Проведите влево/вправо для навигации
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-4 py-3 safe-area-padding-bottom">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onQuestionChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="min-w-[100px] h-12 text-sm"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Назад
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="min-w-[140px] h-12 bg-accent hover:bg-accent/90 text-sm"
            >
              {isSubmitting ? "Завершение..." : "Завершить"}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => onQuestionChange(Math.min(questions.length - 1, currentIndex + 1))}
              className="min-w-[100px] h-12 text-sm"
            >
              Далее
              <i className="fas fa-chevron-right ml-2"></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
