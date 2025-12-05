import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

// Функция для конвертации Unicode векторов и математических символов в LaTeX
const convertToLatex = (text: string): string => {
  console.log('Исходный текст для конвертации:', text);
  
  let result = text;
  
  // 1. Конвертируем математические курсивные символы в обычные буквы
  const mathToLatin: Record<string, string> = {
    // Математические курсивные маленькие буквы (U+1D44E - U+1D467)
    '𝑎': 'a', '𝑏': 'b', '𝑐': 'c', '𝑑': 'd', '𝑒': 'e', '𝑓': 'f', '𝑔': 'g',
    'ℎ': 'h', '𝑖': 'i', '𝑗': 'j', '𝑘': 'k', '𝑙': 'l', '𝑚': 'm', '𝑛': 'n',
    '𝑜': 'o', '𝑝': 'p', '𝑞': 'q', '𝑟': 'r', '𝑠': 's', '𝑡': 't', '𝑢': 'u',
    '𝑣': 'v', '𝑤': 'w', '𝑥': 'x', '𝑦': 'y', '𝑧': 'z',
    
    // Математические курсивные большие буквы (U+1D434 - U+1D44D)
    '𝐴': 'A', '𝐵': 'B', '𝐶': 'C', '𝐷': 'D', '𝐸': 'E', '𝐹': 'F', '𝐺': 'G',
    '𝐻': 'H', '𝐼': 'I', '𝐽': 'J', '𝐾': 'K', '𝐿': 'L', '𝑀': 'M', '𝑁': 'N',
    '𝑂': 'O', '𝑃': 'P', '𝑄': 'Q', '𝑅': 'R', '𝑆': 'S', '𝑇': 'T', '𝑈': 'U',
    '𝑉': 'V', '𝑊': 'W', '𝑋': 'X', '𝑌': 'Y', '𝑍': 'Z',
  };
  
  // Заменяем математические символы на обычные
  Object.keys(mathToLatin).forEach(mathChar => {
    const latinChar = mathToLatin[mathChar];
    result = result.replace(new RegExp(mathChar, 'g'), latinChar);
  });
  
  // 2. Обрабатываем векторы (буква + combining arrow U+20D7)
  // Сначала двойные стрелки, потом одинарные
  result = result.replace(/([a-zA-Z])⃗⃗/g, '\\vec{$1}');
  result = result.replace(/([a-zA-Z])⃗/g, '\\vec{$1}');
  
  // 3. Обрабатываем другие математические символы
  const replacements = [
    // Степени и индексы
    { pattern: /([a-zA-Z0-9\)])\^([0-9]+)/g, replacement: '$1^{$2}' },
    { pattern: /([a-zA-Z0-9\)])\^(-[0-9]+)/g, replacement: '$1^{$2}' },
    { pattern: /([a-zA-Z0-9\)])_([0-9]+)/g, replacement: '$1_{$2}' },
    
    // Математические операторы
    { pattern: /°/g, replacement: '^{\\circ}' },
    { pattern: /×/g, replacement: '\\times' },
    { pattern: /·/g, replacement: '\\cdot' },
    { pattern: /√/g, replacement: '\\sqrt' },
    
    // Дроби в текстовом формате
    { pattern: /(\d+)\/(\d+)/g, replacement: '\\frac{$1}{$2}' },
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
        
        // Убираем \( и \) если есть (формулы уже извлечены TextWithMath)
        if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
          latex = latex.substring(2, latex.length - 2);
          console.log('Убрали \\(\\):', latex);
        }
        
        // Конвертируем Unicode символы в LaTeX
        latex = convertToLatex(latex);
        
        // Если текст содержит обычные слова (кириллицу, пробелы), 
        // но также содержит математику, используем \text{}
        const hasCyrillic = /[а-яА-ЯҚқӘәҒғҮүІіҢңӨөҰұҺһ]/.test(expression);
        const hasSpaces = /\s/.test(expression);
        const hasMath = /\\vec|\^|_|\\frac|\\sqrt|\\times|\\cdot/.test(latex);
        
        if ((hasCyrillic || hasSpaces) && hasMath) {
          // Смешанный текст с математикой - используем \text{}
          latex = `\\text{${latex}}`;
        }
        
        // Рендерим как LaTeX
        katex.render(latex, containerRef.current, {
          displayMode: false, // Всегда inline режим
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            "\\deg": "^{\\circ}",
            "\\vec": "\\mathbf{#1}", // Жирные векторы
          },
        });
        
        console.log('Успешно отрендерено');
        
      } catch (error: any) {
        console.error('KaTeX error for:', expression, 'Error:', error.message);
        // При ошибке показываем исходный текст
        containerRef.current.innerHTML = `<span style="color: #666; font-style: italic">
          ${expression}
        </span>`;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathExpression;
