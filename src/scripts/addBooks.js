import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

dotenv.config();

const books = [
  // Urdu Books
  {
    title: 'Peer-e-Kamil',
    author: 'Umera Ahmad',
    category: 'Urdu Fiction',
    description: 'A spiritual journey of two individuals seeking the perfect spiritual guide. A masterpiece of Urdu literature exploring faith, love, and redemption.',
    price: 450,
    offerPrice: 350,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    featured: true
  },
  {
    title: 'Aab-e-Hayat',
    author: 'Umera Ahmad',
    category: 'Urdu Fiction',
    description: 'A compelling story about life, relationships, and the search for meaning in modern times.',
    price: 400,
    offerPrice: 320,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    featured: false
  },
  {
    title: 'Raja Gidh',
    author: 'Bano Qudsia',
    category: 'Urdu Fiction',
    description: 'A philosophical novel exploring the concepts of halal and haram in relationships and society.',
    price: 500,
    offerPrice: 400,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    featured: true
  },
  {
    title: 'Kulliyat-e-Iqbal',
    author: 'Allama Iqbal',
    category: 'Urdu Poetry',
    description: 'Complete collection of poetry by the great philosopher-poet Allama Iqbal.',
    price: 800,
    offerPrice: 650,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    featured: true
  },
  {
    title: 'Deewan-e-Ghalib',
    author: 'Mirza Ghalib',
    category: 'Urdu Poetry',
    description: 'The timeless poetry collection of Mirza Ghalib, one of the greatest Urdu poets.',
    price: 600,
    offerPrice: 480,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    featured: false
  },

  // English Fiction
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'English Fiction',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    price: 550,
    offerPrice: 450,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    featured: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'English Fiction',
    description: 'A dystopian masterpiece about totalitarianism and surveillance in a future society.',
    price: 500,
    offerPrice: 400,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    featured: true
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'English Fiction',
    description: 'A romantic novel of manners set in Georgian England, exploring themes of love and social class.',
    price: 480,
    offerPrice: 380,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    featured: false
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'English Fiction',
    description: 'A tale of wealth, love, and the American Dream in the Jazz Age.',
    price: 520,
    offerPrice: 420,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    featured: false
  },
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    category: 'English Fiction',
    description: 'The magical beginning of Harry Potter\'s journey at Hogwarts School of Witchcraft and Wizardry.',
    price: 650,
    offerPrice: 550,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    featured: true
  },

  // Science Books
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    description: 'An exploration of the universe, from the Big Bang to black holes, explained for general readers.',
    price: 700,
    offerPrice: 600,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    featured: true
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'Science',
    description: 'A groundbreaking narrative of humanity\'s creation and evolution.',
    price: 750,
    offerPrice: 650,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
    featured: true
  },
  {
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    category: 'Science',
    description: 'A revolutionary look at evolution from the gene\'s point of view.',
    price: 680,
    offerPrice: 580,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    featured: false
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    category: 'Science',
    description: 'A journey through space and time, exploring the universe and our place in it.',
    price: 720,
    offerPrice: 620,
    stock: 42,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
    featured: true
  },
  {
    title: 'The Origin of Species',
    author: 'Charles Darwin',
    category: 'Science',
    description: 'The foundational work on evolutionary biology that changed our understanding of life.',
    price: 600,
    offerPrice: 500,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    featured: false
  },

  // Business & Self-Help
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    description: 'An easy and proven way to build good habits and break bad ones.',
    price: 550,
    offerPrice: 450,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    featured: true
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    category: 'Self-Help',
    description: 'The classic guide to success and wealth creation through positive thinking.',
    price: 480,
    offerPrice: 380,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    featured: false
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    category: 'Business',
    description: 'What the rich teach their kids about money that the poor and middle class do not.',
    price: 520,
    offerPrice: 420,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    featured: true
  },

  // History
  {
    title: 'The History of Pakistan',
    author: 'K.K. Aziz',
    category: 'History',
    description: 'A comprehensive account of Pakistan\'s history from ancient times to modern era.',
    price: 650,
    offerPrice: 550,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    featured: false
  },
  {
    title: 'A History of the World in 100 Objects',
    author: 'Neil MacGregor',
    category: 'History',
    description: 'World history told through 100 objects from the British Museum.',
    price: 800,
    offerPrice: 700,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    featured: false
  },

  // Children's Books
  {
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    category: 'Children',
    description: 'A poetic tale about a young prince who travels from planet to planet.',
    price: 350,
    offerPrice: 280,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    featured: true
  },
  {
    title: 'Charlotte\'s Web',
    author: 'E.B. White',
    category: 'Children',
    description: 'The story of a pig named Wilbur and his friendship with a spider named Charlotte.',
    price: 380,
    offerPrice: 300,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
    featured: false
  },

  // Islamic Books
  {
    title: 'The Sealed Nectar',
    author: 'Safiur Rahman Mubarakpuri',
    category: 'Islamic',
    description: 'A complete biography of Prophet Muhammad (PBUH).',
    price: 550,
    offerPrice: 450,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    featured: true
  },
  {
    title: 'In the Footsteps of the Prophet',
    author: 'Tariq Ramadan',
    category: 'Islamic',
    description: 'Lessons from the life of Muhammad for modern times.',
    price: 600,
    offerPrice: 500,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
    featured: false
  },

  // Technology
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    description: 'A handbook of agile software craftsmanship.',
    price: 850,
    offerPrice: 750,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    featured: true
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    category: 'Technology',
    description: 'Your journey to mastery in software development.',
    price: 900,
    offerPrice: 800,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    featured: false
  }
];

const addBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert new books
    const result = await Book.insertMany(books);
    console.log(`Successfully added ${result.length} books to the database`);

    // Display summary by category
    const categories = [...new Set(books.map(book => book.category))];
    console.log('\nBooks added by category:');
    categories.forEach(category => {
      const count = books.filter(book => book.category === category).length;
      console.log(`  ${category}: ${count} books`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding books:', error);
    process.exit(1);
  }
};

addBooks();
