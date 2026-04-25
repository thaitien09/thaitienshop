import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function check() {
  console.log('--- KIỂM TRA SẢN PHẨM ---');
  const products = await prisma.product.findMany({
    select: { id: true, name: true, costPrice: true, price: true }
  });
  console.table(products);

  console.log('\n--- KIỂM TRA CHI TIẾT ĐƠN HÀNG TT260425-TOC7 ---');
  const order = await prisma.order.findUnique({
    where: { orderCode: 'TT260425-TOC7' },
    include: { items: true }
  });

  if (order) {
    console.log(`Đơn hàng: ${order.orderCode}, Tổng tiền: ${order.totalAmount}`);
    console.table(order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      costPriceInOrder: item.costPrice
    })));
  } else {
    console.log('Không tìm thấy đơn hàng TT260425-TOC7');
  }
}

check()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
