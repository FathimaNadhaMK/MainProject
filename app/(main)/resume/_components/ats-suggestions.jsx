"use client";

import {
  Hash,
  AlignLeft,
  Award,
  Briefcase,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const suggestionCategories = [
  {
    id: "keywords",
    title: "Missing Keywords",
    icon: Hash,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "formatting",
    title: "Formatting Issues",
    icon: AlignLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "skills",
    title: "Skills Section",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    id: "projects",
    title: "Projects & Achievements",
    icon: Briefcase,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  {
    id: "grammar",
    title: "Grammar & Language",
    icon: FileCheck,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950",
  },
];

export default function AtsSuggestions({ suggestions }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">AI Improvement Suggestions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestionCategories.map((category) => {
          const Icon = category.icon;
          const items = suggestions[category.id] || [];

          return (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <Icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Looks good!
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AtsScoreDisplay({ score }) {
  const getScoreStatus = (score) => {
    if (score >= 75) return { label: "Good", variant: "success", icon: CheckCircle };
    if (score >= 50) return { label: "Needs Improvement", variant: "warning", icon: AlertTriangle };
    return { label: "Poor", variant: "destructive", icon: XCircle };
  };

  const status = getScoreStatus(score);
  const StatusIcon = status.icon;

  const getScoreColor = (score) => {
    if (score >= 75) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">ATS Compatibility Score</h3>
        <Badge
          variant={status.variant}
          className="flex items-center gap-1 px-3 py-1"
        >
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your Score</span>
          <span className="font-bold text-2xl">{score}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${getScoreColor(score)} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {score >= 75
            ? "Your resume is well-optimized for ATS systems!"
            : score >= 50
            ? "Your resume could use some improvements to pass ATS filters."
            : "Your resume needs significant improvements to be ATS-friendly."}
        </p>
      </div>
    </div>
  );
}
