'use client'; 
import React from "react";
import Calendar from "../components/Calendar";

function NewSchedule() {


  return (
      <div className="flex-grow p-8">

                <h1 className="text-2xl font-bold mb-4 text-blue-900 text-center font-serif">Add Lessons</h1>
         <Calendar />
      </div>
  );
}

export default NewSchedule; 