import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const chefA = await prisma.user.upsert({
    where: { openId: 'chef_demo_a' },
    update: { nickname: '阿棕', avatarUrl: 'https://placehold.co/120x120/png?text=A' },
    create: { openId: 'chef_demo_a', nickname: '阿棕', avatarUrl: 'https://placehold.co/120x120/png?text=A' },
  });

  const chefB = await prisma.user.upsert({
    where: { openId: 'chef_demo_b' },
    update: { nickname: '小桃', avatarUrl: 'https://placehold.co/120x120/png?text=B' },
    create: { openId: 'chef_demo_b', nickname: '小桃', avatarUrl: 'https://placehold.co/120x120/png?text=B' },
  });

  const customer = await prisma.user.upsert({
    where: { openId: 'customer_demo' },
    update: { nickname: '今天想吃饭', avatarUrl: 'https://placehold.co/120x120/png?text=C' },
    create: { openId: 'customer_demo', nickname: '今天想吃饭', avatarUrl: 'https://placehold.co/120x120/png?text=C' },
  });

  await prisma.binding.upsert({
    where: { customerId_chefId: { customerId: customer.id, chefId: chefA.id } },
    update: {},
    create: { customerId: customer.id, chefId: chefA.id },
  });

  await prisma.menuItem.deleteMany({
    where: { chefId: { in: [chefA.id, chefB.id] } },
  });

  const menuSeeds = [
    {
      id: 'demo_chef_a_tomato_beef_rice',
      chefId: chefA.id,
      name: '番茄牛腩饭',
      description: '酸甜软烂，适合认真写信时吃。',
      textPrice: 28,
      imageUrl: 'https://placehold.co/300x200/png?text=%E7%95%AA%E8%8C%84%E7%89%9B%E8%85%A9',
    },
    {
      id: 'demo_chef_a_caramel_pudding',
      chefId: chefA.id,
      name: '焦糖布丁',
      description: '像回信一样温柔的甜点。',
      textPrice: 16,
      imageUrl: 'https://placehold.co/300x200/png?text=%E5%B8%83%E4%B8%81',
    },
    {
      id: 'demo_chef_b_creamy_pasta',
      chefId: chefB.id,
      name: '奶油蘑菇意面',
      description: '奶香浓郁，适合晚上点单。',
      textPrice: 22,
      imageUrl: 'https://placehold.co/300x200/png?text=%E6%84%8F%E9%9D%A2',
    },
  ];

  for (const item of menuSeeds) {
    await prisma.menuItem.create({ data: item });
  }

  await prisma.notificationSubscription.upsert({
    where: { userId_templateId: { userId: chefA.id, templateId: 'tmpl_demo' } },
    update: { status: 'accepted' },
    create: { userId: chefA.id, templateId: 'tmpl_demo', status: 'accepted' },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });