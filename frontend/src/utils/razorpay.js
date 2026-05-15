let scriptPromise;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(options) {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    if (!options.key || !options.order_id) {
      reject(new Error("Razorpay checkout is missing key or order id"));
      return;
    }
    const checkout = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    checkout.open();
  });
}
