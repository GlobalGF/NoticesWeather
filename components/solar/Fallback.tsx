import React from "react";

interface FallbackProps {
  message: string;
}

const Fallback: React.FC<FallbackProps> = ({ message }) => (
  <section className="my-8 rounded-xl border-2 border-red-300 bg-red-50 p-6 shadow-md text-center">
    <h3 className="text-xl font-bold text-red-900 mb-2">Aviso</h3>
    <p className="text-red-800">{message}</p>
  </section>
);

export default Fallback;
