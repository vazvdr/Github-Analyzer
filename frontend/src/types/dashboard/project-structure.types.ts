import type { GitHubAnalysisInfo, GitHubAnalysisStructure, GitHubTreeItem } from "@/lib/github/github.types";

export interface ProjectStructureProps {
    files: GitHubTreeItem[];
    structure?: GitHubAnalysisStructure;
    analysis?: GitHubAnalysisInfo;
}