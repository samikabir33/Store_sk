"use client";

const PHONE_NUMBER = "8801622132041"; // no +, no spaces (wa.me format)
const DEFAULT_MESSAGE = "Hi! I have a question about a product from Fahmida's Fashion.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 md:bottom-5 right-5 z-[200] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.73-1.87A11.93 11.93 0 0016.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm0 21.6a9.55 9.55 0 01-4.87-1.33l-.35-.207-3.65.883.89-3.556-.228-.365A9.53 9.53 0 016.4 15c0-5.302 4.3-9.6 9.601-9.6 5.301 0 9.6 4.298 9.6 9.6 0 5.302-4.299 9.6-9.6 9.6zm5.273-7.17c-.29-.145-1.716-.847-1.982-.944-.266-.097-.46-.145-.653.145-.194.29-.75.944-.92 1.138-.169.194-.338.218-.628.073-.29-.145-1.224-.451-2.332-1.437-.862-.769-1.444-1.718-1.613-2.008-.169-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.169.194-.29.29-.483.097-.194.048-.363-.024-.507-.073-.145-.653-1.574-.895-2.156-.236-.567-.476-.49-.653-.5-.169-.008-.363-.01-.556-.01-.194 0-.507.073-.773.363-.266.29-1.016.993-1.016 2.42 0 1.428 1.04 2.808 1.185 3.002.145.194 2.049 3.13 4.966 4.39.694.3 1.235.48 1.657.615.696.222 1.33.19 1.831.115.559-.083 1.716-.702 1.958-1.38.242-.678.242-1.259.169-1.38-.072-.121-.266-.194-.556-.339z" />
      </svg>
    </a>
  );
}
