import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
	await prisma.role.deleteMany();

	const userRole = await prisma.role.upsert({
		where: { name: 'user' },
		update: {},
		create: {
			name: 'user',
			description: 'Default user role',
		},
	});

	const adminRole = await prisma.role.upsert({
		where: { name: 'admin' },
		update: {},
		create: {
			name: 'admin',
			description: 'Administrator role',
		},
	});

	console.log({ userRole, adminRole });
}

seed()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
