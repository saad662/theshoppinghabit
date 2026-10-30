import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";
import blog4 from "@/assets/blog-4.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export type ProductItem = {
  name: string;
  tagline: string;
  description: string;
  price: string;
  edition: string;
  image: string;
  altImage: string;
  palette: { name: string; hex: string }[];
  features: string[];
};

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  authorRole: string;
  date: string;
  ts: number;
  readTime: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  trending: number;
  forYou: number;
  hot: boolean;
  accent: "brand" | "pop" | "mint" | "ink";
  intro: string;
  products: ProductItem[];
};

const images = [blog1, blog2, blog3, blog4];
const accents: Post["accent"][] = ["brand", "pop", "mint", "ink"];
const productImgs = [product1, product2, product3, product4];

const seed: Omit<Post, "id" | "image" | "accent" | "ts" | "products" | "intro">[] = [
  { title: "The death of the flat logo and the rise of depth", excerpt: "Spatial computing is forcing a fundamental shift in how brand marks are constructed. We trace the new dimensionality.", tag: "Identity", author: "Mira Okafor", authorRole: "Creative Director", date: "April 24, 2026", readTime: "8 min", views: 24800, likes: 1820, comments: 142, trending: 96, forYou: 88, hot: true },
  { title: "Neural interfaces and the user experience", excerpt: "What happens to UX when the input device is your intent? A field guide for designers entering the BCI era.", tag: "Technology", author: "Jules Verma", authorRole: "Principal Researcher", date: "April 12, 2026", readTime: "6 min", views: 18200, likes: 1340, comments: 88, trending: 88, forYou: 62, hot: true },
  { title: "Why maximalism is the new luxury for Gen Alpha", excerpt: "After a decade of restraint, density and texture are quietly winning. We look at the studios driving the shift.", tag: "Culture", author: "Tomás Brand", authorRole: "Editor at Large", date: "March 28, 2026", readTime: "5 min", views: 9420, likes: 612, comments: 47, trending: 64, forYou: 79, hot: false },
  { title: "Coded design: Building tools, not just pages", excerpt: "How a small studio replaced its handoff workflow with a single source of truth — and shipped 3× faster.", tag: "Process", author: "Iris Lemont", authorRole: "Design Engineer", date: "March 09, 2026", readTime: "10 min", views: 12700, likes: 980, comments: 121, trending: 71, forYou: 92, hot: false },
  { title: "A week inside a Tokyo type foundry", excerpt: "Inkstones, glyph proofs, and the slow architecture of a 14,000-character family.", tag: "Field Notes", author: "Hiro Tanaka", authorRole: "Photographer", date: "February 22, 2026", readTime: "12 min", views: 15400, likes: 1240, comments: 64, trending: 58, forYou: 71, hot: false },
  { title: "Anya Mehta on designing for stillness", excerpt: "The London-based art director on whitespace, refusal, and the politics of not shouting.", tag: "Interview", author: "Cole Davies", authorRole: "Features Editor", date: "February 11, 2026", readTime: "14 min", views: 8200, likes: 540, comments: 39, trending: 42, forYou: 84, hot: false },
  { title: "Ten micro-interactions worth stealing", excerpt: "A live, copy-paste reel of the small motion details that make interfaces feel alive.", tag: "Toolkit", author: "Priya Anand", authorRole: "Motion Designer", date: "January 30, 2026", readTime: "10 min", views: 33100, likes: 2410, comments: 198, trending: 92, forYou: 95, hot: true },
  { title: "The quiet return of the print object", excerpt: "Risograph zines, hand-bound annuals, and why studios are pressing things again.", tag: "Essay", author: "Noah Selman", authorRole: "Contributor", date: "January 18, 2026", readTime: "7 min", views: 6300, likes: 410, comments: 28, trending: 36, forYou: 59, hot: false },
  { title: "Variable type isn't a feature. It's a philosophy.", excerpt: "On axes, optical sizes, and how the best teams are designing systems, not fonts.", tag: "Type", author: "Lena Hoffmann", authorRole: "Type Designer", date: "January 04, 2026", readTime: "9 min", views: 14200, likes: 920, comments: 73, trending: 67, forYou: 81, hot: false },
  { title: "Designing motion that respects the reader", excerpt: "Easing curves, intent, and the case against motion-for-motion's-sake.", tag: "Motion", author: "Priya Anand", authorRole: "Motion Designer", date: "December 19, 2025", readTime: "6 min", views: 7800, likes: 480, comments: 32, trending: 45, forYou: 73, hot: false },
  { title: "What we learned from cold-rolling our own brass", excerpt: "Notes from a year of small-batch hardware, mistakes, and the geometry of patina.", tag: "Material", author: "Mira Okafor", authorRole: "Creative Director", date: "December 02, 2025", readTime: "11 min", views: 5400, likes: 350, comments: 21, trending: 28, forYou: 66, hot: false },
  { title: "The unexpected sound design of the new web", excerpt: "Audio cues are leaving Slack and entering the wider product canon. A primer.", tag: "Sound", author: "Jules Verma", authorRole: "Principal Researcher", date: "November 21, 2025", readTime: "5 min", views: 4900, likes: 280, comments: 18, trending: 22, forYou: 54, hot: false },
  { title: "The studio operating manual we wish existed", excerpt: "Hiring, pricing, refusing — a candid playbook from twelve independent founders.", tag: "Process", author: "Iris Lemont", authorRole: "Design Engineer", date: "November 04, 2025", readTime: "13 min", views: 19800, likes: 1610, comments: 152, trending: 76, forYou: 90, hot: true },
  { title: "Why we stopped using stock photography", excerpt: "And the four-week sprint that replaced 1,200 images with our own archive.", tag: "Process", author: "Hiro Tanaka", authorRole: "Photographer", date: "October 18, 2025", readTime: "8 min", views: 11200, likes: 780, comments: 64, trending: 51, forYou: 77, hot: false },
  { title: "The new editorial: half magazine, half product", excerpt: "How three independent journals are blurring the line between content and tool.", tag: "Culture", author: "Cole Davies", authorRole: "Features Editor", date: "October 02, 2025", readTime: "9 min", views: 8900, likes: 610, comments: 41, trending: 39, forYou: 70, hot: false },
  { title: "Drawing with constraints: a 30-day type challenge", excerpt: "One letter a day, one rule each. The constraint set that taught us the most.", tag: "Type", author: "Lena Hoffmann", authorRole: "Type Designer", date: "September 14, 2025", readTime: "7 min", views: 6700, likes: 420, comments: 36, trending: 31, forYou: 64, hot: false },
];

