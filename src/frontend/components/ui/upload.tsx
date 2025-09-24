"use client"

import type React from "react"
import { useEffect } from "react"
import { motion, useAnimation } from "motion/react"

interface UploadAnimatedProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  strokeWidth?: number
  stroke?: string
}

export const UploadAnimated = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#9ca3af",
  ...props
}: UploadAnimatedProps) => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start("animate")
  }, [controls])

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "8px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 30"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <motion.g
          variants={{
            normal: { y: 0 },
            animate: {
              y: [0, -3, 0],
              transition: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "easeInOut",
              },
            },
          }}
          animate={controls}
          initial="normal"
        >
          <polyline points="17 11 12 6 7 11" />
          <line x1="12" x2="12" y1="6" y2="18" />
        </motion.g>
      </svg>
    </div>
  )
}
