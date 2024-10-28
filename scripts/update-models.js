import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingModels() {
  // Update FWOG model
  await prisma.availableModel.update({
    where: { id: 'fwog' },
    data: {
      owner: 'redaitoronto',
      modelId: 'fwog',
    },
  })

  // Update MEW model
  await prisma.availableModel.update({
    where: { id: 'mew' },
    data: {
      owner: 'redaitoronto',
      modelId: 'mew',
    },
  })

  console.log('Models updated successfully')
}

updateExistingModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
