'use client'; 
import React from "react";
import Calendar from "../components/Calendar";

function ViewClient() {


  return (
  
      <div className="flex-grow p-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-900 text-center">View Client Scheduels</h1>
         <Calendar isView />
      </div>
  );
}

export default ViewClient; 
