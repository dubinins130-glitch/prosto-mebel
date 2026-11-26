import { formatNumber, hasItem, planHasSide, readChoice, readNumber, type Draft, type EstimateConfig } from "@/content/estimate";
import type { RoomSlug } from "@/content/site";

function KitchenDrawing({ draft }: { draft: Draft }) {
  const span = 162 + readNumber(draft, "width") * 0.021;
  const x = (420 - span) / 2;
  const xEnd = x + span;
  const leftLength = 38 + readNumber(draft, "left") * 0.018;
  const rightLength = 38 + readNumber(draft, "right") * 0.018;

  return (
    <>
      <g className="plan-rules" stroke="currentColor">
        <path d={`M${x} 37H${xEnd}m0 -7v14M${x} 30v14M${x} 47v16M${xEnd} 47v16`} />
      </g>
      <g className="plan-outline" stroke="currentColor">
        <path d={`M${x - 4} 67H${xEnd + 4}`} strokeWidth="1.5" />
        <path d={`M${x} 72H${xEnd}v29H${x}zM${x + span / 3} 72v29M${x + span * 2 / 3} 72v29`} />
      </g>
      <g className="plan-wing" data-visible={planHasSide(draft, "left")} stroke="currentColor">
        <path className="plan-rules" d={`M${x - 15} 72v${leftLength}m-6 0h12M${x - 21} 72h12`} />
        <path className="plan-outline" d={`M${x - 4} 67v${leftLength + 5}M${x} 101v${leftLength - 29}h29V101`} />
      </g>
      <g className="plan-wing" data-visible={planHasSide(draft, "right")} stroke="currentColor">
        <path className="plan-rules" d={`M${xEnd + 15} 72v${rightLength}m-6 0h12M${xEnd + 9} 72h12`} />
        <path className="plan-outline" d={`M${xEnd + 4} 67v${rightLength + 5}M${xEnd} 101v${rightLength - 29}h-29V101`} />
      </g>
    </>
  );
}

function WidthRule({ x, y, length }: { x: number; y: number; length: number }) {
  return <path className="plan-rules" d={`M${x} ${y}h${length}m0 -5v10M${x} ${y - 5}v10`} />;
}

function HeightRule({ x, y, length }: { x: number; y: number; length: number }) {
  return <path className="plan-rules" d={`M${x} ${y}v${length}m-5 0h10M${x - 5} ${y}h10`} />;
}

function elevation(draft: Draft) {
  const width = 125 + readNumber(draft, "width") * 0.023;
  const height = 63 + readNumber(draft, "height") * 0.028;
  const depth = 12 + readNumber(draft, "depth") * 0.035;
  return { x: (390 - width - depth) / 2, y: 219 - height, width, height, depth };
}

function ElevationRules({ x, y, width, height, depth }: ReturnType<typeof elevation>) {
  const right = x + width;
  return (
    <>
      <WidthRule x={x} y={y - 12} length={width} />
      <HeightRule x={x - 13} y={y} length={height} />
      <path className="plan-depth" d={`M${right} ${y}l${depth} -12v${height}l-${depth} 12`} />
      <WidthRule x={right} y={233} length={depth} />
    </>
  );
}

function WardrobeDrawing({ draft }: { draft: Draft }) {
  const box = elevation(draft);
  const { x, y, width, height } = box;
  const sections = readNumber(draft, "sections");
  const unit = width / sections;
  const sliding = readChoice(draft, "doors") === "sliding";
  return (
    <>
      <ElevationRules {...box} />
      {readChoice(draft, "type") === "built-in"
        ? <path className="plan-depth" d={`M${x - 5} ${y + height}V${y - 5}h${width + 10}v${height + 5}`} />
        : <path d={`M${x + 8} ${y + height}v6m${width - 16} -6v6`} />}
      <rect x={x} y={y} width={width} height={height} />
      {Array.from({ length: sections }, (_, index) => {
        const left = x + index * unit;
        return (
          <g key={index}>
            {index > 0 && <path d={`M${left} ${y}v${height}`} />}
            {hasItem(draft, "extras", "shelves") && <path className="plan-depth" d={`M${left} ${y + height * .48}h${unit}m-${unit} ${height * .17}h${unit}`} />}
            {hasItem(draft, "extras", "rail") && <path d={`M${left + 4} ${y + 21}h${unit - 8}`} />}
            {hasItem(draft, "extras", "drawers") && <rect x={left + 3} y={y + height - 26} width={unit - 6} height={18} />}
            {hasItem(draft, "extras", "long") && index === 0 && <path className="plan-depth" d={`M${left + unit / 2} ${y + 27}v${height - 58}`} />}
            {sliding
              ? <path d={`M${left + 5} ${y + height * .55}h${Math.min(12, unit - 9)}`} />
              : <path d={`M${left + unit - 6} ${y + height * .47}v12`} />}
          </g>
        );
      })}
      {sliding && <path d={`M${x} ${y + height - 4}h${width}M${x} ${y + 4}h${width}`} />}
    </>
  );
}

