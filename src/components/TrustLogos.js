import React from 'react';
import Image from 'next/image';

export default function TrustLogos() {
  return (
    <div className="reassurances-container">
      <div className="flex items-center justify-center">
        <Image
          src="/logos/cb_visa_mastercard_logo-1.png"
          alt="Visa / Mastercard"
          width={200}
          height={40}
          className="opacity-80 hover:opacity-100 transition"
        />
      </div>
      <div className="flex items-center justify-center">
        <Image
          src="/logos/stripe.png"
          alt="Stripe"
          width={100}
          height={40}
          className="opacity-80 hover:opacity-100 transition"
        />
      </div>
      <div className="flex items-center justify-center">
        <Image
          src="/logos/ssl-secured.jpg"
          alt="SSL Secure"
          width={100}
          height={70}
          className="opacity-80 hover:opacity-100 transition"
        />
      </div>
    </div>
  );
}
