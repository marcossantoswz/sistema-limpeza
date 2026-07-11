// src/utils/date.ts

/**
 * Formata uma data (string ISO ou objeto Date) para o padrão brasileiro (DD/MM/YYYY)
 */
export function formatDateBR(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  
  // Adiciona o timezone offset para evitar que a data volte um dia por causa do fuso horário
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);

  return correctedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Retorna uma string amigável para o período da semana (ex: "12/05 a 19/05")
 */
export function getWeekRangeString(startDate: string | Date, endDate: string | Date): string {
  const start = formatDateBR(startDate).substring(0, 5); // Pega apenas DD/MM
  const end = formatDateBR(endDate).substring(0, 5);
  return `${start} a ${end}`;
}