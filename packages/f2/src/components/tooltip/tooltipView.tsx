import { Ref, Component, jsx, createRef } from '@antv/f-engine';
import { isFunction, find } from '@antv/util';

// view 的默认配置
const defaultStyle = {
  showTitle: false,
  showCrosshairs: false,
  crosshairsType: 'y',
  crosshairsStyle: {
    stroke: 'rgba(0, 0, 0, 0.25)',
    lineWidth: '2px',
  },
  showTooltipMarker: false,
  markerBackgroundStyle: {
    fill: '#CCD6EC',
    opacity: 0.3,
    padding: '6px',
  },
  tooltipMarkerStyle: {
    fill: '#fff',
    lineWidth: '3px',
  },
  background: {
    radius: '4px',
    fill: 'rgba(0, 0, 0, 0.65)',
    padding: ['6px', '10px'],
  },
  titleStyle: {
    fontSize: '24px',
    fill: '#fff',
    textAlign: 'start',
    textBaseline: 'top',
  },
  nameStyle: {
    fontSize: '24px',
    fill: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'start',
    textBaseline: 'middle',
  },
  valueStyle: {
    fontSize: '24px',
    fill: '#fff',
    textAlign: 'start',
    textBaseline: 'middle',
  },
  joinString: ': ',
  showItemMarker: true,
  itemMarkerStyle: {
    width: '12px',
    radius: '6px',
    symbol: 'circle',
    lineWidth: '2px',
    stroke: '#fff',
  },
  layout: 'horizontal',
  snap: false,
  xTipTextStyle: {
    fontSize: '24px',
    fill: '#fff',
  },
  yTipTextStyle: {
    fontSize: '24px',
    fill: '#fff',
  },
  xTipBackground: {
    radius: '4px',
    fill: 'rgba(0, 0, 0, 0.65)',
    padding: ['6px', '10px'],
    marginLeft: '-50%',
    marginTop: '6px',
  },
  yTipBackground: {
    radius: '4px',
    fill: 'rgba(0, 0, 0, 0.65)',
    padding: ['6px', '10px'],
    marginLeft: '-100%',
    marginTop: '-50%',
  },
};

function directionEnabled(mode: string, dir: string) {
  if (mode === undefined) {
    return true;
  } else if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1;
  }

  return false;
}

const RenderItemMarker = (props) => {
  const { records, coord, context, markerBackgroundStyle } = props;
  const point = coord.convertPoint({ x: 1, y: 1 });
  const padding = context.px2hd(markerBackgroundStyle.padding || '6px');
  const xPoints = [
    ...records.map((record) => record.xMin),
    ...records.map((record) => record.xMax),
  ];
  const yPoints = [
    ...records.map((record) => record.yMin),
    ...records.map((record) => record.yMax),
    // y 要到 coord 顶部
    // point.y,
  ];
  if (coord.transposed) {
    xPoints.push(point.x);
  } else {
    yPoints.push(point.y);
  }
  const xMin = Math.min.apply(null, xPoints);
  const xMax = Math.max.apply(null, xPoints);
  const yMin = Math.min.apply(null, yPoints);
  const yMax = Math.max.apply(null, yPoints);

  const x = coord.transposed ? xMin : xMin - padding;
  const y = coord.transposed ? yMin - padding : yMin;
  const width = coord.transposed ? xMax - xMin : xMax - xMin + 2 * padding;
  const height = coord.transposed ? yMax - yMin + 2 * padding : yMax - yMin;

  return (
    <rect
      attrs={{
        x,
        y,
        width,
        height,
        ...markerBackgroundStyle,
      }}
    />
  );
};

const RenderCrosshairs = (props) => {
  const { records, coord, chart, crosshairsType, crosshairsStyle } = props;
  const { left: coordLeft, top: coordTop, right: coordRight, bottom: coordBottom, center } = coord;
  const firstRecord = records[0];
  const { x, y, origin, xField } = firstRecord;
  if (coord.isPolar) {
    // 极坐标下的辅助线
    const xScale = chart.getScale(xField);
    const ticks = xScale.getTicks();
    const tick = find<any>(ticks, (tick) => origin[xField] === tick.tickValue);
    const end = coord.convertPoint({
      x: tick.value,
      y: 1,
    });
    return (
      <line
        attrs={{
          x1: center.x,
          y1: center.y,
          x2: end.x,
          y2: end.y,
          ...crosshairsStyle,
        }}
      />
    );
  }

  return (
    <group>
      {directionEnabled(crosshairsType, 'x') ? (
        <line
          attrs={{
            x1: coordLeft,
            y1: y,
            x2: coordRight,
            y2: y,
            ...crosshairsStyle,
          }}
        />
      ) : null}
      {directionEnabled(crosshairsType, 'y') ? (
        <line
          attrs={{
            x1: x,
            y1: coordTop,
            x2: x,
            y2: coordBottom,
            ...crosshairsStyle,
          }}
        />
      ) : null}
    </group>
  );
};

