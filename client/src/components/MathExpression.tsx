// components/MathExpression.tsx
import { useEffect, useRef } from "react";

interface MathExpressionProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathExpression({
  expression,
  displayMode = false,
  className = "",
}: MathExpressionProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const MathJax = (window as any).MathJax;
    if (MathJax?.typesetPromise) {
      MathJax.typesetPromise([ref.current]);
    }
  }, [expression]);

  return (
    <span ref={ref} className={className}>
      {expression}
    </span>
  );
}
