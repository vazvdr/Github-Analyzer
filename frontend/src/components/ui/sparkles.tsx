"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";

type ParticlesProps = {
    id?: string;
    className?: string;
    background?: string;
    particleSize?: number;
    minSize?: number;
    maxSize?: number;
    speed?: number;
    particleColor?: string;
    particleDensity?: number;
};

export const SparklesCore = ({
    id,
    className,
    background,
    minSize = 1,
    maxSize = 3,
    speed = 4,
    particleColor = "#ffffff",
    particleDensity = 120,
}: ParticlesProps) => {
    const [initialized, setInitialized] = useState(false);
    const controls = useAnimation();
    const generatedId = useId();

    useEffect(() => {
        loadSlim()
            .then(() => {
                setInitialized(true);
            })
            .catch((error) => {
                console.error(
                    "Erro ao inicializar tsParticles:",
                    error
                );
            });
    }, []);

    const particlesLoaded = async (
        container?: Container
    ) => {
        if (!container) {
            return;
        }

        controls.start({
            opacity: 1,
            transition: {
                duration: 1,
            },
        });
    };

    const options = useMemo<ISourceOptions>(
        () => ({
            background: {
                color: {
                    value: background ?? "transparent",
                },
            },

            fullScreen: {
                enable: false,
                zIndex: 1,
            },

            fpsLimit: 120,

            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    onHover: {
                        enable: false,
                        mode: "repulse",
                    },
                },

                modes: {
                    push: {
                        quantity: 4,
                    },

                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                },
            },

            particles: {
                color: {
                    value: particleColor,
                },

                move: {
                    enable: true,
                    speed: {
                        min: 0.1,
                        max: speed,
                    },
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "out",
                    },
                },

                number: {
                    density: {
                        enable: true,
                        width: 400,
                        height: 400,
                    },
                    value: particleDensity,
                },

                opacity: {
                    value: {
                        min: 0.1,
                        max: 1,
                    },

                    animation: {
                        enable: true,
                        speed,
                        startValue: "random",
                        destroy: "none",
                    },
                },

                shape: {
                    type: "circle",
                },

                size: {
                    value: {
                        min: minSize,
                        max: maxSize,
                    },
                },

                links: {
                    enable: false,
                },
            },

            detectRetina: true,
        }),
        [
            background,
            maxSize,
            minSize,
            particleColor,
            particleDensity,
            speed,
        ]
    );

    return (
        <motion.div
            animate={controls}
            className={cn(
                "opacity-0",
                className
            )}
        >
            {initialized && (
                <Particles
                    id={id ?? generatedId}
                    className="h-full w-full"
                    particlesLoaded={particlesLoaded}
                    options={options}
                />
            )}
        </motion.div>
    );
};