// Classes fixas para o Tailwind.
export const TOPIC_COLORS = [
  { id: "blue", label: "Azul", swatch: "bg-topic-blue", surface: "bg-topic-blue/10 border-topic-blue/15", text: "text-topic-blue" },
  { id: "green", label: "Verde", swatch: "bg-topic-green", surface: "bg-topic-green/10 border-topic-green/15", text: "text-topic-green" },
  { id: "purple", label: "Roxo", swatch: "bg-topic-purple", surface: "bg-topic-purple/10 border-topic-purple/15", text: "text-topic-purple" },
  { id: "amber", label: "Âmbar", swatch: "bg-topic-amber", surface: "bg-topic-amber/10 border-topic-amber/15", text: "text-topic-amber" },
  { id: "rose", label: "Rosa", swatch: "bg-topic-rose", surface: "bg-topic-rose/10 border-topic-rose/15", text: "text-topic-rose" },
  { id: "cyan", label: "Ciano", swatch: "bg-topic-cyan", surface: "bg-topic-cyan/10 border-topic-cyan/15", text: "text-topic-cyan" },
  { id: "orange", label: "Laranja", swatch: "bg-topic-orange", surface: "bg-topic-orange/10 border-topic-orange/15", text: "text-topic-orange" },
]

export function getTopicColor(id) {
  // Cor padrão para valores antigos.
  return TOPIC_COLORS.find((color) => color.id === id) ?? TOPIC_COLORS[0]
}
