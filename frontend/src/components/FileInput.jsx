import { useState, useEffect } from "react";

export default function FileInput({ label, required, onChange, error }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(e) {
    const file = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
    onChange(file);
  }

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-white/80">
        {label} {required && <span className="text-crimson-light">*</span>}
      </span>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-gold/30 bg-ink/60 p-3 sm:p-4">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-14 w-14 flex-shrink-0 rounded-lg object-cover sm:h-16 sm:w-16"
          />
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-charcoal text-2xl sm:h-16 sm:w-16">
            📷
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="min-w-0 flex-1 text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-ink hover:file:brightness-110 sm:text-sm sm:file:px-4 sm:file:py-2 sm:file:text-sm"
        />
      </div>
      {error && <p className="mt-1 text-xs text-crimson-light">{error}</p>}
    </label>
  );
}
