/* eslint-disable no-unused-vars */
import { useState } from "react";

export default function Editor({ resume, setResume }) {
    const handleChange = (field, value) => setResume({ ...resume, [field]: value });

    const handleExperienceChange = (index, field, value) => {
        const newExperience = [...resume.experience];
        newExperience[index][field] = field === "bullets"
            ? value.split(",").map(b => b.trim())
            : value;
        setResume({ ...resume, experience: newExperience });
    };

    return (
        <div className="bg-white p-4 rounded shadow w-full md:w-80">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Resume Editor</h2>

            <label className="block mb-2 text-gray-700">
                Name
                <input
                    className="w-full border border-gray-300 rounded px-2 py-1 mt-1 focus:ring focus:ring-blue-300"
                    type="text"
                    value={resume.name}
                    onChange={e => handleChange("name", e.target.value)}
                />
            </label>

            <label className="block mb-2 text-gray-700">
                Email
                <input
                    className="w-full border border-gray-300 rounded px-2 py-1 mt-1 focus:ring focus:ring-blue-300"
                    type="email"
                    value={resume.email}
                    onChange={e => handleChange("email", e.target.value)}
                />
            </label>

            <label className="block mb-2 text-gray-700">
                Phone
                <input
                    className="w-full border border-gray-300 rounded px-2 py-1 mt-1 focus:ring focus:ring-blue-300"
                    type="text"
                    value={resume.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                />
            </label>

            <label className="block mb-2 text-gray-700">
                Summary
                <textarea
                    className="w-full border border-gray-300 rounded px-2 py-1 mt-1 focus:ring focus:ring-blue-300"
                    value={resume.summary}
                    onChange={e => handleChange("summary", e.target.value)}
                />
            </label>

            <h3 className="font-semibold mt-4 mb-2 text-gray-800">Experience</h3>
            {resume.experience.map((exp, idx) => (
                <div key={idx} className="mb-3 border border-gray-200 p-2 rounded">
                    <input
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring focus:ring-blue-300"
                        placeholder="Role"
                        value={exp.role}
                        onChange={e => handleExperienceChange(idx, "role", e.target.value)}
                    />
                    <input
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring focus:ring-blue-300"
                        placeholder="Company"
                        value={exp.company}
                        onChange={e => handleExperienceChange(idx, "company", e.target.value)}
                    />
                    <input
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring focus:ring-blue-300"
                        placeholder="Dates"
                        value={exp.dates}
                        onChange={e => handleExperienceChange(idx, "dates", e.target.value)}
                    />
                    <textarea
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-300"
                        placeholder="Bullets (comma separated)"
                        value={exp.bullets.join(", ")}
                        onChange={e => handleExperienceChange(idx, "bullets", e.target.value)}
                    />
                </div>
            ))}

            <label className="block mb-2 mt-2 text-gray-700">
                Skills (comma separated)
                <input
                    className="w-full border border-gray-300 rounded px-2 py-1 mt-1 focus:ring focus:ring-blue-300"
                    type="text"
                    value={resume.skills.join(", ")}
                    onChange={e => handleChange("skills", e.target.value.split(",").map(s => s.trim()))}
                />
            </label>
        </div>
    );
}
