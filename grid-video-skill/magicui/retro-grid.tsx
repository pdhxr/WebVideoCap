/**
 * Remotion adaptation of Magic UI RetroGrid.
 * Original: magicui.design RetroGrid (see CREDITS.md / retro-grid.original.tsx)
 *
 * Changes vs upstream:
 * - No requestAnimationFrame / cancelAnimationFrame
 * - u_time = useCurrentFrame() / fps
 * - CSS fallback translateY driven by frame (no @keyframes)
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cn } from "../lib/cn";

export const ANIMATION_DURATION_SECONDS = 15;
const GRID_HEIGHT_RATIO = 3;
const GRID_LINE_ALIGNMENT_OFFSET_PX = 0.5;
const GRID_LINE_ANTIALIAS_MULTIPLIER = 0.9;
const GRID_LINE_WIDTH_PX = 0.92;
const GRID_START_OFFSET_RATIO = -0.5;
const GRID_WIDTH_RATIO = 6;
const GRID_X_OFFSET_RATIO = -2;
const MAX_ANGLE = 89;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MIN_ANGLE = 1;
const PERSPECTIVE_PX = 200;

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_container_size;
uniform vec2 u_viewport_size;
uniform vec4 u_line_color;
uniform float u_angle;
uniform float u_cell_size;
uniform float u_device_pixel_ratio;
uniform float u_time;

const float animationDurationSeconds = ${ANIMATION_DURATION_SECONDS.toFixed(1)};
const float gridHeightRatio = ${GRID_HEIGHT_RATIO.toFixed(1)};
const float gridStartOffsetRatio = ${GRID_START_OFFSET_RATIO.toFixed(1)};
const float gridWidthRatio = ${GRID_WIDTH_RATIO.toFixed(1)};
const float gridXOffsetRatio = ${GRID_X_OFFSET_RATIO.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${GRID_LINE_ALIGNMENT_OFFSET_PX.toFixed(1)};
const float gridLineAntialiasMultiplier = ${GRID_LINE_ANTIALIAS_MULTIPLIER.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${GRID_LINE_WIDTH_PX.toFixed(2)};
const float perspectivePx = ${PERSPECTIVE_PX.toFixed(1)};
const float gridTravelRatio = 0.5;
const float verticalCompressionEndPx = 2.6;
const float verticalCompressionStartPx = 1.0;
const float verticalEdgeCompressionEnd = 0.95;
const float verticalEdgeCompressionStart = 0.45;
const float verticalLodLevelEnd = 0.64;
const float verticalLodLevelStart = 0.22;
const float verticalTopCompressionEndCells = 6.0;
const float verticalTopCompressionStartCells = 2.0;

float renderGridLine(float wrappedCoord, float antiAliasWidth, float softnessBoost) {
  return 1.0 - smoothstep(
    lineWidthPx,
    lineWidthPx + (antiAliasWidth * (1.5 + softnessBoost)),
    wrappedCoord
  );
}

void main() {
  float angle = radians(clamp(u_angle, 1.0, 89.0));
  float sinAngle = sin(angle);
  float cosAngle = cos(angle);
  vec2 screen = vec2(
    (gl_FragCoord.x / u_device_pixel_ratio) - (u_container_size.x * 0.5),
    (u_container_size.y * 0.5) - (gl_FragCoord.y / u_device_pixel_ratio)
  );

  vec3 rayOrigin = vec3(0.0, 0.0, perspectivePx);
  vec3 rayDirection = normalize(vec3(screen, -perspectivePx));
  vec3 planeXAxis = vec3(1.0, 0.0, 0.0);
  vec3 planeYAxis = vec3(0.0, cosAngle, sinAngle);
  vec3 planeNormal = normalize(cross(planeXAxis, planeYAxis));
  float denominator = dot(rayDirection, planeNormal);

  if (abs(denominator) < 0.0001) {
    discard;
  }

  float distanceToPlane = dot(-rayOrigin, planeNormal) / denominator;
  if (distanceToPlane <= 0.0) {
    discard;
  }

  vec3 hitPoint = rayOrigin + (rayDirection * distanceToPlane);
  float localX = hitPoint.x;
  float localY = dot(hitPoint, planeYAxis);
  float gridWidth = u_viewport_size.x * gridWidthRatio;
  float gridHeight = u_viewport_size.y * gridHeightRatio;
  float gridScrollSpeed = (gridHeight * gridTravelRatio) / animationDurationSeconds;
  float patternOffsetY = u_time * gridScrollSpeed;
  float gridLeft = (-0.5 * u_container_size.x) + (gridXOffsetRatio * u_container_size.x);
  float gridTop = (-0.5 * u_container_size.y) + (gridStartOffsetRatio * gridHeight);
  vec2 planePosition = vec2(localX - gridLeft, localY - gridTop);

  if (
    planePosition.x < 0.0 ||
    planePosition.y < 0.0 ||
    planePosition.x > gridWidth ||
    planePosition.y > gridHeight
  ) {
    discard;
  }

  vec2 patternPosition = vec2(planePosition.x, planePosition.y - patternOffsetY);
  vec2 wrapped = mod(patternPosition + vec2(gridLineAlignmentOffsetPx), u_cell_size);
  vec2 patternDerivative = max(fwidth(patternPosition), vec2(0.0001));
  vec2 antiAliasWidth = patternDerivative * gridLineAntialiasMultiplier;
  float horizontalCellSpanPx = u_cell_size / patternDerivative.y;
  float horizontalCompression = 1.0 - smoothstep(
    horizontalCompressionStartPx,
    horizontalCompressionEndPx,
    horizontalCellSpanPx
  );
  float verticalCellSpanPx = u_cell_size / patternDerivative.x;
  float sideDistance = abs((planePosition.x / gridWidth) * 2.0 - 1.0);
  float verticalEdgeCompression = smoothstep(
    verticalEdgeCompressionStart,
    verticalEdgeCompressionEnd,
    sideDistance
  );
  float verticalTopCompression = 1.0 - smoothstep(
    u_cell_size * verticalTopCompressionStartCells,
    u_cell_size * verticalTopCompressionEndCells,
    planePosition.y
  );
  float verticalCompression =
    (1.0 - smoothstep(
      verticalCompressionStartPx,
      verticalCompressionEndPx,
      verticalCellSpanPx
    )) * verticalEdgeCompression * verticalTopCompression;
  float horizontalSoftnessBoost = 1.0 + (horizontalCompression * 3.0);
  float verticalSoftnessBoost = 1.0 + (verticalCompression * 3.5);
  float verticalLod = smoothstep(verticalLodLevelStart, verticalLodLevelEnd, verticalCompression);
  float verticalLineFine = renderGridLine(wrapped.x, antiAliasWidth.x, verticalSoftnessBoost);
  float verticalWrappedLod = mod(patternPosition.x + gridLineAlignmentOffsetPx, u_cell_size * 2.0);
  float verticalLineCoarse = renderGridLine(
    verticalWrappedLod,
    antiAliasWidth.x,
    verticalSoftnessBoost + verticalLod
  );
  float verticalLine = max(
    verticalLineFine * (1.0 - verticalLod),
    verticalLineCoarse * verticalLod
  );
  float horizontalLodLevelOne = 1.0 - smoothstep(
    horizontalLodLevelOneStartPx,
    horizontalLodLevelOneEndPx,
    horizontalCellSpanPx
  );
  float horizontalLodLevelTwo = 1.0 - smoothstep(
    horizontalLodLevelTwoStartPx,
    horizontalLodLevelTwoEndPx,
    horizontalCellSpanPx
  );
  float horizontalLineFine = renderGridLine(wrapped.y, antiAliasWidth.y, horizontalSoftnessBoost);
  float horizontalWrappedLodOne = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float horizontalWrappedLodTwo = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 4.0
  );
  float horizontalLineCoarse = renderGridLine(
    horizontalWrappedLodOne,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne
  );
  float horizontalLineExtraCoarse = renderGridLine(
    horizontalWrappedLodTwo,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne + horizontalLodLevelTwo
  );
  float horizontalLineReduced = max(
    horizontalLineFine * (1.0 - horizontalLodLevelOne),
    horizontalLineCoarse * horizontalLodLevelOne
  );
  float horizontalLine = max(
    horizontalLineReduced * (1.0 - horizontalLodLevelTwo),
    horizontalLineExtraCoarse * horizontalLodLevelTwo
  );
  float line = max(verticalLine, horizontalLine);

  if (line <= 0.001) {
    discard;
  }

  float alpha = u_line_color.a * line;
  gl_FragColor = vec4(u_line_color.rgb * alpha, alpha);
}
`;

interface ProgramInfo {
  attributeLocation: number;
  program: WebGLProgram;
  uniforms: {
    angle: WebGLUniformLocation;
    cellSize: WebGLUniformLocation;
    containerSize: WebGLUniformLocation;
    devicePixelRatio: WebGLUniformLocation;
    lineColor: WebGLUniformLocation;
    time: WebGLUniformLocation;
    viewportSize: WebGLUniformLocation;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

function getProgramInfo(gl: WebGLRenderingContext, program: WebGLProgram): ProgramInfo | null {
  const attributeLocation = gl.getAttribLocation(program, "a_position");
  const angle = gl.getUniformLocation(program, "u_angle");
  const cellSize = gl.getUniformLocation(program, "u_cell_size");
  const containerSize = gl.getUniformLocation(program, "u_container_size");
  const devicePixelRatio = gl.getUniformLocation(program, "u_device_pixel_ratio");
  const lineColor = gl.getUniformLocation(program, "u_line_color");
  const time = gl.getUniformLocation(program, "u_time");
  const viewportSize = gl.getUniformLocation(program, "u_viewport_size");
  if (
    attributeLocation < 0 ||
    !angle ||
    !cellSize ||
    !containerSize ||
    !devicePixelRatio ||
    !lineColor ||
    !time ||
    !viewportSize
  ) {
    return null;
  }
  return {
    attributeLocation,
    program,
    uniforms: {
      angle,
      cellSize,
      containerSize,
      devicePixelRatio,
      lineColor,
      time,
      viewportSize,
    },
  };
}

function parseRgba(color: string): Float32Array {
  const m = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (m) {
    return new Float32Array([
      Number(m[1]) / 255,
      Number(m[2]) / 255,
      Number(m[3]) / 255,
      m[4] !== undefined ? Number(m[4]) : 1,
    ]);
  }
  return new Float32Array([0.47, 0.71, 1, 0.35]);
}

export interface RetroGridProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lineColor?: string;
  /** Force CSS fallback (useful if WebGL fails in headless). */
  forceCssFallback?: boolean;
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lineColor = "rgba(120, 180, 255, 0.35)",
  forceCssFallback = false,
  style,
  ...props
}: RetroGridProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const timeSeconds = frame / fps;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    programInfo: ProgramInfo;
    positionBuffer: WebGLBuffer;
  } | null>(null);
  const [isWebGlReady, setIsWebGlReady] = useState(false);

  const normalizedAngle = clamp(angle, MIN_ANGLE, MAX_ANGLE);
  const normalizedCellSize = Math.max(cellSize, 1);
  const lineColorVec = useMemo(() => parseRgba(lineColor), [lineColor]);

  // Init WebGL once (no rAF loop)
  useEffect(() => {
    if (forceCssFallback) {
      setIsWebGlReady(false);
      return;
    }
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handle = delayRender("retro-grid-webgl-init");
    let cancelled = false;

    try {
      const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
      });
      if (!gl || !gl.getExtension("OES_standard_derivatives")) {
        setIsWebGlReady(false);
        continueRender(handle);
        return;
      }
      const program = createProgram(gl);
      if (!program) {
        setIsWebGlReady(false);
        continueRender(handle);
        return;
      }
      const programInfo = getProgramInfo(gl, program);
      if (!programInfo) {
        gl.deleteProgram(program);
        setIsWebGlReady(false);
        continueRender(handle);
        return;
      }
      const positionBuffer = gl.createBuffer();
      if (!positionBuffer) {
        gl.deleteProgram(program);
        setIsWebGlReady(false);
        continueRender(handle);
        return;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      if (!cancelled) {
        glRef.current = { gl, programInfo, positionBuffer };
        setIsWebGlReady(true);
      }
    } catch {
      setIsWebGlReady(false);
    } finally {
      continueRender(handle);
    }

    return () => {
      cancelled = true;
      const ctx = glRef.current;
      if (ctx) {
        ctx.gl.deleteBuffer(ctx.positionBuffer);
        ctx.gl.deleteProgram(ctx.programInfo.program);
        glRef.current = null;
      }
    };
  }, [forceCssFallback]);

  // Draw each Remotion frame — time from frame/fps, not wall clock
  useLayoutEffect(() => {
    if (!isWebGlReady || forceCssFallback) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = glRef.current;
    if (!canvas || !container || !ctx) return;

    const handle = delayRender(`retro-grid-draw-${frame}`);
    const { gl, programInfo, positionBuffer } = ctx;

    const w = Math.floor(container.clientWidth || width);
    const h = Math.floor(container.clientHeight || height);
    if (w === 0 || h === 0) {
      continueRender(handle);
      return;
    }

    const dpr = Math.min(
      (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1,
      MAX_DEVICE_PIXEL_RATIO,
    );
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(programInfo.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(programInfo.attributeLocation);
    gl.vertexAttribPointer(programInfo.attributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(programInfo.uniforms.angle, normalizedAngle);
    gl.uniform1f(programInfo.uniforms.cellSize, normalizedCellSize);
    gl.uniform2f(programInfo.uniforms.containerSize, w, h);
    gl.uniform1f(programInfo.uniforms.devicePixelRatio, dpr);
    gl.uniform4fv(programInfo.uniforms.lineColor, lineColorVec);
    gl.uniform1f(programInfo.uniforms.time, timeSeconds);
    gl.uniform2f(programInfo.uniforms.viewportSize, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    continueRender(handle);
  }, [
    frame,
    timeSeconds,
    isWebGlReady,
    forceCssFallback,
    normalizedAngle,
    normalizedCellSize,
    lineColorVec,
    width,
    height,
  ]);

  // Frame-driven CSS fallback scroll (15s cycle), no @keyframes
  const cycle = (timeSeconds % ANIMATION_DURATION_SECONDS) / ANIMATION_DURATION_SECONDS;
  const fallbackTranslateY = interpolate(cycle, [0, 1], [-50, 0]);

  const showFallback = forceCssFallback || !isWebGlReady;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute overflow-hidden", className)}
      style={{
        width: "100%",
        height: "100%",
        opacity,
        ...style,
      }}
      {...props}
    >
      {showFallback ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: `${PERSPECTIVE_PX}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotateX(${normalizedAngle}deg)`,
              transformOrigin: "center top",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-200%",
                top: 0,
                width: "600vw",
                height: "300vh",
                transformOrigin: "100% 0 0",
                backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 0), linear-gradient(to bottom, ${lineColor} 1px, transparent 0)`,
                backgroundRepeat: "repeat",
                backgroundSize: `${normalizedCellSize}px ${normalizedCellSize}px`,
                transform: `translateY(${fallbackTranslateY}%)`,
              }}
            />
          </div>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: showFallback ? 0 : 1,
        }}
      />
    </div>
  );
}