const RenderXTip = (props) => {
  const { records, coord, xTip, xTipTextStyle, xTipBackground } = props;

  const { bottom: coordBottom } = coord;

  const firstRecord = records[0];
  const { x } = firstRecord;
  const { name: xFirstText } = firstRecord;

  return (
    <rect
      style={{
        display: 'flex',
        left: x,
        top: coordBottom,
        ...xTipBackground,
      }}
    >
      <text
        attrs={{
          ...xTipTextStyle,
          text: isFunction(xTip) ? xTip(xFirstText) : xFirstText,
        }}
      />
    </rect>
  );
};

const RenderYTip = (props) => {
  const { records, coord, yTip, yTipTextStyle, yTipBackground } = props;

  const { left: coordLeft } = coord;

  const firstRecord = records[0];
  const { y } = firstRecord;
  const { value: yFirstText } = firstRecord;
  return (
    <rect
      style={{
        display: 'flex',
        left: coordLeft,
        top: y,
        ...yTipBackground,
      }}
    >
      <text
        style={{
          ...yTipTextStyle,
          text: isFunction(yTip) ? yTip(yFirstText) : yFirstText,
        }}
      />
    </rect>
  );
};

const RenderLabel = (props) => {
  const {
    records,
    coord,
    rootRef,
    background,
    showItemMarker,
    itemMarkerStyle,
    customText,
    nameStyle,
    valueStyle,
    joinString,
    arrowRef,
    arrowWidth,
    x,
  } = props;
  const { left: coordLeft, top: coordTop } = coord;

  return (
    <group style={{ display: 'flex' }}>
      <group
        ref={rootRef}
        style={{
          x: coordLeft,
          y: coordTop,
        }}
      >
        <rect
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: [0, 0, 0, '6px'],
            ...background,
          }}
        >
          {records.map((record) => {
            const { name, value } = record;
            return (
              <group
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: [0, '6px', 0, 0],
                }}
              >
                {showItemMarker ? (
                  <marker
                    style={{
                      width: itemMarkerStyle.width,
                      marginRight: '6px',
                    }}
                    attrs={{
                      ...itemMarkerStyle,
                      fill: record.color,
                    }}
                  />
                ) : null}
                {customText && isFunction(customText) ? (
                  customText(record)
                ) : (
                  <group
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    <text
                      attrs={{
                        ...nameStyle,
                        text: value ? `${name}${joinString}` : name,
                      }}
                    />
                    <text
                      attrs={{
                        ...valueStyle,
                        text: value,
                      }}
                    />
                  </group>
                )}
              </group>
            );
          })}
        </rect>
      </group>
      <group
        style={{
          x: coordLeft,
          y: coordTop,
        }}
      >
        <polygon
          ref={arrowRef}
          style={{
            points: [
              [x - arrowWidth, 0],
              [x + arrowWidth, 0],
              [x, arrowWidth],
            ],
            fill: background.fill,
          }}
        />
      </group>
    </group>
  );
};
export default class TooltipView extends Component {
  rootRef: Ref;
  arrowRef: Ref;

