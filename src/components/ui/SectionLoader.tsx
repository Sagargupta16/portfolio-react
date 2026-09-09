interface SectionLoaderProps {
   label: string;
   loading: boolean;
}

const SectionLoader = ({ label, loading }: SectionLoaderProps) => (
   <div
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-16"
      role={loading ? "status" : undefined}
      aria-label={loading ? `Loading ${label}` : undefined}
   >
      <div aria-hidden="true" className={loading ? "animate-pulse" : undefined}>
         <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            {label}
         </p>
         <div className="mt-4 mb-8 h-8 w-48 rounded-lg bg-white/[0.08]" />
         <div className="space-y-3">
            <div className="h-3 rounded bg-white/[0.05]" />
            <div className="h-3 w-5/6 rounded bg-white/[0.05]" />
            <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
         </div>
      </div>
   </div>
);

export default SectionLoader;
