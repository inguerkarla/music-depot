import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const { id } = params; // Extract the lesson ID from params

  try {
    // Delete the lesson from the database using the correct field name 'lesson_id'
    const deletedLesson = await prisma.lessons.delete({
      where: {
        lesson_id: String(id), // Use 'lesson_id' here
      },
    });

    return new Response(
      JSON.stringify({ message: 'Lesson deleted successfully', lesson: deletedLesson }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to delete lesson' }),
      { status: 500 }
    );
  }
}