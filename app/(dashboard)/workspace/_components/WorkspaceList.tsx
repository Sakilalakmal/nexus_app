import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Oranienbaum } from "next/font/google";
import React from "react";

const Organization = [
  {
    id: "1",
    name: "team 1",
    avatar: "t1",
  },
  {
    id: "2",
    name: "Edu team",
    avatar: "ET",
  },
  {
    id: "3",
    name: "Conding gang",
    avatar: "CG",
  },
];

const colorCombinations = [
  "bg-blue-500 hover:bg-blue-600 text-white",
  "bg-emerald-500 hover:bg-emerald-600 text-white",
  "bg-purple-500 hover:bg-purple-600 text-white",
  "bg-yellow-500 hover:bg-yellow-600 text-white",
  "bg-rose-500 hover:bg-rose-600 text-white",
  "bg-amber-500 hover:bg-amber-600 text-white",
  "bg-indigo-500 hover:bg-indigo-600 text-white",
  "bg-cyan-500 hover:bg-cyan-600 text-white",
  "bg-pink-500 hover:bg-pink-600 text-white",
];

const getWorkspaceColorClass = (id: number) => {
  const charSum = id
    .toString()
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const colorIndex = charSum % colorCombinations.length;
  return colorCombinations[colorIndex];
};

const WorkspaceList = () => {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {Organization.map((org, index) => (
          <Tooltip key={org.id}>
            <TooltipTrigger asChild>
              <Button
                // className="size-12 transition-all duration-200"
                className={cn(
                  "size-12 transition-all duration-200",
                  getWorkspaceColorClass(parseInt(org.id))
                )}
                size={"icon"}
              >
                <span className="text-sm font-semibold">{org.avatar}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{org.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceList;
