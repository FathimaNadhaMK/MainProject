"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const COMPANIES = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Tesla",
    "Uber",
    "Airbnb",
    "Stripe",
    "Salesforce",
    "Adobe",
    "Oracle",
    "IBM",
    "TCS",
    "Infosys",
    "Wipro",
    "Cognizant",
    "Accenture",
    "Startups",
];

export default function CompanySelector({ selected = [], onChange }) {
    const toggleCompany = (company) => {
        if (selected.includes(company)) {
            onChange(selected.filter((c) => c !== company));
        } else {
            onChange([...selected, company]);
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-gray-300">Target Companies (Optional)</Label>

            {/* Selected companies */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded-lg border border-white/5">
                    {selected.map((company) => (
                        <Badge
                            key={company}
                            variant="secondary"
                            className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1.5"
                        >
                            {company}
                            <button
                                type="button"
                                onClick={() => toggleCompany(company)}
                                className="ml-2 hover:text-red-400 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Company grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {COMPANIES.map((company) => (
                    <button
                        key={company}
                        type="button"
                        onClick={() => toggleCompany(company)}
                        className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${selected.includes(company)
                                ? "bg-purple-600 text-white border-2 border-purple-400"
                                : "bg-gray-900 text-gray-400 border border-white/10 hover:border-purple-500/50 hover:text-purple-300"
                            }
            `}
                    >
                        {company}
                    </button>
                ))}
            </div>

            <p className="text-xs text-gray-500">
                Select companies you're interested in working for
            </p>
        </div>
    );
}
