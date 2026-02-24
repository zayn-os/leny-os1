import { saveAs } from 'file-saver';

export const downloadSourceCode = async () => {
    try {
        // Fetch the zip file from the backend
        const response = await fetch('/api/download-source');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        
        // Save the blob as a zip file
        saveAs(blob, 'lifeos-source.zip');
    } catch (error) {
        console.error("Failed to download source:", error);
        alert("Failed to download source code. Please try again.");
    }
};
