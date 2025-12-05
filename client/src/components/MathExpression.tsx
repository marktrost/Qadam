import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

// Функция для конвертации Unicode векторов в LaTeX
const convertUnicodeVectorsToLatex = (text: string): string => {
  let result = text;
  
  // Unicode векторы -> LaTeX \vec{}
  const vectorMap: Record<string, string> = {
    '𝑎⃗': '\\vec{a}',
    '𝑏⃗': '\\vec{b}', 
    '𝑏⃗⃗': '\\vec{b}',
    '𝑐⃗': '\\vec{c}',
    '𝑑⃗': '\\vec{d}',
    '𝑒⃗': '\\vec{e}',
    '𝑓⃗': '\\vec{f}',
    '𝑔⃗': '\\vec{g}',
    'ℎ⃗': '\\vec{h}',
    '𝑖⃗': '\\vec{i}',
    '𝑗⃗': '\\vec{j}',
    '𝑘⃗': '\\vec{k}',
    '𝑙⃗': '\\vec{l}',
    '𝑚⃗': '\\vec{m}',
    '𝑛⃗': '\\vec{n}',
    '𝑜⃗': '\\vec{o}',
    '𝑝⃗': '\\vec{p}',
    '𝑞⃗': '\\vec{q}',
    '𝑟⃗': '\\vec{r}',
    '𝑠⃗': '\\vec{s}',
    '𝑡⃗': '\\vec{t}',
    '𝑢⃗': '\\vec{u}',
    '𝑣⃗': '\\vec{v}',
    '𝑤⃗': '\\vec{w}',
    '𝑥⃗': '\\vec{x}',
    '𝑦⃗': '\\vec{y}',
    '𝑧⃗': '\\vec{z}',
  };
  
  // Заменяем векторы
  Object.keys(vectorMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), vectorMap[key]);
  });
  
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
        // Очищаем контейнер
        containerRef.current.innerHTML = '';
        
        let latexExpression = expression;
        
        // === ВАЖНО: Извлекаем LaTeX из обёртки \( ... \) ===
        // Удаляем \( в начале и \) в конце если есть
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        }
        // Также для формата \\( ... \\)
        if (latexExpression.startsWith('\\\\(') && latexExpression.endsWith('\\\\)')) {
          latexExpression = latexExpression.substring(3, latexExpression.length - 3);
        }
        
        // Конвертируем Unicode векторы в LaTeX
        latexExpression = convertUnicodeVectorsToLatex(latexExpression);
        
        // === ВАЖНО: Проверяем, является ли это формулой ===
        // Если это просто текст без формул - не рендерим KaTeX
        const isPlainText = !(
          latexExpression.includes('\\frac') || 
          latexExpression.includes('\\sqrt') ||
          latexExpression.includes('\\cdot') ||
          latexExpression.includes('\\times') ||
          latexExpression.includes('\\vec') ||
          latexExpression.includes('^') ||
          latexExpression.includes('_') ||
          latexExpression.includes('\\sin') ||
          latexExpression.includes('\\cos') ||
          latexExpression.includes('\\tan') ||
          latexExpression.includes('\\log') ||
          latexExpression.includes('\\int') ||
          latexExpression.includes('{') ||
          latexExpression.includes('}')
        );
        
        if (isPlainText) {
          // Обычный текст
          containerRef.current.textContent = expression;
        } else {
          // Рендерим как формулу
          katex.render(latexExpression, containerRef.current, {
            displayMode,
            throwOnError: false, // Не падать при ошибках!
            strict: false,
            trust: true,
          });
        }
      } catch (error: any) {
        console.error('KaTeX rendering error:', error.message);
        // При ошибке показываем исходный текст
        containerRef.current.innerHTML = `<span style="color: #666">${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
