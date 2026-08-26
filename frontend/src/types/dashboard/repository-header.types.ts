export interface RepositoryHeaderProps {
    repositoryUrl: string;
    owner: string;
    repositoryName: string;
    description: string | null;
    isPrivate: boolean;
}