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
        console.log('MathExpression получает:', expression);
        
        containerRef.current.innerHTML = '';
        
        let latexExpression = expression.trim();
        
        // Извлекаем LaTeX из различных обёрток:
        // 1. \( ... \)  (пропущенный слеш)
        // 2. \\( ... \\) (правильный Markdown)
        
        // Для формата \(...\)
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        }
        
        // Для формата \\(...\\)
        if (latexExpression.startsWith('\\\\(') && latexExpression.endsWith('\\\\)')) {
          latexExpression = latexExpression.substring(3, latexExpression.length - 3);
        }
        
        console.log('После очистки:', latexExpression);
        
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
          latexExpression.includes('\\tan') ||
          latexExpression.includes('\\log') ||
          latexExpression.includes('\\int') ||
          latexExpression.includes('\\,');
        
        if (isMathExpression) {
          console.log('Рендерим как формулу:', latexExpression);
          // Рендерим как формулу
          katex.render(latexExpression, containerRef.current, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true,
          });
        } else {
          console.log('Обычный текст:', expression);
          // Обычный текст
          containerRef.current.textContent = expression;
        }
      } catch (error: any) {
        console.error('KaTeX error:', error.message, 'Expression:', expression);
        // Показываем исходный текст красным для отладки
        containerRef.current.innerHTML = `<span style="color: red">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
