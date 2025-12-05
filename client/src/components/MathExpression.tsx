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
        
        // Проверяем, является ли выражение формулой LaTeX
        const isMathExpression = 
          expression.includes('\\frac') || 
          expression.includes('\\sqrt') ||
          expression.includes('\\cdot') ||
          expression.includes('\\times') ||
          expression.includes('^') ||
          expression.includes('_');
        
        if (isMathExpression) {
          // Рендерим как формулу
          katex.render(expression, containerRef.current, {
            displayMode,
            throwOnError: true, // Временно true чтобы видеть ошибки
            strict: false,
            trust: true, // Разрешаем все команды
          });
        } else {
          // Обычный текст
          containerRef.current.textContent = expression;
        }
      } catch (error: any) {
        console.error('KaTeX rendering error:', error.message, 'Expression:', expression);
        // Показываем исходный текст красным для отладки
        containerRef.current.innerHTML = `
          <span style="color: red; border: 1px solid red; padding: 2px;">
            Ошибка: ${expression}
          </span>
        `;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={className} />;
};

export default MathExpression;
