interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`rounded-md border border-error bg-red-50 px-4 py-3 text-sm text-error ${className}`}
    >
      {message}
    </div>
  );
}
