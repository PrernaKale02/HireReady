import html2pdf from "html2pdf.js";

export default function AIControls({ resume, setAnalysis }) {
    const analyzeResume = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resume)
            });
            const data = await response.json();
            if (data.analysis) setAnalysis(data.analysis);
            else setAnalysis(null);
        } catch (err) {
            alert("Backend not running or fetch failed");
            console.error(err);
        }
    };

    const exportPDF = () => {
        const element = document.getElementById("hireReadyPreview");
        if (element) html2pdf().from(element).save("HireReady_Resume.pdf");
        else alert("Preview not found!");
    };

    return (
        <div className="flex flex-col gap-2 mb-2">
            <button
                onClick={analyzeResume}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Analyze Resume
            </button>
            <button
                onClick={exportPDF}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
                Export PDF
            </button>
        </div>
    );
}
