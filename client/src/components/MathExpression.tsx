import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

// Функция для конвертации Unicode векторов в LaTeX
const convertToLatex = (text: string): string => {
  console.log('Исходный текст для конвертации:', text);
  
  let result = text;
  
  // Сначала пробуем найти векторы вручную
  // Векторы могут быть в разных форматах
  const replacements = [
    // Формат с combining arrow (U+20D7)
    { pattern: /([a-z])⃗/g, replacement: '\\vec{$1}' },
    { pattern: /([a-z])⃗⃗/g, replacement: '\\vec{$1}' },
    
    // Специфические замены для ваших символов
    { pattern: /𝑎⃗/g, replacement: '\\vec{a}' },
    { pattern: /𝑏⃗/g, replacement: '\\vec{b}' },
    { pattern: /𝑏⃗⃗/g, replacement: '\\vec{b}' },
    { pattern: /𝑐⃗/g, replacement: '\\vec{c}' },
    
    // Математические символы
    { pattern: /°/g, replacement: '^{\\circ}' },
    { pattern: /×/g, replacement: '\\times' },
    { pattern: /·/g, replacement: '\\cdot' },
  ];
  
  replacements.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });
  
  console.log('После конвертации:', result);
  return result;
};

const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  displayMode = false,
  className = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && expression) {
      try {
        console.log('Рендерим выражение:', expression);
        
        containerRef.current.innerHTML = '';
        
        let latex = expression.trim();
        
        // Убираем \( и \) если есть
        if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
          latex = latex.substring(2, latex.length - 2);
          console.log('Убрали \\(\\):', latex);
        }
        
        // Конвертируем Unicode символы
        latex = convertToLatex(latex);
        
        // Всегда пробуем рендерить как LaTeX
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            "\\deg": "^{\\circ}",
          },
        });
        
        console.log('Успешно отрендерено');
        
      } catch (error: any) {
        console.error('KaTeX error for:', expression, 'Error:', error.message);
        // При ошибке показываем исходный текст красным для отладки
        containerRef.current.innerHTML = `<span style="color: red; border: 1px solid red; padding: 2px;">
          Ошибка: ${expression}
        </span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
