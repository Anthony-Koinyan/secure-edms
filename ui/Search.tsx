"use client";
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";
export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`flex w-2/3 bg-[#F2F5F6] rounded-lg ${
        isFocused ? "ring-2 ring-[#7070FE]" : ""
      } items-center`}
    >
      <button className="mx-6 rounded-full my-auto hover:bg-gray-300 p-2 h-10 w-10 focus:outline-none focus:ring-2 focus:ring-[#7070FE]">
        <FontAwesomeIcon icon={faSearch} className="text-[#16171B]" />
      </button>
      <input
        type="text"
        className="py-6 h-10 bg-[#F2F5F6] outline-none w-full"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <button className="mx-6 rounded-full my-auto hover:bg-gray-300 p-2 h-10 w-10 focus:outline-none focus:ring-2 focus:ring-[#7070FE]">
        <FontAwesomeIcon icon={faSliders} className="text-[#16171B]" />
      </button>
    </div>
  );
}
