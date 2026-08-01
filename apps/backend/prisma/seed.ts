import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categorias = ['Cervezas', 'Vinos', 'Whisky', 'Ron', 'Vodka', 'Snacks', 'Otros'];
  for (const nombre of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const direct = await prisma.impulsadora.findFirst({ where: { nombre: 'Venta Directa / Sin Impulsadora' } });
  if (!direct) {
    await prisma.impulsadora.create({ data: { nombre: 'Venta Directa / Sin Impulsadora' } });
  }

  for (const nombre of ['Janely', 'Maria', 'Andrea']) {
    const exists = await prisma.impulsadora.findFirst({ where: { nombre } });
    if (!exists) {
      await prisma.impulsadora.create({ data: { nombre } });
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminFirebaseUid = process.env.SEED_ADMIN_FIREBASE_UID;
  if (adminEmail && adminFirebaseUid) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.ADMIN, firebaseUid: adminFirebaseUid },
      create: {
        email: adminEmail,
        firebaseUid: adminFirebaseUid,
        name: process.env.SEED_ADMIN_NAME ?? 'Administrador La Ruta',
        role: Role.ADMIN,
      },
    });
  }

  const whisky = await prisma.categoria.findUnique({ where: { nombre: 'Whisky' } });
  const cervezas = await prisma.categoria.findUnique({ where: { nombre: 'Cervezas' } });
  const vodka = await prisma.categoria.findUnique({ where: { nombre: 'Vodka' } });

  const samples = [
    { nombre: 'Whisky Black Label', categoriaId: whisky!.id, precioCompra: 110, precioVenta: 150, stock: 8, stockMinimo: 3 },
    { nombre: 'Cerveza Pacena 620ml', categoriaId: cervezas!.id, precioCompra: 8.5, precioVenta: 12, stock: 45, stockMinimo: 10 },
    { nombre: 'Vodka Absolut 750ml', categoriaId: vodka!.id, precioCompra: 55, precioVenta: 75, stock: 2, stockMinimo: 5 },
  ];

  for (const product of samples) {
    if (!product.categoriaId) continue;
    const exists = await prisma.producto.findFirst({ where: { nombre: product.nombre } });
    if (!exists) {
      await prisma.producto.create({ data: product });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
