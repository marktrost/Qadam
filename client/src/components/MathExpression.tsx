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
        
        console.log('Оригинальное выражение:', latexExpression);
        
        // Удаляем обертки \( и \)
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        }
        
        console.log('Очищенное выражение:', latexExpression);
        
        // Всегда пытаемся рендерить как LaTeX, даже если нет явных команд
        // (так как могут быть символы ^, _, и т.д.)
        katex.render(latexExpression, containerRef.current, {
          displayMode,
          throwOnError: false, // Не выбрасывать ошибку при проблемах
          strict: false, // Нестрогий режим
          trust: true, // Доверять командам
          macros: {
            "\\degree": "^{\\circ}",
            "\\celsius": "^{\\circ}\\mathrm{C}",
            "\\fahrenheit": "^{\\circ}\\mathrm{F}",
            "\\permille": "\\unicode{0x2030}",
            "\\micro": "\\unicode{0x00B5}",
          }
        });
      } catch (error: any) {
        console.error('KaTeX error for expression:', expression, error.message);
        // Показываем исходный текст с подсветкой ошибки
        containerRef.current.innerHTML = 
          `<span style="color: red; border: 1px solid red; padding: 2px;">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
