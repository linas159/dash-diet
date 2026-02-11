import Image from "next/image";

export default function SafeCheckout() {
  return (
    <div className="mt-3">
      <div className="text-center mb-1">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500">
          <span>GUARANTEED SAFE CHECKOUT</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap px-4">
        <Image
          src="/photos/visa.svg"
          alt="Visa"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/mastercard.svg"
          alt="Mastercard"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/maestro.svg"
          alt="maestro"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/apple-pay.svg"
          alt="Apple Pay"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/google-pay.svg"
          alt="Google Pay"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/paypal.svg"
          alt="PayPal"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
        <Image
          src="/photos/stripe.svg"
          alt="stripe"
          width={45}
          height={28}
          className="h-7 w-auto opacity-70"
        />
      </div>
    </div>
  );
}