const palettes = [
  [{ name: "Ink", hex: "#0a0a0a" }, { name: "Cream", hex: "#f4ede1" }, { name: "Brand", hex: "#ff5b2e" }, { name: "Pop", hex: "#ffd23f" }],
  [{ name: "Graphite", hex: "#2b2b2b" }, { name: "Bone", hex: "#ece6d9" }, { name: "Pulse", hex: "#39d4a3" }, { name: "Aux", hex: "#5b8def" }],
  [{ name: "Magenta", hex: "#e94e77" }, { name: "Citrus", hex: "#ffb347" }, { name: "Deep", hex: "#1a1a3d" }, { name: "Mint", hex: "#a8e6cf" }],
  [{ name: "Acid", hex: "#caff33" }, { name: "Sky", hex: "#7ad7f0" }, { name: "Ink", hex: "#0a0a0a" }, { name: "Cream", hex: "#f4ede1" }],
];

const productPool: Omit<ProductItem, "image" | "altImage" | "palette">[] = [
  { name: "Monolith Mark No. 01", tagline: "A logo system carved from depth, not drawn flat.", description: "Twelve hours of CNC time and three days of hand-finishing go into every Monolith. Each one ships with a foiled certificate, the maker's mark, and a tiny brush for the patina you'll inevitably want to keep clean.", price: "$320", edition: "Edition of 120", features: ["Anodized aluminum", "Hand-numbered", "Lisbon-made"] },
  { name: "Signal Loop Headband", tagline: "An open-source BCI development kit for designers.", description: "A featherweight carbon arc with eight dry electrodes and a battery that lasts a full studio day. The SDK is on GitHub, the schematics are in the box, and the first 100 buyers get a video call with the engineering team.", price: "$890", edition: "Pre-order, ships Q3", features: ["Carbon fiber", "Open-source SDK", "8-channel EEG"] },
  { name: "Density Almanac Vol. III", tagline: "A maximalist reference for the post-restraint era.", description: "Four hundred pages, Smyth-sewn, foil-stamped, and printed on uncoated stock that turns the saturated ink into something closer to fabric. A reference book you'll keep open on the table, not closed on the shelf.", price: "$68", edition: "First print, 2,400 copies", features: ["Smyth-sewn", "Foil-stamped", "Uncoated stock"] },
  { name: "Source Studio License", tagline: "One source of truth — design, code, brand together.", description: "A workspace that finally treats design tokens, components, and brand assets as the same artifact. Bring your team, point it at your repo, and stop copy-pasting hex codes into Slack at midnight.", price: "$12 / seat", edition: "Annual studio plan", features: ["Figma plugin", "Local CLI", "Live tokens"] },
  { name: "Quiet Object Lamp", tagline: "A reading light that disappears when you're done with it.", description: "Brushed brass, a stem you can bend with two fingers, and a warm-white LED that dims to candle. Plug it in, find its spot, and forget about it — which is, of course, the whole point.", price: "$240", edition: "Open run", features: ["Brushed brass", "Bendable stem", "Warm dimming"] },
  { name: "Inkstone Type Specimen", tagline: "A printed ledger of the foundry's variable family.", description: "Every axis, every optical size, every weird in-between you'd never see in a PDF specimen. Printed on a Heidelberg in Tokyo and sewn by hand in a workshop you can visit.", price: "$48", edition: "Run of 600", features: ["Variable axes", "Letterpress cover", "Hand-sewn"] },
];

