"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStory } from "../../../components/StoryProvider";
import { SetupWizard } from "../../../components/SetupWizard";
import { WritingInterface } from "../../../components/WritingInterface";
import Loading from "../../loading";

export default function ProjectPage() {
  const params = useParams();
  const { loadProject, bible, chapters, currentProjectId, loadingProject } =
    useStory();
  const [viewMode, setViewMode] = useState<"SETUP" | "WRITER">("SETUP");

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string);
    }
  }, [params.id]);

  if (loadingProject || !currentProjectId) {
    return <Loading />;
  }

  const activeComponent = viewMode;

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
