import z from 'zod'

import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../lib/prisma'

const activitySchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
})

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/links',
    {
      schema: {
        body: activitySchema,
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params
      const { title, url } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new Error('Trip not found')
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      })

      return {
        activityId: link.id,
      }
    },
  )
}
