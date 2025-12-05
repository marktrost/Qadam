import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

// Проверяем, является ли текст ЧИСТОЙ математической формулой
const isPureMath = (text: string): boolean => {
  // Чистые формулы: начинаются с \(, содержат \frac, \sqrt, \int, или только математические символы
  return text.startsWith('\\(') || 
         /^[a-zA-Z0-9\s\^_\+\-\*\/=<>\(\)\{\}\.,;:!°√∫∑∏∓±×·]+\^?[0-9]*$/.test(text) ||
         text.includes('\\frac') ||
         text.includes('\\sqrt') ||
         text.includes('\\int') ||
         text.includes('\\vec') ||
         text.includes('^{') ||
         text.includes('_{');
};

// Конвертируем только математические части
const convertMathToLatex = (text: string): string => {
  let result = text;
  
  // Конвертируем математические курсивные символы
  const mathToLatin: Record<string, string> = {
    '𝑎': 'a', '𝑏': 'b', '𝑐': 'c', '𝑑': 'd', '𝑒': 'e', '𝑓': 'f', '𝑔': 'g',
    'ℎ': 'h', '𝑖': 'i', '𝑗': 'j', '𝑘': 'k', '𝑙': 'l', '𝑚': 'm', '𝑛': 'n',
    '𝑜': 'o', '𝑝': 'p', '𝑞': 'q', '𝑟': 'r', '𝑠': 's', '𝑡': 't', '𝑢': 'u',
    '𝑣': 'v', '𝑤': 'w', '𝑥': 'x', '𝑦': 'y', '𝑧': 'z',
  };
  
  Object.keys(mathToLatin).forEach(mathChar => {
    result = result.replace(new RegExp(mathChar, 'g'), mathToLatin[mathChar]);
  });
  
  // Векторы
  result = result.replace(/([a-zA-Z])⃗⃗/g, '\\vec{$1}');
  result = result.replace(/([a-zA-Z])⃗/g, '\\vec{$1}');
  
  // Степени и индексы
  result = result.replace(/([a-zA-Z0-9\)])\^([0-9\+\-]+)/g, '$1^{$2}');
  result = result.replace(/([a-zA-Z0-9\)])_([0-9]+)/g, '$1_{$2}');
  
  // Математические символы
  result = result.replace(/°/g, '^{\\circ}');
  result = result.replace(/×/g, '\\times');
  result = result.replace(/·/g, '\\cdot');
  
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
        console.log('Рендерим:', expression);
        
        containerRef.current.innerHTML = '';
        
        let latex = expression.trim();
        
        // Убираем \( и \) если есть
        if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
          latex = latex.substring(2, latex.length - 2);
        }
        
        // Конвертируем математические символы
        latex = convertMathToLatex(latex);
        
        // Проверяем: если это ЧИСТАЯ формула без текста
        const isPureFormula = isPureMath(latex) && 
                             !/[\u0400-\u04FFа-яА-ЯҚқӘәҒғҮүІіҢңӨөҰұҺһ]/.test(latex) &&
                             !/\.|\?|!|,|;|:|»|«/.test(latex);
        
        if (isPureFormula) {
          // Рендерим как LaTeX формулу
          katex.render(latex, containerRef.current, {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true,
          });
        } else {
          // Обычный текст - не рендерим KaTeX!
          containerRef.current.textContent = expression;
        }
        
      } catch (error: any) {
        console.error('KaTeX error:', error.message);
        containerRef.current.textContent = expression;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={className} />;
};

export default MathExpression;
