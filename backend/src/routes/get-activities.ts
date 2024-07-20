import z from 'zod'

import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-errors'

function getDatesInRange({
  startDate,
  endDate,
}: {
  startDate: Date
  endDate: Date
}) {
  const dates = []
  let currentDate = dayjs(startDate)

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'))
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },

        include: {
          activities: {
            orderBy: {
              occurs_at: 'asc',
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found')
      }

      const datesBetweenStartDateAndEndDate: string[] = getDatesInRange({
        startDate: trip.starts_at,
        endDate: trip.ends_at,
      })

      const activitiesGroupByDate = datesBetweenStartDateAndEndDate.map(
        (date) => {
          return {
            date,
            activities: trip.activities.filter((activity) =>
              dayjs(activity.occurs_at).isSame(date, 'days'),
            ),
          }
        },
      )

      return {
        activities: activitiesGroupByDate,
      }
    },
  )
}