function DressingDrawing({ draft }: { draft: Draft }) {
  const width = 152 + readNumber(draft, "width") * 0.022;
  const depth = 76 + readNumber(draft, "depth") * 0.023;
  const height = readNumber(draft, "height");
  const x = (420 - width) / 2;
  const y = 40;
  const railDepth = 17 + height * 0.004;
  const left = planHasSide(draft, "left");
  const right = planHasSide(draft, "right");
  const middleWidth = width - (Number(left) + Number(right)) * railDepth;
  const middleX = x + (left ? railDepth : 0);
  const shelves = readNumber(draft, "shelves");
  const rails = readNumber(draft, "rails");
  const drawers = readNumber(draft, "drawers");
  return (
    <>
      <WidthRule x={x} y={y - 14} length={width} />
      <HeightRule x={x - 14} y={y} length={depth} />
      <path className="plan-depth" d={`M${x + width * .37} ${y + depth}H${x}V${y}h${width}v${depth}h-${width * .37}`} />
      <rect x={x} y={y} width={width} height={railDepth} />
      {left && <rect x={x} y={y + railDepth} width={railDepth} height={depth - railDepth} />}
      {right && <rect x={x + width - railDepth} y={y + railDepth} width={railDepth} height={depth - railDepth} />}
      {Array.from({ length: shelves }, (_, index) => <path key={index} d={`M${x + (index + 1) * width / (shelves + 1)} ${y}v${railDepth}`} />)}
      {Array.from({ length: rails }, (_, index) => <path key={index} className="plan-depth" d={`M${middleX + 6} ${y + railDepth + 7 + index * 5}h${middleWidth - 12}`} />)}
      {Array.from({ length: drawers }, (_, index) => <rect key={index} x={middleX + index * middleWidth / drawers + 2} y={y + 4} width={middleWidth / drawers - 4} height={railDepth - 8} />)}
      {hasItem(draft, "extras", "mirror") && <path d={`M${x + width - 3} ${y + depth * .55}v${depth * .23}`} strokeWidth="3" />}
      {hasItem(draft, "extras", "light") && <path className="plan-rules" d={`M${x + 5} ${y + railDepth + 3}h${width - 10}`} />}
      {hasItem(draft, "extras", "baskets") && <rect className="plan-depth" x={x + width * .22} y={y + depth - 31} width={25} height={20} />}
      {hasItem(draft, "extras", "shoes") && <path d={`M${x + width * .65} ${y + depth - 22}h${width * .19}m-${width * .19} 7h${width * .19}`} />}
    </>
  );
}

