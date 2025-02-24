import z from 'zod'

import { dayjs } from '../lib/dayjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-errors'

const activitySchema = z.object({
  title: z.string().min(3),
  occurs_at: z.coerce.date(),
})

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities',
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
      const { title, occurs_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found')
      }

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new ClientError('Occurs date can not be before start date')
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new ClientError('Occurs date can not be after end date')
      }

      const dateIsAlreadyInUse = await prisma.activity.findFirst({
        where: {
          occurs_at,
        },
      })

      if (dateIsAlreadyInUse) {
        throw new ClientError('There is already an activity at that time')
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      })

      return {
        activityId: activity.id,
      }
    },
  )
}
