import z from 'zod'
import nodemailer from 'nodemailer'

import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-errors'
import { env } from '../env'

const activitySchema = z.object({
  email: z.string().email(),
})

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
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
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },

        include: {
          participants: {
            select: {
              email: true,
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found')
      }

      const participantsEmail = trip.participants.map(
        (participant) => participant.email,
      )

      if (participantsEmail.includes(email)) {
        throw new ClientError('E-mail already added')
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: trip.id,
        },
      })

      const formattedStartDate = dayjs(trip.starts_at).format('LL')
      const formattedEndDate = dayjs(trip.ends_at).format('LL')

      const mail = await getMailClient()

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plan.ner',
          address: 'oi@plan.ner',
        },

        to: participant.email,

        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,

        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você for convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate} a <strong>${formattedEndDate}</strong></p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo: </p>
            <p></p>
            <p>
              <a href="${confirmationLink}">
                Confirmar presença
              </a>
            </p>
          </div>
      `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return {
        participantId: participant.id,
      }
    },
  )
}
