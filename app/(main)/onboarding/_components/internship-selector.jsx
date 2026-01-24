"use client";

import { Label } from "@/components/ui/label";

const INTERNSHIP_OPTIONS = [
    { id: "gsoc", label: "Google Summer of Code (GSoC)" },
    { id: "outreachy", label: "Outreachy" },
    { id: "mlh", label: "MLH Fellowship" },
    { id: "company", label: "Company Internships" },
    { id: "research", label: "Research Internships" },
];

export default function InternshipSelector({ selected = [], onChange }) {
    const toggleInternship = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter((i) => i !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-gray-300">Internship Interest (Optional)</Label>

            <div className="space-y-2">
                {INTERNSHIP_OPTIONS.map((option) => (
                    <label
                        key={option.id}
                        className={`
              flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
              ${selected.includes(option.id)
                                ? "bg-green-600/20 border-2 border-green-500/50"
                                : "bg-gray-900 border border-white/10 hover:border-green-500/30"
                            }
            `}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(option.id)}
                            onChange={() => toggleInternship(option.id)}
                            className="w-5 h-5 rounded accent-green-500 cursor-pointer"
                        />
                        <span
                            className={`text-sm ${selected.includes(option.id)
                                    ? "text-green-300 font-medium"
                                    : "text-gray-400"
                                }`}
                        >
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>

            <p className="text-xs text-gray-500">
                Select the types of internships you're interested in
            </p>
        </div>
    );
}
