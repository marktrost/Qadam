export function processLatexInText(text: string): string {
  if (!text) return '';
  
  // Проверяем, есть ли в тексте LaTeX команды
  const hasLatex = text.includes('\\') || text.includes('^') || text.includes('_');
  
  if (!hasLatex) {
    return text; // Возвращаем как есть, если нет LaTeX
  }
  
  // Заменяем обратные слеши на двойные для правильного отображения
  let processed = text
    // Математические окружения
    .replace(/\\\((.+?)\\\)/g, '\\($1\\)') // инлайновая математика
    .replace(/\\\[(.+?)\\\]/g, '\\[$1\\]') // выключная математика
    
    // Дроби
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\\frac{$1}{$2}')
    
    // Корни
    .replace(/\\sqrt\{([^}]+)\}/g, '\\\sqrt{$1}')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '\\\sqrt[$1]{$2}')
    
    // Степени и индексы
    .replace(/\^\{([^}]+)\}/g, '^{$1}')
    .replace(/\_\{([^}]+)\}/g, '_{$1}')
    
    // Операторы
    .replace(/\\cdot/g, '\\\cdot')
    .replace(/\\times/g, '\\\times')
    .replace(/\\div/g, '\\\div')
    .replace(/\\pm/g, '\\\pm')
    .replace(/\\mp/g, '\\\mp')
    
    // Греческие буквы и символы
    .replace(/\\alpha/g, '\\\alpha')
    .replace(/\\beta/g, '\\\beta')
    .replace(/\\gamma/g, '\\\gamma')
    .replace(/\\delta/g, '\\\delta')
    .replace(/\\epsilon/g, '\\\epsilon')
    .replace(/\\pi/g, '\\\pi')
    .replace(/\\infty/g, '\\\infty')
    
    // Скобки
    .replace(/\\left\(/g, '\\\left(')
    .replace(/\\right\)/g, '\\\right)')
    .replace(/\\left\[/g, '\\\left[')
    .replace(/\\right\]/g, '\\\right]')
    
    // Отношения
    .replace(/\\le/g, '\\\le')
    .replace(/\\ge/g, '\\\ge')
    .replace(/\\neq/g, '\\\neq')
    .replace(/\\approx/g, '\\\approx')
    .replace(/\\sim/g, '\\\sim');
  
  // Автоматически оборачиваем математические выражения в $...$ если они еще не обернуты
  // Но только для выражений, которые выглядят как математика
  const mathPatterns = [
    /\\[a-zA-Z]+\{[^}]+\}/, // \frac{...}{...}, \sqrt{...}
    /[a-zA-Z0-9]+\^\{[^}]+\}/, // a^{2}
    /[a-zA-Z0-9]+\_\{[^}]+\}/, // a_{n}
    /\\[a-zA-Z]+/ // \cdot, \times и т.д.
  ];
  
  // Если текст содержит LaTeX команды, но не обернут в $, оборачиваем весь блок
  if (mathPatterns.some(pattern => pattern.test(processed)) && 
      !processed.includes('$') && 
      !processed.includes('\\(') && 
      !processed.includes('\\[')) {
    // Разделяем на строки и обрабатываем каждую
    const lines = processed.split('\n');
    processed = lines.map(line => {
      if (line.trim() && mathPatterns.some(pattern => pattern.test(line))) {
        return `$${line}$`;
      }
      return line;
    }).join('\n');
  }
  
  return processed;
}
