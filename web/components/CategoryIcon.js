import { CakeSlice, Citrus, Coffee, Cookie, CupSoda, EggFried, Leaf, UtensilsCrossed } from "lucide-react";

export const CATEGORY_ICONS = {
  coffee: { Icon: Coffee, label: "قهوه" },
  cold: { Icon: CupSoda, label: "نوشیدنی سرد" },
  tea: { Icon: Leaf, label: "چای و دمنوش" },
  breakfast: { Icon: EggFried, label: "صبحانه" },
  cake: { Icon: CakeSlice, label: "کیک و دسر" },
  food: { Icon: UtensilsCrossed, label: "غذا" },
  juice: { Icon: Citrus, label: "آبمیوه" },
  snack: { Icon: Cookie, label: "میان‌وعده" },
};

export default function CategoryIcon({ icon, ...props }) {
  const { Icon } = CATEGORY_ICONS[icon] ?? CATEGORY_ICONS.coffee;
  return <Icon aria-hidden="true" {...props} />;
}
