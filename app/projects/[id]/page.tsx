"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const hasCheckedContent = useRef(false);

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string);
    }
  }, [params.id]);

  // Check if project has content and switch to writer mode
  useEffect(() => {
    if (
      !loadingProject &&
      currentProjectId &&
      chapters.length > 0 &&
      !hasCheckedContent.current
    ) {
      // If there are chapters with content, switch to writer mode
      const hasContent = chapters.some(
        (chapter) => chapter.content && chapter.content.trim().length > 0
      );
      if (hasContent) {
        hasCheckedContent.current = true;
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setViewMode("WRITER"), 0);
      }
    }
  }, [loadingProject, currentProjectId, chapters]);

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
