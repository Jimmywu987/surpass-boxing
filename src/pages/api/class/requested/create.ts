import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { setLimit, people, ...data } = req.body;
    const user = session?.user as User;
    if (!user.admin) {
      const lessons = await prisma.lessons.findFirst({
        where: {
          userId: user.id,
          expiryDate: { gte: new Date() },
          lesson: {
            gt: 0,
          },
        },
      });
      if (!lessons) {
        return res
          .status(401)
          .json({ errorMessage: "You don't have any lessons left" });
      }
    }
    let regularBookingTimeSlotId = data.regularBookingTimeSlotId ?? null;

    const weekday = format(new Date(data.date), "EEEE").toLowerCase();

    if (!regularBookingTimeSlotId) {
      let hasCoachName = {};
      if (data.coachName) {
        hasCoachName = {
          coach: {
            username: data.coachName,
          },
        };
      }
      const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst(
        {
          where: {
            [weekday]: true,
            startTime: data.startTime,
            endTime: data.endTime,
            className: data.className,
            ...hasCoachName,
          },
        }
      );
      if (regularBookingSlot) {
        regularBookingTimeSlotId = regularBookingSlot.id;
      }
    }
    let addOneUserToClass = {};
    if (!user.admin) {
      addOneUserToClass = {
        userOnBookingTimeSlots: {
          create: {
            userId: user.id,
          },
        },
      };
    }
    const response = await prisma.bookingTimeSlots.create({
      data: {
        ...data,
        coachName: !!data.coachName ? data.coachName : null,
        numberOfParticipants: setLimit ? people : null,
        regularBookingTimeSlotId,
        ...addOneUserToClass,
      },
    });
    return res.status(201).json({ type: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
