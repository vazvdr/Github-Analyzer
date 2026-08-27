import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";

type TreeNode = {
    [key: string]: TreeNode | null;
};

export class ProjectStructureUtils {
    static buildTree(
        files: ProjectStructureProps["files"]
    ): TreeNode {
        const root: TreeNode = {};

        for (const file of files) {
            const parts = file.path.split("/");
            let current = root;

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;

                if (isFile) {
                    current[part] = null;
                    return;
                }

                if (!current[part]) {
                    current[part] = {};
                }

                current = current[part] as TreeNode;
            });
        }

        return root;
    }

    static renderTree(
        node: TreeNode,
        prefix = ""
    ): string {
        return Object.entries(node)
            .map(([name, value], index, entries) => {
                const isLast = index === entries.length - 1;
                const connector = isLast ? "└── " : "├── ";
                const childPrefix =
                    prefix + (isLast ? "    " : "│   ");

                if (value === null) {
                    return `${prefix}${connector}${name}`;
                }

                return `${prefix}${connector}${name}/\n${this.renderTree(
                    value,
                    childPrefix
                )}`;
            })
            .join("\n");
    }

    static buildProjectStructure(
        files: ProjectStructureProps["files"]
    ): string {
        const tree = this.buildTree(files);

        return this.renderTree(tree);
    }
}