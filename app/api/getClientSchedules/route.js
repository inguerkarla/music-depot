import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId');
    
    // Set up the where clause for the query
    let whereClause = {
      client_id: {
        not: null, // Base condition: ensure client_id is not null
      }
    };
    
    // If clientId is provided in the request, add it to the where clause
    if (clientId) {
      whereClause = {
        ...whereClause,
        client_id: clientId, // Override with specific client_id
      };
    }
    
    // Fetch lesson schedules based on the where clause
    const schedules = await prisma.lesson_schedule.findMany({
      where: whereClause,
      select: {
        client_id: true,
        start_time: true,
        end_time: true,
        date: true,
        clients: { 
          select: {
            users: {
              select: {
                first_name: true,
                last_name: true,
              }
            }
          }
        },
        lessons: {
          select: {
            lesson_name: true
          }
        }
      },
    });

    // Format schedules for Big Calendar
    const formattedSchedules = schedules.map(schedule => {
      const start_time = new Date(schedule.start_time);
      const end_time = new Date(schedule.end_time);

      // Convert times to 'HH:mm' format
      const formattedStartTime = `${start_time.getHours().toString().padStart(2, '0')}:${start_time.getMinutes().toString().padStart(2, '0')}`;
      const formattedEndTime = `${end_time.getHours().toString().padStart(2, '0')}:${end_time.getMinutes().toString().padStart(2, '0')}`;
      const formattedDate = schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : null;
      
      const clientFirstName = schedule.clients?.users?.first_name;
      const clientLastName = schedule.clients?.users?.last_name;
      const lessonName = schedule.lessons.lesson_name;
      
      return {
        client_id: schedule.client_id,
        start: formattedStartTime, // Return as string in HH:mm format
        end: formattedEndTime,     // Return as string in HH:mm format
        title: `Lesson for ${clientFirstName} ${clientLastName}`, // Add client name
        date: formattedDate,      // Just the date part for events that span a full day
        client_first_name: clientFirstName, // Store the client's first name
        client_last_name: clientLastName,   // Store the client's last name
        lesson_name: lessonName,           // Store the lesson name
      };
    });
    
    // Output the formatted result
    return NextResponse.json(formattedSchedules); // Send the schedules as a response
  } catch (error) {
    console.error("Error fetching client schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch client schedules" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}