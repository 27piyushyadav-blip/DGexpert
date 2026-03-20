"use client";

export function UploadButton({ 
  onClientUploadComplete, 
  onUploadBegin, 
  onUploadError,
  accept,
  children,
  ...buttonProps 
}) {
  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept || "image/*";
    
    try {
      // Notify upload begin
      onUploadBegin?.();
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onClientUploadComplete?.([{ url, name: file.name }]);
        } else {
          // Handle case where no file was selected
          const error = new Error("No file selected");
          onUploadError?.(error);
        }
      };
      
      input.onerror = (error) => {
        const uploadError = new Error("File input error occurred");
        onUploadError?.(uploadError);
      };
      
      input.click();
    } catch (error) {
      onUploadError?.(error as Error);
    }
  };

  return (
    <button type="button" onClick={handleClick} {...buttonProps}>
      {children || "Upload"}
    </button>
  );
}