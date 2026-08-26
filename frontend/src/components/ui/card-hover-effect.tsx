"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type HoverEffectItem = {
    title: string;
    description: string;
    link?: string;
};

export const HoverEffect = ({
    items,
    className,
}: {
    items: HoverEffectItem[];
    className?: string;
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3",
                className
            )}
        >
            {items.map((item, idx) => {
                const content = (
                    <>
                        <AnimatePresence>
                            {hoveredIndex === idx && (
                                <motion.span
                                    className="absolute inset-0 block h-full w-full rounded-3xl bg-lime-500/10"
                                    layoutId="hoverBackground"
                                    initial={{ opacity: 0 }}
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
                                            delay: 0.2,
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
                    </>
                );

                if (item.link) {
                    return (
                        <a
                            href={item.link}
                            key={item.title}
                            className="group relative block h-full w-full p-2"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {content}
                        </a>
                    );
                }

                return (
                    <div
                        key={item.title}
                        className="group relative block h-full w-full p-2"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {content}
                    </div>
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
                "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-transparent bg-transparent p-4 group-hover:border-lime-500 dark:border-white/[0.2]",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">{children}</div>
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
                "mt-4 font-bold tracking-wide",
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
                "mt-8 text-sm leading-relaxed tracking-wide",
                className
            )}
        >
            {children}
        </p>
    );
};