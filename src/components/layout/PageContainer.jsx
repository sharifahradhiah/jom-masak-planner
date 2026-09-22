export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8 ${className}`}>
      {children}
    </div>
  );
}
