export interface Game {
  name: string;
  description: string;
  image: string;
  videoUrl?: string;
  deckVerified: boolean;
  platforms: string[];
  originalPrice: number;
  protonDbRating?: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface Tier {
  name: string;
  minPrice: number;
  games: Game[];
}

export const tiers: Tier[] = [
  { 
    name: "Tier 1", 
    minPrice: 1, 
    games: [
      {
        name: "Stellar Drift",
        description: "A mesmerizing space exploration game with stunning visuals and an immersive soundtrack.",
        image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        originalPrice: 14.99,
        protonDbRating: "platinum"
      },
      {
        name: "Neon Abyss",
        description: "Fast-paced roguelite action with endless combinations of power-ups and weapons.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "linux"],
        originalPrice: 19.99,
        protonDbRating: "gold"
      },
      {
        name: "Pixel Warriors",
        description: "Retro-style beat 'em up with modern mechanics and local co-op support.",
        image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2940&auto=format&fit=crop",
        deckVerified: false,
        platforms: ["windows", "mac"],
        originalPrice: 9.99
      },
      {
        name: "Cosmic Racer",
        description: "High-speed anti-gravity racing through spectacular alien worlds.",
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 12.99
      }
    ]
  },
  { 
    name: "Tier 2", 
    minPrice: 10,
    games: [
      {
        name: "Quantum Break",
        description: "A mind-bending puzzle game that challenges your perception of reality.",
        image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2940&auto=format&fit=crop",
        deckVerified: false,
        platforms: ["windows", "mac"],
        originalPrice: 24.99
      },
      {
        name: "Cyber Knights",
        description: "Strategic cyberpunk RPG with deep character customization and branching storylines.",
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 29.99
      },
      {
        name: "Desert Nomad",
        description: "Atmospheric survival adventure in a vast procedurally generated desert.",
        image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "linux"],
        originalPrice: 19.99
      },
      {
        name: "Forest Guardian",
        description: "Magical metroidvania where you protect an ancient forest from corruption.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 16.99
      },
      {
        name: "Time Traders",
        description: "Economic simulation with a twist - trade goods across different time periods.",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2940&auto=format&fit=crop",
        deckVerified: false,
        platforms: ["windows", "mac"],
        originalPrice: 14.99
      },
      {
        name: "Mech Commander",
        description: "Build and customize your mech army in this tactical strategy game.",
        image: "https://images.unsplash.com/photo-1563207153-f403bf289096?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "linux"],
        originalPrice: 24.99
      }
    ]
  },
  { 
    name: "Tier 3", 
    minPrice: 25,
    games: [
      {
        name: "Lost Echoes",
        description: "Atmospheric horror adventure with a gripping narrative and stunning art direction.",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows"],
        originalPrice: 29.99
      },
      {
        name: "Starbound Legacy",
        description: "Epic space opera RPG with procedurally generated worlds and rich lore.",
        image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 34.99
      },
      {
        name: "Dragon's Ascent",
        description: "Epic fantasy RPG with dynamic weather and day/night cycle affecting gameplay.",
        image: "https://images.unsplash.com/photo-1561488111-5d800fd56b8a?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 39.99
      },
      {
        name: "Neon Streets",
        description: "Open-world cyberpunk adventure with ray-tracing and advanced AI systems.",
        image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows"],
        originalPrice: 49.99
      },
      {
        name: "Orbital Defense",
        description: "Base-building strategy game set on a space station with realistic physics.",
        image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "mac", "linux"],
        originalPrice: 24.99
      },
      {
        name: "Ancient Mysteries",
        description: "Archaeological adventure with puzzle-solving and ancient civilization mysteries.",
        image: "https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?q=80&w=2940&auto=format&fit=crop",
        deckVerified: false,
        platforms: ["windows", "mac"],
        originalPrice: 19.99
      },
      {
        name: "Arctic Survival",
        description: "Intense survival simulation in a harsh arctic environment with dynamic weather.",
        image: "https://images.unsplash.com/photo-1517459094519-7f85f0a54c8d?q=80&w=2940&auto=format&fit=crop",
        deckVerified: true,
        platforms: ["windows", "linux"],
        originalPrice: 29.99
      }
    ]
  }
];