import Book from '../models/Book.js';

const seedBooks = [
  {
    title: "The Silent Forest",
    author: "Emily Hart",
    price: 20,
    offerPrice: 16,
    rating: 4.5,
    reviews: 45,
    description: "A suspenseful tale of mystery and survival in the wilderness.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    category: "Thrill",
    stock: 50
  },
  {
    title: "Beyond the Stars",
    author: "James Carter",
    price: 25,
    offerPrice: 20,
    rating: 4.7,
    reviews: 32,
    description: "An astronaut's journey through time, space, and self-discovery.",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    category: "Astronaut",
    stock: 30
  },
  {
    title: "History Unfolded",
    author: "Sarah Monroe",
    price: 22,
    offerPrice: 18,
    rating: 4.4,
    reviews: 28,
    description: "Dive deep into the events that shaped our world.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    category: "History",
    stock: 40
  },
  {
    title: "Fictional Realms",
    author: "Liam Grey",
    price: 18,
    offerPrice: 15,
    rating: 4.2,
    reviews: 40,
    description: "A world of imagination where anything is possible.",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    category: "Fiction",
    stock: 60
  },
  {
    title: "Verses of the Soul",
    author: "Nora Blake",
    price: 15,
    offerPrice: 12,
    rating: 4.8,
    reviews: 52,
    description: "A poetry collection that touches hearts and inspires minds.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    category: "Poetry",
    stock: 35
  },
  {
    title: "The Truth Within",
    author: "Daniel Ross",
    price: 24,
    offerPrice: 19,
    rating: 4.3,
    reviews: 33,
    description: "A powerful non-fiction book revealing hidden realities of life.",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    category: "Non-Fiction",
    stock: 45
  }
];

export const seedDatabase = async () => {
  try {
    const count = await Book.countDocuments();

    if (count === 0) {
      await Book.insertMany(seedBooks);
      console.log('Database seeded with sample books');
    } else {
      console.log('Database already contains books');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
