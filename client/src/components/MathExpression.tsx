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
        
        let latexExpression = expression.trim();
        
        // Извлекаем LaTeX из различных обёрток:
        // 1. \( ... \)  (пропущенный слеш)
        // 2. \\( ... \\) (правильный Markdown)
        // 3. $ ... $ (inline math)
        // 4. $$ ... $$ (display math)
        
        if ((latexExpression.startsWith('\\(') || latexExpression.startsWith('\\(\\(')) && 
            (latexExpression.endsWith('\\)') || latexExpression.endsWith('\\\\)'))) {
          // Удаляем \( в начале и \) в конце
          latexExpression = latexExpression.replace(/^\\\(/, '').replace(/\\\)$/, '');
          // Также удаляем лишние слеши
          latexExpression = latexExpression.replace(/^\\\\\(/, '').replace(/\\\\\)$/, '');
        }
        
        if (latexExpression.startsWith('$') && latexExpression.endsWith('$')) {
          latexExpression = latexExpression.substring(1, latexExpression.length - 1);
          if (latexExpression.startsWith('$') && latexExpression.endsWith('$')) {
            latexExpression = latexExpression.substring(1, latexExpression.length - 1);
            displayMode = true;
          }
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
          latexExpression.includes('\\tan') ||
          latexExpression.includes('\\log') ||
          latexExpression.includes('\\int') ||
          latexExpression.includes('\\,');
        
        if (isMathExpression) {
          // Рендерим как формулу
          katex.render(latexExpression, containerRef.current, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true,
          });
        } else {
          // Обычный текст
          containerRef.current.textContent = expression;
        }
      } catch (error: any) {
        console.error('KaTeX error for expression:', expression, error.message);
        // Показываем исходный текст серым
        containerRef.current.innerHTML = `<span style="color: #666; font-style: italic">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
