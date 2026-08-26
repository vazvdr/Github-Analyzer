export function scrollToSection(
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
) {
    event.preventDefault();

    const section = document.getElementById(sectionId);

    if (!section) {
        return;
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}