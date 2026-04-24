const QUOTES = [
  "A consistência é a chave do progresso. Vamos começar o dia!",
  "Um passo de cada vez. Mantenha o foco!",
  "Acredite no processo e mantenha o ritmo constante.",
  "Faça de hoje um ótimo dia para as suas metas.",
  "Pequenas vitórias diárias constroem o grande sucesso."
];

export async function getMotivationalQuote(): Promise<string> {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return quote;
}

export async function getHabitSuggestion(habitsInfo: string): Promise<string> {
  return "Consistência é o objetivo. Vamos retomar os hábitos hoje.";
}