const intros = [
  "We didn't set out to build an object. We set out to answer a question. The object came later — quietly, after a year of arguments, three discarded prototypes, and one excellent bottle of wine in a Lisbon basement.",
  "This is a piece about what happens when you take the brief seriously enough to throw it away. The result is the small collection below, and the slightly longer story behind each one.",
  "Most things you read about new tools are written before anyone has lived with them. This isn't. We've spent six months with the pieces below — on desks, in studios, in one case in a backpack across three time zones.",
];

export const posts: Post[] = seed.map((p, i) => {
  const accent = accents[i % accents.length];
  const baseImg = images[i % images.length];
  const productCount = (i % 2 === 0) ? 3 : 2;
  const products: ProductItem[] = Array.from({ length: productCount }).map((_, j) => {
    const tpl = productPool[(i + j) % productPool.length];
    return {
      ...tpl,
      image: productImgs[(i + j) % productImgs.length],
      altImage: productImgs[(i + j + 1) % productImgs.length],
      palette: palettes[(i + j) % palettes.length],
    };
  });
  return {
    ...p,
    id: `b${i + 1}`,
    image: baseImg,
    accent,
    ts: seed.length - i,
    intro: intros[i % intros.length],
    products,
  };
});

export const allTags = Array.from(new Set(posts.map((p) => p.tag)));

export const accentChip: Record<Post["accent"], string> = {
  brand: "bg-brand text-brand-foreground",
  pop: "bg-pop text-pop-foreground",
  mint: "bg-mint text-ink",
  ink: "bg-ink text-cream",
};

export function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}
