export default function LivePreview({ resume }) {
    return (
        <div id="hireReadyPreview" className="text-gray-900 font-sans leading-relaxed p-6 bg-white rounded-md shadow-md">
            <div className="border-b border-gray-300 pb-3 mb-4">
                <h2 className="text-3xl font-bold">{resume.name || "Your Name"}</h2>
                <p className="text-gray-600">{resume.email || "email@example.com"} | {resume.phone || "123-456-7890"}</p>
            </div>

            <div className="mb-5">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Summary</h3>
                <p className="italic text-gray-700">{resume.summary || "Professional summary goes here."}</p>
            </div>

            {resume.experience && resume.experience.length > 0 && (
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Experience</h3>
                    {resume.experience.map((exp, idx) => (
                        <div key={idx} className="mb-4">
                            <p className="font-semibold text-gray-800">{exp.role || "Role"} @ {exp.company || "Company"}</p>
                            <p className="text-sm italic text-gray-600">{exp.dates || "Dates"}</p>
                            <ul className="list-disc list-inside mt-1 text-gray-700">
                                {exp.bullets && exp.bullets.length > 0
                                    ? exp.bullets.map((b, i) => <li key={i}>{b}</li>)
                                    : <li>Achievement bullet</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Skills</h3>
                <p className="text-gray-700">{resume.skills.length > 0 ? resume.skills.join(", ") : "Skill 1, Skill 2"}</p>
            </div>
        </div>
    );
}
