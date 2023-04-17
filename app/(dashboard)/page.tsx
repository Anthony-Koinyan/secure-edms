"use client";

import React, { FormEvent } from "react";

export default function MyApp() {
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log(e.currentTarget.files);
  };

  return (
    <>
      <input type="file" onChange={uploadFile} />
    </>
  );
}