function HallwayDrawing({ draft }: { draft: Draft }) {
  const box = elevation(draft);
  const { x, y, width, height } = box;
  const floor = y + height;
  const closed = readChoice(draft, "type") === "closed";
  const middle = x + width * .39;
  const middleWidth = width * .43;
  const has = (value: string) => hasItem(draft, "extras", value);
  return (
    <>
      <ElevationRules {...box} />
      <path className="plan-depth" d={`M${x} ${floor}V${y}h${width}v${height}z`} />
      {has("wardrobe") && <g>
        <rect x={x} y={y} width={width * .34} height={height} />
        <path d={`M${x + width * .17} ${y}v${height}m6 -${height * .5}v12m-12 -12v12`} />
      </g>}
      {closed
        ? <g><rect x={middle} y={y + 5} width={middleWidth} height={height * .55} /><path d={`M${middle + middleWidth - 8} ${y + height * .28}v12`} /></g>
        : <path d={`M${middle} ${y + 21}h${middleWidth}m-${middleWidth * .8} 2v12q5 5 8 0m${middleWidth * .2} -12v12q5 5 8 0m${middleWidth * .2} -12v12q5 5 8 0`} />}
      {has("mirror") && <rect x={x + width * .85} y={y + height * .14} width={width * .13} height={height * .55} />}
      {has("shoe-rack") && <g><rect x={middle} y={floor - 35} width={middleWidth} height={35} /><path d={`M${middle} ${floor - 17}h${middleWidth}`} /></g>}
      {has("seat") && <g>
        <rect x={middle - 2} y={floor - 46} width={middleWidth + 4} height={7} />
        {!has("shoe-rack") && <path d={`M${middle + 4} ${floor - 39}v39m${middleWidth - 8} -39v39`} />}
      </g>}
    </>
  );
}

function ChildrenDrawing({ draft }: { draft: Draft }) {
  const box = elevation(draft);
  const { x, y, width, height } = box;
  const floor = y + height;
  const sections = readNumber(draft, "sections");
  const type = readChoice(draft, "type");
  const desk = type === "desk" || type === "combined";
  const cabinetWidth = type === "combined" ? width * .41 : width;
  const division = cabinetWidth / sections;
  const desktopX = type === "combined" ? x + cabinetWidth + 4 : x;
  const desktopWidth = x + width - desktopX;
  const desktopY = floor - Math.min(66, height * .77);
  const has = (value: string) => hasItem(draft, "extras", value);

  return (
    <>
      <ElevationRules {...box} />
      {type !== "desk" && <g>
        <rect x={x} y={y} width={cabinetWidth} height={height} />
        {Array.from({ length: sections - 1 }, (_, index) => <path key={index} d={`M${x + division * (index + 1)} ${y}v${height}`} />)}
        {type === "storage" && <path d={`M${x} ${y + height / 2}h${cabinetWidth}`} />}
      </g>}
      {desk && <g>
        <rect x={desktopX} y={desktopY} width={desktopWidth} height={7} />
        <path d={`M${desktopX + 6} ${desktopY + 7}V${floor}m${desktopWidth - 12} 0V${desktopY + 7}`} />
        {type === "desk" && Array.from({ length: sections - 1 }, (_, index) => <path className="plan-depth" key={index} d={`M${desktopX + desktopWidth * (index + 1) / sections} ${desktopY + 7}v${floor - desktopY - 7}`} />)}
      </g>}
      {has("drawers") && <rect x={x + width - 35} y={floor - 32} width={32} height={27} />}
      {has("hooks") && <path d={`M${x + width - 6} ${desktopY + 14}h9v6q0 5 4 4`} />}
      {has("shelves") && <path d={`M${desk ? desktopX : x + 3} ${y + 14}h${desk ? desktopWidth : width - 6}m-${desk ? desktopWidth : width - 6} 14h${desk ? desktopWidth : width - 6}`} />}
    </>
  );
}

const drawings = {
  kitchens: KitchenDrawing,
  wardrobes: WardrobeDrawing,
  "dressing-rooms": DressingDrawing,
  hallways: HallwayDrawing,
  children: ChildrenDrawing,
};

export function EstimateSketch({ room, config, draft }: { room: RoomSlug; config: EstimateConfig; draft: Draft }) {
  const Drawing = drawings[room];
  return (
    <div className="estimate-plan">
      <div className="plan-annotation category-mono"><span>{config.view}</span><span>Схема без масштаба</span></div>
      <svg className="plan-drawing" data-sketch={room} viewBox={room === "kitchens" ? "0 0 420 205" : "0 0 420 250"} aria-hidden="true" fill="none" stroke="currentColor">
        <Drawing draft={draft} />
      </svg>
      <div className="plan-size"><span>{formatNumber.format(readNumber(draft, "width"))}</span><small>мм</small></div>
      <div className="plan-annotation plan-foot category-mono"><span>{config.mainSize}</span><span>{config.planLabel(draft)}</span></div>
    </div>
  );
}
