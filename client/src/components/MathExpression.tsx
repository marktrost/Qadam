// components/MathExpression.tsx
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
        containerRef.current.innerHTML = '';
        
        let latexExpression = expression.trim();
        
        console.log('MathExpression получил:', latexExpression);
        
        // Удаляем обертки \( \) или \\\( \\\)
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        } else if (latexExpression.startsWith('\\\\(') && latexExpression.endsWith('\\\\)')) {
          latexExpression = latexExpression.substring(3, latexExpression.length - 3);
        }
        
        // Если после очистки пусто, показываем оригинал
        if (!latexExpression) {
          containerRef.current.textContent = expression;
          return;
        }
        
        // Всегда пытаемся рендерить
        katex.render(latexExpression, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            "\\vec": "\\overrightarrow{#1}",
            "\\degree": "^{\\circ}",
            "\\celsius": "^{\\circ}\\mathrm{C}",
          }
        });
      } catch (error: any) {
        console.error('KaTeX error:', error.message, 'for:', expression);
        containerRef.current.textContent = expression;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`math-expression ${className}`} />;
};

export default MathExpression;
