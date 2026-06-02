export const LUNCH_MENU = [
  {
    id: "chicken-salad",
    name: "(سالاد مرغ) Chicken Salad",
    ingredients:
      "Little Gem lettuce, French lettuce, romaine, celery stalk, bell peppers, green apple, celery leaves, grilled chicken breast, chicken salad dressing",
    sort_order: 1,
  },
  {
    id: "curry-chicken-pizza",
    name: "(پیتزا مرغ کاری) Curry Chicken Pizza",
    ingredients:
      "Italian rye pizza dough, diced chicken breast, curry spices, mushrooms, tomatoes, baby corn, Baguette special sauce",
    sort_order: 2,
  },
  {
    id: "garlic-steak-pizza",
    name: "(پیتزا سیر و استیک) Garlic & Steak Pizza",
    ingredients:
      "Italian rye pizza dough, beef tenderloin, olive oil, fresh garlic, Baguette special sauce",
    sort_order: 3,
  },
  {
    id: "smoked-chicken-pizza",
    name: "(پیتزا مرغ دودی) Smoked Chicken Pizza",
    ingredients:
      "Italian rye pizza dough, chicken breast, barbecue sauce, Baguette special sauce",
    sort_order: 4,
  },
  {
    id: "other-office",
    name: "(سایر دفاتر) Other office — no lunch",
    ingredients:
      "I am joining from another office and do not need a Tehran office lunch order.",
    sort_order: 99,
  },
] as const;
