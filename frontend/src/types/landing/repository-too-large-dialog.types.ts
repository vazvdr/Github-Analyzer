export interface RepositoryTooLargeDialogProps {
    repositorySize: number;
    onClose: () => void;
    formatRepositorySize: (sizeInKb: number) => string;
}