export interface ProjectItem {
  date: string;
  title: string;
  imagePath?: string;
  showInProjects?: boolean;
  featured?: boolean;
  githubLink?: string;
  externalLink?: string;
  tech?: string[];
}