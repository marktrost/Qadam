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
        
        // Если выражение содержит только LaTeX команды, обрабатываем как формулу
        if (expression.includes('\\frac') || expression.includes('\\sqrt') || 
            expression.includes('\\cdot') || expression.includes('^') || 
            expression.includes('_')) {
          
          katex.render(expression, containerRef.current, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true, // Разрешаем команды типа \frac, \sqrt
          });
        } else {
          // Если это обычный текст без формул
          containerRef.current.textContent = expression;
        }
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        containerRef.current.innerHTML = `<span style="color: #666">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <div ref={containerRef} className={`${className} inline-block`} />;
};

export default MathExpression;
