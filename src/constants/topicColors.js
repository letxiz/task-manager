// Classes fixas para o Tailwind.
export const TOPIC_COLORS = [
  { id: "blue", label: "Azul", swatch: "bg-topic-blue", surface: "bg-topic-blue/10 border-topic-blue/30", text: "text-topic-blue" },
  { id: "green", label: "Verde", swatch: "bg-topic-green", surface: "bg-topic-green/10 border-topic-green/30", text: "text-topic-green" },
  { id: "purple", label: "Roxo", swatch: "bg-topic-purple", surface: "bg-topic-purple/10 border-topic-purple/30", text: "text-topic-purple" },
  { id: "amber", label: "Âmbar", swatch: "bg-topic-amber", surface: "bg-topic-amber/10 border-topic-amber/30", text: "text-topic-amber" },
  { id: "rose", label: "Rosa", swatch: "bg-topic-rose", surface: "bg-topic-rose/10 border-topic-rose/30", text: "text-topic-rose" },
]

export function getTopicColor(id) {
  // Cor padrão para valores antigos.
  return TOPIC_COLORS.find((color) => color.id === id) ?? TOPIC_COLORS[0]
}
