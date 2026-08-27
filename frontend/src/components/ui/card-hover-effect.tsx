"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type HoverEffectItem = {
    title: string;
    description: string;
    link?: string;
};

interface HoverEffectProps {
    items: HoverEffectItem[];
    className?: string;
}

export const HoverEffect = ({
    items,
    className,
}: HoverEffectProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3",
                className
            )}
        >
            {items.map((item, idx) => {
                const Wrapper = item.link ? "a" : "div";

                return (
                    <Wrapper
                        key={item.title}
                        {...(item.link ? { href: item.link } : {})}
                        className="group relative block h-full w-full p-2"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <AnimatePresence>
                            {hoveredIndex === idx && (
                                <motion.span
                                    className="card-hover-background absolute inset-0 block h-full w-full rounded-3xl"
                                    layoutId="hoverBackground"
                                    initial={{
                                        opacity: 0,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        transition: {
                                            duration: 0.15,
                                        },
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: {
                                            duration: 0.15,
                                            delay: 0.1,
                                        },
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        <Card>
                            <CardTitle>{item.title}</CardTitle>

                            <CardDescription>
                                {item.description}
                            </CardDescription>
                        </Card>
                    </Wrapper>
                );
            })}
        </div>
    );
};

export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-border p-4 transition-colors group-hover:card-hover-border",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4
            className={cn(
                "mt-4 font-bold tracking-wide text-foreground",
                className
            )}
        >
            {children}
        </h4>
    );
};

export const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                "mt-8 text-sm leading-relaxed tracking-wide text-muted-foreground",
                className
            )}
        >
            {children}
        </p>
    );
};