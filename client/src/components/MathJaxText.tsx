import { useEffect, useRef } from 'react';
import { processLatexInText } from '@/utils/latexUtils';

interface MathJaxTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export default function MathJaxText({ text, className = '', inline = false }: MathJaxTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Обработка текста с LaTeX
  const processedText = processLatexInText(text);
  
  useEffect(() => {
    const updateMathJax = () => {
      if (containerRef.current && window.MathJax) {
        // Если MathJax уже загружен, обновляем рендеринг
        if (window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
            console.warn('MathJax typeset error:', err);
          });
        } else if (window.MathJax.Hub) {
          // Для старой версии MathJax
          window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, containerRef.current]);
        }
      }
    };
    
    // Ждем немного для загрузки MathJax если нужно
    if (window.MathJax) {
      updateMathJax();
    } else {
      const timer = setTimeout(updateMathJax, 100);
      return () => clearTimeout(timer);
    }
  }, [processedText]);
  
  const Wrapper = inline ? 'span' : 'div';
  
  return (
    <Wrapper
      ref={containerRef}
      className={`${className} mathjax-content`}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
  }
