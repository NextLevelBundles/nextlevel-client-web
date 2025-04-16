export interface Bundle {
  id: number;
  title: string;
  image: string;
  minPrice: number;
  timeLeft: string;
  keysLeft: number;
  tag: "Most Popular" | "New Release" | "Featured" | "Last Chance" | "Best Value" | "Staff Pick";
  neonClass: "neon-card-blue" | "neon-card-purple" | "neon-card-orange";
}

export const bundles: Bundle[] = [
  {
    id: 1,
    title: "Indie Legends",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop",
    minPrice: 9.99,
    timeLeft: "47:59:59",
    keysLeft: 2481,
    tag: "Most Popular",
    neonClass: "neon-card-blue"
  },
  {
    id: 2,
    title: "RPG Masters",
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2940&auto=format&fit=crop",
    minPrice: 14.99,
    timeLeft: "95:12:33",
    keysLeft: 1853,
    tag: "New Release",
    neonClass: "neon-card-purple"
  },
  {
    id: 3,
    title: "Strategy Elite",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2940&auto=format&fit=crop",
    minPrice: 12.99,
    timeLeft: "71:45:21",
    keysLeft: 3102,
    tag: "Featured",
    neonClass: "neon-card-orange"
  },
  {
    id: 4,
    title: "Retro Classics",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop",
    minPrice: 7.99,
    timeLeft: "23:45:10",
    keysLeft: 892,
    tag: "Last Chance",
    neonClass: "neon-card-blue"
  },
  {
    id: 5,
    title: "Action Heroes",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop",
    minPrice: 19.99,
    timeLeft: "119:32:45",
    keysLeft: 4521,
    tag: "Best Value",
    neonClass: "neon-card-purple"
  },
  {
    id: 6,
    title: "Puzzle Paradise",
    image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2940&auto=format&fit=crop",
    minPrice: 11.99,
    timeLeft: "83:21:09",
    keysLeft: 1756,
    tag: "Staff Pick",
    neonClass: "neon-card-orange"
  }
];