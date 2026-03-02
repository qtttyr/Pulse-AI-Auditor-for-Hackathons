import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react"

export const CustomEdge = ({ 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  markerEnd 
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16, // Smooth corners for the 90-degree turns
  })

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={{ 
        ...style, 
        stroke: "rgba(203, 213, 225, 1)", // Slate-300
        strokeWidth: 2 
      }} 
    />
  )
}
