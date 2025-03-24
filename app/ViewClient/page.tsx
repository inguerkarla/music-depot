'use client';
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Configure date-fns localizer
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface ClientSchedule {
  date: string;
  start: string;
  end: string;
  title: string;
  client_first_name: string;
  client_last_name: string;
  lesson_name: string;
}

// Function to convert 'HH:mm' to a Date object
const convertToDate = (dateString: string, timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(`${dateString}T00:00:00Z`); // Ensure the date is in UTC
  date.setHours(hours, minutes); // Set the correct hours and minutes
  return date;
};

// Helper function to convert UTC date to local time zone (America/New_York)
const convertToLocalTime = (date: string): Date => {
  // Ensure that the date string is valid
  const localDate = new Date(date);
  if (isNaN(localDate.getTime())) {
    console.error(`Invalid date string: ${date}`);
    return new Date(); // Return the current date as fallback
  }

  const localString = localDate.toLocaleString("en-US", { timeZone: "America/New_York" });
  return new Date(localString); // Converts the local string back to Date object
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch the data from API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/getClientSchedules");
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data: ClientSchedule[] = await response.json();

        // Map API response to Big Calendar events
        const mappedEvents = data.map((schedule) => {
          const { date, start, end, client_first_name, client_last_name, lesson_name } = schedule;

          const startDate = convertToDate(date, start); // Convert start time to Date object
          const endDate = convertToDate(date, end); // Convert end time to Date object

          // Adjust to local time zone
          const startLocal = convertToLocalTime(startDate.toISOString());
          const endLocal = convertToLocalTime(endDate.toISOString());

          return {
            title: `${client_first_name} ${client_last_name} for ${lesson_name}`,
            start: startLocal,
            end: endLocal,
          };
        });

        setEvents(mappedEvents);
        console.log('Mapped events:', mappedEvents);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-900">Client Schedule</h1>
      <div className="w-full max-w-4xl rounded-lg shadow-xl overflow-hidden bg-white">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month", "week", "day", "agenda"]}
          style={{
            height: "75vh",
          }}
          dayPropGetter={(date) => {
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            return {
              style: {
                backgroundColor: isWeekend ? "#f0f4f8" : "#ffffff",
                border: "1px solid #e5e7eb",
              },
            };
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: "#8E24AA",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 8px",
              fontWeight: "bold",
            },
          })}
          toolbarPropGetter={() => ({
            style: {
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              padding: "10px",
              fontSize: "16px",
              fontWeight: "bold",
            },
          })}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
