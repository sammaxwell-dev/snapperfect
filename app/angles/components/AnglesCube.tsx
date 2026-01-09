'use client';

import { useRef, useEffect, memo, useMemo, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface AnglesCubeProps {
    rotation: number;
    tilt: number;
    zoom: number;
    onAngleChange: (rotation: number, tilt: number) => void;
    onFrontFaceClick?: () => void;
}

// Function to create a label texture efficiently
function createLabelTexture(label: string, isFront: boolean = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background - Dark Grey
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 256, 256);

    if (isFront) {
        // Draw "Image" Icon for front - clickable appearance
        ctx.strokeStyle = '#D4FF00';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.strokeRect(55, 55, 146, 146);

        // Mountain peaks
        ctx.beginPath();
        ctx.moveTo(65, 165);
        ctx.lineTo(105, 110);
        ctx.lineTo(138, 155);
        ctx.lineTo(160, 130);
        ctx.lineTo(190, 165);
        ctx.stroke();

        // Sun/Dot
        ctx.fillStyle = '#D4FF00';
        ctx.beginPath();
        ctx.arc(155, 95, 14, 0, Math.PI * 2);
        ctx.fill();

        // Plus icon to indicate "add"
        ctx.strokeStyle = '#D4FF00';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(128, 185);
        ctx.lineTo(128, 215);
        ctx.moveTo(113, 200);
        ctx.lineTo(143, 200);
        ctx.stroke();
    } else {
        // Normal Text Label
        ctx.font = 'bold 100px Inter, Arial, sans-serif';
        ctx.fillStyle = '#444444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 128, 128);
    }

    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 252);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Camera controller that responds to zoom
function CameraController({ zoom }: { zoom: number }) {
    const { camera } = useThree();

    useEffect(() => {
        // Base distance is 8, zoom -50 to +50 maps to distance 12 to 5
        const baseDistance = 8;
        const zoomFactor = zoom / 50; // -1 to 1
        const distance = baseDistance - (zoomFactor * 3.5);

        // Maintain the same angle ratio as original position [5, 4, 5]
        const angle = Math.atan2(5, 5); // ~45 degrees
        const elevation = Math.atan2(4, Math.sqrt(50)); // elevation angle

        camera.position.set(
            distance * Math.cos(elevation) * Math.cos(angle),
            distance * Math.sin(elevation),
            distance * Math.cos(elevation) * Math.sin(angle)
        );
        camera.updateProjectionMatrix();
    }, [zoom, camera]);

    return null;
}

// The interactive cube
function InteractiveCube({
    rotation,
    tilt,
    onRotationChange,
    onFrontFaceClick
}: {
    rotation: number;
    tilt: number;
    onRotationChange: (rot: number, tlt: number) => void;
    onFrontFaceClick?: () => void;
}) {
    const controlsRef = useRef<any>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [isHovered, setIsHovered] = useState(false);
    const isDragging = useRef(false);
    const [frontHovered, setFrontHovered] = useState(false);

    // Keep refs of current props to compare and avoid loops
    const lastProps = useRef({ rotation, tilt });
    useEffect(() => {
        lastProps.current = { rotation, tilt };
    }, [rotation, tilt]);

    // Create textures once
    const textures = useMemo(() => ({
        front: createLabelTexture('F', true),
        back: createLabelTexture('B'),
        top: createLabelTexture('T'),
        bottom: createLabelTexture('Bo'),
        right: createLabelTexture('R'),
        left: createLabelTexture('L'),
    }), []);

    // Sync state TO OrbitControls
    useEffect(() => {
        if (controlsRef.current && !isDragging.current) {
            const azimuthalTarget = (rotation * Math.PI) / 180;
            const polarTarget = ((90 - tilt) * Math.PI) / 180;

            controlsRef.current.setAzimuthalAngle(azimuthalTarget);
            controlsRef.current.setPolarAngle(polarTarget);
            controlsRef.current.update();
        }
    }, [rotation, tilt]);

    const handleControlsChange = useCallback(() => {
        if (controlsRef.current && isDragging.current) {
            const azimuthal = controlsRef.current.getAzimuthalAngle();
            const polar = controlsRef.current.getPolarAngle();

            const rotationDeg = Math.round((azimuthal * 180) / Math.PI);
            const tiltDeg = Math.round(90 - (polar * 180) / Math.PI);

            // ONLY update if it actually changed from current state
            // to break the loop
            if (rotationDeg !== lastProps.current.rotation || tiltDeg !== lastProps.current.tilt) {
                onRotationChange(rotationDeg, tiltDeg);
            }
        }
    }, [onRotationChange]);

    const edgeColor = (isHovered || isDragging.current) ? "#D4FF00" : "#444444";
    const opacity = (isHovered || isDragging.current) ? 0.8 : 0.4;

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.8}
                dampingFactor={0.1}
                enableDamping={true}
                minPolarAngle={Math.PI * 0.1}
                maxPolarAngle={Math.PI * 0.9}
                onStart={() => { isDragging.current = true; }}
                onEnd={() => { isDragging.current = false; }}
                onChange={handleControlsChange}
            />

            <group
                ref={groupRef}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
                {/* Cube with textures */}
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial attach="material-0" map={textures.right} roughness={0.5} />
                    <meshStandardMaterial attach="material-1" map={textures.left} roughness={0.5} />
                    <meshStandardMaterial attach="material-2" map={textures.top} roughness={0.5} />
                    <meshStandardMaterial attach="material-3" map={textures.bottom} roughness={0.5} />
                    <meshStandardMaterial attach="material-4" map={textures.front} roughness={0.5} />
                    <meshStandardMaterial attach="material-5" map={textures.back} roughness={0.5} />
                </mesh>

                {/* Clickable Front Face Overlay */}
                <mesh
                    position={[0, 0, 0.502]}
                    onPointerOver={() => {
                        if (onFrontFaceClick) {
                            setFrontHovered(true);
                            document.body.style.cursor = 'pointer';
                        }
                    }}
                    onPointerOut={() => {
                        setFrontHovered(false);
                        document.body.style.cursor = 'auto';
                    }}
                    onClick={(e) => {
                        if (onFrontFaceClick) {
                            e.stopPropagation();
                            onFrontFaceClick();
                        }
                    }}
                >
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        transparent
                        opacity={frontHovered ? 0.15 : 0}
                        color="#D4FF00"
                    />
                </mesh>

                {/* Interaction Edges */}
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(1.005, 1.005, 1.005)]} />
                    <lineBasicMaterial color={edgeColor} transparent opacity={opacity} />
                </lineSegments>
            </group>
        </>
    );
}

const CANVAS_GL_SETTINGS = {
    antialias: true,
    alpha: true,
    powerPreference: "high-performance" as const
};

const AnglesCube = memo(({ rotation, tilt, zoom, onAngleChange, onFrontFaceClick }: AnglesCubeProps) => {
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0a0a0a] cursor-grab active:cursor-grabbing">
            <Canvas gl={CANVAS_GL_SETTINGS}>
                <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={20} />
                <CameraController zoom={zoom} />

                <ambientLight intensity={2} />
                <pointLight position={[5, 5, 5]} intensity={3} color="#ffffff" />

                <InteractiveCube
                    rotation={rotation}
                    tilt={tilt}
                    onRotationChange={onAngleChange}
                    onFrontFaceClick={onFrontFaceClick}
                />
            </Canvas>
        </div>
    );
});

AnglesCube.displayName = 'AnglesCube';

export default AnglesCube;
