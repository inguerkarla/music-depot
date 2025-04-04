import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");
    const date = searchParams.get("date");

    let data = [];
    switch (view) {
      case "ViewLessons":
        if (date) {
          // Fetch lessons for the specific date
          const startOfDay = new Date(`${date}T00:00:00.000Z`);
          const endOfDay = new Date(`${date}T23:59:59.999Z`);
          data = await prisma.lessons.findMany({
            where: {
              start_date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            include: {
              instructors: {
                include: {
                  users: true, 
                },
              },
              lesson_levels: true, 
              lesson_schedule: true, 
            },
          });
        } else {
          // Fetch all lessons if no date is provided
          data = await prisma.lessons.findMany({
            include: {
              instructors: {
                include: {
                  users: true, 
                },
              },
              lesson_levels: true, 
              lesson_schedule: true, 
            },
          });
        }
        break;


      default:
        return NextResponse.json({ error: "Invalid view type" }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}