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
        
        console.log('🔬 MathExpression вход:', latexExpression);
        
        // Удаляем обертки \(...\) или \\\(...\\\)
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        } else if (latexExpression.startsWith('\\\\(') && latexExpression.endsWith('\\\\)')) {
          latexExpression = latexExpression.substring(3, latexExpression.length - 3);
        }
        
        console.log('🔬 MathExpression очищенный:', latexExpression);
        
        // Если пусто после очистки
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
            "\\cdot": "\\cdot",
            "\\times": "\\times",
            "\\div": "\\div",
            "\\sqrt": "\\sqrt{#1}",
            "\\frac": "\\frac{#1}{#2}",
            "\\int": "\\int",
            "\\sum": "\\sum",
            "\\lim": "\\lim",
            "\\to": "\\to",
            "\\infty": "\\infty",
            "\\alpha": "\\alpha",
            "\\beta": "\\beta",
            "\\gamma": "\\gamma",
            "\\delta": "\\delta",
            "\\sin": "\\sin",
            "\\cos": "\\cos",
            "\\tan": "\\tan",
            "\\log": "\\log",
            "\\ln": "\\ln",
          }
        });
        
        console.log('✅ MathExpression успешно отрендерен');
      } catch (error: any) {
        console.error('❌ KaTeX error:', error.message, 'for:', expression);
        // Показываем оригинал с подсветкой
        containerRef.current.innerHTML = 
          `<span style="color: #666; font-style: italic; border: 1px solid #ddd; padding: 2px;">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`math-expression ${className}`} />;
};

export default MathExpression;
