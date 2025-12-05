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
  return text
    // Заменяем Unicode символы векторов на LaTeX команды
    .replace(/𝑎⃗/g, '\\vec{a}')
    .replace(/𝑏⃗/g, '\\vec{b}')
    .replace(/𝑐⃗/g, '\\vec{c}')
    .replace(/𝑑⃗/g, '\\vec{d}')
    .replace(/𝑒⃗/g, '\\vec{e}')
    .replace(/𝑓⃗/g, '\\vec{f}')
    .replace(/𝑔⃗/g, '\\vec{g}')
    .replace(/ℎ⃗/g, '\\vec{h}')
    .replace(/𝑖⃗/g, '\\vec{i}')
    .replace(/𝑗⃗/g, '\\vec{j}')
    .replace(/𝑘⃗/g, '\\vec{k}')
    .replace(/𝑙⃗/g, '\\vec{l}')
    .replace(/𝑚⃗/g, '\\vec{m}')
    .replace(/𝑛⃗/g, '\\vec{n}')
    .replace(/𝑜⃗/g, '\\vec{o}')
    .replace(/𝑝⃗/g, '\\vec{p}')
    .replace(/𝑞⃗/g, '\\vec{q}')
    .replace(/𝑟⃗/g, '\\vec{r}')
    .replace(/𝑠⃗/g, '\\vec{s}')
    .replace(/𝑡⃗/g, '\\vec{t}')
    .replace(/𝑢⃗/g, '\\vec{u}')
    .replace(/𝑣⃗/g, '\\vec{v}')
    .replace(/𝑤⃗/g, '\\vec{w}')
    .replace(/𝑥⃗/g, '\\vec{x}')
    .replace(/𝑦⃗/g, '\\vec{y}')
    .replace(/𝑧⃗/g, '\\vec{z}')
    // Также заменяем символы без стрелок
    .replace(/𝑎/g, 'a')
    .replace(/𝑏/g, 'b')
    .replace(/𝑐/g, 'c')
    .replace(/𝑑/g, 'd')
    .replace(/𝑒/g, 'e')
    .replace(/𝑓/g, 'f')
    .replace(/𝑔/g, 'g')
    .replace(/ℎ/g, 'h')
    .replace(/𝑖/g, 'i')
    .replace(/𝑗/g, 'j')
    .replace(/𝑘/g, 'k')
    .replace(/𝑙/g, 'l')
    .replace(/𝑚/g, 'm')
    .replace(/𝑛/g, 'n')
    .replace(/𝑜/g, 'o')
    .replace(/𝑝/g, 'p')
    .replace(/𝑞/g, 'q')
    .replace(/𝑟/g, 'r')
    .replace(/𝑠/g, 's')
    .replace(/𝑡/g, 't')
    .replace(/𝑢/g, 'u')
    .replace(/𝑣/g, 'v')
    .replace(/𝑤/g, 'w')
    .replace(/𝑥/g, 'x')
    .replace(/𝑦/g, 'y')
    .replace(/𝑧/g, 'z');
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
        
        let latexExpression = expression.trim();
        
        // Извлекаем LaTeX из различных обёрток:
        if ((latexExpression.startsWith('\\(') || latexExpression.startsWith('\\(\\(')) && 
            (latexExpression.endsWith('\\)') || latexExpression.endsWith('\\\\)'))) {
          latexExpression = latexExpression.replace(/^\\\(/, '').replace(/\\\)$/, '');
          latexExpression = latexExpression.replace(/^\\\\\(/, '').replace(/\\\\\)$/, '');
        }
        
        if (latexExpression.startsWith('$') && latexExpression.endsWith('$')) {
          latexExpression = latexExpression.substring(1, latexExpression.length - 1);
          if (latexExpression.startsWith('$') && latexExpression.endsWith('$')) {
            latexExpression = latexExpression.substring(1, latexExpression.length - 1);
            displayMode = true;
          }
        }
        
        // Конвертируем Unicode векторы в LaTeX
        latexExpression = convertUnicodeVectorsToLatex(latexExpression);
        
        // Проверяем, является ли выражение формулой LaTeX
        const isMathExpression = 
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
          latexExpression.includes('\\,');
        
        if (isMathExpression) {
          // Рендерим как формулу
          katex.render(latexExpression, containerRef.current, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true,
            macros: {
              "\\vec": "\\mathbf{#1}",
            },
          });
        } else {
          // Обычный текст
          containerRef.current.textContent = expression;
        }
      } catch (error: any) {
        console.error('KaTeX error for expression:', expression, error.message);
        // Показываем исходный текст
        containerRef.current.innerHTML = `<span>${expression}</span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
