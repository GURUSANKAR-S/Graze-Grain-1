import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user with hashed password
  const hashedPassword = await bcrypt.hash('password', 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('Created admin user:', adminUser.email);

  // Create menu categories
  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { slug: 'appetizers' },
      update: {},
      create: {
        name: 'Appetizers',
        slug: 'appetizers',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.menuCategory.upsert({
      where: { slug: 'main-courses' },
      update: {},
      create: {
        name: 'Main Courses',
        slug: 'main-courses',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.menuCategory.upsert({
      where: { slug: 'desserts' },
      update: {},
      create: {
        name: 'Desserts',
        slug: 'desserts',
        displayOrder: 3,
        isActive: true,
      },
    }),
    prisma.menuCategory.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: {
        name: 'Beverages',
        slug: 'beverages',
        displayOrder: 4,
        isActive: true,
      },
    }),
  ]);
  console.log('Created categories:', categories.map((c) => c.name).join(', '));

  // Create menu items
  const menuItems = [
    // Appetizers
    {
      name: 'Spicy Ramen',
      slug: 'spicy-ramen',
      description: 'A fiery and flavorful ramen to warm your soul.',
      price: 12.99,
      imageUrl: '/uploads/spicy-ramen.jpg',
      categoryId: categories[0].id,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Avocado Toast',
      slug: 'avocado-toast',
      description: 'Healthy and delicious, a perfect start to your day.',
      price: 8.99,
      imageUrl: '/uploads/avocado-toast.jpg',
      categoryId: categories[0].id,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Quinoa Salad',
      slug: 'quinoa-salad',
      description: 'A light and refreshing salad with a zesty vinaigrette.',
      price: 10.99,
      imageUrl: '/uploads/quinoa-salad.jpg',
      categoryId: categories[0].id,
      isFeatured: true,
      isAvailable: true,
    },
    // Main Courses
    {
      name: 'Classic Burger',
      slug: 'classic-burger',
      description: 'A juicy beef patty with all the classic fixings.',
      price: 14.99,
      imageUrl: '/uploads/classic-burger.jpg',
      categoryId: categories[1].id,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Grilled Salmon',
      slug: 'grilled-salmon',
      description: 'Fresh Atlantic salmon with herbs and lemon butter.',
      price: 18.99,
      imageUrl: '/uploads/grilled-salmon.jpg',
      categoryId: categories[1].id,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Chicken Parmesan',
      slug: 'chicken-parmesan',
      description: 'Crispy breaded chicken with marinara and mozzarella.',
      price: 16.99,
      imageUrl: '/uploads/chicken-parmesan.jpg',
      categoryId: categories[1].id,
      isFeatured: false,
      isAvailable: true,
    },
    // Desserts
    {
      name: 'Chocolate Cake',
      slug: 'chocolate-cake',
      description: 'A rich and decadent dessert to satisfy your sweet tooth.',
      price: 7.99,
      imageUrl: '/uploads/chocolate-cake.jpg',
      categoryId: categories[2].id,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Tiramisu',
      slug: 'tiramisu',
      description: 'Classic Italian coffee-flavored layered dessert.',
      price: 8.99,
      imageUrl: '/uploads/tiramisu.jpg',
      categoryId: categories[2].id,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Mango Kulfi',
      slug: 'mango-kulfi',
      description: 'Traditional frozen mango dessert with cardamom notes.',
      price: 6.99,
      imageUrl: '/uploads/mango-kulfi.jpg',
      categoryId: categories[2].id,
      isFeatured: false,
      isAvailable: true,
    },
    // Beverages
    {
      name: 'Matcha Latte',
      slug: 'matcha-latte',
      description: 'A creamy and energizing green tea latte.',
      price: 5.99,
      imageUrl: '/uploads/matcha-latte.jpg',
      categoryId: categories[3].id,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Fresh Orange Juice',
      slug: 'fresh-orange-juice',
      description: 'Freshly squeezed orange juice.',
      price: 4.99,
      imageUrl: '/uploads/fresh-orange-juice.jpg',
      categoryId: categories[3].id,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Masala Chai',
      slug: 'masala-chai',
      description: 'House brewed tea with ginger and warm spices.',
      price: 3.99,
      imageUrl: '/uploads/masala-chai.jpg',
      categoryId: categories[3].id,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'Cold Coffee',
      slug: 'cold-coffee',
      description: 'Iced coffee blended with milk and cane sugar.',
      price: 5.49,
      imageUrl: '/uploads/cold-coffee.jpg',
      categoryId: categories[3].id,
      isFeatured: false,
      isAvailable: false,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: item.categoryId,
        isFeatured: item.isFeatured,
        isAvailable: item.isAvailable,
      },
      create: item,
    });
  }
  console.log('Created menu items:', menuItems.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
