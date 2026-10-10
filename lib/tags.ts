// Tags disponibles, regroupés. La valeur stockée en base ne change pas
// (ex. "Volonté"), seul le libellé affiché peut être plus parlant.

export const TAG_GROUPS: { title: string; tags: string[] }[] = [
  {
    title: "Cuisine",
    tags: ["Français", "Italien", "Asiatique", "Indien", "Oriental", "Mexicain", "Américain", "Méditerranéen"],
  },
  {
    title: "Concept",
    tags: ["Bistrot", "Gastronomique", "Fast-food", "Street food", "Volonté", "Tapas / Partage", "Brunch"],
  },
  { title: "Régime", tags: ["Vegan"] },
  { title: "Ambiance", tags: ["Romantique", "Familial"] },
];

export const ALL_TAGS = TAG_GROUPS.flatMap((g) => g.tags);

const LABELS: Record<string, string> = {
  Volonté: "À volonté",
};

export function tagLabel(tag: string) {
  return LABELS[tag] ?? tag;
}