  constructor(props) {
    super(props);
    this.rootRef = createRef();
    this.arrowRef = createRef();
  }
  // 调整 显示的位置
  async _position() {
    const { props, context, rootRef, arrowRef } = this;
    const { canvas } = context;
    await canvas.ready;
    const rect = rootRef.current?.childNodes[0];
    if (!rect) {
      return;
    }

    const { records, coord } = props;
    const arrowWidth = context.px2hd('6px');
    const record = records[0];
    // 中心点
    const { x } = record;
    const { left: coordLeft, top: coordTop, width: coordWidth } = coord;
    const { width, height } = rect.getBBox();
    const radius = rect.getAttribute('radius');

    const halfWidth = width / 2;
    // 让 tooltip 限制在 coord 的显示范围内
    const offsetX = Math.min(
      Math.max(x - coordLeft - halfWidth, -arrowWidth - radius),
      coordWidth - width + arrowWidth + radius
    );
    // 因为默认是从 coord 的范围内显示的，所以要往上移，移出 coord，避免挡住 geometry
    const offset = Math.min(coordTop, height + arrowWidth); // 因为不能超出 canvas 画布区域，所以最大只能是 y

    rect.setLocalPosition(offsetX, -offset);
    arrowRef.current.setLocalPosition(offsetX + halfWidth, arrowWidth);
  }
  didMount() {
    this._position();
  }
  didUpdate() {
    this._position();
  }
  render() {
    const { props, context } = this;
    const { records, coord } = props;
    const firstRecord = records[0];
    const { x } = firstRecord;
    const {
      chart,
      background: customBackground,
      showTooltipMarker = defaultStyle.showTooltipMarker,
      markerBackgroundStyle = defaultStyle.markerBackgroundStyle,
      showItemMarker = defaultStyle.showItemMarker,
      itemMarkerStyle: customItemMarkerStyle,
      nameStyle,
      valueStyle,
      joinString = defaultStyle.joinString,
      showCrosshairs = defaultStyle.showCrosshairs,
      crosshairsStyle,
      crosshairsType = defaultStyle.crosshairsType,
      snap = defaultStyle.snap,
      tooltipMarkerStyle = defaultStyle.tooltipMarkerStyle,
      showXTip,
      showYTip,
      xTip,
      yTip,
      xTipTextStyle = defaultStyle.xTipTextStyle,
      yTipTextStyle = defaultStyle.yTipTextStyle,
      xTipBackground = defaultStyle.xTipBackground,
      yTipBackground = defaultStyle.yTipBackground,
      custom = false,
      customText,
    } = props;
    const itemMarkerStyle = {
      ...customItemMarkerStyle,
      ...defaultStyle.itemMarkerStyle,
    };

    const background = {
      ...defaultStyle.background,
      ...customBackground,
    };

    const arrowWidth = context.px2hd('6px');

    return (
      <group>
        {/* 非自定义模式时显示的文本信息 */}
        {!custom && (
          <RenderLabel
            records={records}
            coord={coord}
            rootRef={this.rootRef}
            itemMarkerStyle={itemMarkerStyle}
            customText={customText}
            showItemMarker={showItemMarker}
            x={x}
            arrowRef={this.arrowRef}
            arrowWidth={arrowWidth}
            background={background}
            nameStyle={{ ...defaultStyle.nameStyle, nameStyle }}
            valueStyle={{ ...defaultStyle.valueStyle, valueStyle }}
            joinString={joinString}
          />
        )}
        {showTooltipMarker ? (
          <RenderItemMarker
            coord={coord}
            context={context}
            records={records}
            markerBackgroundStyle={markerBackgroundStyle}
          />
        ) : null}
        {/* 辅助线 */}
        {showCrosshairs ? (
          <RenderCrosshairs
            chart={chart}
            coord={coord}
            records={records}
            crosshairsType={crosshairsType}
            crosshairsStyle={{ ...defaultStyle.crosshairsStyle, ...crosshairsStyle }}
          />
        ) : null}
        {/* 辅助点 */}
        {snap
          ? records.map((item) => {
              const { x, y, color, shape } = item;
              return (
                <circle
                  attrs={{
                    cx: x,
                    cy: y,
                    r: '6px',
                    stroke: color,
                    fill: color,
                    ...shape,
                    ...tooltipMarkerStyle,
                  }}
                />
              );
            })
          : null}
        {/* X 轴辅助信息 */}
        {showXTip && (
          <RenderXTip
            records={records}
            coord={coord}
            xTip={xTip}
            xTipTextStyle={{ ...defaultStyle.xTipTextStyle, xTipTextStyle }}
            xTipBackground={{ ...defaultStyle.xTipBackground, xTipBackground }}
          />
        )}
        {/* Y 轴辅助信息 */}
        {showYTip && (
          <RenderYTip
            records={records}
            coord={coord}
            yTip={yTip}
            yTipTextStyle={{ ...defaultStyle.yTipTextStyle, yTipTextStyle }}
            yTipBackground={{ ...defaultStyle.yTipBackground, yTipBackground }}
          />
        )}
      </group>
    );
  }
}
