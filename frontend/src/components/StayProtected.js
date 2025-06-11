import React from "react";

function StayProtected() {
  return (
    <section className="bg-blue-900 text-white py-20 px-6 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Protected</h2>
        <p className="mb-6 text-base text-blue-200">
          Subscribe to our newsletter for the latest security threats, antivirus updates, and exclusive offers.
        </p>

        <form className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full sm:w-auto px-5 py-3 rounded text-black focus:outline-none focus:ring focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white px-6 py-3 rounded transition"
          >
            Subscribe <span className="ml-1">📩</span>
          </button>
        </form>

        <p className="text-xs text-blue-300 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}

export default StayProtected;
