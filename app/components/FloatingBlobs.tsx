'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Blob = ({ color, size, initialX, initialY, duration }: {
    color: string;
    size: string;
    initialX: string;
    initialY: string;
    duration: number;
}) => {
    return (
        <motion.div
            className="absolute rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                left: initialX,
                top: initialY,
            }}
            animate={{
                x: [0, 50, -50, 0],
                y: [0, -30, 30, 0],
                scale: [1, 1.1, 0.9, 1],
                opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
};

export default function FloatingBlobs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <Blob
                color="#D4FF00"
                size="40vw"
                initialX="-10%"
                initialY="-10%"
                duration={25}
            />
            <Blob
                color="#FF0099"
                size="45vw"
                initialX="60%"
                initialY="60%"
                duration={30}
            />
            <Blob
                color="#00D4FF"
                size="35vw"
                initialX="20%"
                initialY="30%"
                duration={35}
            />
            <Blob
                color="#D4FF00"
                size="30vw"
                initialX="70%"
                initialY="-5%"
                duration={28}
            />
        </div>
    );
}
