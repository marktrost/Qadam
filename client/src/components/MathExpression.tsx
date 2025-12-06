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
        
        // Удаляем обертки \( и \)
        if (latexExpression.startsWith('\\(') && latexExpression.endsWith('\\)')) {
          latexExpression = latexExpression.substring(2, latexExpression.length - 2);
        }
        
        // Расширенные макросы для лучшей поддержки
        const macros: Record<string, string> = {
          "\\vec": "\\overrightarrow{#1}",
          "\\degree": "^{\\circ}",
          "\\celsius": "^{\\circ}\\mathrm{C}",
          "\\permille": "\\unicode{0x2030}",
          "\\cdot": "\\cdot",
          "\\times": "\\times",
          "\\div": "\\div",
          "\\pm": "\\pm",
          "\\mp": "\\mp",
          "\\approx": "\\approx",
          "\\sim": "\\sim",
          "\\cong": "\\cong",
          "\\equiv": "\\equiv",
          "\\neq": "\\neq",
          "\\leq": "\\leq",
          "\\geq": "\\geq",
          "\\subset": "\\subset",
          "\\supset": "\\supset",
          "\\subseteq": "\\subseteq",
          "\\supseteq": "\\supseteq",
          "\\in": "\\in",
          "\\notin": "\\notin",
          "\\forall": "\\forall",
          "\\exists": "\\exists",
          "\\nexists": "\\nexists",
          "\\emptyset": "\\emptyset",
          "\\varnothing": "\\varnothing",
          "\\mathbb{R}": "\\mathbb{R}",
          "\\mathbb{N}": "\\mathbb{N}",
          "\\mathbb{Z}": "\\mathbb{Z}",
          "\\mathbb{Q}": "\\mathbb{Q}",
          "\\mathbb{C}": "\\mathbb{C}",
          "\\sin": "\\sin",
          "\\cos": "\\cos",
          "\\tan": "\\tan",
          "\\cot": "\\cot",
          "\\sec": "\\sec",
          "\\csc": "\\csc",
          "\\arcsin": "\\arcsin",
          "\\arccos": "\\arccos",
          "\\arctan": "\\arctan",
          "\\sinh": "\\sinh",
          "\\cosh": "\\cosh",
          "\\tanh": "\\tanh",
          "\\log": "\\log",
          "\\ln": "\\ln",
          "\\lg": "\\lg",
          "\\exp": "\\exp",
          "\\lim": "\\lim",
          "\\sup": "\\sup",
          "\\inf": "\\inf",
          "\\max": "\\max",
          "\\min": "\\min",
          "\\det": "\\det",
          "\\gcd": "\\gcd",
          "\\lcm": "\\operatorname{lcm}",
          "\\Pr": "\\Pr",
          "\\operatorname{sgn}": "\\operatorname{sgn}",
        };
        
        katex.render(latexExpression, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
          trust: true,
          macros,
        });
      } catch (error: any) {
        console.error('KaTeX error for expression:', expression, error.message);
        // Показываем исходный текст
        containerRef.current.textContent = expression;
      }
    }
  }, [expression, displayMode]);

  return <span ref={containerRef} className={`math-expression ${className}`} />;
};

export default MathExpression;
