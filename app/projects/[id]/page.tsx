"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStory } from "../../../components/StoryProvider";
import { SetupWizard } from "../../../components/SetupWizard";
import { WritingInterface } from "../../../components/WritingInterface";
import { Loader2 } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const { loadProject, bible, chapters } = useStory();
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"SETUP" | "WRITER" | "AUTO">("AUTO");

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string);
      setIsLoaded(true);
    }
  }, [params.id, loadProject]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  // Determine actual view based on mode and data state
  const hasContent = chapters.length > 0;
  const hasOutline = bible.outline && bible.outline.length > 0;
  const dataReadyForWriter = hasContent || hasOutline;

  // Logic:
  // If user explicitly chose a mode, respect it.
  // Otherwise, if data is ready, show Writer. Else show Setup.
  const showWriter =
    viewMode === "WRITER" || (viewMode === "AUTO" && dataReadyForWriter);

  // If explicit setup is requested, show Setup regardless of data.
  // Exception: If viewMode is 'SETUP', show Setup.
  const activeComponent =
    viewMode === "SETUP" ? "SETUP" : showWriter ? "WRITER" : "SETUP";

  return (
    <div className="min-h-screen bg-white">
      {activeComponent === "WRITER" ? (
        <WritingInterface onEditSetup={() => setViewMode("SETUP")} />
      ) : (
        <SetupWizard onFinish={() => setViewMode("WRITER")} />
      )}
    </div>
  );
}
