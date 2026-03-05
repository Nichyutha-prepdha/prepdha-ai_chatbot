import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Create default school
  const school = await prisma.school.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Default School',
    },
  })
  
  console.log('Created/updated school:', school)
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
