import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  displayMode = false,
  className = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && expression) {
      try {
        // Очищаем контейнер
        containerRef.current.innerHTML = '';
        
        // Извлекаем LaTeX из обёртки \( ... \) если есть
        let latexExpression = expression;
        
        // Удаляем \( в начале и \) в конце
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        }
        
        // Также удаляем $...$ если есть
        if (latexExpression.startsWith('$') && latexExpression.endsWith('$')) {
          latexExpression = latexExpression.substring(1, latexExpression.length - 1);
        }
        
        // Проверяем, является ли выражение формулой LaTeX
        const isMathExpression = 
          latexExpression.includes('\\frac') || 
          latexExpression.includes('\\sqrt') ||
          latexExpression.includes('\\cdot') ||
          latexExpression.includes('\\times') ||
          latexExpression.includes('^') ||
          latexExpression.includes('_') ||
          latexExpression.includes('\\sin') ||
          latexExpression.includes('\\cos') ||
          latexExpression.includes('\\log') ||
          latexExpression.includes('\\int');
        
        if (isMathExpression) {
          // Рендерим как формулу
          katex.render(latexExpression, containerRef.current, {
            displayMode,
            throwOnError: false, // Не выбрасывать ошибки
            strict: false,
            trust: true, // Разрешаем все команды
          });
        } else {
          // Обычный текст
          containerRef.current.textContent = expression;
        }
      } catch (error: any) {
        console.error('KaTeX error:', error.message);
        // Показываем исходный текст
        containerRef.current.innerHTML = `<span>${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={className} />;
};

export default MathExpression;
